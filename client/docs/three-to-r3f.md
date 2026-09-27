# Three.js → React Three Fiber Transition Guide

Living notes translating vanilla Three.js patterns to R3F.
New topics get appended as questions come up.

## Index

- [1. Canvas Fullscreen & Resize (`renderer.setSize`)](#1-canvas-fullscreen--resize-renderersetsize)
- [2. (next: ask to add)](#2-next-ask-to-add)

---

## 1. Canvas Fullscreen & Resize (`renderer.setSize`)

### Three.js (vanilla)

```js
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
```

You own the loop, the sizing, and the camera aspect update.

### R3F equivalent

You **don't** call `renderer.setSize`. `<Canvas>` creates the renderer and
auto-resizes it to its **parent div** via ResizeObserver, and auto-updates
`camera.aspect` on resize.

Fix is CSS, not JS. Canvas defaults to `height: 100%` of parent — if
`html/body/#root` have no height, canvas collapses to 0px.

**Required CSS (`src/index.css`):**

```css
html,
body,
#root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
canvas { display: block; }
```

That's already applied in this repo. No `resize` listener needed.

### Common patterns

**1. Full-viewport app (what you have in `src/App.tsx`):**
Just CSS above is enough. `<Canvas>` fills `#root`.

**2. Explicit size / sidebar layout:**
```tsx
<div style={{ width: '100vw', height: '100vh' }}>
  <Canvas camera={{ fov: 75, near: 1, far: 1000, position: [0, 10, 0] }}>
    {/* scene */}
  </Canvas>
</div>
```
Or directly on Canvas:
```tsx
<Canvas style={{ width: '100vw', height: '100vh' }}>
```

**3. Pixel ratio (replaces `setPixelRatio`):**
```tsx
<Canvas dpr={[1, 2]}> {/* min 1, max 2 — same as Math.min(devicePixelRatio, 2) */}
```

**4. Reading size inside scene (replaces `window.innerWidth`):**
```tsx
import { useThree } from '@react-three/fiber'

function Rig() {
  const size = useThree((s) => s.size)         // { width, height } in px, reactive
  const viewport = useThree((s) => s.viewport) // world units at z=0
  const gl = useThree((s) => s.gl)             // renderer — escape hatch only
  // ...
}
```

**5. True browser fullscreen (F11-style, Fullscreen API):**
```tsx
const gl = useThree((s) => s.gl)
gl.domElement.requestFullscreen()
```
R3F still auto-resizes after the fullscreen change. No manual `setSize`.

### Escape hatch (rarely needed)

```tsx
const gl = useThree((s) => s.gl)
const size = useThree((s) => s.size)
gl.setSize(size.width, size.height, false)
```
Almost never required — only if you disabled auto-resize with `<Canvas resize={false}>`.

### Rules of thumb

| Vanilla Three.js | R3F |
|---|---|
| `renderer.setSize(w, h)` | Size the **parent div** with CSS |
| `window resize` listener + `camera.aspect` update | Automatic |
| `renderer.setPixelRatio()` | `<Canvas dpr={...}>` |
| `renderer.domElement` | `useThree(s => s.gl.domElement)` / `onCreated={({ gl }) => ...}` |
| Sizing bug | Check parent height first — 99% of cases |

---

## 2. (next: ask to add)

Placeholder for next question (controls? `useFrame` vs `requestAnimationFrame`? loading GLTF vs `GLTFLoader`?).
Ask and it gets documented here with the same vanilla-vs-R3F format.
