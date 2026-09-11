import type { ComponentType } from "react";
import { TestMap, TestMapSpawnZones } from "./TestMap";
import type { SpawnZone } from './WorldTypes';

export interface MapEntry {
    component: ComponentType
    spawnZones: SpawnZone[]
};

export const MAP_REGISTRY: Record<string, MapEntry> = {
    testMap: { component: TestMap, spawnZones: TestMapSpawnZones },
};