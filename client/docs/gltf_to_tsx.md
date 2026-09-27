## How to Convert GLTF to TSX

```shell
## jsx
bunx gltfjsx public/model.glb 

## tsx
bunx gltfjsx public/model.glb -t

## custom output path
bunx gltfjsx public/model.glb -o src/components/Model.tsx -t

```


```ts
{
  "map": "strongHold",
  "objects": [
      { "model": "/models/cyberpunk_hovercar.glb", "zone": 0 },
      { "model": "/models/cyberpunk_hovercar.glb", "zone": 3, "rotationY": 1.2 }
  ]
}
```