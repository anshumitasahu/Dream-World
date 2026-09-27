# Black GLB Fix — Sketchfab Models Rendering Black

Notes on why Sketchfab-exported GLB models render solid black in three.js /
react-three-fiber, and every way to fix it. Written after fixing
`public/models/ignore/map/the_last_stronghold_animated_floating.glb`.

---

## TL;DR

Sketchfab exports "unlit" artwork as materials with:

- `KHR_materials_unlit` → three.js loads them as `MeshBasicMaterial`
- `baseColorFactor: [0,0,0,1]` (pure **black**) and **no baseColorTexture**
- the real artwork in the **emissiveTexture** slot

three.js GLTFLoader **silently discards emissive data for `MeshBasicMaterial`**,
so all that's left is black base color → solid black model. It looks fine on
Sketchfab's own viewer because their viewer applies emissive even on unlit
materials.

Fix: **remove `KHR_materials_unlit` from the GLB**. The loader then builds a
`MeshPhysicalMaterial` that keeps the emissive map — and since base color is
black, it renders exactly like the intended unlit look.

---

## Symptom

- Model loads, animation plays, geometry visible — but everything is black.
- Only parts with a base color texture (e.g. the sky dome) show correctly.
- Same file looks perfect on Sketchfab / gltf.report / sandbox.babylonjs.com.

---

## Root Cause (detailed)

### 1. What is actually inside the GLB

Inspecting the JSON chunk of the Stronghold GLB:

```json
{
  "extensionsUsed": ["KHR_materials_unlit", "KHR_materials_emissive_strength"],
  "materials": [
    {
      "name": "final_gate_low",
      "doubleSided": true,
      "emissiveFactor": [1, 1, 1],
      "emissiveTexture": { "index": 1 },
      "extensions": { "KHR_materials_unlit": {} },
      "pbrMetallicRoughness": {
        "baseColorFactor": [0, 0, 0, 1],
        "metallicFactor": 0
      }
    }
  ]
}
```

Every one of the 10 materials followed this pattern: **black base color, no
baseColor texture, all pixels carried by the emissive texture**. This is a
Sketchfab export quirk — they bake their "unlit / shadeless" material style
into glTF as black-base + emissive.

### 2. Why three.js drops the artwork

In `GLTFLoader` (also in `three-stdlib`'s copy, `loadMaterial()`):

```js
// emissive is ONLY assigned when the material is NOT MeshBasicMaterial:
if (materialDef.emissiveFactor !== void 0 && materialType !== MeshBasicMaterial) {
  materialParams.emissive = new Color().setRGB(...)
}
if (materialDef.emissiveTexture !== void 0 && materialType !== MeshBasicMaterial) {
  pending.push(parser.assignTexture(materialParams, "emissiveMap", ...))
}
```

`KHR_materials_unlit` forces `materialType = MeshBasicMaterial`, and
`MeshBasicMaterial` has no `emissive` / `emissiveMap` properties. The loader
skips both assignments — no warning, no error. Result: black color, no texture.

### 3. Why it looks fine elsewhere

Sketchfab's viewer (and most DCC tools) apply the emissive slot regardless of
the unlit flag. The glTF spec arguably never intended unlit + emissive-only
artwork, so viewers disagree — three.js is on the strict side.

---

## How to Diagnose Any GLB (one-liner)

No install needed — read the JSON chunk straight out of the container:

```bash
node -e "
const fs = require('fs');
const buf = fs.readFileSync('public/models/ignore/map/YOUR_MODEL.glb');
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString());
console.log('extensionsUsed:', json.extensionsUsed);
console.log(json.materials.map(m => ({
  name: m.name,
  unlit: !!(m.extensions && m.extensions.KHR_materials_unlit),
  baseColorFactor: (m.pbrMetallicRoughness||{}).baseColorFactor,
  baseColorTex: !!(m.pbrMetallicRoughness||{}).baseColorTexture,
  emissiveTex: !!m.emissiveTexture
})));
"
```

Black-model signature: `unlit: true` + `baseColorFactor: [0,0,0,1]` +
`baseColorTex: false` + `emissiveTex: true`.

---

## Fix A — Patch the GLB (applied in this repo)

Strip `KHR_materials_unlit` from the file. It appears in `extensionsUsed`
(not `extensionsRequired`), so removal is spec-legal — no loader will ever
require it. The `KHR_materials_emissive_strength` extension is kept; three.js
supports it.

The JSON chunk is rewritten, the binary (BIN) chunk is copied byte-for-byte:

```js
// patch-glb-unlit.cjs — run: node patch-glb-unlit.cjs
const fs = require('fs');
const path = 'public/models/ignore/map/the_last_stronghold_animated_floating.glb';

fs.copyFileSync(path, path + '.bak'); // rollback copy

const buf = fs.readFileSync(path);
const magic = buf.readUInt32LE(0);
const version = buf.readUInt32LE(4);
const totalLength = buf.readUInt32LE(8);
const jsonChunkLen = buf.readUInt32LE(12);
const jsonChunkType = buf.readUInt32LE(16);
if (magic !== 0x46546c67 || jsonChunkType !== 0x4e4f534a) throw new Error('Not a valid GLB');

const json = JSON.parse(buf.slice(20, 20 + jsonChunkLen).toString('utf8'));

let stripped = 0;
for (const mat of json.materials || []) {
  if (mat.extensions && mat.extensions.KHR_materials_unlit) {
    delete mat.extensions.KHR_materials_unlit;
    stripped++;
    if (Object.keys(mat.extensions).length === 0) delete mat.extensions;
  }
}
if (json.extensionsUsed) {
  json.extensionsUsed = json.extensionsUsed.filter((e) => e !== 'KHR_materials_unlit');
  if (json.extensionsUsed.length === 0) delete json.extensionsUsed;
}

// JSON chunk must be padded with 0x20 (spaces) to a 4-byte boundary (spec)
let jsonStr = JSON.stringify(json);
jsonStr += ' '.repeat((4 - (jsonStr.length % 4)) % 4);

const rest = buf.slice(20 + jsonChunkLen); // BIN chunk follows unchanged
const jsonBuf = Buffer.from(jsonStr, 'utf8');
const newTotal = 12 + 8 + jsonBuf.length + rest.length;

const out = Buffer.alloc(newTotal);
out.writeUInt32LE(magic, 0);
out.writeUInt32LE(version, 4);
out.writeUInt32LE(newTotal, 8);
out.writeUInt32LE(jsonBuf.length, 12);
out.writeUInt32LE(jsonChunkType, 16);
jsonBuf.copy(out, 20);
rest.copy(out, 20 + jsonBuf.length);

fs.writeFileSync(path, out);
console.log(`stripped unlit from ${stripped} materials | size ${totalLength} -> ${newTotal}`);
```

### Verify the result

```bash
node -e "
const fs = require('fs');
const buf = fs.readFileSync('public/models/ignore/map/the_last_stronghold_animated_floating.glb');
const jsonLen = buf.readUInt32LE(12);
if (buf.readUInt32LE(8) !== buf.length) throw new Error('length mismatch');
const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString());
console.log('extensionsUsed:', json.extensionsUsed);
console.log(json.materials.map(m => m.name + ' emissiveTex=' + !!m.emissiveTexture));
console.log('BIN chunk intact:', buf.readUInt32LE(20 + jsonLen + 4) === 0x004E4942);
"
```

### Follow-up in the r3f component

gltfjsx output declares material types. After patching they become
`MeshPhysicalMaterial` at runtime, so update the interface (e.g. in
`src/components/Rendering/map/StrongHoldAnimated.tsx`):

```ts
// before                          // after
sky_sketchfab: THREE.MeshBasicMaterial  →  THREE.MeshPhysicalMaterial
```

(If the cast is `as unknown as GLTFResult` this is type-hygiene, not a build
error — but keep it truthful.)

**Result:** no lighting setup needed. Base color is black so only the emissive
map shows → identical to the unlit original, unaffected by scene lights, works
with post-processing (HueSaturation/Vignette in `Experience.tsx`).

---

## Fix B — Code-Side (why it barely works)

The natural idea "just traverse the scene after `useGLTF` and copy emissive
onto the materials" **cannot work**: the emissive texture/color was discarded
inside GLTFLoader before any code sees the objects. The data is gone.

Remaining (discouraged) options:

1. **Monkey-patch the loader** via drei's 4th `useGLTF` argument
   (`useGLTF(path, true, true, extendLoader)`) — override
   `GLTFLoader.prototype.loadMaterial` to ignore the unlit extension. Fragile
   against loader version changes. Not recommended.
2. **Re-parse the GLB JSON chunk manually** and rebuild materials with
   `emissiveMap` assigned from the parsed images. Complex, ~100 lines, and
   duplicates what Fix A does permanently.
3. **Re-download the model from Sketchfab as `.fbx`/`.gltf` and re-import** —
   the export pipeline is what produces the broken material combo; not reliable.

**What to ask an LLM when you hit this again** (paste-ready prompt):

```text
My GLB model at <path> renders solid black after loading with useGLTF/GLTFLoader,
but looks correct on Sketchfab. Diagnose the file first:

1. Read the GLB JSON chunk (magic "glTF", JSON chunk starts at byte 20,
   length at byte 12) with a small Node script — no dependencies.
2. Check every material for: KHR_materials_unlit in extensions,
   baseColorFactor, presence/absence of baseColorTexture, emissiveTexture,
   emissiveFactor.
3. Expected black-model signature: unlit=true, baseColor=[0,0,0,1],
   no baseColorTexture, artwork only in emissiveTexture — three.js GLTFLoader
   drops emissive for MeshBasicMaterial.
4. If that signature matches, write a Node script that strips
   KHR_materials_unlit from materials + extensionsUsed, rewrites the JSON
   chunk with 4-byte space padding, copies the BIN chunk unchanged, and keeps
   a .bak backup. Verify total length and that the BIN chunk is untouched.
5. Update the gltfjsx-generated material type declarations from
   MeshBasicMaterial to MeshPhysicalMaterial.
```

---

## Fix C — Fix at the Source in Blender

Best long-term option for models you control: repair the material and
re-export, so every future export is clean.

1. **Import** — `File > Import > glTF 2.0 (.glb/.gltf)`, pick the GLB.
2. **Inspect** — select any mesh, open the `Shading` workspace. Each material
   is a Principled BSDF with **Base Color = black** and the artwork plugged
   into **Emission Color** (Emission Strength ≈ 1.56 on the sky material).
3. **Fix per material**:
   - Drag the Emission texture node's output into **Base Color** (leave the
     image node where it is, just rewire).
   - Set **Emission Strength to 0** (or disconnect the emission input) —
     otherwise the texture double-applies and the model glows too bright.
   - Set Metallic `0`, Roughness `1` if you want the fully shadeless look.
   - Repeat for every material (they all share this layout).
4. **Export** — `File > Export > glTF 2.0`, Format: glTF Binary (.glb).
   **Crucial:** in the export panel's Material section leave
   `Export > Materials` as **Principled BSDF** (default). Blender only writes
   `KHR_materials_unlit` when a material is emission-only with nothing else —
   since the texture now feeds Base Color, the unlit flag won't come back and
   three.js will load it as a normal textured PBR material.
5. Optional: tick `Y + Up`, keep `+Y Up` conventions, and confirm the export
   in gltf.report before dropping it into `public/models/`.

---

## Gotchas / Notes

- **Don't just strip the extension from `extensionsUsed` only** — the per-material
  `extensions.KHR_materials_unlit` entry is what actually triggers the
  `MeshBasicMaterial` path. Remove both (the script above does).
- Always pad the rewritten JSON chunk to a **4-byte boundary with spaces
  (0x20)**, never zeros — spec requirement for the JSON chunk type
  (`0x4E4F534A`).
- Keep the BIN chunk untouched; only the JSON chunk changes, so geometry,
  animations, and skinning are safe.
- `KHR_materials_emissive_strength` (found on the sky material, strength ≈1.56)
  is supported by three.js — leave it in.
- After patching, emissive-lit materials are unaffected by scene lights and by
  `Lights` tuning — same as before, just with textures visible.
- Backups: the patch script leaves `<file>.glb.bak` next to the asset. Delete
  it after visual confirmation — anything in `public/` gets copied into builds.
