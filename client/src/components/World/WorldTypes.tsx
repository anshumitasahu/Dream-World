export type SpawnZone = [x: number, z: number, radius: number, y?: number];

export interface ScatterConfig {
    count: number
    center?: [number, number],
    radius?: number
    spacing?: number
    seed?: string
    offsetY?: number
}

export interface WorldObjectConfig {
    model: string
    position?: [number, number, number]
    zone?: number
    rotationY?: number
    offsetY?: number
    scale?: number
    footprint?: [number, number, number]
    physics?: 'fixed' | 'decor'
    scatter?: ScatterConfig
};

export interface OpenGroundConfig {
    size?: number
};

export interface PresentWorldConfig {
    mode?: 'present'
    map: string
    objects: WorldObjectConfig[]
};

export interface OpenWorldConfig {
    mode: 'open'
    ground?: OpenGroundConfig
    playerSpawn?: [number, number, number]
    spawnZones?: SpawnZone[]
    objects: WorldObjectConfig[]
}

export type WorldConfig = PresentWorldConfig | OpenWorldConfig

export function resolvePhysics(config: WorldObjectConfig): 'fixed' | 'decor' {
    return config.physics ?? (config.scatter ? 'decor' : 'fixed')
}