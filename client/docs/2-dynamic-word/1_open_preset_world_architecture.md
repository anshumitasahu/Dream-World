# Open vs Preset world generation — architecture dig

How a `forestWorld` config becomes ground + objects + player. Covers the
uncommitted `dynamic-world-builder` changes that split `World` into two modes:
`open` (procedural ground + scatter) and `preset` (hand-built map + zones).

## 1. The two modes

`src/components/World/worldTypes.ts` changed `WorldConfig` from one shape into a union:

```ts
type WorldConfig = PresetWorldConfig | OpenWorldConfig
```

| | Preset (`mode?: 'preset'`) | Open (`mode: 'open'`) |
|---|---|---|
| Map geometry | Hand-built component from `MAP_REGISTRY` (`testMap`, `strongHold`, ...) | Generated `<OpenPlains size={ground?.size} />` flat ground |
| Ground size | Baked into the GLB / map component | `ground.size` (default 2000), drives collider + mesh + texture repeat |
| Object placement | `position` (exact) or `zone` (random point in a map-authored spawn zone) | `position` (exact) or `scatter` (N copies in a disk) |
| Spawn zones source | `getMapSpawnZones(map)` from registry, scaled by `mapScale` | `config.spawnZones ?? [[0,0,20]]` straight from the config |
| Player spawn source | Random point in a registry zone | `config.playerSpawn` if set, else random point in `config.spawnZones` |
| Example | old `testWorld.json` (`{ map: 'testMap', objects: [...] }`) | `forestWorld.ts` / `forestWorld2.json` |

`WorldObjectConfig` gained one field shared by both modes:

```ts
scatter?: { count, center?: [x,z], radius?, spacing?, seed? }
```

Preset objects simply ignore it (they never receive a `scatterSpot`).

## 2. End-to-end flow: forestWorld → screen + player

```
forestWorld.ts (WorldConfig, mode:'open')
  └─ App.tsx: <Canvas> → <Suspense> → <Experience />
       └─ Experience.tsx
            ├─ worldConfig = forestWorld as WorldConfig
            ├─ mapId = 'openPlains' (open) | config.map (preset)
            ├─ <Physics paused={!physicsActive}>
            │    ├─ <World config={worldConfig} />        ← ground + objects
            │    └─ <EcctrlWrapper mapId mapId config />  ← player
            └─ physics unpauses after 5s (was 1s)
```

### Step 0 — App shell (`App.tsx`)

`<Canvas shadows camera={fov:75, near:0.1, far:1000}>` + `<Suspense fallback={null}>`.
All GLB/texture loads suspend here, so `Experience` (and therefore `World`) only
mounts after the async assets it needs on first render are ready.

### Step 1 — Experience picks the mode (`GameSystem/Experience.tsx`)

Diff vs committed code:

- `testWorld.json` import → `forestWorld.ts` import (TS object, no `resolveJsonModule` needed).
- Derives `mapId`: `mode === 'open' ? 'openPlains' : config.map`. Open mode has no
  registry entry — the id is only used for the player fallback path.
- Passes full `config` to both `<World>` and `<EcctrlWrapper>` (previously only `map` id went to the player).
- Physics pause `1000ms → 5000ms` + post-processing commented out (perf/debug while building open worlds).
- `gravity={[0,0,0]}` stays — real gravity comes from ecctrl (`enableCustomGravity`).

### Step 2 — World branches (`World/World.tsx`)

```tsx
World({config}) → config.mode === 'open' ? <OpenWorld/> : <PresetWorld/>
```

**PresetWorld** (the old behavior, renamed):

1. `MAP_REGISTRY[config.map]` → `{ component, spawnZones, mapScale }`. Unknown map → warn + `null`.
2. `spawnZones = getMapSpawnZones(map)` — registry zones × `mapScale` so objects land on scaled geometry.
3. `<group><group scale={mapScale}><MapComponent/></group>{objects.map(WorldObject)} /></group>`.
4. Each object gets `defaultZone={index}` → round-robin spread when `zone` is omitted.

**OpenWorld** (new):

1. `spawnZones = config.spawnZones ?? [[0,0,20]]` — no registry involved.
2. `scatterPlans = config.objects.map(o => o.scatter ? planScatterSpots({...o.scatter, seed}) : null)` in a `useMemo`. Pure seeded math, computed once per config, identical on every load.
3. Renders `<OpenPlains size={config.ground?.size} />` then `flatMap`s objects:
   - plain object → one `<WorldObject>`;
   - scatter object → `scatterPlans[index].map(spot => <WorldObject scatterSpot={spot} />)`, key `${model}-${index}-${copy}`.

### Step 3 — Scatter layout (`World/scatter.ts`, new file)

`planScatterSpots({count, center=[0,0], radius=50, spacing=0, seed})`:

1. `hashSeed(seed)` (FNV-1a) → `mulberry32()` PRNG. Same seed → same sequence forever.
2. Per copy: uniform disk sample — `angle = rand()*2π`, `distance = sqrt(rand())*radius` (`sqrt` is what makes density uniform, not center-clumped).
3. If `spacing > 0`, reject candidates closer than `spacing` to an accepted spot, up to 30 tries; otherwise keep the last candidate (never collapses to center).
4. Rotation `rand()*2π` stored per spot.
5. Default seed in `World.tsx`: `` `${model}:${center}:${radius}` `` — two entries with the same model but different centers (the two `oak_trees` groves in `forestWorld.ts`) still get different layouts.

No physics here by design — cold loads produce exactly the same x/z list as hot reloads.

### Step 4 — Object placement (`World/WorldObject.tsx`)

Same engine for both modes; only the *candidate list* differs. Mount sequence per copy:

1. **GLB load:** `useGLTF(config.model)` → `scene`.
2. **Bounds (`useMemo`):** `Box3.setFromObject(scene)` → `halfXZ`, `centerY`, `bottomOffset = box.min.y * scale` (+0.1 padding). `footprint` config overrides everything. Recomputes only when scene/config change.
3. **Explicit `position`?** → `setPlacement` immediately, skip physics. This is how houses, campfire, bench, unicorn etc. in `forestWorld.ts` land.
4. **Candidate spots:**
   - scatter copy → exactly one: `{ scatterSpot.x, scatterSpot.z, rotationY: config.rotationY ?? spot.rotationY }`;
   - zoned/preset object → 20 random points: `zone = spawnZones[(config.zone ?? defaultZone) % len]`, `x = zone[0] ± rand*radius`, same for `z`.
5. **Ground snap:** ray down from `y=60`, length 120: `world.castRay(ray, 120, true)`. `groundY = 60 − hit.timeOfImpact`; `y = groundY − bottomOffset` so the mesh *base* sits on the floor even when the GLB origin is mid-mesh.
6. **Overlap probe:** `rapier.Cuboid(half extents)` tested at `y + centerY + halfY + 0.05` via `world.intersectionWithShape`. The +0.05 lift stops "resting on the floor" counting as overlap. Hit → reject candidate.
7. **Miss policy:**
   - scatter: `castRay` miss on a cold load usually means the ground collider isn't mounted yet (hot reload reuses a ready physics world), so retry every 60ms up to 150 times (~9s); genuine miss (outside the map) → `console.warn` + stay hidden (`return null`), never stampede to zone center.
   - zoned: try all 20, then fall back to the zone center ground-snapped + `console.log` spawn-debug line.
8. **Render:** `null` until placed (no origin flash). `physics:'decor'` → plain `<group>` (grass, crystals, pigeons — walk-through); else `<RigidBody type="fixed" colliders="cuboid">` + `<Clone object={scene} scale>`. Diff note: `hull → cuboid` (cheaper, stable for trees/rocks at scale).

### Step 5 — Ground (`Rendering/map/OpenPlains.tsx`)

- New `size` prop (default 2000): `half = size/2` drives `CuboidCollider args={[half,1,half]}`, `planeGeometry [size,size]`, wall positions, and `texture.repeat = size/10` (constant texel density — a 600m forest doesn't stretch like a 2000m plain).
- One fixed body at `y=−1` (top face exactly `y=0`), four collider-only boundary walls, `diffuse.colorSpace = SRGB`, anisotropy 8. `forestWorld` uses `size: 600`.
- Removed unused `THREE` import.

### Step 6 — Player spawn (`mapRegistry.ts` + `EcctrlWrapper.tsx`)

`EcctrlWrapper` now takes `config` and memoizes `getPlayerSpawnPosition(mapId, config)`:

```
open mode:
  playerSpawn set? → use it verbatim  (forestWorld: [0,1,40])
  else → sampleSpawnZone(config.spawnZones ?? [[0,0,20]])
preset mode:
  zones = getMapSpawnZones(mapId)  (registry zones × mapScale)
  empty? → warn + [0,1,0]
  else → sampleSpawnZone(zones)
sampleSpawnZone: pick random zone → uniform disk sample
  (angle = rand*2π, d = sqrt(rand)*r) → [x+d·cos, floorY+1, z+d·sin]
```

The `+1` is `PLAYER_SPAWN_CLEARANCE` so the capsule never starts interpenetrating.
`EcctrlWrapper` also pushes the spawn into `usePlayerStore` and drives camera/FPS controls from `controller.currPos` every frame — unchanged by this diff.

## 3. forestWorld configs as examples

`forestWorld.ts` (`mode:'open'`, `ground.size: 600`, `playerSpawn: [0,1,40]`):

- Exact: house `[28,−1.5,40] scale 0.01`, campfire, bench, lantern, chest, unicorn, horse, velkhana `[-140,0.1,120]`, portal `[60,0.1,60] scale 0.008`.
- Scatter: `oak_trees` ×10 @ (−80,−40) r70 + ×12 @ (−30,80) r35 (scale 10), grass ×60 r120 `decor`, deer ×5 @ (−50,−60) r40, crystal ×8 @ (110,90) r30 `decor`.

`forestWorld2.json` is the bigger variant: same ground/spawn, ~25 objects, adds pine/sakura/toon trees, bushes, flowers, mushrooms, rocks, pigeons — most `decor` so the raycast/overlap pass stays cheap.

## 4. File-by-file diff summary (`git diff` on this branch)

| File | Change | Why |
|---|---|---|
| `World/worldTypes.ts` | `WorldConfig` → `PresetWorldConfig \| OpenWorldConfig`; new `ScatterConfig`, `OpenGroundConfig`; `WorldObjectConfig.scatter?` | Vocabulary for both modes |
| `World/scatter.ts` | **New.** `planScatterSpots` (FNV-1a + mulberry32, uniform disk, spacing, seeded rotation) | Deterministic layouts, physics-independent |
| `World/World.tsx` | Split into `PresetWorld` + `OpenWorld` + branching `World`; scatter `useMemo` + `flatMap` fan-out with `scatterSpot` | One composer, two generators |
| `World/WorldObject.tsx` | `scatterSpot?` prop; single-spot path for scatter; ground-miss retry loop (150×60ms); hide-on-genuine-miss; `hull→cuboid`; debug `console.log` | Cold-load fix + cheap stable colliders |
| `World/mapRegistry.ts` | `getPlayerSpawnPosition(mapId, config?)`; open-mode early return; extracted `sampleSpawnZone` | Player spawn works without a registry map |
| `World/forestWorld.ts`, `forestWorld2.json` | **New (untracked).** Open-mode example configs | Test/demo forest content |
| `Rendering/map/OpenPlains.tsx` | `size` prop drives collider/mesh/walls/texture repeat | Forest (600) vs default plain (2000) |
| `GameSystem/Experience.tsx` | `forestWorld` import; `mapId` derivation; `config` to `World`+`EcctrlWrapper`; pause 1s→5s; postFX commented out | Wire open mode in; longer WASM/GLB settle |
| `GameSystem/EcctrlWrapper.tsx` | `config?` prop → `getPlayerSpawnPosition(mapId, config)` | Honor `playerSpawn`/`spawnZones` |

## 5. Gotchas learned

- **Cold-load scatter invisibility:** `WorldObject` effects run before the async ground collider mounts; the old code treated the ray miss as "outside map" and hid the copy. Hot reload masked it (physics already up). Fixed with the retry loop — same deterministic spot, just placed later.
- **Never scale above `<RigidBody>`:** `World.tsx` still wraps preset maps in `<group scale={mapScale}>` (stronghold ×10). Rapier never sees ancestor scale — see `docs/WorldBuilding.md` §6. Bake final size in Blender instead.
- **Seed collisions:** default seed includes model+center+radius; two identical scatter entries at the same disk would stack identically — pass explicit `seed` to vary.
- **Decor vs fixed:** anything the ray should see through (grass, crystals) must be `decor`, otherwise later copies ray-hit earlier copies' hulls and the overlap probe rejects valid ground.
