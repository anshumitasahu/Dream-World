# Dynamic world builder (beginner notes)

These are notes on the changes on the `dynamic-world-builder` branch: the world stops
being one hard-coded `<TestMap />` and becomes **data-driven** — you describe *what*
should exist in a JSON file, and React/three/rapier figures out *where* to put it.

## The big picture

Before:

```tsx
<Physics ...>
  <TestMap />        {/* one specific map, hard-coded in JSX */}
</Physics>
```

After:

```tsx
<Physics ...>
  <World config={testWorld} />   {/* map + objects come from JSON */}
</Physics>
```

`testWorld.json` says: *"load the map called `testMap`, drop a hovercar in spawn zone 0
and another one in zone 3, slightly rotated."* Nothing about positions, models, or
colliders is written in code anymore — adding an object to the world is now a one-line
JSON edit.

## New files in `src/components/World/`

| File | Role |
| --- | --- |
| `worldTypes.ts` | TypeScript shapes for the data (no logic) |
| `testWorld.json` | The actual world description (data) |
| `mapRegistry.ts` | Phone book: map id → map component + its spawn zones |
| `World.tsx` | Renders the map, then one `WorldObject` per JSON entry |
| `WorldObject.tsx` | The placement engine — decides *where* each object goes |

### 1. `worldTypes.ts` — the vocabulary

```ts
type SpawnZone = [x: number, z: number, radius: number]
```

A spawn zone is a circle on the floor: center `(x, z)`, and a `radius` inside which
objects may randomly land. Three numbers, no objects — just "safe floor area".

`WorldObjectConfig` is one entry in the JSON:

- `model` — path to the `.glb` file (required)
- `position` — skip the random logic entirely, place it exactly here
- `zone` — which spawn zone index to use (if omitted, objects are dealt round-robin
  across the map's zones: object 0 → zone 0, object 1 → zone 1, ...)
- `rotationY` — pin the rotation; if omitted it's random
- `scale` — uniform scale (default 1)
- `footprint` — override the collision probe size (rarely needed; see below)
- `physics` — `'fixed'` = solid static collider you can bump into, `'decor'` = visual
  only, walks through it

`WorldConfig` is the whole file: `{ map, objects }`.

### 2. `testWorld.json` — the world, as data

```json
{
  "map": "testMap",
  "objects": [
    { "model": "/models/cyberpunk_hovercar.glb", "zone": 0 },
    { "model": "/models/cyberpunk_hovercar.glb", "zone": 3, "rotationY": 1.2 }
  ]
}
```

To import JSON in TypeScript/Vite you need `"resolveJsonModule": true` — that's the one-line
change in `tsconfig.app.json`.

### 3. `mapRegistry.ts` — connecting data to code

JSON can only hold plain values, so it refers to the map by *name* (`"testMap"`).
The registry is the lookup table that turns that name into the real React component
plus the list of spawn zones that map declares:

```ts
MAP_REGISTRY = {
  testMap: { component: TestMap, spawnZones: TestMapSpawnZones },
}
```

Adding a second map later = one more entry here. If `config.map` isn't in the registry,
`World` warns and renders nothing instead of crashing.

### 4. `World.tsx` — the composer

Tiny glue component: looks up the map in the registry, renders `<MapComponent />`,
then maps over `config.objects` rendering a `<WorldObject>` for each. Each object gets
`defaultZone={index}` so that objects without an explicit `zone` spread themselves
across the zones automatically (round-robin).

### 5. `TestMap.tsx` — the spawn zones

The only change to the map itself is exporting `TestMapSpawnZones`: six circles on the
floor that are known to be clear. The comment above them lists the *keep-outs* — areas
that were deliberately excluded because they contain ramps, kinematic platforms, the
player spawn point, pillars, etc. If you move the map layout, move these numbers too.

## `WorldObject.tsx` — how an object finds its place

This is the heart of the change. Given "put a hovercar somewhere in zone 3", it runs
this algorithm once on mount:

1. **Explicit position?** If `config.position` is set, skip everything: use it as-is.
2. **Pick the zone.** `spawnZones[(config.zone ?? defaultZone) % spawnZones.length]` —
   the `%` (modulo) wraps the index so it can never point outside the list.
3. **Random candidate spot.** `x = zoneX + (Math.random() * 2 - 1) * radius`, same for
   `z` — a uniform random point in a square of side `2 * radius` around the zone center.
4. **Find the ground: raycast.** A ray (think laser pointer) is shot straight down from
   `y = 60` (high above everything, so it always starts in open air):
   `world.castRay(ray, RAY_LENGTH, true)`. The hit's `timeOfImpact` is the distance
   travelled before hitting geometry, so ground height = `60 - hit.timeOfImpact`.
5. **Sit on the floor, not in it.** Models aren't guaranteed to have their origin at
   their base — the origin might be in the middle of the mesh. `bottomOffset` is the
   model's lowest point (from its bounding box, times scale), and it's subtracted so the
   *bottom* of the model lands exactly on the ground surface, not its middle.
6. **Is the spot free? Overlap probe.** An invisible box (`rapier.Cuboid`) the size of
   the model's bounding box is tested with `world.intersectionWithShape(...)`. If that
   box overlaps *any* existing collider, the spot is rejected. The probe center is lifted
   `+0.05` so an object resting exactly *on* the floor isn't counted as overlapping it.
7. **Repeat up to 20 times.** If every attempt lands inside something, fall back to the
   zone's center (still snapped to the ground by the same raycast).
8. **Render.** `physics: 'decor'` → plain `<group>`; otherwise `<RigidBody type="fixed"
   colliders="hull">` — a static physics body whose collider is a tight-fitting "hull"
   wrapped around the mesh.

The `bounds` object (computed once in a `useMemo`) holds the model's bounding-box
measurements: half extents, center height, bottom offset, scale — everything the raycast
and probe math needs. It only recomputes when the model or config changes.

The component renders `null` until `placement` is decided, so on the very first frame
the object doesn't flash at the origin.

## `window.__spawnDebug` — what is that line?

```ts
;(window.__spawnDebug ??= []).push({ model: config.model, position, attempt: attempt + 1 })
```

Breaking it down piece by piece:

- **`window.__spawnDebug`** — a property hanging off the global `window` object. It's
  not part of the app's render or state; it's a throwaway global debugging hook.
- **`??=`** — logical nullish assignment: *"if the left side is `null` or `undefined`,
  assign the right side to it."* So `(window.__spawnDebug ??= [])` means "give me the
  existing debug array, or create an empty one the first time we need it." That's why
  this line can live inside a component without any setup code elsewhere.
- **`.push({...})`** — records one placement event:
  - success: `{ model, position, attempt }` — where it landed and which try succeeded
  - fallback: `{ model, fallback: true, zone }` — all 20 attempts failed, it gave up and
    used the zone center

**Why bother?** Random placement is invisible — every reload objects land somewhere
different, and if one ends up inside a wall you can't tell *why*. With this hook you
open the browser devtools console and inspect:

```js
__spawnDebug                    // all placements this session
__spawnDebug.length             // how many objects were placed
__spawnDebug.filter(d => d.fallback)  // which ones gave up and used zone centers
__spawnDebug.filter(d => d.attempt > 5)  // spots that took many tries (zone too crowded?)
```

It's dev tooling, not gameplay: nothing in the renderer reads it. For production you'd
either delete it or guard it with `if (import.meta.env.DEV)`.

**Known caveat:** TypeScript currently rejects these two lines
(`Property '__spawnDebug' does not exist on type 'Window & typeof globalThis'`).
The clean fix is a global declaration, e.g. in a `src/vite-env.d.ts` or similar:

```ts
interface SpawnDebugEntry {
  model: string
  position?: [number, number, number]
  attempt?: number
  fallback?: boolean
  zone?: SpawnZone
}

declare global {
  interface Window {
    __spawnDebug?: SpawnDebugEntry[]
  }
}
```

## Summary of every change

- **`src/components/World/`** (new) — the 5 files described above
- **`Experience.tsx`** — `<TestMap />` → `<World config={testWorld} />` inside `<Physics>`
- **`TestMap.tsx`** — exports `TestMapSpawnZones` (6 clear floor circles + keep-out notes)
- **`tsconfig.app.json`** — `"resolveJsonModule": true` so JSON can be imported

## Adding an object to the world now

```json
{ "model": "/models/barrel.glb", "zone": 2, "scale": 1.5 }
```

One JSON line. Random valid spot in zone 2, sitting on the ground, solid collider, done.
