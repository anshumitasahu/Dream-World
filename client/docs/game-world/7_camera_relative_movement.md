# 7. Camera-Relative WASD — W Means "Away From Camera" (Beginner Notes)

> Goal of this step: press **W and walk away from the camera**, no matter where the camera orbited. D strafes screen-right, S backs toward the camera. Movement finally feels like a real third-person game.
> Prereq: `6_pointer_lock_camera.md` (the `yaw` ref we reuse). This completes the movement chain: input → intent → camera-relative velocity → follow → orbit.

## 0. What we just did (TL;DR)

1. Added 4 lines in `Player.tsx`'s `useFrame` — rotate the `(x, z)` input by the camera `yaw` before `setLinvel`.
2. Nothing else changed: keys, normalization, gravity preservation, smoothing, `lookAt` all untouched.
3. Run the app: lock the mouse, orbit 180°, press W — capsule walks away from you instead of toward you.

New code (sits between normalization and `setLinvel`):

```tsx
const s = Math.sin(yaw.current)
const c = Math.cos(yaw.current)
const wx = x * c + z * s
const wz = -x * s + z * c

const vel = b.linvel()
b.setLinvel({ x: wx * SPEED, y: vel.y, z: wz * SPEED }, true)
```

## 1. Mental model: input lives in "screen space", physics lives in "world space"

Until now, keys mapped straight to world axes (doc 4 §3): W = world `−Z`, always. That was fine while the camera sat fixed behind the player. But step 6 let the camera orbit — and suddenly "forward on my screen" and "world −Z" point in different directions:

```
Camera orbited 90°:                  What the player sees         What W did (broken)
  CAM                               ┌──────────────┐
   │                                 │   screen-up  │              W moved the capsule
   │                                 │      ↑       │              toward screen-LEFT
   ▼                                 │      ●→      │              (world −Z = left
PLAYER ──→ world −Z (= screen-left)   └──────────────┘               on this view)
```

The fix is a **frame change**: input `(x, z)` is measured in *screen space* (W = "up on my screen"), physics needs it in *world space*. Rotating the input vector by the camera's yaw converts one to the other. Pipeline from doc 4 §1, stage 2 upgraded:

```
1. INPUT (keys held) → 2. INTENT (x,z in screen space)
       ── NEW: rotate intent by yaw → world-space (wx, wz) ──
3. VELOCITY → 4. PHYSICS → 5. CAMERA → 6. RENDER
```

The `yaw` ref already exists (step 6 built it for the orbit) — today it earns its second job.

## 2. Core concept: rotating a 2D vector (the only math you need)

A "rotation" takes a direction and spins it by an angle without changing its length:

```
input (x, z), angle yaw with s = sin(yaw), c = cos(yaw):

  wx = x * c + z * s
  wz = -x * s + z * c
```

Why this exact pattern (and not some other sign mix)? Derive it from the two cases you can check by hand:

- **W at yaw = 0** must stay `(0, −1)`: `wx = 0·c + (−1)·s = −s = 0` ✓, `wz = −0·s + (−1)·c = −c = −1` ✓. Identity — camera behind player, old behavior preserved.
- **W at yaw = π** (camera swung to the far side, now looking `+Z`) must become `(0, +1)` — away from the camera: `wx = −sin(π) = 0` ✓, `wz = −cos(π) = +1` ✓.
- **D (screen-right) at yaw = 0** must stay `(1, 0)`: `wx = c = 1` ✓, `wz = −s = 0` ✓.
- **D at general yaw** gives `(c, −s)` — verify against camera geometry: camera forward is `(−s, −c)` (player minus camera position from step 6's orbit formula), screen-right = forward rotated 90° = `(c, −s)` ✓.

Length check: `wx² + wz² = x² + z²` (expand it — cross terms cancel). Rotation never changes speed, so the diagonal normalization from doc 4 §3 (applied *before* rotating) stays valid after. Normalize-then-rotate, in that order.

Intuition over memorization: you don't need to re-derive signs from scratch each time — check W-forward and D-right at yaw = 0 and yaw = π. If all four match, the formula is right.

## 3. Every new line, explained

```tsx
const s = Math.sin(yaw.current)
const c = Math.cos(yaw.current)
```

- Snapshot sin/cos once per frame (not six `Math.sin` calls) — cheaper and guarantees both lines use the *same* angle. Reads the live `yaw` ref the mouse keeps updated (doc 6 §3b: refs read silently in the frame loop, no renders).

```tsx
const wx = x * c + z * s
const wz = -x * s + z * c
```

- The rotation itself (§2). `(x, z)` = screen-space intent (`z = −1` means "W pressed" = screen-up), `(wx, wz)` = world-space direction physics understands.
- Only **yaw** participates — pitch is deliberately excluded. Tilting the camera down must not make W drive the capsule into the floor; movement stays on the ground plane. (Full 3D direction with pitch is for fly modes, not walkers.)

```tsx
b.setLinvel({ x: wx * SPEED, y: vel.y, z: wz * SPEED }, true)
```

- Same call as doc 4 §3, with rotated components swapped in. `y: vel.y` gravity preservation and wake-up `true` unchanged — rotation affects steering only, never falling.

What we did NOT touch (and why): key mapping (still screen-space W = screen-up — correct by definition), normalization (length-preserving rotation keeps it valid), camera orbit/smoothing/`lookAt` (movement reads the camera's angle; it never writes camera state — one-way dependency, no ownership conflict per doc 5 §4).

## 4. What pressing W does now (two scenarios)

Setup: player at `[20, 1, 20]`, locked mouse.

**Scenario A — yaw = 0** (camera behind at `+Z`, looking `−Z`): W → `(0,−1)` → rotation is identity → `setLinvel({0, vel.y, −5})` → capsule moves world `−Z` = screen-up, away from camera. Same as before.

**Scenario B — orbited 180° (yaw = π)**: camera now at `−Z` side looking `+Z`. W → `(0,−1)` → rotated: `wx = −sin(π) ≈ 0`, `wz = −cos(π) = +1` → `setLinvel({0, vel.y, +5})` → capsule moves world `+Z` = screen-up on the *new* view, away from camera. Before this step it would have walked *toward* the camera (screen-down) — the exact wrongness this step fixes.

**Diagonal + orbit combined:** W+D at yaw = π/2: normalized input `(0.707, −0.707)` → rotated by 90° → same speed, new heading, still exactly `SPEED` m/s (§2 length preservation). Strafe-circles around the dragon work at any camera angle.

## 5. How to test / debug this yourself

- **The 180° test:** lock, hold W, sweep the mouse so the camera orbits halfway around — the capsule should curve and keep walking screen-up/away the whole time. (Before: it ends up walking toward the camera.)
- **Strafe test:** hold D only, orbit 360° slowly — capsule circles screen-right relative to your view at every angle.
- **Identity test:** yaw = 0 (fresh load, no mouse yet) — W/D behave exactly like step 4. Regression check that rotation didn't break the base case.
- **Speed test:** W+D diagonal at any yaw covers the same distance as W alone over 3 seconds (rotation preserves the normalization).
- **Sign-flip debug:** if W ever walks *toward* the camera, exactly one sign in the two lines is wrong — recheck §2's four hand cases to find which.
- **Pitch independence:** look near-straight-down (max pitch), press W — capsule moves along the ground, doesn't dive. Pitch correctly excluded.

## 6. Common beginner mistakes (camera-relative edition)

1. **Rotating by the wrong angle:** using the *player's* facing (we have none — `lockRotations`, no facing) or a stale yaw copy instead of the live camera `yaw.current`. The angle must be the camera's actual orbit angle.
2. **Including pitch:** rotating the full 3D direction by pitch makes W push the capsule into the ground when looking down. Walkers rotate yaw only.
3. **Normalizing after rotating with a broken (non-length-preserving) formula:** any sign error that isn't a true rotation changes diagonal speed. Verify `wx² + wz² = x² + z²` — if it doesn't simplify exactly, the formula is wrong.
4. **Rotating the velocity instead of the intent:** reading `linvel`, rotating *that*, writing back — feedback loop that compounds gravity/friction remnants. Rotate the clean `(x, z)` intent, preserve `y` separately.
5. **Double-applying yaw:** rotating in both the movement code and (later) a player-mesh facing operation — each stage rotates once. Today only movement rotates; when mesh facing arrives, it *displays* yaw without re-rotating velocity.

## 7. Series checkpoint — what you can now build

Steps 1–7 complete the core third-person loop:

- [x] Physics world + floor (gravity, collision)
- [x] Capsule body that lands upright (`lockRotations`, capsule shell)
- [x] WASD velocity control (world-space → now camera-relative)
- [x] Chase camera with smoothing (`delta`-independent easing)
- [x] Pointer-lock mouse orbit (yaw/pitch, clamped)
- [x] Camera-relative steering (this step)

Natural next steps: **jump** (`Space` → `applyImpulse` + grounded check), **sprint** (shift × 1.6 `SPEED`), **player mesh facing** (rotate capsule visual toward move direction), **camera collision** (pull in at low pitch near walls). Each is one focused step like this one.

Related files: `src/components/GameSystem/Player.tsx`
Packages: none new — plain `Math.sin`/`Math.cos` on the existing `yaw` ref
