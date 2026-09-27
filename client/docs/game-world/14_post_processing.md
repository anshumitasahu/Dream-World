# Dreamy look

```tsx
import { EffectComposer, Bloom, DepthOfField, HueSaturation, Noise, Vignette } from '@react-three/postprocessing'

<color attach="background" args={['#bcc0fe']} />
<fog attach="fog" args={['#bcc0fe', 0, 100]} />
<EffectComposer multisampling={1}>
  {/* <Bloom intensity={0.7} luminanceThreshold={0.5} luminanceSmoothing={0.2} /> */}
  {/* <DepthOfField focusDistance={0.01} focalLength={0.05} bokehScale={4} /> */}
  <HueSaturation saturation={-0.25} />
  {/* <Noise premultiply opacity={0.12} blendFunction={BlendFunction.SCREEN} /> */}
  <Vignette offset={0.25} darkness={0.8} />
</EffectComposer>
```