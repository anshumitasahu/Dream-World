# 2. RigidBody + Collider + Velocity + Collision (Deep Dive)

> Prereq: read `0_physics_model.md` first.
> Goal: understand each knob we used in `App.tsx` line-by-line, so you can add new objects confidently.

Our current bodies (`src/App.tsx:20-35`):

```tsx
<Physics gravity={[0, -9.81, 0]}>
  <RigidBody colliders="cuboid" position={[0, 5, 0]}>
    <Model modelPath="/models/black_dragon_with_idle_animation.glb" ... />
  </RigidBody>
  <RigidBody type="fixed" colliders="cuboid">
    <mesh position={[0, -0.05, 0]}>
      <boxGeometry args={[2000, 0.1, 2000]} />
      <meshStandardMaterial color="#3a3a3a" />
    </mesh>
  </RigidBody>
</Physics>
```

---

## 1. RigidBody — the "thing"

A RigidBody is a **position + rotation + velocity** tracked by physics. The mesh inside is just its costume.

### 1a. The 3 types

```tsx
<RigidBody type="dynamic">            {/* default — falls, collides, pushed */}
<RigidBody type="fixed">              {/* never moves — floors, walls */}
<RigidBody type="kinematicPosition">  {/* moved by YOUR code — player, elevator */}
```

| Type | Gravity? | Pushable? | Moves by | Use for |
|------|----------|-----------|----------|---------|
| `dynamic` | yes | yes | physics | dragon, crates, balls |
| `fixed` | no | no (pushes others) | never | floor, walls |
| `kinematicPosition` | no | yes (pushes dynamics) | `setNextKinematicTranslation()` in code | player controller, platforms |

Our scene:

- Dragon omits `type` → defaults to `dynamic` → falls. Same as writing `type="dynamic"`.
- Floor uses `type="fixed"` → stays put when 500kg dragon lands.

Beginner rule: **if it shouldn't fall, `type="fixed"`.** Forgetting this is the #1 "my floor flew away" bug.

### 1b. Props you already used

```tsx
<RigidBody colliders="cuboid" position={[0, 5, 0]}>
```

- `position={[x,y,z]}` — spawn in **world space**. Ours = 5m above floor so you see the fall.
- `rotation={[x,y,z]}` — spawn rotation (radians). Ours omitted = no tilt.
- `colliders="cuboid"` — auto-build a box shell from children (see §2). Shortcut so you don't write `<CuboidCollider>` manually.

More you will need soon:

```tsx
<RigidBody
  mass={2}                 // kg; default auto from volume
  friction={0.8}           // 0 = ice, 1+ = grippy. Floor usually ~1
  restitution={0.3}        // bounciness 0..1. Ball ~0.7, crate ~0
  linearDamping={0.1}      // air drag on move. Higher = stops faster
  angularDamping={0.5}     // drag on spin
  lockRotations            // FPS player: don't tip over
  enabledRotations={[false, true, false]}  // finer: only yaw
  canSleep                 // default true — bodies nap when still (perf win)
>
```

### 1c. Reading + moving via ref (don't use mesh.position!)

```tsx
import { useRef } from 'react'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'

function Ball() {
  const body = useRef<RapierRigidBody>(null)

  // read: where am I?
  const pos = body.current?.translation()  // { x, y, z }
  const vel = body.current?.linvel()       // { x, y, z }

  // teleport (rare): respawn
  body.current?.setTranslation({ x: 0, y: 5, z: 0 }, true)

  // push: jump / kick
  body.current?.applyImpulse({ x: 0, y: 5, z: 0 }, true)

  return (
    <RigidBody ref={body} colliders="ball">
      <mesh><sphereGeometry /><meshStandardMaterial /></mesh>
    </RigidBody>
  )
}
```

Key distinction:

- `setTranslation / setLinvel` = **teleport** (breaks momentum, use for spawn/respawn)
- `applyImpulse / applyForce` = **physical** (respects mass, use for jump/push)
- `impulse` = instant kick (jump). `force` = over time (rocket). Beginners want impulse 90% of the time.

Never do `meshRef.current.position.y += 1` on a physics object — next step Rapier overwrites it. Move the **body**.

---

## 2. Collider — the invisible solid

Rapier never collides raw triangles by default (too slow). It collides cheap **shells**.

### 2a. Auto (`colliders="..."` prop) vs manual components

Auto — what we use now, one line:

```tsx
<RigidBody colliders="cuboid">  {/* box fitted to child mesh */}
<RigidBody colliders="ball">    {/* sphere */}
<RigidBody colliders="hull">    {/* shrink-wrap convex — good for dragon/rock */}
<RigidBody colliders="trimesh"> {/* exact shape — STATIC ONLY, never dynamic */}
<RigidBody colliders={false}>   {/* no auto — you add manual ones below */}
```

Manual — precise control, combine shapes:

```tsx
<RigidBody colliders={false} position={[0, 5, 0]}>
  <Model ... />
  <CuboidCollider args={[0.5, 1, 0.5]} position={[0, 1, 0]} />   {/* torso */}
  <BallCollider args={[0.4]} position={[0, 2.2, 0]} />           {/* head */}
</RigidBody>
```

Available: `<CuboidCollider args={[hx,hy,hz]} />` (half-extents!),
`<BallCollider args={[r]} />`, `<CapsuleCollider args={[halfH, r]} />`,
`<ConeCollider>`, `<CylinderCollider>`, `<HullCollider>`, `<TrimeshCollider>`, `<HeightfieldCollider>`.

Note `args` for cuboid are **half** sizes: `args={[1,1,1]}` = 2×2×2m box.

### 2b. Which to pick (cheat sheet)

| Shape | Cost | Accuracy | Use |
|-------|------|----------|-----|
| `cuboid` | cheapest | boxy | floor, walls, crates — **default choice** |
| `ball` | cheapest | round | balls, heads |
| `capsule` | cheap | player-like | **players** (slides off edges, doesn't snag) |
| `hull` | medium | shrink-wrap | dragon, rocks, static props |
| `trimesh` | expensive | exact | static level art ONLY |

Why our dragon uses `cuboid` **right now** (line 21):

- You selected `cuboid` in the editor — simplest + cheapest.
- Downside: GLB wings/tail stick out of the box → floats slightly / tips oddly.
- Upgrade path: `colliders="hull"` for better fit, or manual `Capsule + Ball` combo later.
- Never `trimesh` on a dynamic dragon — slow + tunneling risk.

### 2c. Collider-only props (put on RigidBody OR collider component)

```tsx
<RigidBody friction={1} restitution={0.2}>
  <CuboidCollider args={[1, 0.1, 1]} friction={1.2} sensor={false} />
</RigidBody>
```

- `friction` — grip. Floor `~1`, ice `~0`.
- `restitution` — bounce `0..1`. Combined as average of two touching materials.
- `sensor={true}` — detects overlap but **no push**. For trigger zones, pickups, lava. Pair with `onIntersectionEnter`.
- `collisionGroups` / `solverGroups` — advanced: which layers hit which (bullets vs player).

### 2d. See the invisible: `debug`

```tsx
<Physics debug gravity={[0, -9.81, 0]}>
```

Green wireframes = colliders. If an object has no wireframe, it has no collision. Leave `debug` on while learning.

---

## 3. Velocity — how things actually move

Position is the **result**. Velocity is the **cause**.

- `linvel` (linear velocity) = move speed `[x,y,z]` m/s. Falling dragon: `[0,-9.81,0]` after 1s.
- `angvel` (angular velocity) = spin speed. Tipping dragon rotates via this.

Gravity just does `linvel.y -= 9.81 * dt` every step. Then `position += linvel * dt`.

Read / write:

```tsx
body.current?.linvel()                          // { x, y, z }
body.current?.setLinvel({ x: 0, y: 5, z: 0 }, true)  // teleport speed (jump hack)
body.current?.applyImpulse({ x: 0, y: 3, z: 0 }, true) // mass-aware kick (real jump)
```

Jump recipe (for later player):

```tsx
// only if grounded, then:
body.current?.applyImpulse({ x: 0, y: 5, z: 0 }, true)
// mass 1 → vel += 5 m/s up. Heavier mass needs bigger impulse.
```

Damping drains velocity: `linearDamping={0.5}` = strong air brake. Player movement usually sets damping + clamps speed manually each frame.

Sleep: still bodies `canSleep` → solver skips them (perf). `applyImpulse(..., true)` wakes automatically (2nd arg = wake up).

---

## 4. Collision — the moment of touch

Pipeline per step:

```
1. Broadphase: cheap AABB check — "could these boxes overlap?"
2. Narrowphase: exact shape test — "do cuboid vs cuboid intersect?"
3. Solver: push apart along contact normal, kill inward velocity, apply friction/bounce
4. Events: fire callbacks if you subscribed
```

Resting contact (dragon on floor):

- Solver pushes dragon up exactly enough to zero penetration.
- `linvel.y` → `0`. Friction kills sideways slide.
- Next steps repeat — stable rest, not jitter (solver iterates ~4x/step by default).

Bounce: `restitution` average > 0 → reflect velocity. `0.5` floor + `0.5` ball = `0.5` bounce height ratio.

Friction: resists sliding. High friction floor + `lockRotations` player = controllable character.

### 4a. Collision events (subscribe when needed)

Nothing logs by default. Opt in:

```tsx
<RigidBody
  colliders="cuboid"
  onCollisionEnter={({ other }) => console.log('hit!', other.rigidBodyObject?.name)}
  onCollisionExit={() => console.log('left')}
  onSleep={() => console.log('napping')}
  onWake={() => console.log('awake')}
>
```

Sensor / trigger (no push, just detect):

```tsx
<RigidBody type="fixed" colliders={false}>
  <CuboidCollider args={[5, 2, 5]} sensor
    onIntersectionEnter={() => console.log('player entered zone')}
    onIntersectionExit={() => console.log('left zone')}
  />
</RigidBody>
```

Use sensors for: coins, checkpoints, lava, door triggers. Use normal colliders for: walls, floors, crates.

### 4b. Why things fall through (checklist)

1. No `<Physics>` ancestor, or two worlds (bodies in different worlds never meet)
2. `colliders={false}` with no manual collider child → ghost
3. `sensor={true}` → intentionally no push
4. Spawned **inside** floor → solver ejects violently or tunnels. Spawn above.
5. `trimesh` on dynamic / paper-thin plane + high speed → tunneling. Use thicker box + `cuboid`/`hull`, or enable CCD: `<RigidBody ccd>` for bullets.
6. Floor missing `type="fixed"` → floor itself falls.

Quick test: turn on `<Physics debug>` — no green shell = no collision, guaranteed fall-through.

---

## 5. Our scene annotated (every line that matters)

```tsx
<Physics gravity={[0, -9.81, 0]}>       // World. 60 steps/s, Earth gravity down -Y
  <RigidBody                            // Body 1: dynamic (default) = falls + pushed
    colliders="cuboid"                  // Shell: box around GLB. Cheap, slightly loose fit
    position={[0, 5, 0]}                // Spawn 5m up so fall is visible
  >
    <Model ... />                       // Costume only. No physics of its own
  </RigidBody>
  <RigidBody                            // Body 2: floor
    type="fixed"                        // Never moves, but pushes dragon up
    colliders="cuboid"                  // Shell: box from mesh below
  >
    <mesh position={[0, -0.05, 0]}>      // Center sunk so TOP face = y=0 exactly
      <boxGeometry args={[2000, 0.1, 2000]} />  // Real thickness (not plane) = no tunneling
      <meshStandardMaterial color="#3a3a3a" />  // Lit gray, reacts to spot/point lights
    </mesh>
  </RigidBody>
</Physics>
```

Try now (safe experiments):

- `position={[0,10,0]}` → longer fall
- `<Physics debug>` → see both green boxes
- `restitution={0.6}` on dragon body → bouncy landing
- `colliders="hull"` on dragon → tighter fit to wings

Next up: player movement (kinematic body + `setLinvel` each frame + jump impulse) and sensor zones.
