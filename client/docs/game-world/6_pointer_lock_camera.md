# 6. Pointer Lock Rotates Camera — Mouse-Look Orbit (Beginner Notes)

> Goal of this step: click the screen → mouse captured → moving the mouse **orbits the camera around the capsule** (yaw + pitch). ESC releases. A crosshair dot appears while locked; a hint overlay appears when unlocked.
> Prereq: `5_camera_follow.md` (the fixed-direction follow we upgrade). Sequel: step 7, camera-relative WASD (W = "away from camera").

## 0. What we just did (TL;DR)

1. Added `yaw` / `pitch` refs + a Pointer Lock wiring (`requestPointerLock`, `pointerlockchange`, `mousemove`) in `Player.tsx`.
2. Replaced the fixed follow offset with an **orbit position** computed from yaw/pitch each frame — same smoothing + `lookAt` as before.
3. Added an `<Html fullscreen>` overlay: "Click to look around" when unlocked, crosshair dot when locked.
4. Run the app: click → mouse disappears → moving it swings the camera around the player. WASD still world-space (fixed in step 7).

Changed code in `src/components/GameSystem/Player.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'

const CAM_DIST = 9
const MOUSE_SENS = 0.0025
const MIN_PITCH = 0.05
const MAX_PITCH = 1.3

export default function Player() {
  const yaw = useRef(0)
  const pitch = useRef(0.42)
  const [locked, setLocked] = useState(false)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const canvas = gl.domElement
    const onLockChange = () => setLocked(document.pointerLockElement === canvas)
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return
      yaw.current -= e.movementX * MOUSE_SENS
      const next = pitch.current + e.movementY * MOUSE_SENS
      pitch.current = Math.min(MAX_PITCH, Math.max(MIN_PITCH, next))
    }
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [gl])

  useFrame((state, delta) => {
    /* ...movement unchanged... */
    const t = b.translation()
    const cam = state.camera
    const cp = Math.cos(pitch.current)
    const targetX = t.x + Math.sin(yaw.current) * cp * CAM_DIST
    const targetY = t.y + Math.sin(pitch.current) * CAM_DIST
    const targetZ = t.z + Math.cos(yaw.current) * cp * CAM_DIST
    const a = 1 - Math.exp(-CAM_SMOOTH * delta)
    cam.position.x += (targetX - cam.position.x) * a
    cam.position.y += (targetY - cam.position.y) * a
    cam.position.z += (targetZ - cam.position.z) * a
    cam.lookAt(t.x, t.y + LOOK_HEIGHT, t.z)
  })
}
```

## 1. Mental model: two angles describe every orbit

Last step the camera sat at a fixed offset (always +Z behind). Now the offset **swings**. Any point on a sphere around the player needs exactly two angles:

```
            +Y (up)
             │
             │   pitch = how HIGH the camera sits (0 = level, 1.3 = near-top-down)
             │    ╲
              ╲    ╲  CAM_DIST = 9m (fixed leash length)
               ╲    ╲
                ╲____╲________ yaw = which SIDE (spin around the player)
               player
```

- **yaw** = spin around the pole (compass direction). Mouse left/right.
- **pitch** = height angle. Mouse up/down. Clamped so you can't go under the floor or exactly overhead.
- `CAM_DIST` = leash length, always 9m. The camera lives *on* this sphere, never closer/farther.

Each frame: angles → offset → desired position → same smoothing + `lookAt` from step 5. Only the *target* computation changed; the glide and aim are untouched.

Ownership check (doc 5 §4 rule: one owner per frame): mouse writes **angles** (refs), follow code writes **position**, `lookAt` writes **rotation**. Three different properties — no fights. This is why custom orbit composes with our follow while `OrbitControls` couldn't.

## 2. Why Pointer Lock (and not just `mousemove`)?

Normal `mousemove` gives **absolute cursor position** — the cursor hits the screen edge and stops. FPS-style look needs **relative motion** ("moved 12px left since last event, keep going forever"). The Pointer Lock browser API provides exactly that:

- `canvas.requestPointerLock()` — must be called from a user gesture (click). Hides the cursor, captures all mouse motion to that element.
- `e.movementX / movementY` — relative deltas per event, unbounded. Flick right 5 times = keep turning, no edge.
- `document.pointerLockElement` — which element currently owns the mouse (`null` = unlocked). ESC always unlocks (browser-reserved, can't be overridden).
- `pointerlockchange` event — fires on lock AND unlock. Our single source of truth for `locked` state.

Why not drei's `<PointerLockControls />`? It's FPS-style: it rotates the camera **in place** (you are the camera). We have a third-person chase cam: the camera must **orbit around** the player and keep `lookAt`ing it. PLC would fight our position code (§1 ownership) and gives us no orbit. So we use the same underlying browser API directly, with our own two angles. Same API, different driving.

## 3. Core concepts (only 4 you need now)

### a) `useThree((s) => s.gl)` — reach the renderer/canvas

```tsx
const gl = useThree((s) => s.gl)
gl.domElement  // the actual <canvas> HTML element
```

- `useThree` reads R3F's internal store from any component inside `<Canvas>`. `gl` = the Three.js renderer; `.domElement` = the canvas it draws into.
- We need the raw canvas for `requestPointerLock()` (a DOM API, not a Three API). Selector form `(s) => s.gl` subscribes only to `gl` — no re-renders on unrelated state changes.

### b) `useState locked` vs `useRef yaw/pitch` — when each is correct

```tsx
const yaw = useRef(0)          // changes 60+/sec, JSX never displays it
const [locked, setLocked] = useState(false)  // JSX displays it (overlay vs crosshair)
```

- Rule from doc 4 §2a extended: state changing every mouse event must NOT re-render (refs for `yaw`/`pitch` — the frame loop reads them silently). State the JSX *shows* MUST re-render (`locked` toggles overlay ↔ crosshair). Pick by asking: "does the JSX display this value?" Yes → `useState`. No → `useRef`.

### c) Spherical → cartesian (the 3-line formula)

```tsx
const cp = Math.cos(pitch.current)
targetX = t.x + Math.sin(yaw) * cp * CAM_DIST
targetY = t.y + Math.sin(pitch) * CAM_DIST
targetZ = t.z + Math.cos(yaw) * cp * CAM_DIST
```

- Horizontal reach shrinks as you look down from above: at `pitch = 0`, `cp = 1` → full 9m horizontal; at high pitch, `cp → small` → camera mostly above. That's the `* cp` on X/Z. Y gets the complementary `sin(pitch)` share. Sanity: `yaw=0, pitch≈0` → offset `(0, ~0, 9)` = step 5's old `(0,4,8)`-style behind-view. The math reduces to what you already had.
- `pitch.current = 0.42` initial ≈ `sin ≈ 0.41 × 9 ≈ 3.7m` up, `cos ≈ 0.91 × 9 ≈ 8.2m` back — deliberately matches the old `(0,4,8)` framing so the first frame feels familiar.

### d) `<Html fullscreen>` — DOM inside the 3D canvas

```tsx
<Html fullscreen>
  {locked ? <crosshair dot/> : <click-to-lock overlay/>}
</Html>
```

- drei's `Html` renders regular HTML (divs, text, click handlers) as an overlay layer managed inside `<Canvas>`. `fullscreen` = stretch over the whole canvas instead of tracking a 3D point.
- Why here: the overlay belongs to the *canvas*, and `Player` already lives inside `<Canvas>` with access to `gl`. No new files, no App.tsx changes.
- Clicking the overlay calls `lock()` → `requestPointerLock()` from a genuine user gesture (browser requirement). The `r.catch(() => {})` swallows the promise rejection when the browser denies too-rapid re-lock (e.g. spam-clicking right after ESC — browsers enforce ~1.5s cooldown).

## 4. Every new line, explained

**Sign conventions (why minus on yaw, plus on pitch):**

```tsx
yaw.current -= e.movementX * MOUSE_SENS
pitch.current + e.movementY * MOUSE_SENS  // then clamped
```

- Mouse right (`movementX > 0`) should swing the view right → the camera orbits *left* around the player (opposite side), hence minus. Standard third-person feel.
- Mouse down (`movementY > 0`, screen coords grow downward) raises the camera (look down at player from above), hence plus. Drag down = see more from the top. Both match typical third-person games; flip the signs if you prefer inverted.

**Pitch clamp — the guardrails:**

```tsx
const MIN_PITCH = 0.05
const MAX_PITCH = 1.3
pitch.current = Math.min(MAX_PITCH, Math.max(MIN_PITCH, next))
```

- Below `0.05`: camera sinks toward ground level, then under the floor — you'd stare at gray underside. Above `1.3` (~75°): camera near-overhead, `cos(pitch)` → tiny horizontal offset → `lookAt` up-vector degenerates and the view rolls/spins (gimbal flip). Clamping keeps you in the safe band: slightly-above-level to near-top-down.

**Lock-state guard inside mousemove:**

```tsx
if (document.pointerLockElement !== canvas) return
```

- Belt and suspenders with the overlay design (when unlocked, the overlay covers the screen so mouse doesn't reach the canvas meaningfully). Mouse events only steer while locked — unlocked mouse is free for clicking UI.

**Effect cleanup (same habit as doc 4 §2b):**

```tsx
return () => {
  document.removeEventListener('pointerlockchange', onLockChange)
  document.removeEventListener('mousemove', onMouseMove)
}
```

- `document`-level listeners (not window-level like keys — pointer lock events fire on `document`). Same rule: always remove on unmount or StrictMode double-mount stacks duplicates.

**Fragment wrapper:**

```tsx
return (
  <>
    <RigidBody>...</RigidBody>
    <Html fullscreen>...</Html>
  </>
)
```

- Component previously returned one element; now two (body + overlay). Fragments (`<>`) group without adding DOM/scene nodes — required JSX syntax, zero runtime cost. Note `<Html>` sits *outside* `<Physics>` — correct, it's UI, not a physical thing.

## 5. What happens when you click and look (frame by frame)

Locked, `yaw = 0.5` (looked a bit left), `pitch = 0.42`, player at `[20, 1, 20]`, `delta = 1/60`:

1. `mousemove` events already accumulated into `yaw`/`pitch` refs (no renders — §3b).
2. `useFrame`: `cp = cos(0.42) ≈ 0.913` → target `≈ [20 + sin(0.5)×0.913×9, 1 + sin(0.42)×9, 20 + cos(0.5)×0.913×9]` ≈ `[23.9, 4.7, 27.2]`.
3. `a = 1 − e^(−5/60) ≈ 0.08` → camera glides 8% toward target (same trailing feel as step 5 — fast flicks pan smoothly instead of snapping).
4. `lookAt(20, 2, 20)` — re-aim at head. Camera moved AND player possibly moved; aim recomputed after both.
5. ESC → browser exits lock → `pointerlockchange` → `setLocked(false)` → overlay returns, cursor freed. Click re-locks.

## 6. How to test / debug this yourself

- **Click test:** click overlay → it vanishes, crosshair dot appears, cursor gone. ESC → overlay returns. That's the whole lock lifecycle.
- **Yaw test:** locked, sweep mouse right — world pans right, camera circles the capsule. Full 360° sweep should orbit cleanly with no flip.
- **Pitch limits:** push mouse up hard — camera descends but never goes under the floor. Pull down hard — near-top-down but never rolls/flips. That's the clamp working.
- **Smoothing feel:** fast flick → camera eases after the mouse instead of teleporting. Set `CAM_SMOOTH = 20` for near-rigid mouse, `1` for drunken lag — `5` is the middle (same knob as step 5).
- **Sensitivity:** `MOUSE_SENS = 0.0025` ≈ full 360° turn in ~25cm of mouse travel. Double it for twitchy, halve for cinematic.
- **Spam-click after ESC:** click instantly after releasing — no console error (the `.catch` swallowed the browser cooldown rejection). Without it: unhandled promise rejection in console.
- **WASD while locked:** still world-space — W always −Z even when you're looking +Z (you walk *toward* the camera). Feels wrong on purpose; step 7 fixes it.

## 7. Common beginner mistakes (pointer-lock edition)

1. **`requestPointerLock` outside a gesture:** calling it in `useEffect`/on load → browser silently denies. Must come from click/keypress — hence the overlay button.
2. **Reading `movementX` when unlocked:** deltas still fire on normal mousemove; without the `pointerLockElement` guard, hovering menus would spin the camera.
3. **Storing yaw/pitch in `useState`:** re-renders 60+/sec on every mouse twitch for values JSX never shows. Refs + frame-loop reads (doc 4 §2a rule).
4. **Missing pitch clamp:** looking straight down puts the camera overhead → `lookAt` gimbal flip; looking up from below the floor. Always clamp pitch to a safe band.
5. **Forgetting `pointerlockchange`:** tracking lock with your own click flag misses ESC-unlock (browser-side, no click event) → overlay thinks you're locked while the cursor is free. The event is the only reliable source.
6. **Two camera owners again (doc 5 §4):** re-adding `OrbitControls` alongside this orbit = same tug-of-war. Position owner (follow) + angle owner (mouse) + PLC-style rotators can't all coexist.
7. **Overlay swallowing clicks after lock:** the unlocked overlay covers the screen (`inset: 0`) — correct, since you must click it to lock. But if it stayed mounted *while locked*, it would block nothing (pointer lock routes all input to the canvas) yet still visually dim the game — hence conditional render on `locked`.

## 8. What's next (not yet done)

- [ ] **Step 7 — Camera-relative WASD:** rotate the `(x, z)` intent by `yaw` before `setLinvel`, so W = "away from camera" (uses the `yaw` ref we just added — it was built for this)
- [ ] Jump (`Space` → `applyImpulse({y})` when grounded) — needs a grounded check first
- [ ] Hide the dragon / move it out of the walk area — it's still a cuboid obstacle at origin (fine for push tests, move later)
- [ ] Camera collision (don't clip through walls/floor at low pitch) — advanced, after step 7

Related files: `src/components/GameSystem/Player.tsx`
Packages: `@react-three/fiber` (`useFrame`, `useThree`), `@react-three/drei` (`Html`), `@react-three/rapier` (unchanged), DOM Pointer Lock API (`requestPointerLock`, `pointerlockchange`, `movementX/Y`)
