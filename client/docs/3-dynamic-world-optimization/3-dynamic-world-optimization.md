# Dynamic world optimization — P0 batch (notes)

Notes on the first optimization pass on the `dynamic-world-builder` branch, implementing
items 1–6 of the **P0** checklist from
[architectureAndOptimizationPlan.md](../architectureAndOptimizationPlan.md).
Goal: kill the cold-load "freeze + fallback stampede" — the ground + player appear
instantly, scattered copies pop in via `Suspense`.

## The problem being fixed

`forestWorld` scatters ~250 copies, and **every copy** used to pay the full placement tax:

- one `Box3.setFromObject(scene)` per copy
- one `world.castRay` ground-snap per copy (with up to 150 retries on cold load)
- one `intersectionWithShape` overlap probe per copy
- one `<RigidBody colliders="cuboid">` per copy

Rapier keeps every `fixed` collider in the broadphase forever (no lazy loading), so
250 far-away grass tufts were costing physics + draw calls for nothing.

## What changed, file by file

| File | Change |
| --- | --- |
| `src/components/World/worldTypes.ts` | new `resolvePhysics()` helper — scatter defaults to `decor` |
| `src/components/World/WorldObject.tsx` | flat-ground fast path, per-URL bounds cache, decor render branch |
| `src/components/World/World.tsx` | `OpenWorld` passes `flatGround` to every `WorldObject` |
| `src/components/World/forestWorld.ts` | `spacing` added to all 13 scatter entries |
| `src/components/GameSystem/Experience.tsx` | P0-only preloads, `multisampling={0}`, `<axesHelper/>` removed |
| `src/components/Rendering/map/OpenPlains.tsx` | `GROUND_TEXTURES` export, `anisotropy` 8 → 4 |
| `CharacterModel.tsx`, `HoverCar.tsx`, `TestMap.tsx`, `StrongHoldAnimated.tsx` | blanket `useGLTF.preload(...)` removed |

---

## 1. Scatter defaults to `physics: 'decor'`

Before: missing `physics` meant `'fixed'` — every scattered tree/rock/bush was a
RigidBody. Now (`worldTypes.ts`):

```ts
export function resolvePhysics(config: WorldObjectConfig): 'fixed' | 'decor' {
  return config.physics ?? (config.scatter ? 'decor' : 'fixed')
}
```

- scattered copies → visual-only (walk through them)
- everything else → solid static collider, as before
- explicit `"physics": "fixed"` in JSON still wins — that's the hook for
  hero-adjacent interactables (P3 physics tiers)

This alone removes ~200 RigidBodies from forestWorld.

## 2. Flat-ground fast path (no raycast on open maps)

`World.tsx` marks open-mode objects with `flatGround`. In `WorldObject.tsx` the
placement effect gets a synchronous branch before the raycast path:

```ts
if (flatGround) {
  // scatterSpot → position: [x, FLAT_GROUND_Y + offsetY, z], rotationY pinned or from spot
  // otherwise → one random point inside the spawn zone, same y
  return
}
// ...preset-map path: castRay + intersectionWithShape + cold-load retries
```

No castRay, no overlap probe, no retry timers — placement on open maps is pure math,
so a cold load behaves exactly like a hot reload.

**The y=0 vs y=-1 subtlety:** the visible OpenPlains plane sits at `y=-1` (it lives
inside the `RigidBody` at `[0,-1,0]`), but the `CuboidCollider args={[half, 1, half]}`
top face — the surface the old raycast actually hit — is at `y=0`. So the constant is:

```ts
/** OpenPlains collider top — the visible ground plane sits 1m lower at y=-1 */
const FLAT_GROUND_Y = 0
```

Using 0 (not -1) preserves every object's existing world position, so all the
hand-tuned `offsetY` values in `forestWorld.ts` still land exactly where they did
with the raycast. If you ever want objects pinned to the *visible* plane instead,
flip `FLAT_GROUND_Y` to `-1` and re-tune the offsets.

## 3. Bounds cached per model URL, not per copy

Module-level cache in `WorldObject.tsx`:

```ts
const boundsCache = new Map<string, RawBounds>()

function readRawBounds(url: string, scene: THREE.Object3D): RawBounds {
  // Box3.setFromObject once per URL; stores *unscaled* halfXZ/halfY/centerY/bottomOffset
}
```

Per copy the memo rescales the cached numbers by `config.scale` (cheap arithmetic).
The old `Bounds.scale` field is gone — the render branch reads `config.scale ?? 1`
directly.

On open maps the memo short-circuits (`if (flatGround) return null`) — bounds only
fed the raycast snap and the overlap probe, both of which are skipped, so
**`Box3.setFromObject` never runs at all on open maps**.

Note: no `footprint` overrides were added to `forestWorld.ts` for this reason — they'd
be inert there. `footprint` still works and is worth adding when scattered objects go
onto *preset* maps (or when something is `physics: 'fixed'` on a preset map).

## 4. `spacing` on every scatter entry

`planScatterSpots({ spacing })` already existed — `forestWorld.ts` now uses it so
copies don't overlap by construction (and don't need physics overlap checks):

| Entry | spacing |
| --- | --- |
| oak trees, stylized toon tree, rocks, deer | 3–5 |
| grass, bush | 2 |
| flower_bush, blue_scrub_bush | 1.5 |
| flowers, mushrooms, glowing mushrooms | 1 |
| crystals | 3 |

## 5. Preload only P0

`Experience.tsx` (module scope) is now the single preload point:

```ts
useGLTF.preload('/models/capsule.glb')
useTexture.preload(GROUND_TEXTURES)   // 4 paths exported from OpenPlains.tsx
```

Removed the blanket preloads: `cyberpunk_hovercar.glb` (HoverCar), `testMap.glb`
(TestMap), the stronghold GLB (StrongHoldAnimated), and `capsule.glb`
(CharacterModel — which preloaded a GLB it doesn't even render). Everything else
streams through the `<Suspense fallback={null}>` around `<Experience />` in `App.tsx`.

## 6. Per-frame cost

- `<axesHelper />` removed from `Experience.tsx`
- `<EffectComposer multisampling={0}>` (was 1) — big fill-rate win, desktop is fine
- postprocessing stays `HueSaturation + Vignette` only (no Bloom/SSAO on scatter maps)
- ground textures `anisotropy` 8 → 4 in `OpenPlains.tsx`

---

## Gotchas

- **Lint:** oxlint reports 8 warnings, 0 errors. The one new warning is
  `only-export-components` for `GROUND_TEXTURES` — same class as the existing
  `OpenPlainsSpawnZones` / `TestMapSpawnZones` / `StrongHoldSpawnZones` exports.
- **Preset maps unchanged:** `PresetWorld` doesn't pass `flatGround`, so TestMap /
  Stronghold keep the raycast + probe path (they need it — geometry isn't flat).

## Still open from P0

- Item **7** (delete build bloat): `public/**/*.bak` and `public/models/ignore/*`
  files not referenced by any world. Not touched in this pass.

## Verified

`bunx tsc -b` clean · `bun run lint` 0 errors · `bun run build` passes
(pre-existing >500 kB chunk warning, unrelated).
