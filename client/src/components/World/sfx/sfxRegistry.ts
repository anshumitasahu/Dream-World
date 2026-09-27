import type { TextureKind } from '../texture/textureRegistry'

export const SFX_REGISTRY = {
  animal: [
    '/ignore/sounds/animal/horse.mp3',
  ],
  deepSea: [
    '/ignore/sounds/deepSea/creepy-whale.mp3',
    '/ignore/sounds/deepSea/distant-growl.mp3',
    '/ignore/sounds/deepSea/growl.mp3',
    '/ignore/sounds/deepSea/haunting-whale.mp3',
    '/ignore/sounds/deepSea/long-howl.mp3',
    '/ignore/sounds/deepSea/underwater.mp3',
    '/ignore/sounds/deepSea/whale.mp3',
  ],
  dragon: [
    '/ignore/sounds/dragon/dragon-distant-howling.mp3',
    '/ignore/sounds/dragon/dragon-flaping-winds.mp3',
    '/ignore/sounds/dragon/dragon-roar-near.mp3',
    '/ignore/sounds/dragon/high-growl.mp3',
    '/ignore/sounds/dragon/low-growl.mp3',
  ],
  forest: [
    '/ignore/sounds/forest/crickets-forest-night.mp3',
    '/ignore/sounds/forest/early-forest.mp3',
  ],
  props: [
    '/ignore/sounds/props/ancient-mechanical-gears-city.mp3',
    '/ignore/sounds/props/fire-crackling.mp3',
    '/ignore/sounds/props/magical-opening.mp3',
    '/ignore/sounds/props/magic-item.mp3',
  ],
  rain: [
    '/ignore/sounds/rain/rain.mp3',
  ],
  thunder: [
    '/ignore/sounds/thunder/dry-thunder.mp3',
    '/ignore/sounds/thunder/long-heavy-thunder.mp3',
    '/ignore/sounds/thunder/loud-thunder.mp3',
  ],
  walk: [
    '/ignore/sounds/walk/grass-footstep.mp3',
    '/ignore/sounds/walk/rocky-footstep.mp3',
    '/ignore/sounds/walk/wet-footstep.mp3',
  ],
  water: [
    '/ignore/sounds/water/stream.mp3',
  ],
  wind: [
    '/ignore/sounds/wind/desert-wind.mp3',
    '/ignore/sounds/wind/winter-wind.mp3',
  ],
  weapon: [
    '/ignore/sounds/weapon/gun-shot.mp3',
    '/ignore/sounds/weapon/gun-reload.mp3',
  ]
} as const

export type SfxCategory = keyof typeof SFX_REGISTRY

export const SFX_CATEGORIES = Object.keys(SFX_REGISTRY) as SfxCategory[]

export function getSfx(category: SfxCategory): string[] {
  return [...SFX_REGISTRY[category]]
}

export function getRandomSfx(category: SfxCategory): string | undefined {
  const clips = SFX_REGISTRY[category]
  if (!clips) return undefined
  return clips[Math.floor(Math.random() * clips.length)]
}

export const sounds: Record<SfxCategory, readonly string[]> = SFX_REGISTRY

const WIND_CLIPS = SFX_REGISTRY.wind
const DESERT_WIND = WIND_CLIPS[0]
const WINTER_WIND = WIND_CLIPS[1]

/** The two wind beds: a dry desert gust and a colder winter gust. */
export const WIND_SFX = {
  desert: DESERT_WIND,
  winter: WINTER_WIND,
} as const

export type WindSfx = keyof typeof WIND_SFX

export function getWindSfx(kind: WindSfx): string {
  return WIND_SFX[kind]
}

const FOREST_CLIPS = SFX_REGISTRY.forest
const FOREST_NIGHT = FOREST_CLIPS[0]
const FOREST_DAY = FOREST_CLIPS[1]

/** Forest ambience: birdsong by day, crickets by night. */
export const FOREST_SFX = {
  day: FOREST_DAY,
  night: FOREST_NIGHT,
} as const

export type ForestTime = keyof typeof FOREST_SFX

export function getForestSfx(time: ForestTime): string {
  return FOREST_SFX[time]
}

const WALK_CLIPS = SFX_REGISTRY.walk
const GRASS_STEP = WALK_CLIPS[0]
const ROCKY_STEP = WALK_CLIPS[1]
const WET_STEP = WALK_CLIPS[2]

/** Footstep clip per ground texture. Only grass/mud have dedicated recordings — everything else falls back to rocky. */
export const FOOTSTEP_BY_TEXTURE: Record<TextureKind, string> = {
  default: ROCKY_STEP,
  grass: GRASS_STEP,
  soil: ROCKY_STEP,
  snow: ROCKY_STEP,
  sand: ROCKY_STEP,
  mud: WET_STEP,
}

export function getFootstepSfx(texture: TextureKind = 'default'): string {
  return FOOTSTEP_BY_TEXTURE[texture] ?? ROCKY_STEP
}
