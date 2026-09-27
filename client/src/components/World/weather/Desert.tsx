import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getWindSfx } from '../sfx/sfxRegistry'
import { useAmbientSfx } from '../sfx/useAmbientSfx'

const SAND_COUNT = 420
const AREA = 70
const HEIGHT = 22
const STREAK = 1.1
const DRIFT = 26

function buildSand(count: number) {
  const positions = new Float32Array(count * 6)
  const speeds = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * AREA
    const y = Math.random() * HEIGHT
    const z = (Math.random() - 0.5) * AREA
    positions.set([x, y, z, x - STREAK, y + 0.14 * STREAK, z], i * 6)
    speeds[i] = DRIFT * (0.7 + Math.random() * 0.7)
  }
  return { positions, speeds }
}

export default function Desert() {
  useAmbientSfx(getWindSfx('desert'), 0.35)

  const { positions, speeds } = useMemo(() => buildSand(SAND_COUNT), [])
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
    const px = state.camera.position.x
    const pz = state.camera.position.z
    for (let i = 0; i < SAND_COUNT; i++) {
      const o = i * 6
      let x = arr[o] + speeds[i] * step
      let y = arr[o + 1] - 0.6 * step
      if (x - px > AREA / 2) {
        x = px - AREA / 2 + Math.random() * 2
        y = Math.random() * HEIGHT
        arr[o + 2] = pz + (Math.random() - 0.5) * AREA
      }
      if (y < 0) y = HEIGHT
      arr[o] = x
      arr[o + 1] = y
      arr[o + 3] = x - STREAK
      arr[o + 4] = y + 0.14 * STREAK
      arr[o + 5] = arr[o + 2]
    }
    attr.needsUpdate = true
  })

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial color="#c2a06a" transparent opacity={0.5} />
    </lineSegments>
  )
}
