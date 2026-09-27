# DreamWorld — Architecture & Optimization Plan

> Goal: text ("dream world") -> AI JSON (world, environment, objectives) -> WorldBuilder builds it -> user publishes -> feed shows **images only** -> click `?world=id` loads + plays -> portals connect worlds.
> Constraints locked in: **desktop/laptop/PC only** (no mobile), **invisible first-person hero** (Ecctrl capsule only), **2 build modes** (`open` = OpenPlains up to 2000 units, `preset` = hand-built interaction maps), **feed = thumbnails**.

## 0. Where you are now (measured)

- `src/components/World/forestWorld.ts`: ~250 copies via `scatter` (60 grass, 40 bush, 30 flowers, 25 flower_bush, etc.)
- `src/components/World/World.tsx` `OpenWorld`: `flatMap` -> one `<WorldObject>` per copy.
- `src/components/World/WorldObject.tsx`: per copy does `Box3.setFromObject(scene)` + `world.castRay` + `intersectionWithShape` + `<RigidBody colliders="cuboid"><Clone/></RigidBody>`. That's 250+ draw calls + 250+ colliders + 250 raycasts on mount.
- `public/models`: **421MB**, single files: 17MB neo-tokyo, 16MB city_ruins, 11MB high_school, 7.2MB hovercar, 3.7MB portal/crystal. Whole-world initial load budget blown by one file.
- `src/components/GameSystem/Experience.tsx`: `<Physics timeStep="vary">` + postprocessing + `<axesHelper/>`, 1s physics delay hack.
- `src/components/Rendering/map/OpenPlains.tsx`: flat ground 2000 default, single cuboid collider — good, keep it.

**Key fact: Rapier does NOT lazy-load.** Every `fixed` collider stays in broadphase even 1500m away. `<Clone>` does NOT frustum-cull as a group. You must chunk/instance yourself.

---

## Priority order (TL;DR)

| Order | What | Effort | Impact |
|---|---|---|---|
| **P0 immediate (today)** | Flip scatter to `decor`, skip raycast on flat ground, cache bounds, kill debug/post cost | 2-4h | kills cold-load hitch |
| **P1 week 1** | Move `public/` -> CDN (R2/S3+Cloudflare), compress all GLBs | 1-2 days | 421MB -> ~30MB initial, feed becomes viable |
| **P2 week 2** | `AssetRegistry` + `modelId` + TSX catalog, AI JSON locked to catalog (Zod) | 2-3 days | unblocks DreamWorld AI + publish/share |
| **P3 week 3** | Instanced scatter + 250m chunk streaming + physics tiers for OpenPlains | 3-5 days | 100 trees = 1 draw call, 2000u map playable |
| **P4 after** | `?world=id` streaming (P0/P1/P2 rings) + portals + preset-map rules | 2-3 days | social + connected dreams |
| **P5 later** | Far-static merging, LOD/billboards, shadow/post tuning | when needed | polish, not blocking |

Do P0-P1 before anything else. P5 is explicitly **do not do now**.

---

## P0 — Fastest wins (do first, easy + high impact)

- [x] **1. Default all scatter to `physics: 'decor'`.** In `worldTypes.ts` treat missing `physics` on scattered copies as decor. Only hero-adjacent interactables get colliders (see P3 tiers). This alone removes ~200 RigidBodies from forestWorld.
- [x] **2. Skip ground-snap on OpenPlains.** Ground is flat `y=-1`. In `WorldObject.tsx`: `if (config.mode === 'open' && flat) position.y = offsetY, no castRay, no intersectionWithShape`. Keep raycast path only for `preset` maps.
- [x] **3. Cache bounds per model URL, not per copy.** `Map<string, Bounds>` module cache in `WorldObject.tsx`. `Box3.setFromObject` once per URL. Add `footprint` override in JSON for trees/rocks to skip Box3 entirely.
- [x] **4. Use `spacing` in scatter.** You already have `planScatterSpots({spacing})` — set `spacing: 3-5` for trees, `1-2` for grass/bush so copies don't overlap and you don't need physics overlap checks.
- [x] **5. Preload only P0.** `useGLTF.preload(ground + player capsule)` in `Experience.tsx`. Remove blanket preloads. Everything else streams via `Suspense`.
- [x] **6. Kill per-frame cost.** Remove `<axesHelper/>`, set `multisampling={0}` (desktop still fine, huge fill-rate win), keep `HueSaturation+Vignette` only — no Bloom/SSAO on scatter maps. `anisotropy=4` not 8 on ground.
- [ ] **7. Delete build bloat.** `public/**/*.bak`, `public/models/ignore/*` not referenced by any world. Anything in `public/` ships to dist. Check with `grep -r "models/" src/components/World`.

Expected: cold load from "freeze + fallback stampede" to "ground + player instantly, scatter pops in".

---

## P1 — CDN + GLB compression (high impact, do second)

Vite `public/` = no hashing, no immutable cache, no compression, 421MB copied into every build. Social feed can't work like this.

- [ ] **1. Move to R2 / S3 + Cloudflare CDN.**
  - Bucket: `dreamworld-assets`, paths: `models/nature/oak-v3-draco.glb`, `textures/ground/...ktx2`.
  - Headers: `Cache-Control: public, max-age=31536000, immutable`, `Content-Type: model/gltf-binary`, CORS `*`.
  - Frontend: `VITE_CDN_URL=https://cdn.dreamworld.gg`, all URLs built as `${CDN}/models/...`. Keep only `capsule.glb` + ground fallback in `public/`.
  - Version by filename (`oak-v3.glb`), never overwrite. AI JSON references `modelId`, frontend maps to CDN URL (see P2) so migration is transparent.
- [ ] **2. Compress every GLB with `gltf-transform`.** gzip does almost nothing on GLB (already binary) — Draco + KTX2 + resize matters 10x more.
  ```bash
  npm i -g @gltf-transform/cli
  and install ktx-software.deb
  gltf-transform inspect public/models/ignore/nature/oak_trees.glb
  
  # pipeline per file:
  gltf-transform dedup in.glb tmp.glb
  gltf-transform resize --width 1024 --height 1024 tmp.glb tmp2.glb   # scatter: 512, hero/map: 1024
  gltf-transform ktx2 tmp2.glb tmp3.glb --slots baseColor,normal,roughness
  gltf-transform draco tmp3.glb out-draco.glb --method edgebreaker
  # verify in https://gltf.report, check black-material regression (docs/BlackGlbFix.md)

  # simply for scattering props
  gltf-transform optimize input.glb output.glb --compress draco --texture-compress ktx2 --flatten false --join false
  ```
- [ ] **3. Enforce budgets (desktop, invisible hero).**
  - scatter (tree/grass/bush/rock/flower/mushroom): **<500KB ideal, <1MB max, <10k tris, 1 material, 1x 512 KTX2**.
  - props (bench/lantern/chest/portal/crystal): **<2MB, <30k tris**.
  - creatures (deer/unicorn/dragon): **<3MB, <50k tris, no skinning unless animated**.
  - preset map whole: **<15MB visual + <500KB colliders.glb**. Initial world total: **<30MB**.
  - Your 17/16/11MB files can never be scatter — either compress to budget or mark `presetOnly: true`.
- [ ] **4. Ideal GLB checklist.**
  - Applied transforms (`Ctrl+A` in Blender), +Y up, 1 unit = 1m.
  - No `KHR_materials_unlit` + black baseColor (see BlackGlbFix — strip it).
  - No embedded 4K PNGs, no duplicate samplers, no unused animations/skins.
  - Proxy colliders modeled separately (`COL_*`), never `trimesh` on scatter.

---

## P2 — AssetRegistry + TSX model catalog + AI contract (DreamWorld core)

This is your current idea and it's correct: stop putting raw URLs in world JSON. AI returns `modelId`, frontend resolves everything else.

- [ ] **1. Registry shape (`src/components/World/assetRegistry.ts`).**
  ```ts
  export type ColliderKind = 'none' | 'trunk' | 'cuboid' | 'ball' | 'custom';
  export interface AssetDef {
    id: string;                 // 'oak_tree' — what AI returns
    url: string;                // `${CDN}/models/nature/oak-v3-draco.glb`
    category: 'nature'|'prop'|'creature'|'structure'|'special'|'terrain';
    tris: number; sizeKB: number;
    scale: number; offsetY: number;
    footprint?: [number,number,number]; // skips Box3
    collider: ColliderKind;     // scatter nature -> 'none' | 'trunk'
    interactRadius?: number;    // chest/portal/dragon
    sound?: string;             // howler key
    tags: string[];             // ['forest','spooky','dream'] — AI filters by these
    lodDist?: [number, number]; // [cull, colliderOff]
    presetOnly?: boolean;       // 17MB maps can't scatter
  }
  export const ASSETS: Record<string, AssetDef> = {
    oak_tree: { id:'oak_tree', url:`${CDN}/models/nature/oak-v3-draco.glb`, category:'nature', tris: 4200, sizeKB: 380, scale: 10, offsetY: -1, footprint:[1.2,4,1.2], collider:'none', tags:['forest','day'], lodDist:[600,80] },
    // ... one entry per unique GLB
  };
  ```
- [ ] **2. TSX per unique model (`src/components/Rendering/models/<Name>.tsx`).** Generated once via `gltfjsx`, then hand-edit: bake size/scale, declare collider proxy, sound, interaction.
  ```bash
  npx gltfjsx@6.5.3 public/models/ignore/nature/oak_trees.glb -o src/components/Rendering/models/OakTree.tsx --types --draco
  ```
  Each TSX exports: visual + `collider` + `interact()` + `sound` + `footprint`. `WorldObject` looks up `ASSETS[modelId]`, never raw `model` URL. Keep legacy `model` field as fallback during migration.
- [ ] **3. AI JSON contract (Zod, server-side).** Never let LLM invent URLs/counts.
  ```ts
  const DreamJSON = z.object({
    worldId: z.string(), seed: z.string(),
    mode: z.enum(['open','preset']),
    ground: z.object({ size: z.number().max(2000) }).optional(),
    sky: z.enum(['day','sunset','night','void']),
    palette: z.array(z.string()).max(5),
    objects: z.array(z.object({
      modelId: z.string().refine(id => !!ASSETS[id]),
      count: z.number().max(100), // scatter cap
      center: z.tuple([z.number(),z.number()]).optional(),
      radius: z.number().max(400).optional(),
      physics: z.enum(['fixed','decor']).default('decor'),
    })).max(20),
    objectives: z.array(z.object({ id: z.string(), type: z.enum(['find','collect','talk','enter']), target: z.string(), text: z.string() })).max(5),
    portals: z.array(z.object({ to: z.string(), position: z.tuple([z.number(),z.number(),z.number()]) })).max(3),
  });
  ```
  Prompt includes `Object.values(ASSETS).map(a=>[a.id,a.tags])` so LLM picks `oak_tree x40 + glowing_mushroom x15 + dragon x1` for "spooky forest dream", not URLs.
- [ ] **4. Backend minimal (Postgres).** `users(id, handle)`, `worlds(id, owner, config JSONB, seed, thumbnail_url, likes, plays, created_at)`, `portals(from_world, to_world, position)`. Feed queries thumbnails only. `GET /w/:id` returns JSON manifest (KBs).

---

## P3 — OpenPlains instancing + chunk streaming (the 100-tree fix)

Replace `flatMap -> 100x WorldObject -> 100x RigidBody+Clone` with **1 `Instances` per model per chunk**.

- [ ] **1. Group scatter by `modelId`.** In `OpenWorld`, `useMemo` group: `Map<modelId, ScatterSpot[]>`. Render one `<ScatterField def={ASSETS[id]} spots={...}/>` per model, not per copy.
- [ ] **2. Chunk 2000u map into 250m cells.** `cell = floor(x/250), floor(z/250)`. Only mount 3x3 cells around player. Player pos from `store/playerStore.ts`, checked throttled every 300ms in `useFrame` (not every frame), `setState` only when cell changes.
  ```tsx
  // sketch
  function ScatterField({ def, spots }) {
    const cells = useMemo(() => groupByCell(spots, 250), [spots]);
    const playerCell = usePlayerCell(250); // zustand + throttle
    const visible = nineCells(cells, playerCell);
    return visible.map(([key, list]) => (
      <Instances key={key} geometry={def.geometry} material={def.material} limit={list.length} frustumCulled>
        {list.map((s,i) => <Instance key={i} position={[s.x, def.offsetY, s.z]} rotation={[0,s.rotationY,0]} scale={def.scale} />)}
      </Instances>
    ));
  }
  ```
  Use drei `Instances/Instance` (1 draw call per chunk-model). `useGLTF` cache means 100 trees is already 1 fetch — this fixes the draw-call side.
- [ ] **3. Physics tiers (flat ground = cheap).**
  - `decor` (default scatter): **no RigidBody at all**, just `Instances`. Grass/flowers/bush/mushroom stay here forever.
  - Near trees/rocks (<80m): one `trunk` cylinder or `cuboid` per tree, `enabled={near}` prop on RigidBody, or a single merged collider per chunk.
  - Interactables (chest/portal/dragon): individual `<RigidBody type="fixed">` + `interactRadius` sphere sensor, always loaded in spawn chunk.
- [ ] **4. Shadows/lights.** Scatter `castShadow=false`, only structures/creatures cast. One directional + hemisphere (your `Lights.tsx`), no per-object lights.

---

## P4 — worldId loading + portals + preset maps

- [ ] **1. `?world=id` sequence.**
    1. Fetch manifest JSON (KBs) + show `thumbnail_url` as loading background.
    2. P0: ground + spawn 100m + capsule — `useGLTF.preload()` these two only, `Suspense` fallback = thumbnail.
    3. P1 (300m ring) then P2 (rest) via `requestIdleCallback` / `React.lazy`. Prefetch portal `to` manifest when player within 20m of portal.
- [ ] **2. Portals.** Portal object stores `targetWorldId`. On enter: unmount `<World/>`, show thumbnail loader, `window.location = ?world=target` or in-app `setWorldId`. Never keep two worlds mounted. Prefetch target JSON early, GLBs lazy.
- [ ] **3. Preset maps (interaction maps).** Load whole via `Suspense` — they're bounded. One `fixed` body + `<50` cuboid proxies from `*_colliders.glb` (your `docs/WorldBuilding.md` pattern). Scatter on top is `decor` only. No per-copy raycast — spawn zones come from `mapRegistry.ts`.

---

## P5 — Later (explicitly defer)

- Far statics: merge distant chunks into one geometry, billboard/impostor trees beyond 600m (fog already hides them — your fog is 0-100m, extend to ~400m for 2000u maps).
- LOD: `detailed <-> trunk <-> billboard` by distance. Only after P3 ships.
- KTX2 everywhere, MSAA off, `flat` ground texture repeat tuned per size.
- Objective system: `objectives[]` from AI -> HUD checklist (`playerHudStore.ts`) + proximity triggers, no physics needed.
- Like/play counters, thumbnail generation (headless screenshot on publish).

---

## Appendix — copy-paste checklists

**New GLB intake:** `inspect` -> `dedup` -> `resize 512/1024` -> `ktx2` -> `draco` -> `gltf.report` visual check -> add `ASSETS` entry -> `gltfjsx` TSX -> set `collider/footprint/sound` -> mark `presetOnly` if >3MB.

**Migration order:** P0 code (decor+flat) -> compress top-10 used GLBs -> CDN env var -> registry for those 10 -> convert forestWorld URLs to modelIds -> instanced ScatterField -> chunk streaming -> portals.

**What NOT to do:** don't gzip GLBs (useless), don't `trimesh` scatter, don't scale above RigidBody, don't load all worlds for feed (images only), don't build LOD before instancing.
