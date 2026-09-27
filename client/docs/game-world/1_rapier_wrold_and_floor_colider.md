# 1. Rapier World + Floor Collider (Beginner Notes)

> Goal of this step: give our scene **gravity** so the dragon falls and **lands on the floor** instead of falling forever.
> If you run the app now, the dragon spawns at `y=5`, falls down, and stops on the ground.
> Prereq: `0_physics_model.md` (mental model). Sequel: `2_rigidbody_collider_velocity_collision.md` (deep dive).

## 0. What we just did (TL;DR)

1. Installed physics: `bun add @react-three/rapier`
2. Wrapped scene objects in `<Physics>` in `src/App.tsx`
3. Made dragon a **falling** body: `<RigidBody colliders="cuboid" position={[0,5,0]}>`
4. Made floor a **static** body: `<RigidBody type="fixed" colliders="cuboid">` with a thin box mesh

Final `App.tsx` looks like this:

```tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PointerLockControls } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import Model from './components/Rendering/models/Model'

export default function App() {
  return (
    <Canvas camera={{ fov: 75, near: 1, far: 1000, position: [0, 1, 100] }}>
      <axesHelper />
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Physics gravity={[0, -9.81, 0]}>
        <RigidBody colliders="cuboid" position={[0, 5, 0]}>
          <Model
            modelPath="/models/black_dragon_with_idle_animation.glb"
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={1}
          />
        </RigidBody>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[2000, 0.1, 2000]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
        </RigidBody>
      </Physics>
      {/* <PointerLockControls /> */}
      <OrbitControls />
    </Canvas>
  )
}
```

> Note: dragon currently uses `colliders="cuboid"` (cheap box, slightly loose around wings).
> Upgrade to `"hull"` later for tighter fit — see doc 2 §2b.

## 1. Mental model: Three.js vs R3F vs Rapier

Think in 3 layers:

| Layer | What it does | Analogy |
|-------|--------------|---------|
| **Three.js** | Draws things (meshes, lights, camera) | Eyes |
| **React Three Fiber (R3F)** | Lets you write Three.js as React JSX (`<mesh>`, `<Canvas>`) | Translator |
| **Rapier** | Simulates weight, gravity, collision | Brain for touch |

Before this change we only had **eyes**. The floor was just paint — no solidity. Rapier adds **touch**.

Flow per frame:
```
1. Rapier steps physics (60 times/sec by default)
   -> updates RigidBody positions
2. R3F copies those positions to the visible meshes
3. Three.js draws the frame
```

You never move physics objects with `mesh.position` directly. You move the `RigidBody`, the mesh follows.

## 2. Core Rapier concepts (only 4 you need now)

### a) `<Physics>` = the World
Creates one physics simulation. Everything that should collide must be inside it.

```tsx
<Physics gravity={[0, -9.81, 0]}>
  {/* bodies go here */}
</Physics>
```

- `gravity={[x, y, z]}` — Earth-like is `[0, -9.81, 0]`. Negative Y = pull down.
- Only **one** `<Physics>` per scene normally.
- Debug view: `<Physics debug>` shows wireframe colliders. Super useful to see invisible shapes.

### b) `<RigidBody>` = a physical thing
Wraps a mesh to give it mass, velocity, position in physics.

3 types:

```tsx
<RigidBody type="dynamic"> {/* default: falls, gets pushed, collides */}
<RigidBody type="fixed">   {/* never moves: floors, walls */}
<RigidBody type="kinematicPosition"> {/* moved by code: elevators, player */}
```

We used:
- Dragon = `dynamic` (default, so we omitted `type`) — it should fall.
- Floor = `fixed` — it should never move even when dragon lands on it.

Rule: **If it should not fall, make it `fixed`.**

### c) Collider = invisible solid shape
Rapier does NOT use your pretty triangles for collision by default (too slow). It wraps them in a simple invisible shape.

`colliders` prop auto-creates one from the child mesh:

| Value | Shape | When to use |
|-------|-------|-------------|
| `"cuboid"` | box | floor, walls, crates |
| `"ball"` | sphere | balls |
| `"hull"` | shrink-wrap convex shell | dragon, rocks, simple characters |
| `"trimesh"` | exact mesh shape | static scenery only, never for moving things (slow + buggy) |

We used:
- Floor: `colliders="cuboid"` — perfect box.
- Dragon: `colliders="cuboid"` for now — cheap box around GLB (see doc 2 §2b for `hull` upgrade).

Beginner trap: `colliders="trimesh"` on a moving character looks accurate but causes tunneling and jank. Use `hull` or `cuboid` for anything dynamic.

### d) Position belongs on RigidBody, not mesh
```tsx
// correct: spawn height on body
<RigidBody position={[0, 5, 0]}>
  <Model position={[0, 0, 0]} />
</RigidBody>
```
If you put offset on both, they add up. Keep mesh at `[0,0,0]` inside body unless you need a visual offset.

## 3. Why we changed the floor mesh

Old floor:
```tsx
<mesh rotation={[-Math.PI/2, 0, 0]}>
  <planeGeometry args={[2000, 2000, 100, 100]} />
  <meshBasicMaterial vertexColors />
</mesh>
```

New floor:
```tsx
<RigidBody type="fixed" colliders="cuboid">
  <mesh position={[0, -0.05, 0]}>
    <boxGeometry args={[2000, 0.1, 2000]} />
    <meshStandardMaterial color="#3a3a3a" />
  </mesh>
</RigidBody>
```

3 reasons:

1. **Plane has zero thickness.** A `cuboid` collider built from a flat plane is paper-thin. Fast falling objects tunnel through. A thin box `2000 x 0.1 x 2000` gives real volume. Top face is still at `y=0` because center is at `-0.05`.
2. **`meshBasicMaterial` ignores lights.** It looks flat white/gray and `vertexColors` without vertex colors renders black. `meshStandardMaterial` reacts to our spot/point lights so floor has depth.
3. **Before it wasn't in `<Physics>` at all.** No RigidBody = no collision. Dragon would fall through.

## 4. Collision flow (what happens when you press run)

1. Dragon spawns at `y=5` (RigidBody position).
2. Each physics step, gravity adds downward velocity: `v += -9.81 * dt`.
3. Rapier moves dragon down, checks `cuboid` vs floor `cuboid` overlap.
4. On contact, solver pushes dragon out and zeroes vertical velocity. It rests at `y≈0`.
5. R3F syncs mesh transform to body transform, Three draws it.

If you see dragon fall through: collider missing, floor not `fixed`, or spawn inside floor.

## 5. How to test / debug this yourself

- Change spawn to `position={[0, 10, 0]}` — longer fall, easier to see.
- Add `debug`: `<Physics debug gravity={[0,-9.81,0]}>` — green wireframes = colliders. If you don't see one, that object has no collision.
- Remove floor RigidBody temporarily — dragon falls forever. That proves physics is working.
- Console: `@react-three/rapier` logs nothing on collision by default. To see events, add `onCollisionEnter` on RigidBody later.

## 6. R3F things you touched without realizing

- `<Canvas>` = renderer + camera + loop. We didn't need `requestAnimationFrame` — R3F owns it.
- JSX in lowercase (`<mesh>`, `<boxGeometry>`) = Three.js objects. Capitalized (`<Physics>`, `<RigidBody>`, `<Model>`) = React components.
- `position={[x,y,z]}` prop = `object.position.set(x,y,z)` in vanilla Three.
- Lights only affect `Standard/Physical` materials, not `Basic`. That's why material swap mattered.

## 7. Common beginner mistakes (save yourself hours)

1. Moving mesh with `useFrame` while it has RigidBody — fights physics. Move body via `api` or forces instead.
2. Two `<Physics>` worlds — objects in different worlds never collide.
3. Huge floor `2000x2000` + `hull` on tiny player = float precision jitter far from origin. Keep play area near `[0,0,0]` or make floor smaller (e.g. `100x100`).
4. Forgetting `type="fixed"` on floor — floor becomes dynamic and falls away with player.
5. Scaling RigidBody parent via `scale` prop — colliders don't like non-uniform scale. Scale the mesh/geometry instead.

## 8. What's next (not yet done)

- [ ] Player controller: WASD + jump with `kinematicPosition` or character controller
- [ ] Collision events: `onCollisionEnter` for sound / damage
- [ ] Better dragon collider: compound colliders (`<CuboidCollider>` + `<BallCollider>` manually) instead of auto `hull`
- [ ] Limit floor to playable size + add walls so player can't walk to infinity

Related files: `src/App.tsx`, `src/components/Rendering/models/Model.tsx`
Packages: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`
