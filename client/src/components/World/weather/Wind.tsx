import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getWindSfx } from '../sfx/sfxRegistry'
import { useAmbientSfx } from '../sfx/useAmbientSfx'

const MOTE_COUNT = 160
const AREA = 60
const HEIGHT = 18
const DRIFT = 5

function buildMotes(count: number) {
  const positions = new Float32Array(count * 3)
  const phase = new Float32Array(count)
  const speeds = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * AREA
    positions[i * 3 + 1] = Math.random() * HEIGHT
    positions[i * 3 + 2] = (Math.random() - 0.5) * AREA
    phase[i] = Math.random() * Math.PI * 2
    speeds[i] = DRIFT * (0.6 + Math.random() * 0.8)
  }
  return { positions, phase, speeds }
}

export default function Wind() {
  useAmbientSfx(getWindSfx('desert'), 0.4)

  const { positions, phase, speeds } = useMemo(() => buildMotes(MOTE_COUNT), [])
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
      const gust = 1 + 0.6 * Math.sin(t * 0.6 + phase[i])
      arr[o] += speeds[i] * gust * step
      arr[o + 1] += Math.sin(t * 1.3 + phase[i]) * 0.4 * step
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

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color="#d8dce6"
        size={0.18}
        sizeAttenuation
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  )
}
