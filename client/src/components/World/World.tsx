import { useMemo } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import { getMapSpawnZones, MAP_REGISTRY } from './mapRegistry';
import { WorldObject } from './WorldObject';
import { planScatterSpots } from './scatter';
import { OpenPlains } from "../ Rendering/map/OpenPlains"
import type { OpenWorldConfig, PresetWorldConfig, SpawnZone, WorldConfig } from './WorldTypes';

export function PresetWorld({ config, ...props }: ThreeElements['group'] & { config: PresetWorldConfig }) {
  const entry = MAP_REGISTRY[config.map];
  const spawnZones = useMemo(() => getMapSpawnZones(config.map), [config.map])
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
      {config.objects.map((object, index) => (
        <WorldObject
          key={`${object.model}-${index}`}
          config={object}
          defaultZone={index}
          spawnZones={spawnZones}
        />
      ))}
    </group>
  )
};
function OpenWorld({ config, ...props }: ThreeElements['group'] & { config: OpenWorldConfig }) {
  const spawnZones: SpawnZone[] = useMemo(() => config.spawnZones ?? [[0, 0, 20]], [config])

  const scatterPlans = useMemo(() => config.objects.map((object) => {
    if (!object.scatter) return null
    return planScatterSpots({
      count: object.scatter.count,
      center: object.scatter.center,
      radius: object.scatter.radius,
      spacing: object.scatter.spacing,
      seed: object.scatter.seed ?? `${object.model}:${object.scatter.center?.join(', ') ?? '0,0'}:${object.scatter.radius ?? 50}`,
    })
  }), [config])

  return (
    <group {...props}>
      <OpenPlains size={config.ground?.size} />
      {config.objects.flatMap((object, index) => {
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

export function World({ config, ...props }: ThreeElements['group'] & { config: WorldConfig }) {
  if (config.mode === 'open') {
    return <OpenWorld config={config} {...props} />
  }
  return <PresetWorld config={config} {...props} />
}