# 13. Zustand HUD Store — Replacing the Hand-Rolled External Store (Beginner Notes)

> Goal of this step: replace the hand-rolled `useSyncExternalStore` bridge from doc 11 with a **zustand global store** holding the same `{ isPointerLocked, isGrounded }` state. Same architecture (Player publishes, PlayerHud subscribes, sibling layout) — only the store plumbing changes.
> Prereq: `11_hud_out_of_canvas.md` (the bridge we are upgrading), `12_ecctrl_fps_player.md` (the current `Player` writer). No physics, movement, or camera changes.

## 0. What we just did (TL;DR)

1. Rewrote `playerHudStore.ts` as `create<PlayerHudStore>()(...)` — values plus a `setPlayerHud` action in one store, same no-op guard as before.
2. Updated `PlayerHud.tsx` to read via per-field selectors (`state.isPointerLocked`, `state.isGrounded`) so each only re-renders its own subscriber on change.
3. Updated `Player.tsx` to write via `usePlayerHudStore.getState().setPlayerHud(...)` — no hook subscription in the 3D loop, works fine inside event listeners and `useFrame`.
4. `tsc -b`, `oxlint`, and `npm run build` all pass. No new packages — `zustand` was already in `package.json`.

## 1. Mental model: same bridge, managed by a library

The doc-11 architecture is untouched:

```
3D WORLD (inside Canvas)                   DOM WORLD (outside Canvas)
------------------------------             ------------------------------
Player: getState().setPlayerHud(...)  ──→  PlayerHud: usePlayerHudStore(selector)
publishes, never renders DOM               subscribes, never touches 3D
```

What changed is only *who implements the listener list*: before, we hand-managed `snapshot` + `listeners` + `useSyncExternalStore`. Now zustand owns that machinery. Mental model in one line: **zustand is our doc-11 external store, pre-built** — `create()` makes the module state + subscriber set, the hook call with a selector is the subscribe + re-render-on-change, `getState()` is the escape hatch for writing outside React renders.

Vocabulary (only 3 new words):

| Term | Plain English | Our use |
|------|---------------|---------|
| `create()` | Builds a tiny global state container: holds values, notifies subscribers on change | `usePlayerHudStore` in `playerHudStore.ts` |
| `Selector` | A function picking one slice (`state.isGrounded`) — component re-renders only when that slice changes | `PlayerHud.tsx` reads each field separately |
| `getState()` | Reads/writes the store without subscribing — for event handlers and frame loops | `Player.tsx` pointer-lock handler + `useFrame` |

Why selectors instead of `usePlayerHudStore()` whole-store? The whole-store form re-renders on *any* field change; per-field selectors scope re-renders (grounded flips don't disturb the pointer-lock subscriber and vice versa). Same spirit as the doc-11 change guard, one level finer.

Why `getState()` in `Player` instead of calling the hook? `Player` never renders HUD state — subscribing it would re-render the 3D component on every HUD flip. `getState().setPlayerHud(...)` publishes with zero subscription. It also works where hooks can't: inside `useFrame` callbacks and DOM event listeners.

## 2. Every new line, explained

**`playerHudStore.ts` — the store:**

```ts
interface PlayerHudValues {
  isPointerLocked: boolean
  isGrounded: boolean
}

interface PlayerHudStore extends PlayerHudValues {
  setPlayerHud: (patch: Partial<PlayerHudValues>) => void
}
```

- Two interfaces: values (the data) + store (data plus the writer action). The action lives *inside* the store now, typed as a partial patch — same call signature as the old standalone `setPlayerHud`, so writers barely change. Descriptive names (`PlayerHudValues`) over short ones, per project taste.

```ts
export const usePlayerHudStore = create<PlayerHudStore>()((set, get) => ({
  isPointerLocked: false,
  isGrounded: false,
  setPlayerHud: (patch) => {
    const currentState = get()
    const nextIsPointerLocked = patch.isPointerLocked ?? currentState.isPointerLocked
    const nextIsGrounded = patch.isGrounded ?? currentState.isGrounded
    if (
      nextIsPointerLocked === currentState.isPointerLocked &&
      nextIsGrounded === currentState.isGrounded
    )
      return
    set(patch)
  },
}))
```

- `create<PlayerHudStore>()(...)` — the curried form gives full type inference on `set`/`get`. Initial values identical to the old `snapshot`.
- The guard compares the *merged* result field-by-field and returns early on no-ops (the doc-9/doc-11 guard, now inside the store so every writer gets it free). `?? currentState` means an omitted field keeps its value — `set(patch)` then merges, same as the old `{ ...snapshot, ...patch }` spread.
- Only one export now. The old file exported two functions (`setPlayerHud`, `usePlayerHud`); zustand fuses them into one hook-object: read via call-with-selector, write via `.getState()`.

**`PlayerHud.tsx` — what changed:**

```tsx
import { usePlayerHudStore } from './playerHudStore'

const isPointerLocked = usePlayerHudStore((state) => state.isPointerLocked)
const isGrounded = usePlayerHudStore((state) => state.isGrounded)
```

- Was `const { isPointerLocked, isGrounded } = usePlayerHud()`. Same two values, sourced from two independent subscriptions. Everything below (crosshair, badge, overlay, `requestPointerLock`) is byte-identical.

**`Player.tsx` — what changed:**

```tsx
import { usePlayerHudStore } from './playerHudStore'

// pointer-lock handler:
usePlayerHudStore.getState().setPlayerHud({ isPointerLocked: ... })

// useFrame:
usePlayerHudStore.getState().setPlayerHud({ isGrounded: controller.isOnGround })
```

- Was bare `setPlayerHud(...)` import. Same payloads, same call sites — only the path to the writer changed (through the store object). The store's own equality guard still drops redundant `isGrounded` writes at 60 fps.

What we did NOT touch (and why): `App.tsx` sibling layout, `PlayerHud` JSX/styles, Ecctrl movement, camera, ground source (`controller.isOnGround`) — the data flow is identical, only the container changed.

## 3. How to test / debug this yourself

- **Badge test:** jump — red `Airborne` in air, green `Grounded` on land. Stuck? `setPlayerHud` isn't firing — check the `useFrame` call site in `Player.tsx`.
- **Overlay test:** ESC → overlay returns; click → locks again. If click does nothing, `querySelector('#root canvas')` found nothing (same as doc 11 §5).
- **Re-render sanity:** in React DevTools, land/take off repeatedly — only `PlayerHud` re-renders, never `Player` (it doesn't subscribe) and never the whole `App`. If `Player` re-renders per flip, someone called the `usePlayerHudStore(...)` hook inside it — switch back to `getState()`.
- **Whole-store smell:** if a component reads `usePlayerHudStore()` with no selector, every field flip re-renders it. Prefer one selector per field.

## 4. Common beginner mistakes (zustand edition)

1. **Subscribing the writer:** calling `usePlayerHudStore((s) => s.setPlayerHud)` or the whole hook inside `Player`/`useFrame` — subscribes the 3D component to HUD flips. Writers use `getState()`, readers use the hook.
2. **Whole-store reads:** `const hud = usePlayerHudStore()` re-renders on any change. Split into per-field selectors.
3. **Forgetting `getState()` is stable:** it's fine to call `usePlayerHudStore.getState()` inside effects and frame loops — no dependency-array issues, no stale closures.
4. **Duplicating the guard at call sites:** the store already drops no-op patches. Writers can post plain values; no `if (changed)` needed around the call (harmless if kept, just redundant).

## 5. Series checkpoint — what you can now build

Steps 1–13: core loop + crash-proof UI + library-managed global state:

- [x] Physics world + floor, capsule body, WASD, chase → FPS head camera
- [x] Screen-pinned HUD via external store (doc 11)
- [x] Same HUD via zustand global store — this step

Natural next steps: **score/health HUD** (just more fields in the same store + more selectors — that's the payoff), **sprint FOV kick** (read run state via a new field), **interact raycast** (publish highlight target through the store).

Related files: `src/components/GameSystem/playerHudStore.ts`, `src/components/GameSystem/PlayerHud.tsx`, `src/components/GameSystem/Player.tsx`
Packages: `zustand` (`create`, selectors, `getState`) — already a dependency, no install needed
