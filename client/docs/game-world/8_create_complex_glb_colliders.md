# How to create complex glb colliders
[source youtube link](https://youtu.be/G063QE-xAs8?si=snqAKCg7wcGo3xTO)

- go to this (https://gltf.pmnd.rs/)[https://gltf.pmnd.rs/]
- drop yourl glb
- get jsk
- implement types to fix type erros

```tsx
export function HoverCar(props: JSX.IntrinsicElements['group']) {}

<mesh
  name="Cylinder005_0"
  castShadow
  receiveShadow
  geometry={(nodes.Cylinder005_0 as Mesh).geometry} // this line
  material={materials.cdp_metal}
  morphTargetDictionary={(nodes.Cylinder005_0 as Mesh).morphTargetDictionary}
  morphTargetInfluences={(nodes.Cylinder005_0 as Mesh).morphTargetInfluences}
/>

```