# 3. Capsule Player — Your First Controllable Body (Beginner Notes)

> Goal of this step: add a **red capsule** that spawns in the air, falls, and **lands standing upright** on the floor.
> It doesn't move yet — WASD comes in the next step. Right now it just *exists* as a solid body.
> Prereq: `0_physics_model.md`, `1_rapier_wrold_and_floor_colider.md`, `2_rigidbody_collider_velocity_collision.md`.

## 0. What we just did (TL;DR)

1. Created `src/components/GameSystem/Player.tsx` — a `RigidBody` + `CapsuleCollider` + red `capsuleGeometry` mesh.
2. Added `<Player />` inside `<Physics>` in `src/App.tsx` (next to the dragon, not replacing it).
3. Run the app: red capsule drops ~1m, lands, stands still. Green wireframe (debug) hugs the red mesh exactly.

Final `Player.tsx`:

```tsx
import { CapsuleCollider, RigidBody } from '@react-three/rapier'

export default function Player() {
  return (
    <RigidBody
      colliders={false}
      position={[3, 2, 0]}
      lockRotations
      friction={1}
      restitution={0}
    >
      <CapsuleCollider args={[0.5, 0.5]} />
      <mesh>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial color="#e63b3b" />
      </mesh>
    </RigidBody>
  )
}
```

And in `App.tsx`, one line added inside `<Physics>`:

```tsx
<Physics gravity={[0, -9.81, 0]} debug>
  <RigidBody colliders="cuboid" position={[0, 5, 0]}>
    {/* dragon, unchanged */}
  </RigidBody>
  <Player />
  <RigidBody type="fixed" colliders="cuboid">
    {/* floor, unchanged */}
  </RigidBody>
</Physics>
```

## 1. Mental model: a player is 3 layers in one component

Every character in a physics game is the same sandwich. We already met this in doc 0 (§2, two worlds) — now we build one ourselves:

```
┌─────────────────────────────────────────┐
│  Player.tsx                             │
│                                         │
│  1. BODY (RigidBody)                    │
│     "Where am I? How fast? How heavy?"  │
│     position, velocity, mass             │
│            │                            │
│  2. SHELL (CapsuleCollider)             │
│     invisible solid that collides       │
│            │                            │
│  3. COSTUME (mesh + capsuleGeometry)    │
│     red pill you actually SEE           │
└─────────────────────────────────────────┘
```

- Physics only touches layers 1+2. It has no idea what color the capsule is.
- Three.js only draws layer 3. It has no idea gravity exists.
- `<RigidBody>` wrapping the mesh is the glue: Rapier moves the body, R3F copies the transform to the mesh (doc 0 §4).

Rule from doc 0 still holds: **never move the mesh directly — move the body.** We haven't added movement yet, but when WASD arrives, it will push the `RigidBody`, never `mesh.position`.

## 2. Why a capsule and not a box?

The dragon uses `colliders="cuboid"` (a box). For a *player* that will soon walk, boxes are bad:

| Shape | Walking into a small step / floor seam | Landing slightly tilted |
|-------|----------------------------------------|------------------------|
| **Box** | Sharp bottom edge **catches** — gets stuck on tiny lips | Corner digs in — tips or jitters |
| **Capsule** | Round bottom **slides up and over** | Round bottom **self-rights**, always settles upright-ish |

A capsule = a cylinder with a hemisphere (half-ball) on each end. No sharp edges anywhere, so nothing snags. This is why virtually every character controller in every engine (Unity, Unreal, Godion, Rapier) defaults to a capsule. Cheat sheet in doc 2 §2b says the same: `capsule` = **players**.

## 3. Capsule anatomy: the two numbers you must match

A capsule is defined by exactly 2 numbers:

- **radius (r)** — how fat. Ours: `0.5` → 1m wide.
- **halfHeight (h)** — half the length of the *cylindrical middle section only* (not counting the caps). Ours: `0.5` → middle section is 1m tall.

Total height = middle + two caps = `2*h + 2*r` = `1 + 1` = **2m tall**. Roughly human-sized. Good default for a player.

Here's the beginner trap: **Rapier and Three.js take these numbers in different order and different form.** Same capsule, two dialects:

```tsx
<CapsuleCollider args={[0.5, 0.5]} />              // Rapier: [halfHeight, radius]
<capsuleGeometry args={[0.5, 1, 8, 16]} />        // Three:  [radius, length, capSegments, radialSegments]
```

- Rapier wants `[halfHeight, radius]` = `[0.5, 0.5]`.
- Three wants `[radius, length, ...]` where `length` = the FULL middle section = `2 * halfHeight` = `1`.
- The last two (`8, 16`) are just smoothness (segments). More = rounder, slower. `8, 16` is a fine default; ignore them for now.

**The shell and the costume must be the same size.** If the collider is bigger than the mesh, you float above the floor. If smaller, you sink into it. With `debug` on, the green wireframe should hug the red mesh exactly — that's your visual check.

Rest-height math (so you can predict landings): the body's `position` is its **center**. It comes to rest with its bottom touching `y=0`, so center = `halfHeight + radius` = `0.5 + 0.5` = **`y=1`**. We spawn at `y=2`, so it falls exactly 1m. Small drop, easy to watch.

## 4. Every prop in Player.tsx, line by line

```tsx
<RigidBody
```

Default `type="dynamic"` (we omit it, same as the dragon) — falls under gravity, collides. Correct for now: we *want* to watch it fall and land. Later steps keep it dynamic and push it with velocity for WASD.

```tsx
  colliders={false}
```

Turn OFF the auto-collider. Why? Auto (`colliders="cuboid"`) would wrap our capsule mesh in a **box** — reintroducing the snagging problem from §2. `false` means "I'll add my own shell manually," which we do on the next line. (Doc 2 §2a covers auto vs manual.)

```tsx
  <CapsuleCollider args={[0.5, 0.5]} />
```

Our manual shell: `[halfHeight, radius]`. Position defaults to `[0,0,0]` = centered on the body, which is what we want — shell, body, and mesh all concentric.

```tsx
  position={[3, 2, 0]}
```

Spawn in **world space**: 3m to the side of the dragon (so they don't collide mid-air), 2m up (1m drop to rest). Position lives on the `RigidBody`, never on the mesh — doc 1 §2d.

```tsx
  lockRotations
```

**The most important line for a player.** A dynamic body that lands even slightly off-center gets torque (twisting force) and tips over — your capsule would faceplant and lie on the floor. `lockRotations` freezes all rotation so the body can move but never tilt. It always stays upright no matter what it bumps into. (FPS characters always use this; doc 2 §1b lists it.)

```tsx
  friction={1}
  restitution={0}
```

- `friction={1}` = grippy shoes. `0` would be ice — the capsule would slide away on landing. Floors/players usually want `~1`.
- `restitution={0}` = zero bounce. A bouncy player feels broken; save bounce for balls (doc 2 §1b, §4).

```tsx
  <mesh>
    <capsuleGeometry args={[0.5, 1, 8, 16]} />
    <meshStandardMaterial color="#e63b3b" />
  </mesh>
```

The costume: red pill, same dimensions as the shell (§3). `meshStandardMaterial` (not `Basic`) so it reacts to our scene lights like the floor does — doc 1 §3 reason 2.

## 5. Collision flow (what happens when you press run)

Same 5-step loop as doc 1 §4, now with two falling bodies:

1. Player spawns at `[3,2,0]`, dragon at `[0,5,0]`, both velocity `[0,0,0]`. (Spawned 3m apart → their shells never touch → no mid-air collision.)
2. Gravity: `vel.y -= 9.81 * dt` every 1/60s step, both bodies.
3. Player's capsule shell approaches the floor's cuboid shell. Narrowphase tests capsule-vs-box (doc 2 §4).
4. Contact: solver pushes the player up along the contact normal, zeroes `vel.y`. Friction kills sideways drift. `lockRotations` kills any tip.
5. Player rests with center at `y≈1`, asleep (`canSleep` defaults true — doc 2 §3). Mesh follows body. You see a red capsule standing on gray floor next to the dragon.

## 6. How to test / debug this yourself

- **Green wireframe check:** with `<Physics debug>`, the green capsule outline should exactly overlap the red mesh. Bigger/smaller/offset = your `args` don't match (§3).
- **Drop test:** change spawn to `position={[3, 6, 0]}` — longer fall, same upright landing. Proves gravity + solver, not luck.
- **Tip test:** temporarily remove `lockRotations`, spawn at `position={[3, 2, 0.3]}` (slightly off-axis), watch it faceplant. Put `lockRotations` back. Now you *feel* why the prop exists.
- **Bounce test:** set `restitution={0.8}` — capsule bounces on landing like a ball. Set back to `0`. Players don't bounce.
- **Ice test:** set `friction={0}` and give the dragon a shove into the player (or spawn player at an x-offset with drift later) — slides forever. Set back to `1`.

## 7. Common beginner mistakes (capsule edition)

1. **Swapped args:** `<CapsuleCollider args={[0.5, 0.5]}>` looks symmetric so you're safe *this time* — but with `args={[0.8, 0.3]}` remember Rapier = `[halfHeight, radius]`, Three = `[radius, length]`. Swapping gives a fat pancake or thin needle that doesn't match the visual.
2. **Forgetting `colliders={false}`** while adding a manual collider → you get BOTH the auto box AND your capsule. Double shell = floats 0.5m in the air. One body, one shell.
3. **Forgetting `lockRotations`** → capsule tips over on first contact and rolls. #1 "my player fell over" bug.
4. **Position on the mesh instead of the body** → offsets add up (doc 1 §2d). Keep `<mesh>` positionless inside a `RigidBody` unless you deliberately want a visual offset, with the collider adjusted to match.
5. **Spawning inside the floor** (`position={[3, 0.5, 0]}` puts the capsule's bottom below `y=0`) → solver ejects it violently. Always spawn with bottom above `y=0`: `spawnY > halfHeight + radius`.

## 8. What's next (not yet done)

- [ ] **Step 4 — WASD moves capsule:** read keys, `setLinvel` / impulse each frame (that's why we kept it `dynamic`)
- [ ] **Step 5 — Camera follows capsule:** `useFrame` lerp to body translation
- [ ] **Step 6 — Pointer lock rotates camera:** uncomment `<PointerLockControls />` (already imported in `App.tsx`)
- [ ] **Step 7 — Camera-relative WASD:** transform input direction by camera yaw

Related files: `src/components/GameSystem/Player.tsx`, `src/App.tsx`
Packages: `@react-three/rapier` (`RigidBody`, `CapsuleCollider`), `three` (`capsuleGeometry`)
