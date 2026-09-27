import type { TextureKind } from './texture/textureRegistry'

/** [x, z, radius] plus an optional floor surface Y used for player spawn */
export type SpawnZone = [x: number, z: number, radius: number, y?: number]

/** Scatter `count` copies of a model inside a disk; each copy ground-snaps and overlap-checks like a zoned object */
export interface ScatterConfig {
  /** How many copies to place */
  count: number
  /** [x, z] center of the scatter disk (defaults to the world origin) */
  center?: [number, number]
  /** Radius of the scatter disk (defaults to 50) */
  radius?: number
  /** Minimum separation between copies in meters; 0 (default) = purely random */
  spacing?: number
  /** Layout seed; defaults to the model path so layouts are stable across reloads */
  seed?: string
  /** Vertical nudge in meters added after ground-snap; negative sinks, positive lifts (defaults to 0) */
  offsetY?: number
}

export interface WorldObjectConfig {
  /** Registry name resolved client-side via MODEL_REGISTRY (e.g. "house"), never a path */
  model: string
  /** Explicit placement, skips spawn zone resolution */
  position?: [number, number, number]
  /** Spawn zone index to place the object in (defaults to round-robin over zones) */
  zone?: number
  /** Fixed Y rotation; random when omitted */
  rotationY?: number
  /** Vertical nudge in meters added after ground-snap; negative sinks, positive lifts (defaults to 0) */
  offsetY?: number
  scale?: number
  /** Collision probe half extents override; defaults to the model bounding box */
  footprint?: [number, number, number]
  /** 'fixed' adds a static collider, 'decor' is visual only (default 'fixed', scattered copies default 'decor') */
  physics?: 'fixed' | 'decor'
  /** Scatter many copies across an area (forests, rock fields, herds) */
  scatter?: ScatterConfig
}

export interface WorldEnvironmentConfig {
  weather?: 'clear' | 'wind' | 'rain' | 'snow' | 'forest' | 'desert'
  time?: 'day' | 'night'
  fogColor?: string
}

/** Circular ground trigger volume a player must enter to complete a mission */
export interface MissionZone {
  /** [x, y, z] trigger center in world space */
  position: [number, number, number]
  /** Trigger radius in meters */
  radius: number
}

export interface MissionConfig {
  /** Stable id, unique within a world; keys completion state */
  id: string
  name: string
  description?: string
  zone: MissionZone
}

export interface OpenGroundConfig {
  /** Edge length of the square ground in meters (defaults to 2000) */
  size?: number
  /** Ground texture set resolved client-side via textureRegistry (defaults to 'default') */
  texture?: TextureKind
}

/** Preset mode: a hand-built map from the registry, objects spawn into its zones */
export interface PresetWorldConfig {
  mode?: 'preset'
  map: string
  objects: WorldObjectConfig[],
  /** Player-triggered objectives; zones are monitored every frame */
  missions?: MissionConfig[],
}

/** Open mode: fully dynamic map — flat ground plus whatever the objects describe (forest, houses, creatures...) */
export interface OpenWorldConfig {
  mode: 'open'
  ground?: OpenGroundConfig
  playerSpawn?: [number, number, number]
  spawnZones?: SpawnZone[]
  objects: WorldObjectConfig[],
  environment?: WorldEnvironmentConfig,
  /** Player-triggered objectives; zones are monitored every frame */
  missions?: MissionConfig[],
}

export type WorldConfig = PresetWorldConfig | OpenWorldConfig

/**
 * Collision mode for an object: scattered copies default to visual-only decor
 * (a forest of trees should not each be a rigid body), everything else
 * defaults to a fixed collider.
 */
export function resolvePhysics(config: WorldObjectConfig): 'fixed' | 'decor' {
  return config.physics ?? (config.scatter ? 'decor' : 'fixed')
}
