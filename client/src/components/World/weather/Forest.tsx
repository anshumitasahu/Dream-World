import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getForestSfx } from '../sfx/sfxRegistry'
import { useAmbientSfx } from '../sfx/useAmbientSfx'
import type { TimeOfDay } from './weatherRegistry'

const LEAF_COUNT = 220
const AREA = 60
const HEIGHT = 26
const LEAF_COLORS = ['#6b8f3a', '#8a9a4a', '#a8763c', '#5f7d33']

function buildLeaves(count: number) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const speeds = new Float32Array(count)
  const sway = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * AREA
    positions[i * 3 + 1] = Math.random() * HEIGHT
    positions[i * 3 + 2] = (Math.random() - 0.5) * AREA
    speeds[i] = 0.5 + Math.random() * 0.9
    sway[i] = Math.random() * Math.PI * 2
    const c = new THREE.Color(LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)])
    colors.set([c.r, c.g, c.b], i * 3)
  }
  return { positions, colors, speeds, sway }
}

export default function Forest({ time }: { time: TimeOfDay }) {
  useAmbientSfx(getForestSfx(time), time === 'night' ? 0.25 : 0.15)

  const { positions, colors, speeds, sway } = useMemo(() => buildLeaves(LEAF_COUNT), [])
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [positions, colors])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state, delta) => {
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const step = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const px = state.camera.position.x
    const pz = state.camera.position.z
    for (let i = 0; i < LEAF_COUNT; i++) {
      const o = i * 3
      let y = arr[o + 1] - speeds[i] * step
      arr[o] += Math.sin(t * 0.8 + sway[i]) * 0.8 * step
      arr[o + 2] += Math.cos(t * 0.6 + sway[i]) * 0.5 * step
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
        vertexColors
        size={0.3}
        sizeAttenuation
        transparent
        opacity={time === 'night' ? 0.6 : 0.85}
        depthWrite={false}
      />
    </points>
  )
}
