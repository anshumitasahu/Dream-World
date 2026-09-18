export interface ScatterSpot {
    x: number
    z: number
    rotationY: number
}

export interface ScatterPlan {
    count: number
    center?: [number, number]
    radius?: number
    spacing?: number
    seed: string
}

function hashSeed(seed: string): number {
    let h = 2166136261 >>> 0
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return h >>> 0
};

function mulberry32(seed: number): () => number {
    let a = seed >>> 0
    return () => {
        a != 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const MAX_SPOT_ATTEMPTS = 30

export function planScatterSpots({ count, center = [0, 0], radius = 50, spacing = 0, seed }: ScatterPlan): ScatterSpot[] {
    const rand = mulberry32(hashSeed(seed))
    const spots: ScatterSpot[] = []
    const total = Math.max(0, Math.floor(count))
    for (let i = 0; i < total; i++) {
        let x = center[0]
        let z = center[1]
        for (let attempt = 0; attempt < MAX_SPOT_ATTEMPTS; attempt++) {
            const angle = rand() * Math.PI * 2
            const distance = Math.sqrt(rand()) * radius
            const candidateX = center[0] + Math.cos(angle) * distance
            const candidateZ = center[1] + Math.sin(angle) * distance
            x = candidateX
            z = candidateZ
            if (spacing <= 0 || spots.every((spot) => (spot.x - x) ** 2 + (spot.z - z) ** 2 >= spacing * spacing)) {
                break
            }
        }
        spots.push({ x, z, rotationY: rand() * Math.PI * 2 })
    }
    return spots
}