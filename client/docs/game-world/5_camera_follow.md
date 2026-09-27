# 5. Camera Follows Capsule — Chase Cam with Smoothing (Beginner Notes)

> Goal of this step: the camera **trails behind and above** the capsule and glides after it as you walk. No more losing the player off-screen. Rotation (mouse look) comes in step 6 — right now the follow direction is **fixed** (always +Z behind, looking −Z).
> Prereq: `4_wasd_movement.md` (the `useFrame` loop we extend). Sequel: pointer-lock rotation, then camera-relative WASD.

## 0. What we just did (TL;DR)

1. Extended the existing `useFrame` in `Player.tsx` — after setting velocity, it reads the body position and moves `state.camera` toward `player + offset`, then `lookAt`s the player.
2. Removed `<OrbitControls />` (and the drei import) from `App.tsx` — it fought the follow code for control of the camera every frame.
3. Run the app: camera starts far away, swoops to behind/above the capsule, then trails it smoothly as you walk with WASD.

New code in `src/components/GameSystem/Player.tsx` (movement part unchanged, camera part added):

```tsx
const SPEED = 5
const CAM_OFFSET_X = 0
const CAM_OFFSET_Y = 4
const CAM_OFFSET_Z = 8
const CAM_SMOOTH = 5
const LOOK_HEIGHT = 1

useFrame((state, delta) => {
  /* ...movement unchanged... */

  const t = b.translation()
  const cam = state.camera
  const targetX = t.x + CAM_OFFSET_X
  const targetY = t.y + CAM_OFFSET_Y
  const targetZ = t.z + CAM_OFFSET_Z
  const a = 1 - Math.exp(-CAM_SMOOTH * delta)
  cam.position.x += (targetX - cam.position.x) * a
  cam.position.y += (targetY - cam.position.y) * a
  cam.position.z += (targetZ - cam.position.z) * a
  cam.lookAt(t.x, t.y + LOOK_HEIGHT, t.z)
})
```

And in `App.tsx`, deleted two things:

```tsx
// removed: import { OrbitControls, PointerLockControls } from '@react-three/drei'
// removed: {/* <PointerLockControls /> */} + <OrbitControls />
```

## 1. Mental model: the camera is a dumb object you drag each frame

Beginners often treat the camera as special. It isn't. It's just an object with a **position** and a **direction**, sitting in the scene like everything else:

```
PLAYER (decides where IT goes)        CAMERA (we decide where IT goes)
  body position ← physics                 cam.position ← OUR code in useFrame
  moves by velocity                       cam direction ← cam.lookAt(point)
```

Nobody moves the camera for you. `OrbitControls` used to do it (drag-to-orbit logic writing `cam.position` every frame). Now **we** do it: each frame, compute where the camera *should* be (player + offset), nudge it there, point it at the player. That's the whole trick — a "chase cam" is just an offset that gets re-applied 60×/sec.

Pipeline extended from doc 4 §1:

```
1. INPUT → 2. INTENT → 3. VELOCITY → 4. PHYSICS (player moves)
                                              │
5. CAMERA: read new player pos → ease camera → lookAt player
                                              │
6. RENDER: draw the world from the camera's new viewpoint
```

Note the order inside our single `useFrame`: movement first, camera second. The camera reads the *post-move* body position, so it never lags one frame behind the player.

## 2. Core concepts (only 3 you need now)

### a) `useFrame((state, delta))` — two free arguments

So far we used `useFrame(() => {...})` and ignored its arguments. It actually passes two:

```tsx
useFrame((state, delta) => {
  state.camera  // the active THREE camera — move it, rotate it, it's yours
  delta         // seconds since last frame (~0.016 at 60fps, ~0.008 at 120fps)
})
```

- `state` also holds `scene`, `gl`, `clock`, pointer — but `camera` is all we need today.
- `delta` is the key to **frame-rate independence** (§3c). Any per-frame change that should feel identical at 60fps and 144fps must scale by `delta`.

### b) `translation()` — read the body's position

```tsx
const t = b.translation()  // { x, y, z } — physics truth, same as linvel() is for speed
```

- Pair with doc 4's `b.linvel()`: `linvel` = how fast, `translation` = where. Both read the **body**, never the mesh (rule from doc 0 §2 — the mesh is a follower, its position may lag or be offset).
- Returns the body's center. Our capsule is 2m tall, so its center rests at `y≈1` — that's why `lookAt` adds `LOOK_HEIGHT` (§3d) instead of staring at the center/feet.

### c) `lookAt` — point the camera at a target

```tsx
cam.lookAt(t.x, t.y + LOOK_HEIGHT, t.z)
```

- Rotates the camera in place so its `-Z` axis (the direction Three.js cameras "look" down) aims at the given point. Position untouched — only rotation.
- Call it **every frame after moving** the camera. Moving changes the geometry, so the aim must be recomputed. Move-then-aim, always in that order.

## 3. Every new line, explained

**Constants — the tuning panel:**

```tsx
const CAM_OFFSET_X = 0
const CAM_OFFSET_Y = 4
const CAM_OFFSET_Z = 8
const CAM_SMOOTH = 5
const LOOK_HEIGHT = 1
```

- Offset `(0, 4, 8)` = camera hovers 4m up, 8m behind (`+Z`, since forward is `−Z` per doc 4 §3). Distance `√(16+64) ≈ 9m` back. High enough to see over the capsule, far enough for context, close enough for control feel.
- All knobs at the top next to `SPEED`, same habit as doc 4: tuning never means hunting through logic.

**Desired position = player + offset:**

```tsx
const targetX = t.x + CAM_OFFSET_X
```

- The camera's *goal* each frame. Player walks → goal walks with it. Fixed offset = fixed viewing direction (always looking −Z). Step 6 will *rotate* this offset around the player for mouse look.

**Smoothing — the one formula to memorize:**

```tsx
const a = 1 - Math.exp(-CAM_SMOOTH * delta)
cam.position.x += (targetX - cam.position.x) * a
```

- Each frame, the camera covers fraction `a` of the remaining gap. Gap shrinks → steps shrink → glide that eases into place instead of snapping. Big gap (start of game, camera at `z=100`) = fast swoop; tiny gap (walking steadily) = gentle trail.
- Why this formula and not `a = 0.1` fixed? A fixed fraction is **frame-rate dependent**: at 120fps you apply it twice as often → noticeably tighter follow than at 60fps. `1 − e^(−k·delta)` is the frame-rate-independent version: `delta` halves at 120fps, `a` halves with it, net motion per *second* stays identical. `CAM_SMOOTH` (`k`) = responsiveness in "per second" units: `5` ≈ closes most of the gap in well under a second.
- Per-axis writes (`.x`, `.y`, `.z` separately) are just manual `lerp` — same math as `cam.position.lerp(target, a)`, written out so you see each axis converge.

**Aim at chest, not feet:**

```tsx
cam.lookAt(t.x, t.y + LOOK_HEIGHT, t.z)
```

- `t.y` is the body center (`≈1` standing). `+1` aims at `≈2` = head height — the capsule sits slightly below frame center with floor visible ahead. Aiming at raw `t.y` (or worse, `y=0`) tilts the view down and wastes half the screen on floor.

## 4. Why `OrbitControls` had to go

`OrbitControls` runs its **own** per-frame update: it keeps an internal orbit state (angle, radius, target) and rewrites `cam.position` + `cam.lookAt` from it every frame. Our follow code writes the same two properties every frame. Two drivers, one camera:

```
frame N:  follow moves cam toward player → OrbitControls overwrites from ITS state → camera jumps back
frame N+1: same fight → visible jitter / camera ignores player
```

General rule: **exactly one system may own the camera per frame.** Today that's our follow code. In step 6, `<PointerLockControls />` becomes the *rotation* owner while our code keeps owning *position* — split ownership works only because they touch different properties (position vs quaternion) and are designed to compose. `OrbitControls` owns both, so it can't stay.

Side effect, fully expected: the `Canvas camera.position [0,1,100]` start no longer means "view from far away" permanently — it's just frame-0. Over the first ~second the camera swoops from `z=100` to the player. If the swoop annoys you, set the Canvas position near the spawn (e.g. `[20, 5, 28]`) so frame-0 starts close.

Typecheck bonus: removing the drei import also cleared the old `PointerLockControls is declared but never read` warning — `tsc -b` is now fully clean. (We'll re-import it in step 6 for real.)

## 5. What happens each frame now (concrete numbers)

Player standing at `[20, 1, 20]`, camera already settled at `[20, 5, 28]`. You hold W for one frame (`delta = 1/60`):

1. Movement (unchanged): `setLinvel({x:0, y:vel.y, z:-5})` → Rapier steps → player `z: 20 → 19.917`.
2. Camera: `translation()` = `[20, 1, 19.917]` → target `[20, 5, 27.917]`.
3. `a = 1 − e^(−5/60) ≈ 0.08` → camera covers 8% of the gap: `z: 28 → 27.993`. Player moved 8.3cm, camera moved 0.7cm — the gap stretches slightly while walking, exactly the trailing feel.
4. `lookAt(20, 2, 19.917)` — re-aim at the new head position.
5. Rapier sleeps/naps unaffected; dragon unaffected; R3F draws from the new viewpoint.

Hold W for 3 seconds: player travels ~15m to `z≈5`, camera trails the whole way. Before this step, the player would have walked off-screen in 2 seconds.

## 6. How to test / debug this yourself

- **Walk far:** hold W 5 seconds — capsule stays framed the whole way. (Before: lost off-screen.)
- **Feel the smoothing constant:** set `CAM_SMOOTH = 1` → drunk, laggy drone. Set `20` → rigid, near-instant. `5` is the middle. Now you know what the knob does.
- **Feel the offset:** `CAM_OFFSET_Y = 10, CAM_OFFSET_Z = 14` → high overview cam. `Y = 2, Z = 4` → tight over-shoulder (near plane may clip the capsule at very small Z — back off if the screen goes red inside the mesh).
- **Frame-rate check:** cap your display to 60 vs 120 (or open devtools perf throttle) — follow tightness should feel identical. If it didn't, `delta` would be missing (§7.1).
- **Aim check:** comment out the `lookAt` line — camera follows position but stares fixed −Z while walking sideways; player drifts out of center. Restores your respect for the one-liner.

## 7. Common beginner mistakes (camera edition)

1. **Fixed lerp factor (`* 0.1`, no `delta`):** feels right on your monitor, wrong on everyone else's refresh rate. Always scale smoothing by `delta` via `1 − e^(−k·delta)`.
2. **Two camera owners:** leaving `<OrbitControls />` in while follow code runs → jitter/tug-of-war (§4). One owner per frame, no exceptions.
3. **`lookAt` before moving:** aiming from the stale position → constant 1-frame rotational lag, visible as swimminess when strafing. Move-then-aim.
4. **Aiming at feet (`t.y` raw or `0`):** horizon tilts, half the screen is floor. Aim at head/chest (`+ LOOK_HEIGHT`).
5. **Snapping (`cam.position.set(target...)`):** no smoothing = camera rigidly welded to the player — every physics jitter transfers to the view and feels harsh. Ease toward the target instead.
6. **Reading mesh position instead of `translation()`:** mesh transform can lag the body by a frame or carry visual offsets → camera chases stale data and micro-stutters. Read the body.
7. **Offset inside the player:** tiny `CAM_OFFSET_Z` puts the camera inside the capsule → near-plane clip fills the screen with red. Keep the rest distance larger than ~1m, or shrink later with collision-aware zoom (advanced, not now).

## 8. What's next (not yet done)

- [ ] **Step 6 — Pointer lock rotates camera:** re-add `<PointerLockControls />`, click-to-lock mouse look; follow offset rotates around player by camera yaw
- [ ] **Step 7 — Camera-relative WASD:** rotate the `(x, z)` intent from doc 4 by camera yaw before `setLinvel`, so W = "away from camera"
- [ ] Jump (`Space` → `applyImpulse({y})` when grounded) — needs a grounded check first
- [ ] Camera collision (don't clip through walls/floor when orbiting low) — advanced, after rotation works

Related files: `src/components/GameSystem/Player.tsx`, `src/App.tsx`
Packages: `@react-three/fiber` (`useFrame` state/delta), `three` (`camera.position`, `camera.lookAt`)
