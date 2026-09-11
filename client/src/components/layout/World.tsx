import type { ThreeElements } from '@react-three/fiber'
import { MAP_REGISTRY } from './mapRegistry'
import { WorldObject } from './WorldObject'
import type { WorldConfig } from './WorldTypes'

export function World({ config, ...props }: ThreeElements['group'] & { config: WorldConfig }) {
  const entry = MAP_REGISTRY[config.map]
  if (!entry) {
    console.warn(`[World] Unknown map "${config.map}". Available maps: ${Object.keys(MAP_REGISTRY).join(', ')}`)
    return null
  }
  const MapComponent = entry.component
  return (
    <group {...props}>
      <MapComponent />
      {config.objects.map((object, index) => (
        <WorldObject
          key={`${object.model}-${index}`}
          config={object}
          defaultZone={index}
          spawnZones={entry.spawnZones}
        />
      ))}
    </group>
  )
}