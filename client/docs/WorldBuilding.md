# World Building — Visual Meshes, Colliders, Scale, and Moving Platforms

> Beginner guide for this repo (`@react-three/fiber` + `@react-three/rapier` + `ecctrl`).
> Goal: you model something pretty in Blender, export a `.glb`, walk on it in-game
> with colliders that actually line up — at any map size, animated or not.
> Prereqs: `docs/game-world/0_physics_model.md` (visual vs physical world),
> `docs/game-world/1_rapier_wrold_and_floor_colider.md` (RigidBody basics).

---

## 0. Concepts in 2 minutes

**GLB = one file with two chunks.** A `.glb` is a container: a JSON chunk
(describes nodes, meshes, materials, animations) + a BIN chunk (raw vertex
positions, indices, textures). Scaling a model just multiplies numbers in the
BIN chunk. Same triangle count = same file size. A 1 m cube scaled to 10 m
costs ~0 extra bytes.

**Blender = the editor for GLBs.** Three.js draws whatever is in the GLB.
Rapier collides with invisible shapes you declare in code. Blender is where
you author *both*: the pretty visual mesh, and a second ultra-simple mesh
whose only job is collision.

**Two worlds (repeat until it sticks):**

```
VISUAL (Three.js)              PHYSICAL (Rapier)
pretty stronghold mesh         invisible boxes you stand on
materials, lights, animation   mass, friction, gravity numbers
what you SEE                   what you FEEL
```

`@react-three/rapier` syncs them only if *you* declare both in the same place.
If they disagree in position, rotation, or scale, you fall through floors or
float in mid-air. Every section below exists to keep them in agreement.

**Why not `colliders="trimesh"` on the visual and call it done?**

| Auto collider | What it does | Why it hurts on a real map |
|---|---|---|
| `cuboid` / `ball` | one box / sphere around the mesh | cheap, stable, but floats over details |
| `hull` | shrink-wrap convex shell | tight for single rocks/cars, but fills in courtyards, doorways, arches — you collide with air |
| `trimesh` | exact triangles as collider | correct-looking, but: slow to build, slow to query, tunnels on fast/dynamic bodies, **frozen at bind pose on skinned meshes**, includes ropes/flags/chains you should walk through |

This repo's `StrongHoldAnimated.tsx` hit all of those at once: skinned +
animated + ropes + 10x group scale. The fix is **proxy colliders you model
yourself in Blender**: 5–20 boxes that cover only walkable surfaces.

---

## 1. Blender crash course (only what you need)

Install Blender (free, blender.org), open it, then:

- **Navigate:** middle-mouse drag = orbit, `Shift` + middle-mouse = pan,
  scroll = zoom. Numpad `1/3/7` = front/side/top, `0` = camera.
- **Modes:** `Tab` toggles Object mode (move whole things) vs Edit mode
  (move vertices). You model proxies in Object mode 95% of the time.
- **Select:** left-click, `A` = select all, `Alt+A` or `Esc` = deselect.
- **Move / rotate / scale:** `G` = grab/move, `R` = rotate, `S` = scale.
  Press `X/Y/Z` after to lock an axis (`S, Z, 2` = twice as tall).
  Type numbers directly (`S, 10, Enter` = 10x).
- **Panel:** press `N` for the side panel → `Item > Dimensions` shows real
  meters. This is your ruler.
- **Apply transforms:** `Ctrl+A > All Transforms`. This bakes your `G/R/S`
  into the vertex data so scale reads `1,1,1` again. **Do this before every
  export** or three.js and Rapier will disagree about size.
- **Collections:** the outliner (top-right) groups objects. Make one called
  `Visual` and one called `Colliders`. You export them separately.

Scene units: `Scene Properties > Units > Unit System: Metric, Unit Scale: 1.0`.
1 Blender unit = 1 meter = 1 Rapier meter = 1 three.js unit. Keep it that way.

---

## 2. Final size in Blender — how to scale, and why file size doesn't grow

Your stronghold GLB is tiny in raw units (Sketchfab `scale={0.002}` heritage)
so `mapRegistry.ts` compensates with `mapScale: 10` and `World.tsx` wraps the
map in `<group scale={10}>`. That wrapper is the collider killer (section 6).
Fix it at the source: **scale the blend file to final gameplay meters once,
export, then use scale 1 everywhere.**

Steps:

1. `File > Import > glTF 2.0`, pick your map GLB.
2. Select everything visual (`A`), check `N > Item > Dimensions`. Suppose the
   main deck reads `X: 2.4 m` but you want ~24 m gameplay.
3. With everything still selected: `S, 10, Enter` (or `S` then type `10`).
   Dimensions now read 24 m.
4. `Ctrl+A > All Transforms` — scale fields go back to `1,1,1`, vertices keep
   the new size. This is the critical step. Unapplied scale is the #1 cause
   of "looks right, collides wrong".
5. Measure: enable `Measure` tool from the toolbar, or add a 1.8 m tall
   capsule (`Shift+A > Mesh > Capsule`, set height 1.8) as a human ruler next
   to doorways. Door ≥ 2 m, step ≤ 0.4 m (ecctrl can step ~0.5 m), wall ≥ 1 m
   thick for proxies.
6. Save as `stronghold_final.blend`. **Never scale again in code.**

File size: unchanged. You didn't add triangles, you multiplied position
floats. A 20 MB GLB scaled 10x is still ~20 MB. What *does* grow files:
subdivision, duplicate islands, 4K textures. Fix those with `Decimate` and
texture resize, not by staying small.

---

## 3. Building proxy colliders (the optimized way)

Goal: one simple convex shape per walkable surface. Player feet only touch
the tops — nobody feels the carving under the stairs.

1. In the same `.blend`, create collection `Colliders` (right-click in
   outliner → New Collection).
2. For each island / deck / tower floor: `Shift+A > Mesh > Cube`. In Object
   mode `G`/`S` it over the walkable area. Make it **slightly inset** (~10 cm
   inside the visual edge) so walls catch you before you see through the rim.
   Thickness ~0.5–1 m, top face exactly at the floor you stand on.
3. Ramps / stairs: one rotated box per ramp run. Don't staircase every step —
   one sloped cuboid walks smoother than 12 tiny boxes.
4. Walls / cliffs around the play area: tall thin boxes so the player can't
   walk off into fog. Cheap insurance.
5. **Skip:** ropes, chains, flags, poles, arches, sky dome, decorative spikes.
   If the player should walk through it, it gets no proxy.
6. Name them: `COL_main_deck`, `COL_east_island`, `COL_tower_top`,
   `COL_ramp_south`, `COL_wall_north`. The `COL_` prefix is how the loader
   code finds them later.
7. Select all `COL_*`, `Ctrl+A > All Transforms`. Transforms frozen, scale 1.
8. Keep proxies **low-poly**: default cube = 12 triangles. Ten proxies =
   120 triangles vs a 500K-triangle trimesh. Faster load, faster
   `world.castRay` spawns (`WorldObject.tsx`), stable solver.
9. Hide the `Visual` collection (eye icon), leave only `Colliders` visible —
   you export this view next.

Collider budget rule of thumb: static map < 50 cuboids. If you need more
detail than that, you need fewer details, not trimesh.

---

## 4. Export: one visual GLB + one collider GLB

Same `.blend`, same origin, two exports. Same origin = alignment forever.

**A. Visual (`stronghold_visual.glb`):**

1. Show only `Visual` collection. Hide `Colliders` (eye + monitor icons off
   so it's excluded from export).
2. `File > Export > glTF 2.0 (.glb)`.
3. Settings: Format = **glTF Binary (.glb)**, Include → Limit to
   **Visible Objects**, Transform → **+Y Up** ticked, Geometry →
   **Apply Modifiers** ticked, Materials → default Principled (see
   `docs/BlackGlbFix.md` — emission-only materials come back black in
   three.js, rewire artwork into Base Color first).
4. Drop into `public/models/map/stronghold_visual.glb`.

**B. Colliders (`stronghold_colliders.glb`):**

1. Hide `Visual`, show only `Colliders`.
2. Same export dialog. Extra: Data → Mesh → **Compression: None** (keeps
   bounding boxes exact), Materials → export without materials is fine
   (proxies need no textures — uncheck `Materials` export if your Blender
   offers it; otherwise one shared grey material is harmless).
3. Drop into `public/models/map/stronghold_colliders.glb`.

Verify both in https://gltf.report — drag each file, confirm the collider
file shows only white boxes at the same coordinates as the visual.

**Regenerate the component** (like `docs/game-world/8_create_complex_glb_colliders.md`):

```bash
npx gltfjsx@6.5.3 public/models/map/stronghold_visual.glb \
  -o src/components/Rendering/map/StrongHoldVisual.tsx \
  --types
```

Then fix material types if needed (Physical vs Basic — see BlackGlbFix doc).

---

## 5. Import in R3F + Rapier (the pattern used in this repo)

Load the visual for eyes, the proxies for touch. Derive each cuboid from the
proxy mesh's own transform — then visual and collider can never drift.

```tsx
import * as THREE from 'three'
import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

export function StrongHold({ ...props }: JSX.IntrinsicElements['group']) {
  const { scene: visual } = useGLTF('/models/map/stronghold_visual.glb')
  const { scene: colScene } = useGLTF('/models/map/stronghold_colliders.glb')

  const proxies = useMemo(() => {
    const list: THREE.Object3D[] = []
    colScene.updateMatrixWorld(true)
    colScene.traverse((o) => {
      if (o.name.startsWith('COL_')) list.push(o)
    })
    return list
  }, [colScene])

  return (
    <group {...props}>
      {/* eyes */}
      <primitive object={visual} />
      {/* touch: one frozen body, many cuboid shells */}
      <RigidBody type="fixed" colliders={false}>
        {proxies.map((o) => {
          const mesh = o as THREE.Mesh
          mesh.geometry.computeBoundingBox()
          const size = new THREE.Vector3()
          mesh.geometry.boundingBox!.getSize(size)
          // geometry is unit-ish box; world size comes from object scale
          // (baked to 1,1,1 if you applied transforms — then size is final)
          const pos = new THREE.Vector3()
          const quat = new THREE.Quaternion()
          const scl = new THREE.Vector3()
          o.matrixWorld.decompose(pos, quat, scl)
          const euler = new THREE.Euler().setFromQuaternion(quat)
          return (
            <CuboidCollider
              key={o.name}
              args={[
                (size.x * scl.x) / 2,
                (size.y * scl.y) / 2,
                (size.z * scl.z) / 2,
              ]}
              position={[pos.x, pos.y, pos.z]}
              rotation={[euler.x, euler.y, euler.z]}
            />
          )
        })}
      </RigidBody>
    </group>
  )
}

useGLTF.preload('/models/map/stronghold_visual.glb')
useGLTF.preload('/models/map/stronghold_colliders.glb')
```

Even simpler alternative (fewer lines, same result): render each proxy as a
hidden mesh with an auto cuboid, so Rapier derives the shape itself:

```tsx
<RigidBody type="fixed" colliders={false}>
  {proxies.map((o) => (
    <RigidBody key={o.name} type="fixed" colliders="cuboid">
      <mesh geometry={(o as THREE.Mesh).geometry}
        position={o.position} rotation={o.rotation} scale={o.scale}
        visible={false} />
    </RigidBody>
  ))}
</RigidBody>
```

Pick one pattern per map and stick to it. After final-size-in-Blender,
`mapRegistry.ts` becomes `strongHold: { component: StrongHold, ... }` with
**no `mapScale`** (defaults to 1), and `scaleSpawnZones()` passes zones
through untouched. Re-derive `StrongHoldSpawnZones` from the new floor heights
(raycast from above in Blender, or read proxy top faces) instead of scaling
old numbers.

---

## 6. Why you must not scale inside / above `<RigidBody>`

The old code did this:

```tsx
// World.tsx (old, broken for physics)
<group scale={mapScale}>   {/* 10x visual... */}
  <MapComponent />        {/* ...but Rapier never sees this scale */}
</group>
```

plus baked `TrimeshCollider args={[vertices, indices]}` in unscaled units.
Rapier creates collider shapes from `args` numbers at body-creation time —
it does **not** inherit three.js parent `scale`. Result: 10x island visually,
1x invisible floor physically. Player spawns (correctly scaled to world space
by `getMapSpawnZones`) land in mid-air.

Rules:

1. **Never put `scale` on any ancestor of a RigidBody.** Scale the mesh
   *inside* the body, or better: bake size in Blender, keep JSX scale at 1.
2. **Never non-uniformly scale a physics branch** (`scale={[2,1,1]}`).
   Inertia and normals go wrong; round body, stretched visual.
3. **If you truly need runtime rescaling** (map variants), scale *both*
   channels with the same number: visual `<group scale={s}>` **and**
   collider `args` + `position` multiplied by `s` (rotation unchanged).
   That's the snippet from the previous discussion — it works because the
   same `s` reaches eyes and touch. But physics at 10x is float-unstable
   (deep penetrations, jittery contacts), so prefer Blender-final-size.
4. Spawn zones, raycast heights (`WorldObject.tsx` casts from `y=60`), and
   `floorY` values must all live in the **same** space as the final visual.
   One scale factor anywhere breaks all three silently.

---

## 7. Moving colliders along with animation

Static proxies from section 5 never move. If the visual bobs (floating
islands, `Scene` animation ±0.5 m), the floor slides out from under the
collider every frame. Three options, cheapest first:

**Option A — freeze the walkable, animate the decor (recommended).**
In Blender, delete/lock the island-bob keyframes, keep rope/flag flutter.
Static `type="fixed"` proxies then match 100% of the time at zero CPU cost.
Do this unless bobbing is core gameplay.

**Option B — one kinematic body per moving island.**
`trimesh` colliders can't move (Rapier rebuilds their acceleration structure
per step — slow and buggy). `cuboid`/`hull`/`ball` can, as
`type="kinematicPosition"`, driven from `useFrame`:

```tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'

function BobbingIsland({ proxy, visual, phase = 0 }) {
  const body = useRef<RapierRigidBody>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase
    // must mirror the visual's animation curve exactly
    body.current?.setNextKinematicTranslation({
      x: 0, y: Math.sin(t * 0.8) * 0.5, z: 0,
    })
  })
  return (
    <>
      <RigidBody ref={body} type="kinematicPosition" colliders={false}>
        <CuboidCollider args={proxy.halfExtents} position={proxy.center} />
      </RigidBody>
      {/* visual island mesh driven by the same curve, or by bone copy below */}
      {visual}
    </>
  )
}
```

Critical: the visual and the body must run the **same function of time**.
Two hand-tuned sine waves that *look* similar will separate at the peaks and
the player will jitter. Either drive both from the one `useFrame`, or…

**Option C — copy bone world transform to the body (skinned maps).**
Skinned vertices are placed by bones (`bone.matrixWorld × boneInverse`), not
by node transforms — that's why auto-colliders landed rotated 90° on the
stronghold. Track the bone instead of the vertices:

```tsx
useFrame(() => {
  islandBone.getWorldPosition(tmpVec)   // bone that carries the island
  islandBone.getWorldQuaternion(tmpQuat)
  body.current?.setNextKinematicTranslation({ x: tmpVec.x, y: tmpVec.y, z: tmpVec.z })
  body.current?.setNextKinematicRotation({
    x: tmpQuat.x, y: tmpQuat.y, z: tmpQuat.z, w: tmpQuat.w,
  })
})
```

One cuboid per bone-driven island. Ropes/chains/flags get **no** collider —
they're visual only. Never try to collide exact cloth/skin deformation; games
approximate every platformer, elevator, and ship this way.

Player-carrying note: `kinematicPosition` bodies carry standing players if
moved via `setNextKinematicTranslation` (velocity is derived). Moving the
*mesh* with the GLB animation while the body stays still strands the player.

---

## 8. Stronghold recipe (your map, end to end)

1. Blender: import `the_last_stronghold_animated_floating.glb`, scale whole
   scene to gameplay meters, `Ctrl+A > All Transforms`, save blend.
2. Decide: freeze island bob (Option A) or split 3–5 islands into kinematic
   bodies (Option B/C). Delete the bob curves if A.
3. Model `COL_*` boxes for: main deck, south deck, north deck, keep tower top,
   east hanging platform, far east ledge, ramps, perimeter walls. Skip sky,
   ropes, chains, poles.
4. Export `stronghold_visual.glb` + `stronghold_colliders.glb` (section 4),
   regenerate component with gltfjsx, replace the baked-`colliderData`
   `TrimeshCollider` loop with the section-5 proxy pattern.
5. `mapRegistry.ts`: drop `mapScale: 10` → default 1. Re-measure
   `StrongHoldSpawnZones` floor heights from proxy tops (old `y` values were
   pre-scale bind-pose guesses; `scaleSpawnZones` will now pass them through).
6. `World.tsx`: delete the `<group scale={mapScale}>` wrapper, render
   `<MapComponent />` directly.
7. `<Physics debug>` once: green boxes should sit exactly on walkable tops,
   inset slightly, none on ropes/sky. Walk every zone, check
   `window.__spawnDebug` for fallback placements (see dynamic-world-builder doc).

---

## 9. Debug checklist (when it still feels wrong)

- `<Physics debug>` on — no green box where you stand = no collider there.
- Player falls through: floor body missing `type="fixed"`, spawn inside
  geometry, or proxy top below `floorY`. Lift spawn, re-check.
- Player floats: standing on an invisible hull/trimesh you meant to delete
  (ropes/sky). Remove it from proxies.
- Bumpy walking: trimesh micro-detail. Replace with flat cuboids.
- Drift over time: visual animated, collider fixed. Apply Option A/B/C.
- Offset grows with distance from origin: unapplied Blender scale, or parent
  `<group scale>` above the body. Bake to 1, remove wrapper.
- Raycast spawns land inside walls: `WorldObject.tsx` casts against *all*
  colliders including decor hulls — mark non-floor objects `physics: 'decor'`
  or shrink their hulls.
- 10x-scale jitter: you scaled in code, not Blender. Re-export at final size.

Common beginner mistakes: moving a physics mesh with `useFrame` instead of
the body; two `<Physics>` worlds; `trimesh` on anything dynamic; scaling the
RigidBody parent; forgetting `Ctrl+A` before export; exporting colliders with
a different origin than the visual.
