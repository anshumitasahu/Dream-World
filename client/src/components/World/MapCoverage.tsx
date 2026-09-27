import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { usePlayerHudStore } from '../../store/playerHudStore'
import { useMapExploreStore } from '../../store/mapExploreStore'
import { usePlayerStore } from '../../store/playerStore'
import { collectMapMarkers } from './mapMarkers'
import type { WorldConfig } from './worldTypes'

/** Fallback edge length when an open config omits `ground.size` (matches OpenPlains). */
const OPEN_GROUND_SIZE = 2000

/**
 * Invisible coverage tracker for open-mode worlds. It configures the exploration
 * grid from the world config (size + object markers), then reveals the cells
 * around the player's ground position every frame. Preset maps have no coverage
 * grid, so this tears the store down and does nothing.
 */
export default function MapCoverage({ config }: { config: WorldConfig }) {
  const isOpen = config.mode === 'open'

  useEffect(() => {
    const store = useMapExploreStore.getState()
    if (config.mode !== 'open') {
      store.reset()
      return
    }
    store.configure({
      size: config.ground?.size ?? OPEN_GROUND_SIZE,
      markers: collectMapMarkers(config),
    })
  }, [config])

  // A run begins when the pointer locks (the alarm starts then too), so clear
  // progress on that edge to keep the explored % scoped to the current run.
  useEffect(() => {
    if (!isOpen) return
    return usePlayerHudStore.subscribe((state, previous) => {
      if (state.isPointerLocked && !previous.isPointerLocked) {
        useMapExploreStore.getState().clearProgress()
      }
    })
  }, [isOpen])

  useFrame(() => {
    if (!isOpen) return
    const { position } = usePlayerStore.getState()
    useMapExploreStore.getState().visit(position.x, position.z)
  })

  return null
}
