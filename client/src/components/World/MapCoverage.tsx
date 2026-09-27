import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { usePlayerHudStore } from '../../store/playerHudStore'
import { useMapExploreStore } from '../../store/mapExploreStore'
import { usePlayerStore } from '../../store/playerStore'
import { collectMapMarkers } from './mapMarkers'
import type { WorldConfig } from './worldTypes'

const OPEN_GROUND_SIZE = 2000

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