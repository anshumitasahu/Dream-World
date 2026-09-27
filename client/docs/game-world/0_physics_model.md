# 0. Physics Model — What Even Is "Physics" in a Game? (Start Here)

> Read this first before RigidBody / Collider docs.
> Goal: build intuition for **why** we need Rapier at all, and what runs every frame.

## 1. The problem: Three.js has eyes, no touch

Three.js only **draws**:

- `mesh` = triangles + material on screen
- No weight, no falling, no blocking

Before Rapier, our floor was just paint:

```tsx
<mesh>
  <planeGeometry />
  <meshBasicMaterial />
</mesh>
```

Dragon at `y=5` would stay floating at `y=5` forever — or if we animated it down manually, it would sink straight through the floor. There is no "solid".

Physics adds **touch**: solidity, weight, push, bounce.

## 2. Two worlds running side-by-side

Think of every physics game as two parallel worlds:

```
VISUAL WORLD (Three.js)          PHYSICAL WORLD (Rapier)
-----------------------          ------------------------
pretty dragon mesh               invisible cuboid around dragon
pretty gray floor mesh           invisible huge flat box
lights, shadows, colors          mass, velocity, gravity numbers
what you SEE                     what you FEEL / COLLIDE
```

`@react-three/rapier` keeps them in sync automatically:

- You declare both in one place (`<RigidBody>` wraps `<mesh>`)
- Rapier moves the **body**
- R3F copies body position → mesh position every frame

Rule: **never move the mesh directly if it has physics. Move the body.**

## 3. Vocabulary (only 9 words to memorize)

| Term | Plain English | Example in our scene |
|------|---------------|---------------------|
| `World` (`<Physics>`) | The room where physics happens. Owns gravity + clock | `<Physics gravity={[0,-9.81,0]}>` |
| `Gravity` | Constant pull applied every step | `-9.81` on Y = Earth-like fall |
| `RigidBody` | A thing that can move / be hit | Dragon (moves), floor (doesn't) |
| `Collider` | Invisible solid shell around a thing | `cuboid` box around dragon + floor |
| `Mass` | How heavy. Auto = volume × density | Dragon heavier than a ball |
| `Velocity` | Speed + direction right now | `linvel` = falling speed |
| `Force / Impulse` | Push over time / instant kick | Jump = upward impulse |
| `Timestep` | Physics clock tick. Default 60/sec | `1/60s` per step |
| `Solver` | Judge that un-overlaps things | Pushes dragon out of floor |

That's it. Everything else is detail on these 9.

## 4. What happens every frame (the loop)

Vanilla mental model:

```
60 times per second:
  1. Apply gravity: velocity.y -= 9.81 * dt
  2. Move bodies: position += velocity * dt
  3. Detect overlap: does dragon box intersect floor box?
  4. Solve: if yes, push out + kill inward velocity
  5. Copy result to visible meshes
  6. Three.js draws
```

Concrete fall in our `App.tsx`:

1. Dragon spawns at `position={[0,5,0]}` with velocity `[0,0,0]`
2. Step 1: `vel.y = 0 + (-9.81)*(1/60) = -0.16`
3. Step 2: `pos.y = 5 - 0.16*(1/60) ≈ 4.997` — tiny drop
4. After ~1 sec: `vel.y ≈ -9.81`, falling fast
5. Dragon cuboid touches floor cuboid → solver says "no penetration"
6. Pushes dragon up to rest on top, sets `vel.y = 0`
7. Dragon sleeps there. Mesh follows body, so you see it land.

If there were no floor collider, step 3 never triggers → falls forever.

## 5. Why Rapier (and not code it ourselves)?

- Collision math for boxes/spheres/capsules is hard + must be fast
- Rapier is written in Rust, compiled to WASM — runs near-native speed in browser
- `@react-three/rapier` = React wrapper: `<Physics>`, `<RigidBody>` instead of manual `world.step()`
- Alternative `cannon` / `ammo` exist, but Rapier is fastest + best maintained for R3F now

You don't need to learn Rust or WASM. Just the 9 words above + JSX props.

## 6. How our scene maps to the model

`src/App.tsx` right now:

```tsx
<Physics gravity={[0, -9.81, 0]}>          {/* World + gravity */}
  <RigidBody colliders="cuboid" position={[0, 5, 0]}>  {/* dynamic body + box shell */}
    <Model modelPath="/models/black_dragon_with_idle_animation.glb" ... />
  </RigidBody>
  <RigidBody type="fixed" colliders="cuboid">          {/* immovable body + box shell */}
    <mesh position={[0, -0.05, 0]}>
      <boxGeometry args={[2000, 0.1, 2000]} />
      <meshStandardMaterial color="#3a3a3a" />
    </mesh>
  </RigidBody>
</Physics>
```

- World: one `<Physics>`, Earth gravity
- Body 1: dragon, dynamic (default) → falls
- Shell 1: auto `cuboid` around GLB
- Body 2: floor, `fixed` → never moves
- Shell 2: auto `cuboid` from box mesh, top face at `y=0`

Next: `1_rapier_wrold_and_floor_colider.md` = how we built this step-by-step.
Then: `2_rigidbody_collider_velocity_collision.md` = deep dive on each piece.
