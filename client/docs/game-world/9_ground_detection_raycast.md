# 9. Ground Detection — How Does the Player Know It's on the Floor? (Beginner Notes)

> Goal of this step: give the capsule a sense of **touch for its feet** — a boolean `isGrounded` that is `true` on the floor, `false` mid-air. This is the gatekeeper for jump, footsteps, landing, coyote-time — everything that must only happen on ground.
> Prereq: `3_capsule_player.md` (the body we probe), `0_physics_model.md` (the two-worlds model). This step only *reads* physics — it moves nothing.

## 0. What we just did (TL;DR)

1. Asked the physics world every frame: "is there floor within 1.1 m below the player's center?" using `world.castRay()`.
2. Stored the answer in two places: a fast `isGroundedRef` for game logic, a `isGrounded` state for the on-screen badge.
3. Excluded the player's own body from the ray so it doesn't hit itself.
4. Run the app: green `Grounded` badge on the floor, red `Airborne` badge when you walk off something / fall from spawn.

New code (top of `useFrame`, before movement):

```tsx
const playerPosition = playerBody.translation()
if (groundRayRef.current === null) {
  groundRayRef.current = new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 })
}
const groundRay = groundRayRef.current
groundRay.origin.x = playerPosition.x
groundRay.origin.y = playerPosition.y
groundRay.origin.z = playerPosition.z
const groundHit = world.castRay(groundRay, GROUND_RAY_LENGTH, true, undefined, undefined, undefined, playerBody)
const groundedNow = groundHit !== null
if (groundedNow !== isGroundedRef.current) {
  isGroundedRef.current = groundedNow
  setIsGrounded(groundedNow)
}
```

## 1. Mental model: physics knows contact, your code doesn't

Rapier's solver from doc 0 §4 already knows when the capsule rests on the floor — it pushes it out every step and zeroes `vel.y`. But that knowledge stays **inside the physics world**. Your `Player.tsx` code can't see it:

```
PHYSICAL WORLD (Rapier)              YOUR CODE (Player.tsx)
-----------------------              ----------------------
solver pushes capsule out of floor   ❌ no variable tells you "on ground"
vel.y becomes 0 on landing           ❌ vel.y == 0 also happens at jump peak!
contacts exist internally            ❌ no contact list in your scope
what Rapier FEELS                    what you can READ → nothing yet
```

Why not just check `vel.y === 0`? Because velocity is ambiguous:

- Standing on floor: `vel.y ≈ 0` ✓ grounded
- Top of a jump arc: `vel.y ≈ 0` for one frame ✗ but airborne
- Falling fast past a ledge: `vel.y = -5` ✗ airborne (correct by luck, wrong reason)

Velocity answers "how fast am I moving", never "what is under my feet". Ground detection answers a different question: **"is there something solid just below me?"** That needs a direct probe of the world — a raycast.

Pipeline position (reads only, touches nothing):

```
1. INPUT → 2. INTENT → 3. VELOCITY → 4. PHYSICS
                                              │
                              NEW: GROUND PROBE (reads world) ─→ isGrounded
                                              │
                              5. CAMERA → 6. RENDER (+ badge)
```

Later steps (jump) will *consume* `isGroundedRef`. Today we only *produce* it.

## 2. Core concept: a raycast is a laser measuring tape

A **ray** = a half-line with an origin point and a direction. A **raycast** = "fire this laser into the physics world, tell me the first solid thing it hits (or null if nothing within range)".

```
        player center (ray origin)
               ●
               │  direction (0, −1, 0) = straight down
               │  max length 1.1 m
               │
            ───┴─── capsule bottom (1.0 m below center)
               │  ← 0.1 m of "feeler" past the feet
          ═════╪═════ floor top (y = 0)
               ▲ hit! timeOfImpact ≈ 1.0 → grounded = true


        player falling from spawn [20, 2, 20]:
               ●  (y = 2, feet at y = 1, floor 1.0 m below feet)
               │
               │  ray reaches down to y = 0.9... floor at y = 0?
               │  distance center→floor = 2.0 m > 1.1 m range
               ✕  null → grounded = false (Airborne!)
```

Vocabulary (only 5 new words):

| Term | Plain English | Our value |
|------|---------------|-----------|
| `Ray` | Laser: origin + direction | origin = player center, dir = straight down |
| `maxToi` | How far the laser reaches ("time of impact" = distance along a normalized dir) | `1.1` m |
| `solid` | If `true`, a ray starting *inside* a collider still counts as hitting it | `true` — forgiving when feet sink slightly into floor |
| `RayColliderHit` | The answer: which collider + how far, or `null` | `null` = air, non-null = ground |
| `filterExcludeRigidBody` | "Ignore this body" — don't let the laser hit yourself | `playerBody` — else the ray hits its own capsule |

Why 1.1 m? Our capsule is `CapsuleCollider args={[0.5, 0.5]}` = halfHeight 0.5 + radius 0.5 → total height 2.0 m, so feet sit exactly 1.0 m below the center (`translation()`). Ray length = 1.0 (reach the feet) + 0.1 (tiny feeler past the soles). Standing: floor is ~1.0 m below center → inside range → hit. Even 5 cm airborne: distance 1.05 → still hit (small grace). Clearly falling: distance > 1.1 → null.

## 3. Every new line, explained

```tsx
const { world, rapier } = useRapier()
```

- `useRapier()` is the hook that hands you the live physics world (same `<Physics>` from `App.tsx`). `world` = the room you can query (cast rays, read bodies). `rapier` = the toolbox with classes like `Ray`. Must be called inside a component under `<Physics>` — `Player` is. (Doc 0 §2: the "room where physics happens", now with a door you can knock on.)

```tsx
const GROUND_RAY_LENGTH = 1.1
```

- Named constant next to `MOVE_SPEED`, not a magic number buried in the call. 1.0 m = capsule half-height + radius (center→feet), 0.1 m = feeler. If you ever resize the capsule, this is the one number to revisit.

```tsx
const groundRayRef = useRef<InstanceType<typeof rapier.Ray> | null>(null)
```

- Holds **one** `Ray` object for the whole life of the player. Starts `null`, created lazily on the first frame (see below). A ref — not state, not a plain variable — because `useFrame` runs outside React's render cycle and the object must survive across 60 fps callbacks without triggering re-renders. (Same reason `pressedKeysRef` and `cameraYawRef` are refs per docs 4/6.)
- Why not `useMemo(() => new rapier.Ray(...))`? We mutate `groundRay.origin` every frame, and the React compiler lint flags mutating a memoized value. A ref is the honest container for a mutable long-lived object.

Lazy creation, inside `useFrame`:

```tsx
if (groundRayRef.current === null) {
  groundRayRef.current = new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 })
}
const groundRay = groundRayRef.current
```

- First frame builds the laser: origin placeholder `(0,0,0)`, direction straight down `(0, −1, 0)` — must be normalized (length 1) so `maxToi` means meters. Every later frame reuses it: zero allocations in the hot loop (a `new Ray` per frame = 3600 objects/min for the GC). The `if` also narrows the type for TypeScript: after it, `.current` is definitely a `Ray`.

```tsx
const playerPosition = playerBody.translation()
const groundRay = groundRayRef.current // (after the lazy-init above)
groundRay.origin.x = playerPosition.x
groundRay.origin.y = playerPosition.y
groundRay.origin.z = playerPosition.z
```

- Moves the laser's start to the player's current center every frame — the ray rides along with the capsule. Mutates the existing `groundRay` in place (no `new` per frame). Note this `playerPosition` is declared once at the top of `useFrame` and reused below by the camera code too — one `translation()` call serves both (it was previously declared lower just for the camera; we hoisted it).

```tsx
const groundHit = world.castRay(groundRay, GROUND_RAY_LENGTH, true, undefined, undefined, undefined, playerBody)
```

- The actual question to physics: "from here, going down, do you hit anything within 1.1 m?" Arguments in order: `(ray, maxDistance, solid, filterFlags, filterGroups, excludeCollider, excludeBody)`. The three `undefined`s = "no fancy filtering, check everything". The last one is the important one: **exclude my own body**, otherwise the ray (which starts *inside* the capsule) instantly hits the capsule itself and `isGrounded` is forever `true`. Returns `RayColliderHit | null`.

```tsx
const groundedNow = groundHit !== null
```

- Collapses the rich answer ("which collider, how far") into the one boolean the game needs. We don't care *what* is below (floor? HoverCar roof? stairs later?) — only *whether* something is. Deliberately simple: ground = "anything solid under feet".

```tsx
if (groundedNow !== isGroundedRef.current) {
  isGroundedRef.current = groundedNow
  setIsGrounded(groundedNow)
}
```

- Two storages, two jobs (pattern from doc 6's yaw/pitch refs vs state):
  - `isGroundedRef` — a **ref**: updates silently 60×/sec, readable inside `useFrame` with zero re-renders. This is what jump logic will read next step (`if (Space && isGroundedRef.current) jump()`). Refs are for the frame loop.
  - `isGrounded` **state** — triggers a React re-render, but *only on change* (landing / takeoff moments, ~rare), never every frame. This is what the badge reads. The `if` guard is the whole trick: without it, `setIsGrounded` 60×/sec = 60 re-renders/sec of the HUD for no reason.

What we did NOT touch (and why): movement (`setLinvel`) — probing reads the world, it never writes velocity. Gravity preservation (`y: vel.y`) — untouched. Camera — untouched. Collision events / contact listeners — a valid alternative (see §6.5), deliberately not used; raycast is simpler and frame-exact for walkers.

## 4. What happens now (two scenarios)

Setup: player spawns at `[20, 2, 20]`, floor top at `y = 0`.

**Scenario A — falling from spawn:** center at `y = 2`, floor 2.0 m below center > 1.1 range → `castRay` returns `null` → `groundedNow = false` → badge shows red `Airborne`. Gravity pulls the capsule down (doc 0 §4). Each frame the distance shrinks: 2.0 → 1.5 → 1.2 → still null...

**Scenario B — touchdown:** center reaches `y ≈ 1.0` (feet touch `y = 0`). Distance center→floor = 1.0 ≤ 1.1 → `castRay` returns a hit (`timeOfImpact ≈ 1.0`) → `groundedNow = true` → ref flips, state flips, badge goes green `Grounded`. Solver settles the capsule; every following frame still hits → guard `if` stays quiet, no re-renders. Walk (WASD) along the flat floor: distance stays ~1.0 → stays green the whole walk.

## 5. How to test / debug this yourself

- **Spawn test:** fresh load — badge starts red `Airborne` (spawn is 2 m up), flips green within ~half a second on landing. If it starts green, your ray is hitting the player itself (check the exclude-body argument).
- **Walk test:** hold W on flat floor — stays green continuously. Flicker green/red/green while walking flat = ray length exactly grazing; bump `GROUND_RAY_LENGTH` slightly (1.15) or check floor is level.
- **Fall test:** walk off the HoverCar roof (or anything raised) — flips red the moment feet leave, green on landing. That's the whole point of the feeler: the flip should feel immediate, not delayed.
- **Console probe:** add `console.log(groundHit?.timeOfImpact)` temporarily — standing should print ~1.0 steadily. Prints ~0.0 constantly = self-hit (exclude arg missing). Prints `undefined` alternately = flicker (see above).
- **Badge check:** green = `isGrounded` state true, red = false. Ref and state agree by construction (set together inside the same `if`).

## 6. Common beginner mistakes (ground-detection edition)

1. **Forgetting to exclude yourself:** ray starts inside your own capsule → instant self-hit → `isGrounded` stuck `true` even mid-air. The `playerBody` last argument is not optional in practice.
2. **Ray too long:** length 5 m from center = "grounded" while jumping 3 m in the air (floor still within 5 m). Feeler must be short: feet + a few cm. Ours: 1.0 + 0.1.
3. **Ray too short / origin at feet exactly:** length exactly 1.0 with float error → flickers on flat ground. The +0.1 grace exists precisely to absorb solver jitter (capsule rests ~mm above/below exact contact).
4. **`setState` every frame:** calling `setIsGrounded(groundedNow)` unconditionally = 60 re-renders/sec. Always guard with the `if (changed)` check; keep per-frame reads in the ref.
5. **Allocating a `new Ray` per frame:** works but creates 3600 objects/min for the GC. Lazy-init once into a ref + mutate origin is the standard pattern (which is what we do).
6. **Using collision events instead and wondering about ordering:** `onCollisionEnter/Exit` on the RigidBody is the event-driven alternative — fine for landing *effects* (thud sound), but events fire in the physics step while jump input is read in `useFrame`; a same-frame jump can race the exit event. The raycast reads ground truth at the exact moment you need it. (Rule of thumb: continuous questions → raycast; one-shot reactions → events.)

## 7. Series checkpoint — what you can now build

Steps 1–9 complete everything jump needs except the jump itself:

- [x] Physics world + floor (gravity, collision)
- [x] Capsule body that lands upright
- [x] WASD velocity control (world → camera-relative)
- [x] Chase camera with smoothing + pointer-lock orbit
- [x] Camera-relative steering
- [x] Complex GLB colliders (HoverCar you can stand on — and the ray sees it as ground too)
- [x] Ground probe: `isGroundedRef` (logic) + `isGrounded` (HUD) — this step

Natural next step: **jump** (`Space` → `applyImpulse({y})` gated on `isGroundedRef.current`, keep `y: vel.y` preservation for everything else). After that: sprint, mesh facing, camera collision, coyote-time (which is just "remember last grounded time" — trivial now that the signal exists).

Related files: `src/components/GameSystem/Player.tsx`
Packages: none new — `useRapier` + `rapier.Ray` ship inside `@react-three/rapier` / `@dimforge/rapier3d-compat`
