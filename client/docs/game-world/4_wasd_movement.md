# 4. WASD Moves Capsule — Keyboard Input to Velocity (Beginner Notes)

> Goal of this step: press **W A S D (or arrow keys)** and the red capsule glides on the floor. Release → it stops. No camera work yet — movement is in **world space** (W = always `-Z`), camera-relative steering comes in step 7.
> Prereq: `3_capsule_player.md` (the body, shell, costume). Sequel: camera follow (next).

## 0. What we just did (TL;DR)

1. Added a `keys` set + `keydown`/`keyup` listeners in `Player.tsx` — remembers which keys are held right now.
2. Added a `useFrame` loop — every rendered frame, reads the set, computes a direction, and calls `body.setLinvel(...)` to set the body's velocity.
3. Run the app: hold W → capsule moves away at 5 m/s. Release → stops dead. It still falls with gravity and still can't tip over.

New code in `src/components/GameSystem/Player.tsx` (body/collider/mesh unchanged):

```tsx
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'

const SPEED = 5

export default function Player() {
  const body = useRef<RapierRigidBody>(null)
  const keys = useRef<Set<string>>(new Set())

  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.current.add(e.code)
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame(() => {
    const b = body.current
    if (!b) return

    const k = keys.current
    let x = 0
    let z = 0
    if (k.has('KeyW') || k.has('ArrowUp')) z -= 1
    if (k.has('KeyS') || k.has('ArrowDown')) z += 1
    if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1
    if (k.has('KeyD') || k.has('ArrowRight')) x += 1

    if (x !== 0 && z !== 0) {
      x *= Math.SQRT1_2
      z *= Math.SQRT1_2
    }

    const vel = b.linvel()
    b.setLinvel({ x: x * SPEED, y: vel.y, z: z * SPEED }, true)
  })

  return (
    <RigidBody ref={body} /* ...unchanged... */>
      {/* collider + mesh unchanged */}
    </RigidBody>
  )
}
```

## 1. Mental model: input is a pipeline, not a teleport

Beginners often imagine "press W → move forward" as one action. It's actually a 5-stage pipeline that runs **every frame**:

```
1. INPUT      keyboard remembers: "W is currently held"
       │
2. INTENT     each frame: held keys → direction (x=0, z=-1)
       │
3. VELOCITY   direction × speed → body's velocity (linvel)
       │
4. PHYSICS    Rapier steps: position += velocity × dt, solves collisions
       │
5. RENDER     R3F copies body → mesh, Three.js draws
```

Our code owns stages 1–3. Rapier owns 4. R3F/Three own 5. The docs you already read map onto this:

- Stage 4 is doc 0 §4 (the per-frame loop) and doc 2 §3 (velocity is the *cause*, position the *result*).
- The rule **"move the body, never the mesh"** (doc 0 §2, doc 1 §2d) is why stage 3 calls `setLinvel` on the `RigidBody` instead of touching `mesh.position`.

Two design decisions fall out of this model:

- **Velocity control, not position control.** We set *how fast* it moves, and physics integrates that into *where* it is — so collisions, friction, and gravity keep working. Teleporting position each frame would punch through walls.
- **Every frame, not on keypress.** Holding W fires one `keydown` event, but movement must continue for as long as it's held. So events only *record* state (stage 1); the `useFrame` loop *reads* that state 60×/sec (stage 2). Event = "remember". Frame loop = "act on what you remember".

## 2. Core R3F / React concepts (only 3 you need now)

### a) `useRef` = a box that doesn't re-render

```tsx
const body = useRef<RapierRigidBody>(null)  // will hold the physics body
const keys = useRef<Set<string>>(new Set()) // will hold currently-held keys
```

- `useRef` creates a persistent `.current` slot that survives re-renders.
- Writing to `.current` does **not** re-render the component. That's the point: keys change many times per second — if each keypress re-rendered the JSX, the app would thrash. Refs let the frame loop read fresh input with zero renders.
- `body` starts `null` and gets filled when `<RigidBody ref={body}>` mounts. Hence the `if (!b) return` guard — first frames may run before mount.

### b) `useEffect` = "plug in the keyboard on mount, unplug on unmount"

```tsx
useEffect(() => {
  window.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  return () => { /* remove both */ }
}, [])
```

- Empty `[]` = run once when the component appears, clean up when it disappears.
- Forgetting the cleanup duplicates listeners on every hot-reload/remount → keys get added twice, `keyup` stops working right. Always return the remover.

### c) `useFrame` = "run this before every drawn frame"

```tsx
useFrame(() => { /* read keys → set velocity */ })
```

- R3F owns the render loop (doc 1 §6) — you never write `requestAnimationFrame` yourself. `useFrame` is your hook *into* that loop.
- Our callback runs ~60×/sec. Each run sets the velocity Rapier will integrate on its next step. That ordering (we set intent → physics steps → draw) is exactly pipeline stages 2→4.

## 3. Every new line, explained

**`e.code`, not `e.key`:**

```tsx
const down = (e: KeyboardEvent) => keys.current.add(e.code)
```

- `e.code` = *physical key position* (`KeyW` = the key where W lives on QWERTY, whatever letter it prints on AZERTY). `e.key` = the *printed character* (layout-dependent).
- Games want physical positions, so `KeyW` keeps working on French/German keyboards. Minor detail now, correct habit forever.

**Direction mapping — note the signs:**

```tsx
if (k.has('KeyW') || k.has('ArrowUp')) z -= 1
if (k.has('KeyS') || k.has('ArrowDown')) z += 1
if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1
if (k.has('KeyD') || k.has('ArrowRight')) x += 1
```

- In Three.js, the camera looks down **`-Z`** by default. So "forward" (W) = `-Z`, "back" (S) = `+Z`. A = `-X` (left), D = `+X` (right).
- Arrow keys map to the same directions — free accessibility win, one `||` each.
- This is **world space**: W always means `-Z` no matter where the camera orbits. That's why orbiting with `OrbitControls` while pressing W feels wrong — step 7 (camera-relative) fixes it.

**Diagonal normalization:**

```tsx
if (x !== 0 && z !== 0) {
  x *= Math.SQRT1_2
  z *= Math.SQRT1_2
}
```

- Holding W+D gives `(x=1, z=-1)` with length `√2 ≈ 1.41` — 41% faster diagonally. Classic bug in every beginner movement script.
- Multiplying both by `1/√2` (`Math.SQRT1_2 ≈ 0.707`) brings the length back to exactly 1. All 8 directions now move at the same `SPEED`.

**The velocity write — the heart of the step:**

```tsx
const vel = b.linvel()
b.setLinvel({ x: x * SPEED, y: vel.y, z: z * SPEED }, true)
```

Three things to notice:

1. **`y: vel.y` — we preserve gravity.** `setLinvel` *replaces* the whole velocity vector. If we wrote `y: 0`, we'd erase falling every frame and the capsule would hover/float. Reading current `y` and writing it back untouched means gravity (doc 2 §3: `vel.y -= 9.81·dt`) keeps accumulating exactly as before — movement and falling coexist.
2. **`true` (2nd arg) = wake up.** Sleeping bodies (doc 2 §3) skip simulation. After standing still, our capsule naps; without `true`, the first W-press after a nap would be ignored for a few frames. `true` says "wake up, this body is active again."
3. **Release → instant stop.** No keys = `(x=0, z=0)` → horizontal velocity forced to 0 every frame. Combined with `friction={1}`, the capsule halts immediately — snappy arcade feel. (A slippery/ice feel would instead *lerp* velocity toward the target; we're deliberately not doing that yet.)

**`ref={body}` on the RigidBody:**

```tsx
<RigidBody ref={body} colliders={false} ...>
```

- Plugs the actual Rapier body object into our `body` ref so `useFrame` can call `linvel()`/`setLinvel()`. Same pattern as doc 2 §1c (`Ball` example) — now used for real.

**`const SPEED = 5`:**

- 5 m/s ≈ a brisk run. Human walk ≈ 1.5, sprint ≈ 6–8. Tune freely: `3` = walky, `8` = zippy. One constant at the top so tuning never means hunting through logic.

## 4. Why `setLinvel` and not the alternatives? (doc 2 §1c applied)

| Method | What it does | Why / why not here |
|--------|--------------|--------------------|
| `mesh.position.x += …` | Teleports the visual | **Never with physics** — Rapier overwrites it next step; punches through walls (doc 0 §5, doc 2 §1c) |
| `applyImpulse` every frame | Adds force each frame | Accelerates forever (press W 3s → supersonic). Correct for *jumps* (one kick), wrong for *sustained run* |
| `setTranslation` every frame | Teleports the body | Ignores collision solving on the way — tunnels through the dragon/floor at speed |
| **`setLinvel` every frame** | Declares "move exactly this fast" | **Ours.** Constant speed, collisions still solved, friction still grips. The standard velocity-control character recipe |

Jump later will use `applyImpulse` (one instant kick up, doc 2 §3 recipe) *alongside* this — the two compose because impulse changes `y` while our loop preserves `y`.

## 5. Collision flow (what pressing W actually does, frame by frame)

1. Finger down on W → one `keydown`, `keys = {KeyW}`.
2. Next `useFrame`: direction `(0,-1)` → `setLinvel({x:0, y:vel.y, z:-5})`.
3. Rapier steps: `pos.z += -5 × 1/60 ≈ -0.083m`. Checks capsule-vs-floor: still touching, not penetrating → solver keeps `y` resting, friction would resist sliding but our explicit velocity wins (velocity control overrides friction while held).
4. Capsule reaches the dragon? Capsule-vs-cuboid narrowphase (doc 2 §4) → solver pushes both apart, sideways velocity killed at contact. You can't walk through the dragon — proof collision survives movement.
5. Finger up → `keyup`, `keys = {}` → `setLinvel({x:0, y:vel.y, z:0})` → horizontal velocity zeroed → capsule halts on the spot.

## 6. How to test / debug this yourself

- **Hold W 2 seconds** — steady glide, no acceleration curve (distinguishes `setLinvel` from `applyImpulse`-per-frame, which would visibly speed up).
- **Diagonal check:** hold W+D, compare distance covered vs W alone over the same time. Equal → normalization works. (Or `console.log` the `x, z` before `setLinvel`.)
- **Release test:** let go mid-run — stops within a frame or two (arcade stop, not a slide).
- **Gravity coexistence:** walk off… (no edge yet — floor is 2000m, so instead: note `y` keeps working — spawn at `position={[20, 6, 20]}` and hold W *while falling*. It steers mid-air and still lands. Air control is on by default with this recipe; restricting it is a later design choice, not a bug.)
- **Push test:** walk into the dragon — you stop/slide around it instead of passing through. Collision + movement composed.
- **Keyboard layout sanity:** open devtools, press keys, `console.log(e.code, e.key)` — see why `code` is layout-stable.

## 7. Common beginner mistakes (movement edition)

1. **Overwriting `y`:** `setLinvel({x, y: 0, z})` cancels gravity → capsule floats or can't fall. Always carry `vel.y` through.
2. **`e.key` instead of `e.code`:** works on your keyboard, breaks 'WASD' on AZERTY (`e.key` = 'z' where W is). Use `e.code`.
3. **Missing effect cleanup:** no `removeEventListener` → double listeners after remount/hot-reload → stuck keys (keyup handled once, keydown twice).
4. **`useState` for keys:** re-renders the whole component per keypress for data the JSX never displays. Refs (`useRef`) are the right tool for per-frame input state.
5. **Faster diagonals:** forgetting the `SQRT1_2` normalization → 41% speed boost on W+A etc. Test §6 catches it.
6. **Impulse-per-frame:** `applyImpulse` inside `useFrame` looks like it works for 1 second, then the capsule is uncontrollable. Impulse = one kick (jump); `setLinvel` = sustained speed.
7. **Forgetting `if (!b) return`:** `body.current` is `null` before mount → crash on first frames without the guard.

## 8. What's next (not yet done)

- [ ] **Step 5 — Camera follows capsule:** `useFrame` in a camera rig, lerp to `body.translation()` each frame
- [ ] **Step 6 — Pointer lock rotates camera:** enable `<PointerLockControls />` (already imported in `App.tsx`), click-to-lock
- [ ] **Step 7 — Camera-relative WASD:** rotate the `(x, z)` intent by camera yaw before `setLinvel`, so W = "away from camera"
- [ ] Jump (`Space` → `applyImpulse({y})` when grounded) — needs a grounded check first

Related files: `src/components/GameSystem/Player.tsx`, `src/App.tsx`
Packages: `@react-three/fiber` (`useFrame`), `@react-three/rapier` (`RigidBody`, `CapsuleCollider`, `RapierRigidBody`), `react` (`useEffect`, `useRef`)
