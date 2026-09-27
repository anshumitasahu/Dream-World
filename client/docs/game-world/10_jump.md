# 10. Jump — Press Space to Leave the Ground (Beginner Notes)

> Goal of this step: press **Space** and hop. Only when feet are on the floor — no double-jumps, no flying by mashing Space mid-air.
> Prereq: `9_ground_detection_raycast.md` (the `isGroundedRef` gate we consume). This step finally *writes* upward motion — everything before only moved sideways or fell.

## 0. What we just did (TL;DR)

1. Added one constant: `JUMP_VELOCITY = 5` (upward speed in m/s).
2. Added 4 lines before the existing `setLinvel`: if `Space` is held **and** `isGroundedRef.current` is true, override vertical velocity with `5`.
3. Unified the write: `setLinvel({ x, y: verticalVelocity, z })` — sideways from WASD, vertical from jump-or-gravity.
4. Updated the click-to-play hint to say "Space to jump".
5. Run the app: land (green `Grounded` badge), press Space — capsule pops up ~1.3 m, badge flips red `Airborne`, lands green again.

New code (sits between `linvel()` and `setLinvel`):

```tsx
const currentVelocity = playerBody.linvel()
let verticalVelocity = currentVelocity.y
if (pressedKeys.has('Space') && isGroundedRef.current) {
  verticalVelocity = JUMP_VELOCITY
}
playerBody.setLinvel({ x: worldMoveX * MOVE_SPEED, y: verticalVelocity, z: worldMoveZ * MOVE_SPEED }, true)
```

## 1. Mental model: jump is not "go up", it's "set upward speed and let gravity do the rest"

Beginners often imagine jump as an animation: move up for a while, then move down. Physics games don't work like that. There is exactly one actor on the Y axis — velocity — and two writers fighting over it:

```
GRAVITY (every physics step):          YOUR JUMP (one frame, on Space):
  vel.y -= 9.81 * dt                     vel.y = 5  (instant override)
  pulls down forever                     launches up once
        │                                      │
        └────── same vel.y ────────────────────┘
                          │
              Rapier integrates: pos.y += vel.y * dt
```

Press Space → you set `vel.y = 5`. Next physics steps gravity subtracts: 5 → 4 → 3 ... 0 (peak) ... −1 → −5 (falling). The arc is free — you never code "come back down". That up-then-down curve *is* gravity acting on your one-time launch. Pipeline from doc 9 §1, stage 3 upgraded:

```
1. INPUT (keys + Space) → 2. INTENT (x, z + jump?) → 3. VELOCITY (x, y, z all decided here)
        ── NEW: y = 5 if Space + grounded, else keep gravity's y ──
4. PHYSICS (gravity integrates) → GROUND PROBE → 5. CAMERA → 6. RENDER
```

Doc 9 *produced* `isGroundedRef`. Today we *consume* it — the producer/consumer pair is complete.

## 2. Core concept: velocity-set vs impulse (and why we pick velocity-set)

Doc 0 §3 taught two ways to push things: **impulse** (instant kick, adds to current velocity) vs **setting velocity** (direct overwrite). Both can jump — they feel different:

```
applyImpulse({ y: m * 5 })  ≈  setLinvel({ y: 5 })
   "add 5 m/s to whatever       "forget what y was,
    y already is"                 y is now exactly 5"
   mass-dependent (need m!)       mass-independent
   holding Space stacks:          holding Space idempotent:
   5 → 10 → 15 (rocket!)         5 → 5 → 5 (same hop)
```

We pick **velocity-set** for three reasons:

1. **No mass math.** Impulse means momentum change: to get 5 m/s you must multiply by the capsule's mass (`impulse = mass × Δv`). Our capsule's mass is auto-computed from its volume × density — a number you'd have to look up. Velocity-set skips it entirely.
2. **Consistent with movement.** WASD already steers via `setLinvel` for x/z (doc 4). Jump extends the same call to y — one write owns the full velocity vector, no two systems fighting.
3. **Holding Space can't stack.** While grounded, every frame rewrites `y = 5` — same value, harmless. An impulse would *add* 5 m/s sixty times a second and launch you into orbit. (Holding Space still bunny-hops on every landing — each landing is a fresh grounded frame — but that's one clean hop per landing, not an explosion.)

Jump height falls out of physics, not code: `h = v² / (2g) = 25 / 19.62 ≈ 1.27 m`. Flight time `≈ 2v/g ≈ 1.02 s`. Tune feel by changing one number (`JUMP_VELOCITY`), never gravity.

## 3. Every new line, explained

```tsx
const JUMP_VELOCITY = 5
```

- Named constant next to `MOVE_SPEED`, same convention as `GROUND_RAY_LENGTH` (doc 9 §3). Meters per second upward. Bigger = floatier/higher (7 = ~2.5 m moon jump), smaller = hop (3 = ~0.5 m). If it ever feels wrong, this is the only number to touch — not gravity (world-wide), not ray length (detection).

```tsx
let verticalVelocity = currentVelocity.y
```

- Default: **change nothing**. `currentVelocity.y` is gravity's latest value (falling −3? keep −3; resting 0? keep 0). This preserves the doc 4 §3 gravity rule — jump only *overrides* on the exact frames it fires. `let`, not `const`, because the `if` below may reassign. Only `y` gets this treatment; x/z are always fully overwritten by WASD intent (no preservation — steering is absolute).

```tsx
if (pressedKeys.has('Space') && isGroundedRef.current) {
  verticalVelocity = JUMP_VELOCITY
}
```

- Two conditions, both required:
  - `pressedKeys.has('Space')` — no new event listener needed. The `keydown/keyup` handlers from doc 4 already track *every* key by `event.code` into the set; `'Space'` is the code for the spacebar. Input stage already solved — we just read one more entry.
  - `isGroundedRef.current` — the **ref**, not the state. Refs read silently inside `useFrame` with zero re-renders (doc 9 §3: "refs are for the frame loop"). Ground probe ran *earlier in this same frame* (§4 ordering), so this is fresh — not last frame's answer. Mid-air: `false` → condition dead → `verticalVelocity` stays gravity's → no double jump, period.
- Holding Space: while airborne the gate is shut, so held Space does nothing; on touchdown the next frame fires again → rhythmic bunny-hopping if you keep holding. One hop per landing — by design, not a bug.

```tsx
playerBody.setLinvel({ x: worldMoveX * MOVE_SPEED, y: verticalVelocity, z: worldMoveZ * MOVE_SPEED }, true)
```

- Same call as docs 4/7, with the `y` slot upgraded from "always preserve" to "preserve *unless jumping*". x/z steering untouched — you can run (WASD) and jump simultaneously; the axes are independent. Wake-up `true` unchanged.

```tsx
Click to look around (WASD to move, Space to jump, ESC to release)
```

- The overlay hint (doc 6) teaches the new key. Free, and every playtester reads it.

What we did NOT touch (and why): the ground probe (runs first, jump reads its result — one-way dependency); gravity value in `<Physics>` (world-wide, jump tunes via velocity); camera (jump moves the body; the chase cam from doc 5 follows automatically — that's the payoff of camera-follows-body architecture); `CapsuleCollider`/friction/restitution (hop works on the existing shell).

## 4. What pressing Space does now (three scenarios)

Setup: landed on floor, badge green, `vel.y ≈ 0`, ray hit `≈ 1.0 m`.

**Scenario A — grounded jump:** frame N: probe says grounded (`true`), Space held → `verticalVelocity = 5` → `setLinvel({…, y: 5})`. Physics steps: capsule rises. Frame N+1: center ~5 cm up, ray distance 1.05 ≤ 1.1 → *still* grounded → `y = 5` rewritten (harmless, same value). Frame N+3: center high enough that distance > 1.1 → probe flips `false` → gate shuts → gravity owns y from here: 5 → 0 (peak ~1.27 m) → negative → fall → touchdown → green again.

**Scenario B — mashing Space mid-air:** probe `false` → `if` dead every frame → `verticalVelocity = currentVelocity.y` → falls exactly as if Space didn't exist. No double jump, no hover. Badge stays red throughout.

**Scenario C — run + jump (W+D+Space):** x/z from camera-relative steering (doc 7), y = 5. Takeoff keeps horizontal speed — a running leap in the camera-facing direction. Steering mid-air still works (velocity-set, not impulse) — slightly arcadey, standard for beginners; momentum-preserving air control is a later refinement.

## 5. How to test / debug this yourself

- **Basic hop:** land (green), tap Space — rises ~1.3 m (about two-thirds of the 2 m capsule), falls back, green on landing. Badge red for the ~1 s flight.
- **No-double-jump test:** hold Space through a whole flight — exactly one ascent. Second hop only after green reappears (bunny-hop on landing is correct).
- **Air-mash test:** jump, then hammer Space mid-air — trajectory ignores it completely. If you gain height mid-air, the grounded gate is broken (check you're reading the ref, and the probe runs *before* this code).
- **Height probe:** `console.log(currentVelocity.y)` on jump frames — should print exactly `5` on takeoff frames. Prints `10+` = you're adding instead of setting (impulse-stacking bug). Prints `5` but barely leaves ground = something else overwrites y after (check ordering — jump must be the last writer before `setLinvel`).
- **Ray-length interaction:** if jumps feel "cut" (tiny hops when tapping fast), the 0.1 m feeler may still read grounded for 2–3 frames and rewrite `y = 5` — harmless (same value), not the cause. Real cause of weak jumps is usually `JUMP_VELOCITY` too low or gravity raised in `<Physics>`.
- **Rocket check (holding Space from spawn):** falls from `[20, 2, 20]` red → lands green → immediately hops (Space still held) → repeats. Steady rhythm, same height every time. Accelerating heights = stacking bug.

## 6. Common beginner mistakes (jump edition)

1. **Gating on state instead of ref:** `if (Space && isGrounded)` (state) *works* but re-renders every landing/takeoff into the frame loop's read path and can lag one render behind. The ref is frame-exact. Rule: frame loop reads refs; React reads state.
2. **Impulse without mass:** `applyImpulse({ x: 0, y: 5, z: 0 })` gives `Δv = 5 / mass` — a heavy capsule barely hops. Either scale by mass or (simpler) set velocity like we do.
3. **Adding instead of setting:** `verticalVelocity = currentVelocity.y + JUMP_VELOCITY` — holding Space stacks to the moon, and even a tap mid-fall jumps higher than from rest (fall speed adds). Overwrite, don't accumulate.
4. **Jump before probe:** placing jump code *above* the raycast reads last frame's grounded — one frame stale. On a 60 Hz loop that's a 16 ms late takeoff and (worse) a 16 ms window where walking off a ledge still jumps. Order in our `useFrame`: probe → input → jump → `setLinvel` → camera.
5. **Zeroing y instead of preserving:** `setLinvel({ x, y: jumping ? 5 : 0 })` — the `: 0` murders gravity; the capsule would never fall (hovers when walking off ledges). The `= currentVelocity.y` default is load-bearing.
6. **Forgetting Space is already tracked:** adding a second `keydown` listener just for jump — duplicates doc 4's set, risks double-adds. The `pressedKeys` set already holds `'Space'`; read it.

## 7. Series checkpoint — what you can now build

Steps 1–10 complete the core mover — walk, look, steer, sense ground, hop:

- [x] Physics world + floor (gravity, collision)
- [x] Capsule body that lands upright
- [x] WASD velocity control (world → camera-relative)
- [x] Chase camera with smoothing + pointer-lock orbit
- [x] Camera-relative steering
- [x] Complex GLB colliders (HoverCar roof is jumpable ground — the ray sees it too)
- [x] Ground probe: `isGroundedRef` + badge
- [x] Grounded jump: `Space` → `y = 5`, gravity does the arc — this step

Natural next steps: **variable jump height** (release Space early → halve `vel.y`), **coyote-time** (remember last-grounded timestamp, allow jump ~0.1 s after walking off a ledge), **jump buffering** (remember Space press ~0.1 s, fire on landing), **sprint** (Shift × 1.6 speed), **mesh facing**. Each is one focused step like this one.

Related files: `src/components/GameSystem/Player.tsx`
Packages: none new — `setLinvel` + `pressedKeys` set already existed
