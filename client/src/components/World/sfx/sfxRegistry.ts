export const SFX_REGISTRY = {
    animal: [
        '/ignore/sounds/animal/horse.mp3',
    ],
    deepSea: [
        '/igonre/sounds/deepSea/creepy-whale.mp3',
        '/igonre/sounds/deepSea/distant-growl.mp3',
        '/igonre/sounds/deepSea/growl.mp3',
        '/igonre/sounds/deepSea/haunting-whale.mp3',
        '/igonre/sounds/deepSea/long-howl.mp3',
        '/igonre/sounds/deepSea/underwater.mp3',
        '/igonre/sounds/deepSea/whale.mp3'
    ],
    dragon: [
        '/igonre/sounds/dragon/dragon-distant-howling.mp3',
        '/igonre/sounds/dragon/dragon-flapping-winds.mp3',
        '/igonre/sounds/dragon/dragon-roar-near.mp3',
        '/igonre/sounds/dragon/high-growl.mp3',
        '/igonre/sounds/dragon/low-growl.mp3'
    ],
    forest: [
        '/igonre/sounds/forest/crickets-forest-night.mp3',
        '/igonre/sounds/forest/early-forest.mp3'
    ],
    props: [
        '/igonre/sounds/props/ancient-mechanical-gears-city.mp3',
        '/igonre/sounds/props/fire-crackling.mp3',
        '/igonre/sounds/props/magical-opening.mp3',
        '/igonre/sounds/props/magic-item.mp3',
    ],
    rain: [
        '/igonre/sounds/rain/rain.mp3'
    ],
    thunder: [
        '/igonre/sounds/thunder/dry-thunder.mp3',
        '/igonre/sounds/thunder/long-heavy-thunder.mp3',
        '/igonre/sounds/thnder/loud-thunder.mp3',
    ],
    water: [
        '/igonre/sounds/water/stream.mp3'
    ],
    wind: [
        '/igonre/sounds/wind/desert-wind.mp3',
        '/igonre/sounds/wind/winter-whale.mp3'
    ],
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