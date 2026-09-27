# Dynamic weather — environment-driven fog, rain, lightning + sound

How `environment: { weather, time, fogColor }` on an open-world config becomes
sky color, fog, lighting, rain streaks, lightning flashes, and positional-ish
thunder audio. Covers the `weather/` + `sfx/` work on `dynamic-world-builder`.

## The big picture

```
OpenWorldConfig.environment { weather: 'rain', time: 'night', fogColor? }
  └─ Experience.tsx
       ├─ theme = getWeatherTheme(weather, time, fogColor)   ← one lookup
       ├─ <Fog sky fog near far />        ← ALWAYS mounted (fog is permanent)
       ├─ <Weather weather />             ← switch: 'rain' → <Rain/>, else null
       └─ <Lights sunIntensity sunColor ... hemiIntensity ... /> ← theme-driven
```

Three independent layers, one source of truth (the config):

| Layer | Component | Lifetime |
|---|---|---|
| Sky + fog | `weather/Fog.tsx` | Permanent — every weather, every time of day, only the *colors* change |
| Particles + flash | `weather/Rain.tsx` (via `weather/Weather.tsx`) | Mounted only when `weather === 'rain'` |
| Sun + ambient | `Rendering/Lights.tsx` | Permanent, props driven by the theme |

## 1. `worldTypes.ts` — the vocabulary

```ts
export interface WorldEnvironmentConfig {
  terrain?: 'grass' | 'soil'
  weather?: 'clear' | 'rain' | 'snow' | 'forest' | 'desert'
  time?: 'day' | 'night'
  fogColor?: string
}
```

Only `OpenWorldConfig` carries it (`environment?: WorldEnvironmentConfig`).
Preset mode ignores it — `Experience` reads `config.mode === 'open' ? config.environment : undefined`,
defaulting to `weather: 'clear'`, `time: 'day'` when absent. `fogColor` is an
explicit override: when set, it replaces both sky and fog color from the theme.

## 2. `weatherRegistry.ts` — the theme table

`WEATHER_REGISTRY: Record<WeatherKind, Record<TimeOfDay, WeatherTheme>>` —
5 weathers × 2 times = 10 hand-tuned themes. Each theme holds everything the
scene needs in one object:

```ts
interface WeatherTheme {
  sky: string; fog: string; fogNear: number; fogFar: number
  sunIntensity: number; sunColor: string; sunPosition: [number, number, number]
  hemiIntensity: number; hemiSky: string; hemiGround: string
  rain: boolean
}
```

Design notes:

- **Sky and fog share one color per theme** (e.g. rain-day `#7d8699` for both).
  This is the same rule `Experience` always had — distant geometry must melt
  into the background, and a CSS background can never blend with fog.
- **Time changes light, not just darkness.** Night themes drop `sunIntensity`
  (0.5 → 0.1–0.18), cool the `sunColor` toward blue (`#a8c0ff`), move the sun
  to `NIGHT_SUN = [-40, 120, 60]`, and darken the hemisphere ground color.
  Rain-day keeps a dim grey sun (0.25) so shadows survive but feel overcast.
- **`fogFar` shrinks in bad weather**: clear-day 100 → rain-night 60. Rain
  literally closes in the world.
- `getWeatherTheme(weather, time, fogColor?)` returns the base theme, or a copy
  with `sky`/`fog` replaced when `fogColor` is set.

## 3. `Fog.tsx` — permanent fog, time-dependent color

```tsx
<color attach="background" args={[sky]} />
<fog attach="fog" args={[fog, near, far]} />
```

Two lines, mounted unconditionally by `Experience`. There is no "fog on/off" —
changing `time: 'day'` → `'night'` just feeds it a different `sky`/`fog` pair
from the registry. `fogColor` in the config wins over both when present.

## 4. `Weather.tsx` — the switch

```tsx
switch (weather) {
  case 'rain': return <Rain />
  default: return null
}
```

Deliberately a switch, not an if: `snow`, `forest`, `desert` already exist as
theme keys (sky/fog/light change today) and each gets a `case` returning its
own particle component later. Adding snow = new `Snow.tsx` + one case line.

## 5. `Rain.tsx` — overview (visual rain in depth: `3_how_rain_works.md`)

The whole rain visual is **one object**: 300 short vertical lines in a single
`<lineSegments>` (which *is* `THREE.LineSegments` — R3F constructs it from
the lowercase JSX tag, so `new THREE.LineSegments` never appears in the
codebase). One `Float32Array(1800)` holds all drops, mutated per frame in
`useFrame`, with landed drops respawning around the camera so 300 streaks in
one draw call feel like an endless storm. Full beginner walkthrough with
worked examples → [`3_how_rain_works.md`](./3_how_rain_works.md).

## 6. Sound — how Howler is used

`howler` (`^2.2.4`) is the audio engine. There are no `@types/howler`
packages installed, so `src/types/howler.d.ts` is a minimal hand-written
module shim (`HowlOptions` + `Howl` with `play/stop/unload/volume/once/on`)
— just enough for this usage, not a full type port.

Clip paths come from `World/sfx/sfxRegistry.ts`:

```ts
rain: ['/ignore/sounds/rain/rain.mp3']
thunder: ['dry-thunder.mp3', 'long-heavy-thunder.mp3', 'loud-thunder.mp3']
```

via `getSfx('rain')` / `getSfx('thunder')`. All files live under
`public/ignore/sounds/` (git-ignored sample content, served verbatim).

Two different Howler patterns in one effect:

- **Rain bed — one looping `Howl`, created once.** `new Howl({ src:
  getSfx('rain'), loop: true, volume: 0.35 })`, `play()` on mount,
  `unload()` on unmount. One instance, zero scheduling, follows the `<Rain/>`
  lifetime (unmount stops the rain sound automatically).
- **Thunder — N preloaded `Howl`s, one per clip.** `getSfx('thunder').map(src
  => new Howl({ src: [src], volume: 0.7, preload: true }))`. Preloading
  matters: creating a `Howl` lazily at strike time can delay or drop the
  first play while the file decodes; with all three decoded up front a strike
  is just `bolts[random].play()`. Each bolt `Howl` is unloaded on unmount;
  the old per-strike `new Howl` + `once('end', unload)` variant was replaced
  by this pool for exactly that decode-latency reason.

**Strike scheduler:** chained `setTimeout`, not `setInterval` — each strike
schedules the next with a fresh random delay (5–12s, first strike 1.8s so the
feature is visible immediately). A `cancelled` flag + `pending[]` timer list
in the effect cleanup stops strikes after unmount. The thunder *sound* is
delayed 250–900ms after the *flash* (`setTimeout` inside `strike()`) to fake
distance — light arrives instantly, sound lags.

## 7. Lightning — why the first version was invisible

The original attempt was a `pointLight` at `[0, 40, 0]` pulsed to intensity
60/30/0. It never showed. Cause: three r155+ uses **physical light units by
default**, where a point light falls off as `1/d²`. At 40m above the ground,
`60 / 40² ≈ 0.04` — effectively zero by the time it reaches anything. A
point light only works as lightning if it hovers meters above the camera,
which is fragile.

The fix: flash lights with **no distance falloff** — a global `ambientLight`
(×4 peak) plus a `directionalLight` (×3 peak), both starting at intensity 0:

```tsx
<ambientLight ref={ambientFlashRef} intensity={0} color="#dfe8ff" />
<directionalLight ref={dirFlashRef} position={[50, 80, 30]} intensity={0} color="#cdd8ff" />
```

The strike only records a timestamp (`strikeAt.current = performance.now() /
1000`); the actual brightness is computed **per frame** in `useFrame` from
`flashEnvelope(now - strikeAt)`. Decoupling trigger (audio effect) from
render (frame loop) means the flash timing is frame-accurate and immune to
`setTimeout` jitter.

**The envelope** (`flashEnvelope(t)`) is a double-blink: full white for
90ms → near-black dip at 160ms → 70% reflash decaying to zero by 600ms. That
dip-and-return is what reads as "lightning" instead of "someone toggled a
light". Total visible event ≈ 0.6s.

## 8. `Lights.tsx` — theme-driven sun

`Lights` went from hard-coded to props (`sunIntensity`, `sunColor`,
`sunPosition`, `hemiIntensity`, `hemiSky`, `hemiGround`, all with the old
clear-day values as defaults so `<Lights />` with no props still works —
e.g. the `test.tsx` model viewer). `Experience` feeds it straight from the
theme. No logic in `Lights` itself: weather decides, lights obey.

## 9. File map

| File | Role |
|---|---|
| `World/worldTypes.ts` | `WorldEnvironmentConfig` (`terrain/weather/time/fogColor`), on `OpenWorldConfig.environment` |
| `World/weather/weatherRegistry.ts` | 5×2 theme table + `getWeatherTheme()` with `fogColor` override |
| `World/weather/Fog.tsx` | Permanent `<color>` + `<fog>`, colors from theme |
| `World/weather/Weather.tsx` | Weather switch (`'rain'` → `<Rain/>`, rest → `null` for now) |
| `World/weather/Rain.tsx` | Line-segment rain + Howler rain loop + thunder pool + lightning envelope |
| `World/sfx/sfxRegistry.ts` | Clip paths by category (`rain`, `thunder`, `forest`, …) + `getSfx`/`getRandomSfx` |
| `Rendering/Lights.tsx` | Prop-driven sun + hemisphere (defaults = old clear-day look) |
| `GameSystem/Experience.tsx` | Reads `environment`, `useMemo`s the theme, mounts `Fog` + `Weather`, drives `Lights` |
| `types/howler.d.ts` | Minimal Howler type shim (no `@types/howler` installed) |

## 10. Gotchas learned

- **Point lights can't do lightning** under physical falloff — use
  ambient/directional (no `distance`) for full-scene flashes.
- **Preload thunder clips.** Lazy `new Howl` at strike time risks a silent
  first strike while the mp3 decodes.
- **Camera-follow the rain volume.** A static 60m rain box is left behind
  after seconds of walking; respawning drops around the camera makes 300
  streaks feel infinite.
- **Clamp `delta`.** `Math.min(delta, 0.05)` in `useFrame` prevents
  background-tab jumps from dumping all rain below ground at once.
- **`frustumCulled={false}`** on the rain lines — a CPU-updated buffer with a
  stale bounding sphere flickers in and out otherwise.
- **Chained `setTimeout` > `setInterval`** for strikes: re-randomized delays
  feel natural, and the `pending[]` + `cancelled` pattern cleans up fully on
  unmount (no orphaned strikes, no leaked `Howl`s).
