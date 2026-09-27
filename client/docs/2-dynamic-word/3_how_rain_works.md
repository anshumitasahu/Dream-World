# How the rain works — `<lineSegments>`, one draw call, camera-following drops

Dedicated explainer for `World/weather/Rain.tsx`. Answers the open question
from `2_dynamic_weather.md`: the old doc said `THREE.LineSegments`, but
`grep "new THREE.LineSegments"` finds nothing — so where is it?

(Sound + lightning also live in `Rain.tsx` but are separate systems —
covered in `2_dynamic_weather.md` §§6–7. This doc is only the *visual* rain.)

## 0. The one-line answer

`<lineSegments>` in JSX **is** `THREE.LineSegments`. React Three Fiber
auto-constructs it, so you never write `new` yourself.

The rule: a **lowercase** JSX tag = a three.js class with its first letter
lowercased, constructed by the reconciler:

| What you write (R3F) | What actually runs (plain three.js) |
|---|---|
| `<lineSegments geometry={g}>` | `new THREE.LineSegments()` + `obj.geometry = g` |
| `<lineBasicMaterial color="…"/>` (child) | `new THREE.LineBasicMaterial(…)` + `obj.material = …` |
| `<ambientLight intensity={0}/>` | `new THREE.AmbientLight()` + `obj.intensity = 0` |
| `frustumCulled={false}` (prop) | `obj.frustumCulled = false` |

**Uppercase** tags (`<Rain>`, `<Weather>`) are *your* React components.
Lowercase tags are three.js objects. That's the whole naming convention.

So in `Rain.tsx`, `THREE.*` appears exactly twice — `BufferGeometry` and
`BufferAttribute` (raw data setup, which stays imperative) — and
`new THREE.LineSegments` appears zero times because this line covers it:

```tsx
// src/components/World/weather/Rain.tsx, line 106
<lineSegments geometry={geometry} frustumCulled={false}>
  <lineBasicMaterial color="#2e3947" transparent opacity={0.4} />
</lineSegments>
```

## 1. Same rain, two styles: plain three.js vs R3F

Plain three.js is **imperative** — you create everything, attach everything,
and run the loop yourself:

```js
import * as THREE from 'three'

// ...scene, camera, renderer setup...

const COUNT = 300
const positions = new Float32Array(COUNT * 6)
// ... fill the array with random drops (same buildStreaks logic) ...

const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const material = new THREE.LineBasicMaterial({
  color: 0x2e3947, transparent: true, opacity: 0.4,
})

const rain = new THREE.LineSegments(geometry, material) // ← THE missing line
rain.frustumCulled = false
scene.add(rain)

function animate() {
  requestAnimationFrame(animate)
  // ... mutate `positions`, then:
  geometry.attributes.position.needsUpdate = true
  renderer.render(scene, camera)
}
animate()
```

Our code is **declarative** — you describe the object, R3F builds it:

```tsx
// Data setup stays imperative (buffers aren't JSX-friendly):
const geometry = useMemo(() => {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geo
}, [positions])

// Scene graph is declarative (R3F constructs + attaches for you):
return (
  <lineSegments geometry={geometry} frustumCulled={false}>
    {/* a <...Material> child auto-assigns to the parent's .material —
        that's why no material={...} prop is needed */}
    <lineBasicMaterial color="#2e3947" transparent opacity={0.4} />
  </lineSegments>
)
```

And `useFrame((state, delta) => { … })` replaces the
`requestAnimationFrame(animate)` loop — same per-frame callback, but driven
by R3F's render loop, with `state.camera` handed to you.

The pattern is a hybrid, and it's idiomatic R3F:

- **Imperative** for data (`Float32Array`, `BufferGeometry`, `Howl` audio).
- **Declarative** for the scene graph (`<lineSegments>`, `<ambientLight>`).

## 2. What `LineSegments` draws — a 2-drop example

Forget meshes (triangles). `LineSegments` draws *many disconnected lines*
from one flat array, where **every pair of points = one line**:

```ts
// 2 drops = 4 points = 2 visible streaks:
const points = new Float32Array([
  0, 10, 0,    // point A — top of streak 0
  0, 9.3, 0,   // point B — tail of streak 0 → line A–B is drawn
  5, 12, 3,    // point C — top of streak 1
  5, 11.3, 3,  // point D — tail of streak 1 → line C–D is drawn
])
```

For `RAIN_COUNT = 300` drops: `300 × 2 points × 3 coords = 1800` floats.
The entire rain state is one `Float32Array(1800)`.

Why not 300 small meshes? **Draw calls.** 300 meshes = 300 draw calls per
frame (slow). One `LineSegments` = **1 draw call** no matter how many drops
are inside (fast). That single insight is most of the optimization.

## 3. Building the drops — `buildStreaks()` walked through

```ts
const RAIN_COUNT = 300
const AREA = 60    // 60×60m box around the origin
const HEIGHT = 30  // drops live between y=0 and y=30

function buildStreaks(count: number) {
  const positions = new Float32Array(count * 6) // 2 verts × 3 coords per drop
  const speeds = new Float32Array(count)        // fall speed per drop
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * AREA
    const y = Math.random() * HEIGHT
    const z = (Math.random() - 0.5) * AREA
    positions.set([x, y, z, x, y - 0.7, z], i * 6)
    speeds[i] = 18 + Math.random() * 10 // 18–28 m/s, like real rain
  }
  return { positions, speeds }
}
```

One iteration, concrete numbers — `i = 0`, randoms give `x = 5`, `y = 20`,
`z = -3`, speed `24.5`:

```
positions[0..5] = [5, 20, -3,   5, 19.3, -3]
                   ─────────    ────────────
                   top vertex   tail (same x/z, 0.7m lower)
speeds[0] = 24.5
```

Only the top vertex truly "falls"; the tail is re-derived from it every
frame, so each streak stays vertical and exactly 0.7m long.

This runs **once** (`useMemo` with `[]`), and the geometry wraps the same
buffer — no copy. `useMemo` matters: without it, every re-render would
allocate a new 1800-float array plus a new GPU buffer. With it, the buffer
is created once and only *mutated* afterwards. A dispose effect
(`useEffect(() => () => geometry.dispose(), [geometry])`) frees GPU memory
on unmount.

## 4. Making it fall — the `useFrame` loop

The essence, stripped to one drop:

```ts
// Every frame: top drops by speed × time, tail follows it.
y -= speed * delta
positions[o]     = x; positions[o + 1] = y;       positions[o + 2] = z  // top
positions[o + 3] = x; positions[o + 4] = y - 0.7; positions[o + 5] = z  // tail
attr.needsUpdate = true // ← "hey GPU, the buffer changed, re-upload it"
```

The real loop is that × 300, plus the respawn branch (§5). One guard worth
knowing: `Math.min(delta, 0.05)`. `delta` is seconds since the last frame
(~0.016 at 60fps), but after a tab-switch it can be 5s — unclamped, every
drop would fall `24 × 5 = 120m` in one frame and the sky would empty.

Zero per-frame allocation: the loop never calls `new`, `.set()`, or
`setAttribute`. It writes into the existing array and flips `needsUpdate`.
No garbage → no GC pauses.

## 5. The camera-follow trick (why 300 drops feel infinite)

**The problem.** Drops live in a fixed 60×60m box. Run for 10 seconds
(~40m) and you leave the box: sunshine ahead, rain behind. The naive fix —
a 2000m-wide box — would need ~300,000 drops to stay dense.

**The trick.** Never move the box; *recycle* drops into a box centered on
the player. When a drop hits the ground (`y < 0`), its new x/z is not
"random in the world" but `camera.x ± 30, camera.z ± 30`:

```ts
if (y < 0) {
  y = HEIGHT
  arr[o]     = px + (Math.random() - 0.5) * AREA // px = camera x
  arr[o + 2] = pz + (Math.random() - 0.5) * AREA // pz = camera z
}
```

```
Player at x=0:                    Player runs to x=100 (no trick):
┌──────────────┐                  ┌──────────────┐
│ · · · · · · │ 60m box          │ · · · · · · │  box left at 0
│ · ●(you) · · │                  │ · · · · · · │
│ · · · · · · │                  └──────────────┘   ●(you at 100, dry!)

With the trick (player at x=100, one drop lands):
  respawn x = 100 ± 30 = 70…130 → right above your head
┌──────────────┐
│ · · · · · · │  storm silently teleported with you,
│ · ●(you) · · │  one drop at a time, 30m overhead —
│ · · · · · · │  you never see it happen
└──────────────┘
```

A full fall cycle (30m at ~24m/s) takes ~1.3s, so within ~1–2 seconds of
arriving anywhere, *every* drop has recycled and the whole storm has moved
with you. Cost: ~2 float ops on only the ~10 drops that land each frame —
nothing on the other 290. The `<lineSegments>` object itself never moves
(stays at origin), so there is no transform update and no shader cost.

## 6. Two props that prevent invisible bugs

- **`frustumCulled={false}`** — three skips drawing objects whose bounding
  sphere is off-screen. Our buffer mutates every frame but its bounding
  sphere is computed once (stale after frame 1), so rain would randomly
  vanish when turning the camera. Disabling culling forces it to always
  draw — correct for a camera-following volume.
- **`transparent opacity={0.4} color="#2e3947"`** — dark translucent streaks
  read as rain against both rain-day grey (`#7d8699`) and rain-night black
  (`#0d121d`). Opaque white would look like snow; opaque dark like debris.

## 7. Cheat sheet

| Question | Answer |
|---|---|
| Where is `THREE.LineSegments`? | `<lineSegments>` JSX *is* it — R3F constructs it |
| Why lines, not meshes? | 1 draw call for all 300 drops vs 300 draw calls |
| How many floats? | `300 × 6 = 1800` — one `Float32Array` |
| What falls? | Only the top vertex; tail = `top − 0.7m`, rewritten per frame |
| Why doesn't walking leave the rain? | Landed drops respawn at `camera ± 30m` |
| Why `useMemo`? | Allocate the buffer once; mutate forever; no re-alloc on re-render |
| Why `needsUpdate`? | Tells the GPU to re-upload the mutated buffer |
| Why clamp `delta`? | Tab-switch would otherwise dump all rain underground in one frame |
