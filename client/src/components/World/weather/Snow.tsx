import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getWindSfx } from '../sfx/sfxRegistry'
import { useAmbientSfx } from '../sfx/useAmbientSfx'

const FLAKE_COUNT = 500
const AREA = 70
const HEIGHT = 34
const WIND = 1.6

function buildFlakes(count: number) {
  const positions = new Float32Array(count * 3)
  const speeds = new Float32Array(count)
  const sway = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * AREA
    positions[i * 3 + 1] = Math.random() * HEIGHT
    positions[i * 3 + 2] = (Math.random() - 0.5) * AREA
    speeds[i] = 1.2 + Math.random() * 1.6
    sway[i] = Math.random() * Math.PI * 2
  }
  return { positions, speeds, sway }
}

export default function Snow() {
  useAmbientSfx(getWindSfx('winter'), 0.18)

  const { positions, speeds, sway } = useMemo(() => buildFlakes(FLAKE_COUNT), [])
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
    for (let i = 0; i < FLAKE_COUNT; i++) {
      const o = i * 3
      let y = arr[o + 1] - speeds[i] * step
      arr[o] += (WIND + Math.sin(t + sway[i]) * 0.6) * step
      if (y < 0) {
        y = HEIGHT
        arr[o] = px + (Math.random() - 0.5) * AREA
        arr[o + 2] = pz + (Math.random() - 0.5) * AREA
      }
      const dx = arr[o] - px
      if (dx > AREA / 2) arr[o] -= AREA
      else if (dx < -AREA / 2) arr[o] += AREA
      const dz = arr[o + 2] - pz
      if (dz > AREA / 2) arr[o + 2] -= AREA
      else if (dz < -AREA / 2) arr[o + 2] += AREA
      arr[o + 1] = y
    }
    attr.needsUpdate = true
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color="#ffffff"
        size={0.28}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  )
}
