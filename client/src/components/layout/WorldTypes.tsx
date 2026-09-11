export type SpawnZone = [x: number, z: number, radius: number];

export interface WorldObjectConfig {
    model: string
    position?: [number, number, number]
    zone?: number
    rotationY?: number
    scale?: number
    footprint?: [number, number, number]
    physics?: 'fixed' | 'decor'
};

export interface WorldConfig {
    map: string
    objects: WorldObjectConfig[]
};