import { Suspense, useEffect, useMemo, useRef } from 'react'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Ecctrl, type EcctrlHandle } from 'ecctrl'

import { useCameraShakeStore } from '../../store/cameraShakeStore'
import { usePlayerHudStore } from '../../store/playerHudStore'
import { usePlayerLoadoutStore } from '../../store/playerLoadoutStore'
import { usePlayerStore } from '../../store/playerStore'
import { getPlayerSpawnPosition } from '../World/mapRegistry'
import type { WorldConfig } from '../World/worldTypes'
import type { TextureKind } from '../World/texture/textureRegistry'
import { useFootsteps } from '../World/sfx/useFootsteps'
import CharacterModel from '../Rendering/models/character/CharacterModel'
import { Model as CharacterWithGun } from '../Rendering/models/character/CharacterWithGun'

const MOUSE_SENSITIVITY = 0.0025
const MAX_LOOK_PITCH = 1.55
const EYE_HEIGHT_ABOVE_CENTER = 0.62
const WALK_SPEED = 4
const RUN_SPEED = 8
const CAPSULE_RADIUS = 0.5
const CAPSULE_HALF_HEIGHT = 0.5

interface EcctrlWrapperProps {
  mapId: string
  config?: WorldConfig
}

export default function EcctrlWrapper({ mapId, config }: EcctrlWrapperProps) {
  const ecctrlRef = useRef<EcctrlHandle>(null)
  const viewmodelRef = useRef<THREE.Group>(null)
  const activeCharacter = usePlayerLoadoutStore((s) => s.activeCharacter)

  const texture: TextureKind =
    config?.mode === 'open' ? (config.ground?.texture ?? 'default') : 'default'
  const { playStep } = useFootsteps(texture)

  const spawnPosition = useMemo(
    () => getPlayerSpawnPosition(mapId, config),
    [mapId, config],
  )

  useEffect(() => {
    usePlayerStore.getState().setPlayerPosition(
      new THREE.Vector3(...spawnPosition),
    )
  }, [spawnPosition])

  const pressedKeysRef = useRef<Set<string>>(new Set())

  const lookYawRef = useRef(0)
  const lookPitchRef = useRef(0)
  const lookEulerRef = useRef(
    new THREE.Euler(0, 0, 0, 'YXZ'),
  )

  const renderer = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  // --------------------------------
  // Keyboard
  // --------------------------------

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      pressedKeysRef.current.add(event.code)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeysRef.current.delete(event.code)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // --------------------------------
  // Mouse / pointer lock
  // --------------------------------

  useEffect(() => {
    const canvas = renderer.domElement

    const handlePointerLockChange = () => {
      usePlayerHudStore.getState().setPlayerHud({
        isPointerLocked: document.pointerLockElement === canvas,
      })
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return

      lookYawRef.current -=
        event.movementX * MOUSE_SENSITIVITY

      const nextPitch =
        lookPitchRef.current -
        event.movementY * MOUSE_SENSITIVITY

      lookPitchRef.current = Math.min(
        MAX_LOOK_PITCH,
        Math.max(-MAX_LOOK_PITCH, nextPitch),
      )
    }

    document.addEventListener(
      'pointerlockchange',
      handlePointerLockChange,
    )

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener(
        'pointerlockchange',
        handlePointerLockChange,
      )

      document.removeEventListener(
        'mousemove',
        handleMouseMove,
      )
    }
  }, [renderer])

  // --------------------------------
  // Game loop
  // --------------------------------

  useFrame((state, delta) => {
    const controller = ecctrlRef.current

    if (!controller) return

    const keys = pressedKeysRef.current

    // Once the run is over (alarm rang) the player wakes up: ignore input and
    // drop any keys still held so the body coasts to a stop.
    const active = !usePlayerHudStore.getState().isGameOver

    controller.setMovement({
      forward:
        active && (keys.has('KeyW') || keys.has('ArrowUp')),

      backward:
        active && (keys.has('KeyS') || keys.has('ArrowDown')),

      leftward:
        active && (keys.has('KeyA') || keys.has('ArrowLeft')),

      rightward:
        active && (keys.has('KeyD') || keys.has('ArrowRight')),

      run:
        active && (keys.has('ShiftLeft') || keys.has('ShiftRight')),

      jump: active && keys.has('Space'),
    })

    if (!active) keys.clear()

    const hasInput = keys.has('KeyW') || keys.has('ArrowUp')
      || keys.has('KeyS') || keys.has('ArrowDown')
      || keys.has('KeyA') || keys.has('ArrowLeft')
      || keys.has('KeyD') || keys.has('ArrowRight')

    playStep(delta, {
      moving: active && hasInput,
      grounded: controller.isOnGround,
      running: controller.runActive,
      speed: controller.moveSpeed,
    })

    const bodyPosition = controller.currPos

    // Camera shake: the store only carries the stop time, so we sample the
    // current strength here each frame and rebuild the camera from the physics
    // body every tick (no drift, and the shake ends on its own).
    const shake = useCameraShakeStore.getState()
    let shakeAmount = 0
    if (shake.shakeEndsAt !== null) {
      const remaining = shake.shakeEndsAt - Date.now()
      if (remaining <= 0) {
        shake.stopShake()
      } else {
        // Trauma-style falloff: full strength on the first frame, easing to 0
        // as the stop time approaches.
        const trauma = remaining / shake.shakeDurationMs
        shakeAmount = shake.intensity * trauma * trauma
      }
    }

    // Weapon recoil rides on top of the shake as its own short, upward-biased
    // jolt, so rapid fire doesn't cut a long roar shake short (and vice versa).
    let recoilAmount = 0
    if (shake.recoilEndsAt !== null) {
      const remaining = shake.recoilEndsAt - Date.now()
      if (remaining <= 0) {
        shake.stopRecoil()
      } else {
        const trauma = remaining / shake.recoilDurationMs
        recoilAmount = shake.recoilIntensity * trauma * trauma
      }
    }

    const elapsed = state.clock.getElapsedTime()
    const shakeX = shakeAmount === 0 ? 0 : (Math.sin(elapsed * 39.7) + Math.sin(elapsed * 17.3)) * 0.5 * shakeAmount
    const shakeY = shakeAmount === 0 ? 0 : (Math.sin(elapsed * 47.1 + 1.3) + Math.sin(elapsed * 23.7 + 0.5)) * 0.5 * shakeAmount
    const recoilX = recoilAmount === 0 ? 0 : Math.sin(elapsed * 83.1) * 0.4 * recoilAmount
    const recoilY = recoilAmount === 0 ? 0 : (0.7 + 0.3 * Math.sin(elapsed * 67.9)) * recoilAmount

    state.camera.position.set(
      bodyPosition.x + shakeX + recoilX,
      bodyPosition.y + EYE_HEIGHT_ABOVE_CENTER + shakeY + recoilY,
      bodyPosition.z,
    )

    const lookEuler = lookEulerRef.current
    lookEuler.set(
      lookPitchRef.current,
      lookYawRef.current,
      // A touch of roll so the shake reads as a rumble, not just a bob.
      shakeX * 0.4 + recoilX * 0.4,
    )
    state.camera.quaternion.setFromEuler(lookEuler)

    // The armed viewmodel is a world-space rig snapped onto the camera every
    // tick: parenting it to the capsule would leave the barrel tracking the
    // body instead of the crosshair, and doing it here (the same tick that
    // places the camera) keeps it locked with no frame of lag. The camera has
    // no parent, so its local transform is already the world transform.
    const viewmodel = viewmodelRef.current
    if (viewmodel) {
      viewmodel.position.copy(state.camera.position)
      viewmodel.quaternion.copy(state.camera.quaternion)
    }

    usePlayerStore.getState().setPlayerPosition(bodyPosition)
    usePlayerStore.getState().setPlayerHeading(lookYawRef.current)
  })

  return (
    <>
      {/* Portalled to the scene root rather than into the capsule so the model
          can be driven straight from the camera above; the scene sits at the
          origin, so the rig's world transform is the camera's. */}
      {activeCharacter === 'armed'
        && createPortal(
          <group ref={viewmodelRef}>
            <Suspense fallback={null}>
              <CharacterWithGun />
            </Suspense>
          </group>,
          scene,
        )}
      <Ecctrl
        ref={ecctrlRef}
        position={spawnPosition}
        capsuleRadius={CAPSULE_RADIUS}
        capsuleHalfHeight={CAPSULE_HALF_HEIGHT}
        maxWalkVel={WALK_SPEED}
        maxRunVel={RUN_SPEED}
        enableToggleRun={true}
        enableCustomGravity={true}
      >
        {activeCharacter === 'unarmed' && <CharacterModel position={[0, 1, 0]} />}
      </Ecctrl>
    </>
  )
}
