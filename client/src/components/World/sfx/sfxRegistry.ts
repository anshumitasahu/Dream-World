import type { TextureKind } from '../texture/textureRegistry'

const BASE_URL = import.meta.env.VITE_CDN_URL || 'https://r2.geckostack.store'
const SFX_PATH = `${BASE_URL}/sounds`

export const SFX_REGISTRY = {
  animal: [
    `${SFX_PATH}/animal/horse.mp3`,
  ],
  deepSea: [
    `${SFX_PATH}/deepSea/creepy-whale.mp3`,
    `${SFX_PATH}/deepSea/distant-growl.mp3`,
    `${SFX_PATH}/deepSea/growl.mp3`,
    `${SFX_PATH}/deepSea/haunting-whale.mp3`,
    `${SFX_PATH}/deepSea/long-howl.mp3`,
    `${SFX_PATH}/deepSea/underwater.mp3`,
    `${SFX_PATH}/deepSea/whale.mp3`,
  ],
  dragon: [
    `${SFX_PATH}/dragon/dragon-distant-howling.mp3`,
    `${SFX_PATH}/dragon/dragon-flaping-winds.mp3`,
    `${SFX_PATH}/dragon/dragon-roar-near.mp3`,
    `${SFX_PATH}/dragon/high-growl.mp3`,
    `${SFX_PATH}/dragon/low-growl.mp3`,
  ],
  forest: [
    `${SFX_PATH}/forest/crickets-forest-night.mp3`,
    `${SFX_PATH}/forest/early-forest.mp3`,
  ],
  props: [
    `${SFX_PATH}/props/ancient-mechanical-gears-city.mp3`,
    `${SFX_PATH}/props/fire-crackling.mp3`,
    `${SFX_PATH}/props/magical-opening.mp3`,
    `${SFX_PATH}/props/magic-item.mp3`,
  ],
  rain: [
    `${SFX_PATH}/rain/rain.mp3`,
  ],
  thunder: [
    `${SFX_PATH}/thunder/dry-thunder.mp3`,
    `${SFX_PATH}/thunder/long-heavy-thunder.mp3`,
    `${SFX_PATH}/thunder/loud-thunder.mp3`,
  ],
  walk: [
    `${SFX_PATH}/walk/grass-footstep.mp3`,
    `${SFX_PATH}/walk/rocky-footstep.mp3`,
    `${SFX_PATH}/walk/wet-footstep.mp3`,
  ],
  water: [
    `${SFX_PATH}/water/stream.mp3`,
  ],
  wind: [
    `${SFX_PATH}/wind/desert-wind.mp3`,
    `${SFX_PATH}/wind/winter-wind.mp3`,
  ],
  weapon: [
    `${SFX_PATH}/weapon/gun-shot.mp3`,
    `${SFX_PATH}/weapon/gun-reload.mp3`,
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
