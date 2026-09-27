# Mini-map & map coverage — grid cells, fog reveal, compass

How an open-world config becomes an explored-percentage minimap in the HUD:
the ground is divided into grid cells, the player reveals the cells around them
each frame, and a flat north-up canvas draws coverage + config object markers +
a compass dial. Covers the coverage work on `dynamic-world-builder`.

Open mode only. Preset maps have no square ground to grid, so the whole system
stays off for them (`active: false` → the minimap renders nothing).

## The big picture

```
OpenWorldConfig { ground.size, objects[] }
  └─ Experience.tsx
       └─ <Physics>
            ├─ <World config/>          ← ground + objects
            ├─ <EcctrlWrapper/>         ← player; writes position + heading every frame
            └─ <MapCoverage config/>    ← INVISIBLE tracker (useFrame → visit)
                                          configures the grid, reveals cells per frame

  ┌─ zustand: mapExploreStore ──────────────────────────────┐
  │  visited: Uint8Array(divisions²)  exploredCells  percent │
  │  revision (change signal)  markers[]  size/divisions/…   │
  └──────────────────────────────────────────────────────────┘
              ▲ imperative getState() reads (no re-render)
  ┌─ zustand: playerStore ───────────────────┐
  │  position (live Vector3)   heading (yaw) │
  └──────────────────────────────────────────┘
              ▲
       <MiniMap/>  (PlayerHud, top-right) — one rAF loop draws
       coverage + purple dots + player arrow + compass, React
       re-renders only when `percent` changes.
```

Three things are deliberately decoupled:

| Concern | Lives in | Driven by |
|---|---|---|
| Which cells are explored | `store/mapExploreStore.ts` | `visit(x, z)` called per frame |
| Reading the player | `store/playerStore.ts` | `EcctrlWrapper` per frame |
| Drawing the map | `ui/Hud/MiniMap.tsx` | its own `requestAnimationFrame` loop |

## 1. The grid model

The open ground is a square centred on the origin (see `OpenPlains.tsx`,
default `size = 2000`). Coverage divides it into `divisions × divisions` cells:

```
divisions        = 32            (DEFAULT_DIVISIONS, cells per axis)
size             = 2000 m        (config.ground.size)
cellSize         = size / divisions = 62.5 m
totalCells       = divisions²    = 1024
revealRadius     = 90 m          (DEFAULT_REVEAL_RADIUS_METERS)
```

World → cell mapping (used by both the tracker and the drawer):

```
half = size / 2
col  = floor((x + half) / cellSize)      // clamped to 0..divisions-1
row  = floor((z + half) / cellSize)
index = row * divisions + col
```

Cell `(col, row)` covers world x ∈ `[-half + col·cellSize, -half + (col+1)·cellSize]`
and the matching z span, so the grid lines up exactly with the ground edges.

Why a flat `Uint8Array` and not a `Set<number>`? It is 1024 bytes, indexed in
O(1), and needs no allocation while the player walks. A `Set` of the same size
would allocate on every insert and hash every lookup.

## 2. `mapExploreStore.ts` — state + the hot path

```
active          boolean     // true once an open grid is configured
size            number      // ground edge, meters
divisions       number      // cells per axis (32)
cellSize        number      // size / divisions
revealRadius    number      // meters revealed around the player
visited         Uint8Array  // divisions² flags, 1 = explored
exploredCells   number
totalCells      number
percent         number      // rounded 0..100
revision        number      // bumped on every grid change (see §4)
markers         MapMarker[] // purple dots
```

Three actions:

- **`configure({ size, divisions?, revealRadiusMeters?, markers? })`** — builds
  a fresh grid (progress reset). Called once per world load. `size <= 0` falls
  back to `reset()`.
- **`visit(x, z)`** — the per-frame call. Reveals the circle of cells around the
  player. Details below.
- **`clearProgress()`** — empties the grid but keeps size/markers (kept for a
  new run).
- **`reset()`** — tears everything down (`active: false`), used when leaving
  open mode.

### `visit()` — cheap when nothing changed

```ts
const index = row * divisions + col
if (index === lastIndex) return   // ← the whole per-frame cost while standing/walking inside one cell
lastIndex = index
```

`lastIndex` is a **module-level `let`**, not store state: remembering "which
cell was I in?" must not allocate, notify subscribers, or trigger a React
render. Only when the player crosses into a new cell does the reveal run:

```
span = ceil(revealRadius / cellSize)   // ceil(90 / 62.5) = 2
for dr in -span..span:
  for dc in -span..span:
    skip out-of-bounds cells
    if distance(player, cellCenter) > revealRadius: skip   // round reveal, not a 5×5 square
    if already visited: skip
    mark visited; added++
```

So one position change touches at most a `5×5` block, filtered to a disc
(~13 cells at the defaults). If `added > 0` it emits **one** store update:

```ts
set({
  exploredCells,
  percent: Math.round((exploredCells / totalCells) * 100),
  revision: revision + 1,
})
```

No update at all when the player stands still or re-walks explored ground.

## 3. `MapCoverage.tsx` — the invisible tracker

Rendered inside `<Physics>` in `Experience.tsx`, returns `null`, and does three
things:

**a. Configure on world load**

```ts
useEffect(() => {
  if (config.mode !== 'open') { store.reset(); return }
  store.configure({
    size: config.ground?.size ?? 2000,          // OPEN_GROUND_SIZE fallback
    markers: collectMapMarkers(config),
  })
}, [config])
```

**b. Reset per run** — a run begins when the pointer locks (the alarm starts
then too), so progress is scoped to the run:

```ts
usePlayerHudStore.subscribe((state, previous) => {
  if (state.isPointerLocked && !previous.isPointerLocked) clearProgress()
})
```

**c. Reveal per frame**

```ts
useFrame(() => {
  if (!isOpen) return
  const { position } = usePlayerStore.getState()
  useMapExploreStore.getState().visit(position.x, position.z)
})
```

Placed *after* `EcctrlWrapper` so it reads the position that frame's controller
tick just wrote. Reads go through `getState()` — no subscription, no re-render.

## 4. Why `revision` exists

`visited` is a `Uint8Array` **mutated in place**. That keeps the buffer stable
(no per-cell allocation) but means the array *reference* never changes, so a
subscriber like `useSelector(s => s.visited)` would never see an update.

`revision` is a monotonically increasing number bumped on every real change.
It is the change signal:

- the minimap **redraws its cached coverage canvas** only when `revision`
  changes (§5);
- nothing else subscribes to `visited` directly.

## 5. `MiniMap.tsx` — the flat HUD map

Two canvases in one panel: a `168×168` map and a `56×56` compass dial
(`MAP_PX` / `COMPASS_PX`).

**HUD placement.** `PlayerHud.tsx` renders `<MiniMap/>` top-right, mirroring the
`TimeBar` top-left, and only in the active (pointer-locked) run branch:

```tsx
<div className='pointer-events-none absolute left-5 top-5 z-10 …'>
  <TimeBar … />
</div>
<div className='pointer-events-none absolute right-5 top-5 z-10 …'>
  <MiniMap />
</div>
```

**React vs the frame loop.** The component subscribes to only two store fields —
`active` (render or not) and `percent` (the label) — both of which change
sparsely. Everything positional is drawn imperatively in a `requestAnimationFrame`
loop that reads `getState()`, so the player's per-frame motion and the map
repaint cost **zero** React renders.

**Drawing the map (north-up).** North is `−Z`, so:

```
toMapX(x) = ((x + size/2) / size) * MAP_PX   // +X → right
toMapY(z) = ((z + size/2) / size) * MAP_PX   // +Z → down (so −Z / north is up)
cellPx    = (cellSize / size) * MAP_PX        // ≈ 5.25 px at the defaults
```

The coverage layer is expensive (one `fillRect` per explored cell + faint grid
lines), so it is rendered once into an **offscreen canvas** and blitted with
`drawImage` each frame. It is rebuilt only when `cachedRevision !== state.revision`:

```
coverage canvas (cached)   →   dark background
                               purple fill per visited cell
                               faint grid lines
then per frame:
  mapCtx.drawImage(coverage)
  purple dots for `markers`               // config object positions
  player arrow (rotate(-heading))
  frame + static "N" label
```

**Player arrow.** The arrow is drawn pointing "up" locally, then rotated by the
camera yaw. The world forward vector for yaw `θ` is `(-sin θ, -cos θ)`; after
`rotate(-θ)` the local up `(0, -1)` lands on exactly that direction — so the
arrow tracks facing while the map stays north-up.

**Compass dial.** Canvas y grows downward, so rotating the dial by `heading`
puts the direction the player faces at the top of the dial: with the player
facing east, the `N` letter rotates to the left. Letters are placed at their
dial bearings (`N` 0, `E` +90°, `S` 180°, `W` −90°) and `N` is tinted amber; a
fixed white triangle at the top marks the faced direction.

**DPR handling.** Backing stores are sized `px × min(devicePixelRatio, 2)` and
the context is scaled so all drawing stays in CSS pixels. Capping at 2 avoids
oversized buffers on 3× displays.

## 6. `mapMarkers.ts` — where the purple dots come from

```ts
for (const object of config.objects) {
  if (object.position)      markers.push({ x: object.position[0], z: object.position[2] })
  else if (object.scatter)  markers.push(center ?? [0, 0])   // cluster stand-in
  // zone-placed objects have no config position yet → skipped
}
```

- **Explicit `position`** → used directly (this is how open-mode objects land).
- **`scatter`** → individual copies have no fixed config position, so the disk
  `center` stands in for the cluster.
- **Zone-based placement** → the runtime position isn't known at config time, so
  nothing is pinned.

Markers are always visible (not gated on explored cells) — the point is to pull
the player toward them.

## 7. Player heading

The minimap and compass need facing, which the controller already has. `lookYawRef`
in `EcctrlWrapper.tsx` is written next to the position each frame:

```ts
usePlayerStore.getState().setPlayerPosition(bodyPosition)
usePlayerStore.getState().setPlayerHeading(lookYawRef.current)
```

`playerStore.heading` is the camera yaw in radians (`0` = north / `−Z`). It is
written every frame but never subscribed to — the same zero-re-render pattern as
`position`. Consumers read it imperatively inside the rAF loop.

## 8. File map

| File | Role |
|---|---|
| `store/mapExploreStore.ts` | Grid state: `configure` / `visit` / `clearProgress` / `reset`, `percent`, `revision`, `markers` |
| `components/World/MapCoverage.tsx` | Invisible tracker: configures grid, reveals cells per frame, clears on run start |
| `components/World/mapMarkers.ts` | `collectMapMarkers(config)` → purple-dot positions |
| `components/ui/Hud/MiniMap.tsx` | Two-canvas HUD panel: coverage, markers, player arrow, compass, explored % |
| `store/playerStore.ts` | `position` + `heading` (both per-frame, both read imperatively) |
| `components/GameSystem/EcctrlWrapper.tsx` | Writes `position` + `heading` each frame |
| `components/GameSystem/Experience.tsx` | Mounts `<MapCoverage config={worldConfig}/>` inside `<Physics>` |
| `components/GameSystem/PlayerHud.tsx` | Renders `<MiniMap/>` top-right during a run |

## 9. Tuning

| Knob | Where | Effect |
|---|---|---|
| `DEFAULT_DIVISIONS` (32) | `mapExploreStore.ts` | Finer grid → more, smaller cells; `totalCells` grows quadratically |
| `DEFAULT_REVEAL_RADIUS_METERS` (90) | `mapExploreStore.ts` | How much ground one position reveals; larger = % climbs faster |
| `MAP_PX` / `COMPASS_PX` | `MiniMap.tsx` | Canvas sizes in CSS pixels |

On a 2000 m (4 km²) plain, a single run only covers a small band, so `percent`
moves slowly by design — the revealed trail and the purple dots are the primary
exploration guide. To make the number climb faster, coarsen the grid (lower
`divisions`) or widen the reveal radius.

## 10. Gotchas learned

- **Mutating `Uint8Array` in place breaks ref equality** — a `revision` counter
  is the change signal, not array identity.
- **Never drive the per-frame reveal through store state.** `lastIndex` is a
  module-level `let`; putting it in the store would notify subscribers 60×/s.
- **Cache the coverage repaint.** Rebuilding 1024 `fillRect`s every frame is
  wasteful; an offscreen canvas rebuilt on `revision` keeps the loop cheap.
- **Keep positional canvas drawing out of React.** The rAF loop reads stores
  imperatively; only `percent`/`active` are subscribed.
- **`heading` follows the `position` pattern** (write every frame, read
  imperatively) — subscribing to it would re-render every frame.
- **Reset on the run boundary.** Coverage clears on the pointer-lock edge so it
  matches the alarm lifecycle, not the page lifetime.
- **Preset maps are a no-op.** `active: false` → `<MiniMap/>` returns `null` and
  `MapCoverage` resets, so there is no minimap to draw.
