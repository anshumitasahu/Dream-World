# 12. Ecctrl FPS Player — Physics Body + Head Camera (Beginner Notes)

> Goal of this step: replace the hand-rolled capsule + third-person orbit with an **Ecctrl physics body** driven as **first person**. The camera sits at head height inside the capsule; mouse steers yaw + pitch directly on the camera. WASD moves relative to where you look.
> Prereq: `11_hud_out_of_canvas.md` (the `playerHudStore` we reuse). This changes who owns movement physics (Ecctrl now) and where the camera lives (head, not orbit).

## 0. What we just did (TL;DR)

1. Installed `ecctrl` (`bun add ecctrl`) — it was imported but missing from `package.json`, so the build failed before this step.
2. Rewrote `src/components/GameSystem/Player.tsx`:
   - `<Ecctrl>` owns the RigidBody + capsule collider + gravity + jump + grounding internally. We only feed it **intent** via `setMovement({ forward, backward, leftward, rightward, run, jump })` each frame.
   - `useCustomForward` is NOT set, so Ecctrl derives its movement basis from the **live camera direction** (`camera.getWorldDirection`, projected onto the ground plane). Because our camera IS the head, W is automatically "where I look" — camera-relative movement with zero rotation math on our side.
   - The frame loop then pins `camera.position` to `controller.currPos + eye height` and writes `camera.quaternion` from a yaw/pitch Euler (`'YXZ'` order). No smoothing — the head is rigidly welded to the body.
3. Pitch sign flipped vs the old orbit code: mouse-up must look up now (FPS head), not raise an orbit camera. So `pitch -= movementY` instead of `+=`.
4. Lowered Canvas `near` from `1` to `0.1` in `App.tsx` — at head height inside a capsule, a 1m near plane clips nearby walls/floor.
5. Run the app: click → pointer locks → mouse looks around from head height, WASD walks, Shift runs (hold, via `enableToggleRun={false}`), Space jumps. HUD badge still shows Grounded/Airborne from `controller.isOnGround`.

New code (the whole game loop):

```tsx
useFrame((state) => {
  const controller = ecctrlRef.current
  if (!controller) return

  controller.setMovement({ forward, backward, leftward, rightward, run, jump })

  state.camera.position.set(pos.x, pos.y + EYE_HEIGHT_ABOVE_CENTER, pos.z)
  lookEuler.set(pitch, yaw, 0) // 'YXZ'
  state.camera.quaternion.setFromEuler(lookEuler)
})
```

## 1. Mental model: body and head, two owners

Your sketch says it exactly:

```
Dream World Player
        │
  ┌─────┴──────┐
  │            │
FPS Camera   Ecctrl
  │            │
Pointer Lock  Physics controller
Mouse look    Movement / Gravity / Jump
Pitch/Yaw     Grounding / Collision
Head position       │
                  Rapier
```

- **Ecctrl** = the body. Capsule collider, mass, gravity, floating spring, ground ShapeCast, jump impulse, slope/slide handling. You never touch `linvel` or impulses — you post *intent* (`forward: true`) and it converts to physics.
- **Your code** = the head. Two angles (yaw/pitch) + eye height. Each frame: read body position (glue point), write camera position + rotation. Nothing else moves the camera — one owner, same rule as doc 5 §4.
- **The glue**: Ecctrl reads the camera to decide what "forward" means, and you read `currPos` to decide where the head sits. Each reads what the other writes — no property is written by both, so no fights.

Ownership table:

| Property | Writer | Reader |
|---|---|---|
| `camera.position` | our `useFrame` | Ecctrl (forward basis) + renderer |
| `camera.quaternion` | our `useFrame` (Euler) | Ecctrl (forward basis) + renderer |
| `currPos` / `isOnGround` | Ecctrl internals | our `useFrame` + HUD |
| input intent (`setMovement`) | our `useFrame` | Ecctrl internals |
| yaw/pitch refs | mouse handler | our `useFrame` |

## 2. Core concepts (only 4 you need now)

### a) `setMovement` is intent, not velocity

```tsx
controller.setMovement({ forward: keys.has('KeyW'), jump: keys.has('Space') })
```

- Old code called `body.setLinvel({ x, z })` — direct velocity overwrite, 5 m/s exactly, every frame. Ecctrl instead takes booleans and internally computes impulses from `maxWalkVel`/`maxRunVel`, acceleration factors, slope, air drag, platform velocity. Same keys, different layer: you say *what*, it decides *how much force*.
- It is **partial**: each call only updates the fields you pass. We pass all six every frame, so nothing goes stale.

### b) Forward comes from the camera (default mode)

Inside Ecctrl v2 (`updateForwardDirection`):

```tsx
camera.getWorldDirection(forward)          // where the head looks, 3D
forward.projectOnPlane(up) → normalize     // drop the tilt → ground-plane forward
right = forward × up                        // screen-right on the ground plane
```

- Because our camera pitches with the mouse, W at "looking down 45°" still walks forward on the ground — pitch is projected away. Same effect as doc 7's yaw-only rotation, but Ecctrl does it from the live camera instead of us rotating `(x, z)` by hand. Our doc-7 rotation code is deleted, not ported.
- `useCustomForward` + `setForwardDir` exists if you ever want to decouple (e.g. head looks one way, body strafes another). FPS doesn't need it — leave the default.

### c) The head is a welded camera, not a smoothed follower

```tsx
state.camera.position.set(x, y + 0.62, z)  // direct set, no lerp
state.camera.quaternion.setFromEuler(euler) // direct rotation, no lookAt
```

- Doc 5's smoothing (`1 − e^(−k·delta)`) existed so a chase cam trails nicely. A head must NOT trail — any lag between body and eyes reads as motion sickness / rubber-banding. Direct set every frame.
- `lookAt` is gone too: it aims the camera *at* a point (third-person). FPS sets *orientation* (Euler yaw/pitch) and lets position imply the view. Order `'YXZ'` = yaw first, then pitch in the yawed frame — the standard FPS order. `'XYZ'` would pitch around the world X axis and roll at yaw 90°. If looking ever feels twisted, check this string first.

### d) Mouse deltas steer angles, angles steer the camera

```tsx
yaw -= movementX * SENS        // mouse right → turn right
pitch -= movementY * SENS      // mouse up (movementY < 0) → pitch up
pitch = clamp(pitch, ±1.55)
```

- Same Pointer Lock API as doc 6 (`requestPointerLock` via HUD click, `pointerlockchange` for state, `movementX/Y` unbounded deltas). Only the *meaning* of the angles changed: orbit offset → head orientation.
- Sign flip vs doc 6 is deliberate: there, mouse-down *raised the orbit camera* (look down at player). Here, mouse-up must *look up* (standard FPS, non-inverted). `movementY` grows downward on screen, so looking up needs minus.
- Clamp `±1.55` rad (~89°): prevents pitching past vertical, where yaw would invert and the view flips. Old orbit clamp was `[0.05, 1.3]` (keep camera above floor / below overhead) — different geometry, different band.

## 3. Numbers worth knowing

- **Eye height**: capsule is `radius 0.5 + halfHeight 0.5` → total 2 m, center at body origin. `+0.62` puts eyes at ~1.62 m above feet — average human eye height. Change to crouch/stand feel.
- **Speeds**: `maxWalkVel 4`, `maxRunVel 8` m/s. Old code was flat `SPEED 5`. Walk is a touch slower, Shift-run clearly faster.
- **`enableToggleRun={false}`**: Ecctrl default toggles run on each Shift press (press once = run forever). Hold-to-run matches every FPS — set false.
- **Sensitivity** `0.0025` rad/px unchanged from doc 6: ~2500 px mouse travel = full 360° turn.
- **Near plane** `0.1`: eye inside a 0.5-radius capsule, walls approached closely — `near: 1` would clip everything within arm's reach.

## 4. How to test / debug this yourself

- **Lock test:** click overlay → crosshair appears, cursor gone. ESC → overlay returns. Same lifecycle as doc 6 §6.
- **Look test:** locked, sweep mouse right — world pans right (you turn right). Push mouse up — you look at the sky. Full 360° yaw, near-±90° pitch, no flips.
- **Walk test:** hold W — you move where you look (on the ground plane). Look down 45°, hold W — you walk forward, not into the floor.
- **Strafe test:** hold D — screen-right at every yaw.
- **Jump test:** Space — hop, HUD badge flips red `Airborne`, lands green `Grounded`.
- **Run test:** hold Shift + W — roughly double speed. Tap-shift does NOT latch run (that's `enableToggleRun={false}` working).
- **Inverted look:** if mouse-up looks down, flip the pitch sign back to `+=`. If mouse-right turns left, flip yaw to `+=`.
- **Roll check:** strafe + look at yaw 90° — horizon stays level. If it tilts, the Euler order isn't `'YXZ'`.

## 5. Common beginner mistakes (Ecctrl FPS edition)

1. **Smoothing the head** (porting doc 5's lerp): camera lags the body → swimmy, nauseating view. Heads are welded; smoothing is for chase cams only.
2. **Using `lookAt` for FPS**: aims at a point instead of setting orientation — combined with position pinning it fights the Euler and jitters. `lookAt` = third person; Euler = first person.
3. **Euler order `'XYZ'`**: pitches around world X, so at yaw 90° your "pitch" rolls the horizon. FPS order is `'YXZ'`.
4. **Rotating input by yaw yourself** (doc 7 code): double-applies direction — Ecctrl already projects camera forward. Feed raw intent, let it steer.
5. **Forgetting `ecctrl` was never installed**: `import from 'ecctrl'` with no dependency = build error. Fixed this step with `bun add ecctrl`.
6. **Leaving `near: 1`**: close walls/floor clip away at head height. FPS near planes are ~0.1.
7. **Toggle-run surprise**: default `enableToggleRun` latches Shift. FPS players expect hold-to-sprint — set `false`.

## 6. What's next (not yet done)

- [ ] Hide/detach any visible capsule mesh at the camera (eye inside geometry → near-plane interior visible)
- [ ] Footstep bob (subtle camera y oscillation while moving + grounded)
- [ ] Sprint FOV kick (raise `fov` ~5 while `runActive`)
- [ ] Interact raycast from camera center (crosshair + object highlight)
- [ ] Air control tuning (`airDragFactor`) if steering mid-jump feels dead

Related files: `src/components/GameSystem/Player.tsx`, `src/App.tsx` (near plane), `src/components/GameSystem/playerHudStore.ts` (unchanged)
Packages: `ecctrl` (new — `Ecctrl`, `EcctrlHandle`, `setMovement`, `currPos`, `isOnGround`), `three` (`Euler`, `quaternion.setFromEuler`)
