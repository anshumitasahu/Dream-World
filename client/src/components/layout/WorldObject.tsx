import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Clone, useGLTF } from '@react-three/drei';
import { RigidBody, useRapier } from '@react-three/rapier';
import type { SpawnZone, WorldObjectConfig } from './WorldTypes';

const MAX_PLACEMENT_ATTEMPTS = 20;
const RAY_ORIGIN_Y = 60;
const RAY_LENGTH = 120;

interface Placement {
    position: [number, number, number]
    rotationY: number
};

interface Bounds {
    half: [number, number, number]
    centerY: number
    bottomOffset: number
    scale: number
};

export function WorldObject({ config, defaultZone, spawnZones }: {
    config: WorldObjectConfig
    defaultZone: number
    spawnZones: SpawnZone[]
}) {
    const { scene } = useGLTF(config.model);
    const { world, rapier } = useRapier();
    const [placement, setPlacement] = useState<Placement | null>(null);

    const bounds = useMemo<Bounds>(() => {
        const scale = config.scale ?? 1
        if (config.footprint) {
            return { half: config.footprint, centerY: 0, bottomOffset: 0, scale };
        };
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const halfXZ = Math.max(Math.abs(box.min.x), Math.abs(box.max.x), Math.abs(box.min.z), Math.abs(box.max.z)) * scale
        return {
            half: [halfXZ + 0.1, (size.y * scale) / 2 + 0.1, halfXZ + 0.1],
            centerY: box.getCenter(new THREE.Vector3()).y * scale,
            bottomOffset: box.min.y * scale,
            scale,
        };
    }, [scene, config]);

    useEffect(() => {
        if (config.position) {
            setPlacement({ position: config.position, rotationY: config.rotationY ?? 0 });
            return;
        };

        const zone = spawnZones[(config.zone ?? defaultZone) % spawnZones.length];
        const probe = new rapier.Cuboid(bounds.half[0], bounds.half[1], bounds.half[2]);
        const identityRotation = { x: 0, y: 0, z: 0, w: 1 }

        for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
            const x = zone[0] + (Math.random() * 2 - 1) * zone[2];
            const z = zone[1] + (Math.random() * 2 - 1) * zone[2];

            const ray = new rapier.Ray({ x, y: RAY_ORIGIN_Y, z }, { x: 0, y: -1, z: 0 });
            const hit = world.castRay(ray, RAY_LENGTH, true);
            if (!hit) continue;
            const position: [number, number, number] = [x, RAY_ORIGIN_Y - hit.timeOfImpact - bounds.bottomOffset, z];

            const probeCenter = { x, y: position[1] + bounds.centerY + bounds.half[1] + 0.05, z };
            if (world.intersectionWithShape(probeCenter, identityRotation, probe)) continue;
            // @ts-ignore
            (window.__spawnDebug ??= []).push({ model: config.model, position, attempt: attempt + 1 });
            setPlacement({ position, rotationY: config.rotationY ?? Math.random() * Math.PI * 2 });
            return;
        };

        const ray = new rapier.Ray({ x: zone[0], y: RAY_ORIGIN_Y, z: zone[1] }, { x: 0, y: -1, z: 0 });
        const hit = world.castRay(ray, RAY_LENGTH, true);
        //@ts-ignore
        (window.__spawnDebug ??= []).push({ model: config.model, fallback: true, zone });
        setPlacement({
            position: [zone[0], RAY_ORIGIN_Y - (hit?.timeOfImpact ?? RAY_ORIGIN_Y) - bounds.bottomOffset, zone[1]],
            rotationY: config.rotationY ?? 0,
        });
    }, [config, bounds, world, rapier, spawnZones, defaultZone]);

    if (!placement) return null;

    const model = <Clone object={scene} scale={bounds.scale} />;
    if (config.physics === 'decor') {
        return <group position={placement.position} rotation={[0, placement.rotationY, 0]}>{model}</group>
    };
    return (
        <RigidBody type="fixed" colliders="trimesh" position={placement.position} rotation={[0, placement.rotationY, 0]}>
            {model}
        </RigidBody>
    )
}