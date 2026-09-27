import { Suspense, memo, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import * as THREE from 'three'
import Experience from '../../GameSystem/Experience'
import PlayerHud from '../../GameSystem/PlayerHud'
import DialogueHud from '../Dialogue/DialogueHud'
import MissionHud from '../Mission/MissionHud'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { ThinkingOrb } from 'thinking-orbs'
import type { WorldConfig } from '../../World/worldTypes'
import { WorldLoader } from './WorldLoader'

interface WorldViewportProps {
  world: WorldConfig | null
  loadFailed: boolean
}

// Assets stream in through nested Suspense boundaries (models, textures, the
// armed viewmodel), so the boundary that wraps the experience can't tell when
// the world is actually ready. The three.js LoadingManager can: it counts every
// load regardless of where it sits in the tree. `active` flips true on the
// first load and back to false once the manager drains.
function useWorldAssetsReady(worldKey: string | null) {
  const [readyKey, setReadyKey] = useState<string | null>(null)

  useEffect(() => {
    if (!worldKey) return

    // Readiness is remembered per world key, so a previous world's state can
    // never bleed through and flash the built world + HUD.
    let started = useProgress.getState().active
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      setReadyKey(worldKey)
    }

    const unsubscribe = useProgress.subscribe((state) => {
      if (state.active) started = true
      else if (started) finish()
    })

    // A fully cached world never flips `active`; treat it as ready once the
    // frame has had a chance to mount rather than trapping the loader forever.
    const timeout = setTimeout(() => {
      if (!started) finish()
    }, 600)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [worldKey])

  return readyKey === worldKey
}

export const WorldViewport = memo(function WorldViewport({ world, loadFailed }: WorldViewportProps) {
  const worldKey = useMemo(() => (world ? JSON.stringify(world) : null), [world])
  const assetsReady = useWorldAssetsReady(worldKey)
  const showHud = !!world && assetsReady

  return (
    <div className='relative h-full w-full bg-black'>
      {world ? (
        <>
          <Canvas
            shadows={{ type: THREE.PCFShadowMap }}
            camera={{
              fov: 75,
              near: 0.1,
              far: 1000,
              position: [0, 1, 100],
            }}
          >
            <Suspense fallback={null}>
              <Experience config={world} />
            </Suspense>
          </Canvas>
          {!assetsReady && <WorldLoader />}
        </>
      ) : (
        <div className='flex h-full flex-col items-center justify-center px-6 text-center'>
          {loadFailed ? (
            <>
              <WarningCircleIcon className='h-9 w-9 text-red-300/70' />
              <p className='mt-3 text-sm font-medium text-white'>World failed to load</p>
              <p className='mt-1 text-[12.5px] text-white/40'>Try refreshing or describing the world again.</p>
            </>
          ) : (
            <>
              <ThinkingOrb state='searching' size={64} />
              <p className='mt-4 text-sm font-medium text-white'>Generating your world…</p>
              <p className='mt-1 text-[12.5px] text-white/40'>This usually takes a few seconds.</p>
            </>
          )}
        </div>
      )}
      {showHud && <PlayerHud />}
      {showHud && <DialogueHud />}
      {showHud && <MissionHud />}
    </div>
  )
})
