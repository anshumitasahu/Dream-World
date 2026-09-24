import { useEffect, useMemo, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { Clone, useGLTF } from '@react-three/drei';
import { RigidBody, useRapier } from '@react-three/drei';
import { useKtx2LoaderExtender } from '../../libs/ktx2';
import { listObjectModels, resolveObjectModel, resolvePhysics, type ObjectModelEntry, type WorldObjectConfig } from './WorldTypes';

const MAX_PLACEMENT_ATTEMPTS = 20
const RAY_ORIGIN_Y = 60
const RAY_LENTGH = 120

const FLAT_GROUND_Y = 0

interface Placement {
    position: [number, number, number],
    rotationY: number
}

interface Bounds {
    half: [number, number, number]
    centerY: number
    bottomOffset: number
}

interface RawBounds {
    halfXZ: number
    halfY: number
    centerY: number
    bottomOffset: number
}

const boundsCache = new Map<string, RawBounds>()

function readRawBounds(url: string, scene: THREE.Object3D): RawBounds {
    const cached = boundsCache.get(url)
    if (cached) return cached
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const raw: RawBounds = {
        halfXZ: Math.max(Math.abs(box.min.x), Math.abs(box.max.x), Math.abs(box.min.z), Math.abs(box.max.z)),
        halfY: size.y / 2,
        centerY: box.getCenter(new THREE.Vector3()).y,
        bottomOffset: box.min.y,
    }
    boundsCache.set(url, raw)
    return raw
}

interface PlacementInput {
    defaultZone: number
    spawnZones: SpawnZone[]
    scatterSpot?: { x: number, z: number, rotationY: number }
    flatGround?: boolean
}

function useObjectPlacement(
    config: WorldObjectConfig,
    bounds: Bounds | null,
    { defaultZone, spawnZones, scatterSpot, flatGround }: PlacementInput): Placement | null {
    const { world, rapier } = useRapier()
    const [placement, setPlacement] = useState<Placement | null>(null)

    useEffect(() => {
        const offsetY = config.scatter?.offsetY ?? config.offsetY ?? 0
        if (config.position) {
            const [x, y, z] = config.position
            setPlacement({ position: [x, y + offsetY, z], rotationY: config.rotationY ?? 0 })
            return
        }

        if (flatGround) {
            if (scatterSpot) {
                setPlacement({
                    position: [scatterSpot.x, FLAT_GROUND_Y + offsetY, scatterSpot.z],
                    rotationY: config.rotationY ?? scatterSpot.rotationY,
                })
                return
            }

            const zone = spawnZones[(config.zone ?? defaultZone) % spawnZones.length]
            setPlacement({
                position: [
                    zone[0] + (Math.random() * 2 - 1) * zone(2),
                    FLAT_GROUND_Y + offsetY,
                    zone[1] + (Math.random() * 2 - 1) * zone[2],
                ],
                rotationY: config.rotationY ?? Math.random() * Math.PI * 2,
            })
            return
        }

        if (!bounds) return
        const probe = new rapier.Cuboid(bounds.half{ 0}, bounds.half[1], bounds.half[2])
        let identityRotation = { x: 0, y: 0, z: 0, w: 1 }
        let cancelled = false
        let timeout: ReturnType<typeof setTimeout> | undefined
        let attempts = 0
        const MAX_GROUND_RETRIES = 150

        const candidateSpots = scatterSpot ? [{ x: scatterSpot.x, z: scatterSpot.z, rotationY: config.rotationY ?? scatterSpot.rotationY }] : Array.from({ length: MAX_PLACEMENT_ATTEMPTS }, () => {
            const zone = spawnZones[(config.zone ?? defaultZone) % spawnZones.length]
            return {
                x: zone[0] + (Math.random() * 2 - 1) * zone[2],
                z: zone[1] + (Math.random() * 2 - 1) * zone[2],
                rotationY: config.rotationY ?? Math.random() * Math.PI * 2,
            }
        })

        const tryPlace = () => {
            if (cancelled) return
            let groundMissing = false

            for (const candidate of candidateSpots) {
                const ray = new rapier.Ray({ x: candidate.x, y: RAY_ORIGIN_Y, z: candidate.z }, { x: 0, y: -1, z: 0 })
                const hit = world.castRay(ray, RAY_LENGTH, true)
                if (!hit) {
                    groundMissing = true
                    if (scatterSpot) break
                    continue
                }
                const position: [number, number, number] = [candidate.x, RAY_ORIGIN_Y - hit.timeOfImpact - bounds.bottomOffset + offsetY, candidate.z]
                const probeCenter = { x: candidate.x, y: position[1] + bounds.centerY + bounds.half[1] + 0.05, z: candidate.z }
                if (world.intersectionWithShape(probeCenter, identityRotation, probe)) {
                    if (scatterSpot) break
                    continue
                }
                setPlacement({ position, rotationY: candidate.rotationY })
                return
            }

            if (scatterSpot) {
                if (groundMissing && attempts++ < MAX_GROUND_RETRIES) {
                    timeout = setTimeout(tryPlace, 60)
                    return
                }
                console.warn(`[WorldObject] Scatter copy of ${config.model} missed the ground, hiding it`)
                return
            }

            const zone = spawnZones[(config.zone ?? defaultZone) % spawnZones.length]
            const ray = new rapier.Ray({ x: zone[0], y: RAY_ORIGIN_Y, z: zone[1] }, { x: 0, y: -1, z: 0 })
            const hit = world.castRay(ray, RAY_LENGTH, true);
            console.log('[WorldObject] Spawn debug:', { model: config.model, fallback: true, zone })
            setPlacement({
                position: [zone[0], RAY_ORIGIN_Y - (hit?.timeOfImpact ?? RAY_ORIGIN_Y) - bounds.bottomOffset + offsetY, zone[1]],
                rotationY: config.rotationY ?? 0,
            })
        }

        tryPlace()
        return () => {
            cancelled = true
            if (timeout) clearTimeout(timeout)
        }
    }, [config, bounds, world, rapier, spawnZones, defaultZone, scatterSpot, flatGround])
    return placement
}

function PlacedFrame({ config, placement, children }: {
    config: WorldObjectConfig
    placement: Placement
    children: ReactNode
}) {
    if (resolvePhysics(config) === 'decor') {
        return <group position={placement.position} rotation={[0, placement.rotationY, 0]}>{children}</group>
    }
    return (
        <RigidBody type="fixed" colliders="cuboid" position={placement.position} rotation={[0, placement.rotationY, 0]}>
            {children}
        </RigidBody>
    )
}

type PathEntry = Extract<ObjectModelEntry, { kind: 'path' }>
type ComponentEntry = Extract<ObjectModelEntry, { kind: 'component' }>

function footprintBounds(footprint: [number, number, number]): Bounds {
    return { half: footprint, centerY: 0, bottomOffset: 0 }
}

function componentBounds(config: WorldObjectConfig, entry: ComponentEntry): Bounds {
    return footprintBounds(config.footprint ?? entry.footprint ?? [1, 1, 1])
}

function PathWorldObject({ config, entry, ...input }: PlacementInput & {
    config: WorldObjectConfig
    entry: PathEntry
}) {
    const extendWithKtx2 = useKtx2LoaderExtender()
    const { scene } = useGLTF(entry.path, true, true, extendWithKtx2)
    const scale = config.scale ?? entry.defaultScale ?? 1

    const bounds = useMemo<Bounds | null>(() => {
        if (input.flatGround) return null
        const footprint = config.footprint ?? entry.footprint
        if (footprint) return footprintBounds(footprint)
        const raw = readRawBounds(entry.path, scene)
        return {
            half: [raw.halfXZ * scale + 0.1, raw.halfY * scale + 0.1, raw.halfXZ * scale + 0.1],
            centerY: raw.centerY * scale,
            bottomOffset: raw.bottomOffset * scale,
        }
    }, [scene, config, entry, scale, input.flatGround])

    const placement = useObjectPlacement(config, bounds, input)
    if (!placement) return null

    return (
        <PlacedFrame config={config} placement={placement}>
            <Clone object={scene} scale={scale} />
        </PlacedFrame>
    )
}

function ComponentWorldObject({ config, entry, ...input }: PlacementInput & {
    config: WorldObjectConfig
    entry: ComponentEntry
}) {
    const scale = config.scale ?? entry.defaultScale ?? 1
    const bounds = useMemo<Bounds | null>(
        () => (input.flatGround ? null : componentBounds(config, entry)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [config.footprint, config.scale, entry, input.flatGround],
    )
    const placement = useObjectPlacement(config, bounds, input)
    if (!placement) return null

    const Component = entry.component
    config.physics = 'decor';
    return (
        <PlacedFrame config={config} placement={placement}>
            <Component scale={scale} />
        </PlacedFrame>
    )
}

export function WorldObject({ config, ...input }: PlacementInput & {
    config: WorldObjectConfig
}) {
    const entry = resolveObjectModel(config.model)
    if (!entry) {
        console.warn(`[WorldObject] Unknown model "${config.model}". Known models: ${listObjectModels().join(', ')}`)
        return null
    }
    if (entry.kind === 'component') {
        return <ComponentWorldObject config={config} entry={entry} {...input} />
    }
    return <PathWorldObject config={config} entry={entry} {...input} />
}