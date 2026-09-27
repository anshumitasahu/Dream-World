import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Howl } from 'howler'
import { getSfx } from '../sfx/sfxRegistry'

const RAIN_COUNT = 300
const AREA = 60
const HEIGHT = 30
const FIRST_STRIKE_MS = 1800

function buildStreaks(count: number) {
  const positions = new Float32Array(count * 6)
  const speeds = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * AREA
    const y = Math.random() * HEIGHT
    const z = (Math.random() - 0.5) * AREA
    positions.set([x, y, z, x, y - 0.7, z], i * 6)
    speeds[i] = 18 + Math.random() * 10
  }
  return { positions, speeds }
}

function flashEnvelope(t: number) {
  if (t < 0) return 0
  if (t < 0.09) return 1
  if (t < 0.16) return 0.08
  if (t < 0.28) return 0.7
  if (t < 0.6) return 0.7 * Math.max(0, 1 - (t - 0.28) / 0.32)
  return 0
}

export default function Rain() {
  const ambientFlashRef = useRef<THREE.AmbientLight>(null)
  const dirFlashRef = useRef<THREE.DirectionalLight>(null)
  const strikeAt = useRef(-100)
  const { positions, speeds } = useMemo(() => buildStreaks(RAIN_COUNT), [])
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useEffect(() => () => geometry.dispose(), [geometry])

  useEffect(() => {
    const rain = new Howl({ src: getSfx('rain'), loop: true, volume: 0.2 })
    rain.play()
    const bolts = getSfx('thunder').map((src) => new Howl({ src: [src], volume: 0.5, preload: true }))
    let cancelled = false
    const pending: Array<ReturnType<typeof setTimeout>> = []
    const strike = () => {
      strikeAt.current = performance.now() / 1000
      const bolt = bolts[Math.floor(Math.random() * bolts.length)]
      pending.push(setTimeout(() => {
        if (!cancelled) bolt?.play()
      }, 250 + Math.random() * 650))
    }
    const schedule = (delay: number) => {
      pending.push(setTimeout(() => {
        if (cancelled) return
        strike()
        schedule(5000 + Math.random() * 7000)
      }, delay))
    }
    schedule(FIRST_STRIKE_MS)
    return () => {
      cancelled = true
      pending.forEach(clearTimeout)
      rain.unload()
      bolts.forEach((bolt) => bolt.unload())
    }
  }, [])

  useFrame((state, delta) => {
    const now = performance.now() / 1000
    const v = flashEnvelope(now - strikeAt.current)
    if (ambientFlashRef.current) ambientFlashRef.current.intensity = v * 4
    if (dirFlashRef.current) dirFlashRef.current.intensity = v * 3

    const attr = geometry.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const step = Math.min(delta, 0.05)
    const px = state.camera.position.x
    const pz = state.camera.position.z
    for (let i = 0; i < RAIN_COUNT; i++) {
      const o = i * 6
      const fall = speeds[i] * step
      let y = arr[o + 1] - fall
      if (y < 0) {
        y = HEIGHT
        arr[o] = px + (Math.random() - 0.5) * AREA
        arr[o + 2] = pz + (Math.random() - 0.5) * AREA
      }
      arr[o + 1] = y
      arr[o + 3] = arr[o]
      arr[o + 4] = y - 0.7
      arr[o + 5] = arr[o + 2]
    }
    attr.needsUpdate = true
  })

  return (
    <group>
      <lineSegments geometry={geometry} frustumCulled={false}>
        <lineBasicMaterial color="#3b495c" transparent opacity={0.4} />
      </lineSegments>
      <ambientLight ref={ambientFlashRef} intensity={0} color="#dfe8ff" />
      <directionalLight ref={dirFlashRef} position={[50, 80, 30]} intensity={0} color="#cdd8ff" />
    </group>
  )
}
