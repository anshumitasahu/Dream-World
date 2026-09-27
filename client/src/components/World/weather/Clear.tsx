import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TimeOfDay } from './weatherRegistry'

const MOTE_COUNT = 90
const AREA = 50
const HEIGHT = 12
const DRIFT = 0.4

function buildMotes(count: number) {
  const positions = new Float32Array(count * 3)
  const phase = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * AREA
    positions[i * 3 + 1] = Math.random() * HEIGHT
    positions[i * 3 + 2] = (Math.random() - 0.5) * AREA
    phase[i] = Math.random() * Math.PI * 2
  }
  return { positions, phase }
}

export default function Clear({ time }: { time: TimeOfDay }) {
  const { positions, phase } = useMemo(() => buildMotes(MOTE_COUNT), [])
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state, delta) => {
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const step = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const px = state.camera.position.x
    const pz = state.camera.position.z
    for (let i = 0; i < MOTE_COUNT; i++) {
      const o = i * 3
      arr[o] += (DRIFT + Math.sin(t * 0.5 + phase[i]) * 0.3) * step
      arr[o + 1] += Math.sin(t * 0.9 + phase[i]) * 0.25 * step
      if (arr[o] - px > AREA / 2) {
        arr[o] = px - AREA / 2
        arr[o + 1] = Math.random() * HEIGHT
        arr[o + 2] = pz + (Math.random() - 0.5) * AREA
      }
      const dz = arr[o + 2] - pz
      if (dz > AREA / 2) arr[o + 2] -= AREA
      else if (dz < -AREA / 2) arr[o + 2] += AREA
    }
    attr.needsUpdate = true
  })

  if (time !== 'day') return null

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color="#fff6d8"
        size={0.14}
        sizeAttenuation
        transparent
        opacity={0.25}
        depthWrite={false}
      />
    </points>
  )
}
