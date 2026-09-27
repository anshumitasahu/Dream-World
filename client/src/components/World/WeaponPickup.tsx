import { Suspense, useRef } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import { usePlayerStore } from '../../store/playerStore'
import { usePlayerLoadoutStore } from '../../store/playerLoadoutStore'
import { Model as M4A1Gun } from '../Rendering/models/weapon/M4A1Gun'

/** How close (meters, ground plane) the player must get before the weapon is taken. */
const PICKUP_RADIUS = 2.5
/** Resting height of the floating weapon above its placement point */
const HOVER_HEIGHT = 0.6
const BOB_HEIGHT = 0.08
const BOB_SPEED = 2
const SPIN_SPEED = 1.2

/**
 * World weapon pickup. Renders the M4A1 floating at its placement point; once
 * the player steps inside PICKUP_RADIUS it equips the armed character and
 * renders nothing, so a taken weapon stops costing a draw call entirely.
 */
export function WeaponPickup(props: ThreeElements['group']) {
  const group = useRef<THREE.Group>(null)
  const worldPosition = useRef(new THREE.Vector3())
  const hasWorldPosition = useRef(false)
  const activeCharacter = usePlayerLoadoutStore((state) => state.activeCharacter)

  useFrame((state) => {
    const weapon = group.current
    if (!weapon) return

    // The frame is placed by WorldObject, so world x/z are only known after the
    // first matrix update — read them once and reuse them.
    if (!hasWorldPosition.current) {
      weapon.getWorldPosition(worldPosition.current)
      hasWorldPosition.current = true
    }

    const elapsed = state.clock.getElapsedTime()
    weapon.position.y = HOVER_HEIGHT + Math.sin(elapsed * BOB_SPEED) * BOB_HEIGHT
    weapon.rotation.y = elapsed * SPIN_SPEED

    const player = usePlayerStore.getState().position
    const dx = player.x - worldPosition.current.x
    const dz = player.z - worldPosition.current.z
    if (dx * dx + dz * dz <= PICKUP_RADIUS * PICKUP_RADIUS) {
      usePlayerLoadoutStore.getState().equipWeapon()
    }
  })

  if (activeCharacter === 'armed') return null

  return (
    <group ref={group} {...props}>
      {/* Local boundary: the rifle streaming in must not blank the whole world
          through the Suspense boundary that wraps the experience. */}
      <Suspense fallback={null}>
        <M4A1Gun />
      </Suspense>
    </group>
  )
}
