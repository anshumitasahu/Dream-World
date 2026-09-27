import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMissionStore } from '../../store/missionStore'
import { usePlayerStore } from '../../store/playerStore'
import type { MissionConfig } from './worldTypes'

const DEBUG_RING_COLOR = '#facc15'
const DEBUG_RING_THICKNESS_RATIO = 0.015
const DEBUG_RING_MIN_THICKNESS = 0.25
const DEBUG_RING_MAX_THICKNESS = 2
/** Keeps the debug ring from z-fighting with the terrain */
const GROUND_LIFT = 0.06

interface TriggerZone {
  id: string
  x: number
  z: number
  radius: number
}

interface MissionZonesProps {
  missions: MissionConfig[]
  /** Force the debug rings on/off. Defaults to the `?missionDebug=1` URL param. */
  debug?: boolean
}

function isMissionDebugEnabled(): boolean {
  return new URLSearchParams(window.location.search).get('missionDebug') === '1'
}

/**
 * Invisible mission triggers. Each frame the player's ground position is checked
 * against every mission zone and the zone is completed on entry. Nothing renders
 * by default — pass `debug` (or open the world with `?missionDebug=1`) to draw
 * each zone as a flat yellow ring and verify its placement.
 */
export default function MissionZones({ missions, debug }: MissionZonesProps) {
  const showDebugRings = debug ?? isMissionDebugEnabled()

  const zones = useMemo<TriggerZone[]>(
    () =>
      missions.map((mission) => ({
        id: mission.id,
        x: mission.zone.position[0],
        z: mission.zone.position[2],
        radius: mission.zone.radius,
      })),
    [missions],
  )

  useFrame(() => {
    const player = usePlayerStore.getState().position
    const { completeMission } = useMissionStore.getState()
    for (const zone of zones) {
      if (Math.hypot(player.x - zone.x, player.z - zone.z) <= zone.radius) {
        completeMission(zone.id)
      }
    }
  })

  if (!showDebugRings) return null

  return (
    <group>
      {zones.map((zone) => {
        const thickness = THREE.MathUtils.clamp(
          zone.radius * DEBUG_RING_THICKNESS_RATIO,
          DEBUG_RING_MIN_THICKNESS,
          DEBUG_RING_MAX_THICKNESS,
        )
        return (
          <mesh key={zone.id} position={[zone.x, GROUND_LIFT, zone.z]} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[Math.max(zone.radius - thickness, 0.01), zone.radius, 96]} />
            <meshBasicMaterial
              color={DEBUG_RING_COLOR}
              transparent
              opacity={0.9}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}
