import type { MapMarker } from '../../store/mapExploreStore'
import type { WorldConfig } from './worldTypes'

/**
 * Config object positions the minimap pins as purple dots. Explicit placements
 * are used directly; scatter clusters have no fixed per-copy position, so their
 * disk center stands in for the cluster. Objects placed by zone have no known
 * position until runtime, so they are skipped.
 */
export function collectMapMarkers(config: WorldConfig): MapMarker[] {
  const markers: MapMarker[] = []
  for (const object of config.objects) {
    if (object.position) {
      markers.push({ x: object.position[0], z: object.position[2] })
    } else if (object.scatter) {
      const [x, z] = object.scatter.center ?? [0, 0]
      markers.push({ x, z })
    }
  }
  return markers
}
