import type { ComponentType } from "react";
import { TestMap, TestMapSpawnZones } from "../Rendering/map/TestMap";
import type { SpawnZone, WorldConfig } from './WorldTypes';
import { OpenPlains, OpenPlainsSpawnZones } from '../Rendering/map/OpenPlains';
import { StrongHoldAnimated, StrongHoldSpawnZones } from '../Rendering/map/StrongAnimated';

export interface MapEntry {
    component: ComponentType
    spawnZones: SpawnZone[],
    mapScale?: number
};

export const MAP_REGISTRY: Record<string, MapEntry> = {
    testMap: { component: TestMap, spawnZones: TestMapSpawnZones },
    openPlains: { component: OpenPlains, spawnZones: OpenPlainsSpawnZones },
    strongHold: { component: StrongHoldAnimated, spawnZones: StrongHoldSpawnZones, mapScale: 10 },
};

const PLAYER_SPAWN_CLEARENCE = 1

const SPAWN_ORIGIN: [number, number, number] = [0, PLAYER_SPAWN_CLEARENCE, 0]

export function scaleSpawnZones(zones: SpawnZone[], scale: number): SpawnZone[] {
    if (scale === 1) return zones
    return zones.map(([x, z, radius, y]): SpawnZone => (
        y === undefined ? [x * scale, z * scale, radius * scale] : [x * scale, z * scale, radius * scale, y * scale]
    ))
}

export function getMapSpawnZones(mapId: string): SpawnZone[] {
    const entry = MAP_REGISTRY[mapId]
    if (!entry) return []
    return scaleSpawnZones(entry.spawnZones, entry.mapScale ?? 1)
}

export function getPlayerSpawnPosition(mapId: string, config?: WorldConfig): [number, number, number] {
    if (config?.mode === 'open') {
        if (config.playerSpawn) return config.playerSpawn
        const openZones = config.spawnZones ?? [[0, 0, 20]]
        return sampleSpawnZone(openZones)
    }

    const zones = getMapSpawnZones(mapId);

    if (zones.length === 0) {
        console.warn(`[mapRegistry] No spawn zones for map "${mapId}", spawning at origin`)
        return SPAWN_ORIGIN;
    }

    return sampleSpawnZone(zones)
}

function sampleSpawnZone(zones: SpawnZone[]): [number, number, number] {
    const [x, z, radius, floorY = 0] = zones[Math.floor(Math.random() * zones.length)]

    const angle = Math.random() * Math.PI * 2
    const distance = Math.sqrt(Math.random()) * radius

    return [
        x + Math.cos(angle) * distance,
        floorY + PLAYER_SPAWN_CLEARENCE,
        z + Math.sin(angle) * distance,
    ]
}