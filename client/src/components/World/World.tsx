import { useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { getMapSpawnZones, MAP_REGISTRY } from './mapRegistry'
import { WorldObject } from './WorldObject'
import { planScatterSpots } from './scatter'
import { OpenPlains } from '../Rendering/map/OpenPlains'
import type { OpenWorldConfig, PresetWorldConfig, SpawnZone, WorldConfig, WorldObjectConfig } from './worldTypes'

/** Debug-only per-object overrides (used by the /test/$testChat debugger). */
export interface DebugObjectOverride {
  /** Skip rendering this entry (all of its copies) without shifting sibling keys */
  hidden?: boolean
  /** Replace the entry's scale */
  scale?: number
  /**
   * Pin a zoned entry to an explicit [x, y, z] position. For scattered
   * entries moves the scatter disk center (x, z).
   */
  position?: [number, number, number]
}

function applyObjectOverride(
  config: WorldObjectConfig,
  override: DebugObjectOverride | undefined,
): WorldObjectConfig {
  if (!override || (override.scale === undefined && override.position === undefined)) return config
  let next = config
  if (override.scale !== undefined) next = { ...next, scale: override.scale }
  if (override.position) {
    next = next.scatter
      ? { ...next, scatter: { ...next.scatter, center: [override.position[0], override.position[2]] } }
      : { ...next, position: override.position }
  }
  return next
}

/**
 * Applies debug overrides while keeping untouched entries referentially stable
 * so their random placements don't reshuffle on unrelated sidebar tweaks.
 */
function useOverriddenObjects(
  objects: WorldObjectConfig[],
  overrides?: Record<number, DebugObjectOverride>,
): WorldObjectConfig[] {
  return useMemo(() => {
    if (!overrides) return objects
    return objects.map((object, index) => applyObjectOverride(object, overrides[index]))
  }, [objects, overrides])
}

type ObjectOverridesProp = {
  objectOverrides?: Record<number, DebugObjectOverride>
}

function PresetWorld({ config, objectOverrides, ...props }: ThreeElements['group'] & { config: PresetWorldConfig } & ObjectOverridesProp) {
  const entry = MAP_REGISTRY[config.map]
  // Zones resolved to world space so objects land on the scaled map geometry
  const spawnZones = useMemo(() => getMapSpawnZones(config.map), [config.map])
  const objects = useOverriddenObjects(config.objects, objectOverrides)
  if (!entry) {
    console.warn(`[World] Unknown map "${config.map}". Available maps: ${Object.keys(MAP_REGISTRY).join(', ')}`)
    return null
  }
  const MapComponent = entry.component
  const mapScale = entry.mapScale ?? 1
  return (
    <group {...props}>
      <group scale={mapScale}>
        <MapComponent />
      </group>
      {objects.flatMap((object, index) => {
        if (objectOverrides?.[index]?.hidden) return []
        return (
          <WorldObject
            key={`${object.model}-${index}`}
            config={object}
            defaultZone={index}
            spawnZones={spawnZones}
          />
        )
      })}
    </group>
  )
}

function OpenWorld({ config, objectOverrides, ...props }: ThreeElements['group'] & { config: OpenWorldConfig } & ObjectOverridesProp) {
  const spawnZones: SpawnZone[] = useMemo(() => config.spawnZones ?? [[0, 0, 20]], [config])
  const objects = useOverriddenObjects(config.objects, objectOverrides)
  // Scatter layouts are pure seeded math: computed once per config, identical on
  // every load, and independent of physics mount timing.
  const scatterPlans = useMemo(() => objects.map((object) => {
    if (!object.scatter) return null
    return planScatterSpots({
      count: object.scatter.count,
      center: object.scatter.center,
      radius: object.scatter.radius,
      spacing: object.scatter.spacing,
      seed: object.scatter.seed ?? `${object.model}:${object.scatter.center?.join(',') ?? '0,0'}:${object.scatter.radius ?? 50}`,
    })
  }), [objects])
  return (
    <group {...props}>
      <OpenPlains size={config.ground?.size} texture={config.ground?.texture} />
      {objects.flatMap((object, index) => {
        if (objectOverrides?.[index]?.hidden) return []
        if (!object.scatter) {
          return (
            <WorldObject
              key={`${object.model}-${index}`}
              config={object}
              defaultZone={index}
              spawnZones={spawnZones}
              flatGround
            />
          )
        }
        return (scatterPlans[index] ?? []).map((spot, copy) => (
          <WorldObject
            key={`${object.model}-${index}-${copy}`}
            config={object}
            defaultZone={index}
            spawnZones={spawnZones}
            scatterSpot={spot}
            flatGround
          />
        ))
      })}
    </group>
  )
}

export function World({ config, objectOverrides, ...props }: ThreeElements['group'] & { config: WorldConfig } & ObjectOverridesProp) {
  if (config.mode === 'open') {
    return <OpenWorld config={config} objectOverrides={objectOverrides} {...props} />
  }
  return <PresetWorld config={config} objectOverrides={objectOverrides} {...props} />
}
