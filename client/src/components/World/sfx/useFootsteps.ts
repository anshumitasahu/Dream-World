import { useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { getFootstepSfx } from './sfxRegistry'
import type { TextureKind } from '../texture/textureRegistry'

const MIN_SPEED_MPS = 0.5
const WALK_VOLUME = 1
const RUN_VOLUME = 1
const RUN_RATE = 1.2

interface FootstepState {
  moving: boolean
  grounded: boolean
  running: boolean
  speed: number
}

/**
 * The walk clips are multi-second recordings of continuous stepping, not
 * single-step one-shots — so this plays one looped voice gated on movement
 * (start on move, stop on stop) instead of a play() per stride, which would
 * stack overlapping voices that pile up double/triple/quadruple.
 */
export function useFootsteps(texture: TextureKind = 'default') {
  const howlRef = useRef<Howl | null>(null)
  const voiceRef = useRef<number | null>(null)
  const runningRef = useRef(false)

  useEffect(() => {
    const howl = new Howl({ src: [getFootstepSfx(texture)], loop: true, preload: true })
    howlRef.current = howl
    voiceRef.current = null
    return () => {
      howl.stop()
      howl.unload()
      howlRef.current = null
    }
  }, [texture])

  const stepRef = useRef((_delta: number, state: FootstepState) => {
    const howl = howlRef.current
    if (!howl) return
    const active = state.moving && state.grounded && state.speed >= MIN_SPEED_MPS
    if (!active) {
      if (voiceRef.current !== null) {
        howl.stop()
        voiceRef.current = null
      }
      return
    }
    if (voiceRef.current === null) {
      const id = howl.play()
      voiceRef.current = id
      runningRef.current = state.running
      howl.volume(state.running ? RUN_VOLUME : WALK_VOLUME, id)
      howl.rate(state.running ? RUN_RATE : 1, id)
    } else if (state.running !== runningRef.current) {
      runningRef.current = state.running
      howl.volume(state.running ? RUN_VOLUME : WALK_VOLUME, voiceRef.current)
      howl.rate(state.running ? RUN_RATE : 1, voiceRef.current)
    }
  })

  return { playStep: stepRef.current }
}
