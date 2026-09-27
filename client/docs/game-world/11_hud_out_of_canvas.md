# 11. HUD Out of Canvas — Why `<div>` Inside `<Canvas>` Crashes (Beginner Notes)

> Goal of this step: fix the white-screen crash `R3F: Div is not part of the THREE namespace!` and make the HUD (crosshair, Grounded badge, click-to-play overlay) stay pinned to the screen instead of drifting with the camera.
> Prereq: `10_jump.md` (the HUD we are moving), `0_physics_model.md` (the two-worlds model — today we add a third: the DOM world). This step moves UI only — physics and movement untouched.

## 0. What we just did (TL;DR)

1. Deleted all DOM (`createPortal` + `<div>`s) from `Player.tsx` — it now returns only the `<RigidBody>` capsule.
2. Added `playerHudStore.ts`: a tiny external store holding `{ isPointerLocked, isGrounded }` that both worlds can touch.
3. Added `PlayerHud.tsx`: a plain React component (outside `<Canvas>`) that reads the store and renders the crosshair / badge / overlay as `position: fixed` DOM.
4. Rendered `<PlayerHud />` in `App.tsx` as a sibling of `<Canvas>`, not a child. `Player` publishes (`setPlayerHud`), `PlayerHud` subscribes — `tsc`, `oxlint`, and `npm run build` all pass.
5. Run the app: no white screen, overlay stays dead-center while the camera orbits, badge flips green/red as before.

## 1. Mental model: `<Canvas>` is a different country with its own language

Everything inside `<Canvas>` is compiled by React Three Fiber into **Three.js objects**, not DOM. R3F decides what to build from the tag name:

```
INSIDE <Canvas> (THREE namespace)          OUTSIDE <Canvas> (DOM namespace)
-------------------------------            -------------------------------
<mesh> → THREE.Mesh ✓                      <div> → HTMLDivElement ✓
<group> → THREE.Group ✓                    <button> → HTMLButtonElement ✓
<axesHelper> → THREE.AxesHelper ✓          <PlayerHud> → plain React ✓
<div> → ??? ✗ CRASH                        <mesh> → ??? ✗ (same error, reversed)
what the GPU DRAWS                         what the BROWSER LAYS OUT
```

The error `R3F: Div is not part of the THREE namespace! Did you forget to extend?` is R3F saying: "you gave me a `<div>`, I looked it up in my THREE dictionary, it's not there." `createPortal` didn't help — a portal only changes *where* in the real DOM the output lands; the element is still *created* by R3F's reconciler, which only speaks THREE. (This is also why `<Html fullscreen>` from drei existed: it's a special R3F-aware bridge that positions a DOM node by reprojecting a 3D anchor every frame — which is exactly why our overlay drifted with the camera in the first place. Two symptoms, one cause: the HUD lived in the wrong country.)

The fix is architectural, not syntactic — move the HUD across the border:

```
BEFORE (crash + drift):                    AFTER (works + pinned):
App                                        App
 └─ <Canvas>                               ├─ <Canvas>
     └─ <Physics>                          │   └─ <Physics>
         └─ <Player>                       │       └─ <Player>  (3D only, publishes state)
             ├─ <RigidBody> capsule        │                    …physics/movement/camera unchanged
             └─ createPortal → <div> ✗     └─ <PlayerHud>  (DOM only, subscribes to state)
R3F reconciler chokes on <div>             each reconciler speaks its native language
```

## 2. Core concept: two reconcilers, one bridge (external store)

React can drive two different output systems in one app — the normal DOM reconciler (outside `<Canvas>`) and R3F's THREE reconciler (inside). Components in one tree can't render elements of the other, and they can't use each other's React context either (`useThree`, `<Physics>` context stop at the `<Canvas>` border). So how does the badge know the player landed?

Through **plain module state outside React** — a listener store both sides import:

```
3D WORLD (inside Canvas)                   DOM WORLD (outside Canvas)
------------------------------             ------------------------------
Player useFrame: probe says landed          PlayerHud usePlayerHud(): re-renders
  → setPlayerHud({ isGrounded: true })  ──→   badge turns green
Player pointerlockchange:                   PlayerHud click:
  → setPlayerHud({ isPointerLocked })   ──→   overlay hides/shows
publishes, never renders DOM               subscribes, never touches 3D
```

Vocabulary (only 4 new words):

| Term | Plain English | Our use |
|------|---------------|---------|
| `Reconciler` | The engine turning JSX into output (DOM vs THREE are two different ones) | Reason `<div>` crashes inside `<Canvas>` |
| `External store` | State living in a module, not in React — any component can read/write via subscribe | `playerHudStore.ts` bridges the two worlds |
| `useSyncExternalStore` | React's official hook for reading external stores (tear-free, StrictMode-safe) | `usePlayerHud()` in `PlayerHud.tsx` |
| `Sibling, not child` | `<PlayerHud />` sits next to `<Canvas>`, never inside it | `App.tsx` layout |

Why `useSyncExternalStore` and not prop-drilling or context? Props can't cross the Canvas border (the two trees are separate — `App` renders `<Canvas>` children into R3F's tree, `<PlayerHud>` into the DOM tree; there is no common JSX parent that owns both states... except `App` itself, which *could* hold state — but then 60 fps `setState` in `App` re-renders the whole `<Canvas>`). Context has the same border problem (R3F context ≠ DOM context). The external store is the minimal tool: `Player` writes without re-rendering anything, `PlayerHud` re-renders only itself, only on change (the `if` guard in `setPlayerHud` drops no-op writes — same pattern as doc 9 §3's `if (changed)`).

## 3. Every new line, explained

**`playerHudStore.ts` — the bridge:**

```ts
let snapshot: PlayerHudState = { isPointerLocked: false, isGrounded: false }
const listeners = new Set<() => void>()
```

- Module-level variables: one shared snapshot + one subscriber list for the whole app. Lives outside React entirely — importable from both worlds. (Same idea as doc 4's `pressedKeysRef` set living outside the render cycle, but cross-tree.)

```ts
export function setPlayerHud(patch: Partial<PlayerHudState>): void {
  const next = { ...snapshot, ...patch }
  if (next.isPointerLocked === snapshot.isPointerLocked && next.isGrounded === snapshot.isGrounded) return
  snapshot = next
  listeners.forEach((listener) => listener())
}
```

- Merge the patch, skip notify if nothing changed (the doc-9 guard, lifted to the store so every writer gets it free), else swap snapshot and ping subscribers. Called from `Player`'s pointer-lock handler and from `useFrame`'s grounded-change branch — both already change-gated at the call site, so this is a second safety net, not the first.

```ts
export function usePlayerHud(): PlayerHudState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
```

- The read hook. React subscribes on mount, unsubscribes on unmount, re-renders this component only when notified. Third arg (`getServerSnapshot`) = same getter — required signature, we have no SSR. No `useState`/`useEffect` needed in the HUD at all.

**`Player.tsx` — what changed (and what didn't):**

```tsx
import { setPlayerHud } from './playerHudStore'
```

- Only new import. `createPortal` and `useState` imports deleted — `Player` keeps zero React state now (all frame data was already refs).

```tsx
const handlePointerLockChange = () => {
  setPlayerHud({ isPointerLocked: document.pointerLockElement === canvas })
}
```

- Was `setIsPointerLocked(...)`. Same event, same value — published to the store instead of local state. Plus an initial `handlePointerLockChange()` call on mount so the overlay state is correct even before the first event.

```tsx
if (groundedNow !== isGroundedRef.current) {
  isGroundedRef.current = groundedNow
  setPlayerHud({ isGrounded: groundedNow })
}
```

- Was `setIsGrounded(groundedNow)`. Jump logic still reads `isGroundedRef` (frame-exact, zero re-renders — doc 10 §3 unchanged). The store write only fans out to the badge.

- Return value: just `<RigidBody>…</RigidBody>` — no fragment, no portal. `Player` is 100% THREE elements now, which is why R3F is happy.

**`PlayerHud.tsx` — plain DOM, `position: fixed`:**

- Reads `const { isPointerLocked, isGrounded } = usePlayerHud()`. Renders crosshair + badge when locked, click-to-play overlay otherwise. Styles copied verbatim from the old portal version, with `position: 'absolute'` → `'fixed'` so nothing depends on an offset parent.
- `requestPointerLock` finds the canvas via `document.querySelector('#root canvas')` — necessary because the HUD no longer receives `renderer.domElement` (that object lives inside the Canvas tree; the HUD is outside it). Querying the DOM is the honest cross-border lookup here.

**`App.tsx` + `index.html`:**

```tsx
<>
  <Canvas>…<Player />…</Canvas>
  <PlayerHud />
</>
```

- Sibling layout: the fix in one glance. Also fixed the `<Canvas>` prop indentation while touching the file. Deleted the now-unused `#portal-root` div from `index.html` — no portals left anywhere.

What we did NOT touch (and why): ground probe, jump, WASD, camera — the 3D simulation is byte-identical in behavior. `HoverCar`, floor, `<Physics>` props — untouched. The badge *looks* the same because the styles moved verbatim; only its data source changed (local state → store).

## 4. What you see now (two scenarios)

Setup: fresh load, `snapshot = { isPointerLocked: false, isGrounded: false }`.

**Scenario A — before first click:** `PlayerHud` reads `isPointerLocked: false` → full-screen overlay. Click → `requestPointerLock` locks the canvas → `pointerlockchange` fires in `Player` → store flips → `PlayerHud` re-renders → overlay unmounts, crosshair + red `Airborne` badge mount. Player falls from spawn, lands → store flips `isGrounded` → badge re-renders green. Overlay: gone the whole time, pinned `fixed` — camera orbit can't move it because no 3D anchor is involved anymore.

**Scenario B — the crash, gone:** before, first render threw `R3F: Div is not part of the THREE namespace` → white screen, nothing mounted. Now `Player` returns only `<RigidBody>`/`<CapsuleCollider>`/`<mesh>` — all in R3F's dictionary — and `<div>`s only exist in the DOM tree. `tsc -b`, `oxlint`, `npm run build` all green.

## 5. How to test / debug this yourself

- **Crash test:** load the page — scene renders (red capsule, HoverCar, floor), overlay visible, zero console errors. If the white screen returns, something DOM-ish is back inside `<Canvas>`: search `src` for `<div`, `<button`, `<span`, `createPortal` under any file rendered inside `<Canvas>`.
- **Pin test:** lock the pointer, orbit the mouse 360° — crosshair stays dead-center, badge stays bottom-left. (Before the drei-`<Html>` version, these drifted — the exact bug that started this.)
- **Badge test:** full jump cycle — red in air, green on land. If stuck red/green, the store isn't notified: check `setPlayerHud` is called in both the pointer-lock effect and the grounded-change branch.
- **Click test:** ESC → overlay returns (browser exits lock → event → store). Click → locks again. If click does nothing, `querySelector('#root canvas')` found nothing — check the canvas actually mounted (R3F renders `<canvas>` inside `#root`).
- **Re-render sanity:** open React DevTools, land/take off repeatedly — only `PlayerHud` re-renders on flips, never 60×/sec. If the whole app re-renders per frame, someone lifted this state into `App` — put it back in the store.

## 6. Common beginner mistakes (HUD-across-worlds edition)

1. **Any lowercase-DOM tag inside `<Canvas>`:** `<div>`, `<span>`, `<button>`, `<p>` — all crash with the namespace error. Rule: inside `<Canvas>`, every element must be a THREE thing (`mesh`, `group`, …) or an R3F-aware component (`RigidBody`, drei helpers). When in doubt, check which tree the file renders into.
2. **`createPortal` as a fix:** portals change DOM *placement*, not which reconciler *creates* the element. A `<div>` created by R3F's reconciler crashes no matter which DOM node it portals into. Portals never cross the reconciler border.
3. **Lifting game state into `App`:** `const [isGrounded, setIsGrounded] = useState()` in `App` + props down — works, but every 60 fps write re-renders `<Canvas>` children. The external store scopes re-renders to the HUD alone.
4. **Reading R3F context outside Canvas:** calling `useThree`/`useRapier` in `PlayerHud` throws (no Canvas ancestor). That's why the HUD finds the canvas via `querySelector` instead of receiving `renderer` as a prop — props *can* cross (plain values), context *can't*.
5. **Forgetting the change guard:** `setPlayerHud` called unconditionally in `useFrame` = subscriber ping 60×/sec = HUD re-render 60×/sec. We call it only inside `if (groundedNow !== ...)` — the store's own equality check is just backup.
6. **Leaving dead bridge code:** the `#portal-root` div, drei `Html` import, `createPortal` import — all removed. Dead bridge plumbing confuses the next reader into thinking portals are still involved.

## 7. Series checkpoint — what you can now build

Steps 1–11 complete the core loop *plus* a crash-proof UI layer:

- [x] Physics world + floor (gravity, collision)
- [x] Capsule body that lands upright
- [x] WASD velocity control (world → camera-relative)
- [x] Chase camera with smoothing + pointer-lock orbit
- [x] Camera-relative steering
- [x] Complex GLB colliders (HoverCar)
- [x] Ground probe: `isGroundedRef` + badge
- [x] Grounded jump: `Space` → `y = 5`
- [x] Crash-free screen-pinned HUD via external store — this step

Natural next steps: **variable jump height**, **coyote-time / jump buffering** (both read `isGroundedRef` + timestamps — store already in place for any HUD feedback), **sprint**, **mesh facing**, **score/health HUD** (just more fields in the same store — that's the payoff of this architecture).

Related files: `src/components/GameSystem/Player.tsx`, `src/components/GameSystem/PlayerHud.tsx`, `src/components/GameSystem/playerHudStore.ts`, `src/App.tsx`, `index.html`
Packages: none new — `useSyncExternalStore` ships with React
