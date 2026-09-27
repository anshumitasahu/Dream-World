import { useEffect, useRef } from 'react'
import { useMapExploreStore } from '../../../store/mapExploreStore'
import { usePlayerStore } from '../../../store/playerStore'
import SpecialCircularFrame from './SpecialCircularFrame'

/** Frame width (w-60) and viewBox radius, used to size the circular backing store. */
const FRAME_PX = 240
const FRAME_VIEW_W = 163
const CIRCLE_R = 48
/** Circular viewport diameter in CSS pixels. */
const MAP_PX = Math.round((CIRCLE_R * 2 * FRAME_PX) / FRAME_VIEW_W)

/** Resolution of the cached whole-world coverage texture. */
const WORLD_PX = 512
/** Extra ground shown past the reveal radius, so a fog ring frames the disc. */
const VIEW_RADIUS_FACTOR = 1.2

const COLOR_UNEXPLORED = 'rgba(8, 5, 16, 0.92)'
const COLOR_EXPLORED = 'rgba(124, 58, 237, 0.5)'
const COLOR_GRID = 'rgba(255, 255, 255, 0.06)'
const COLOR_MARKER = '#c084fc'
const COLOR_PLAYER = '#f8fafc'

/** Size the backing store for the device pixel ratio while drawing in CSS pixels. */
function prepareCanvas(canvas: HTMLCanvasElement, size: number, dpr: number) {
  canvas.width = Math.round(size * dpr)
  canvas.height = Math.round(size * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

/**
 * Rotating minimap for the in-game HUD, set inside `SpecialCircularFrame` to
 * match the game UI. The disc is centred on the player and turns with them, so
 * the direction being faced always points up — the map spins like a compass
 * rose instead of there being a separate needle, and a fixed arrow marks the
 * player at the centre. It zooms to the reveal radius rather than showing the
 * whole world, and moves with the player. Drawing runs on its own animation
 * frame and reads the stores imperatively, so neither the player's per-frame
 * position nor the map repaints re-render React.
 */
export default function MiniMap() {
  const active = useMapExploreStore((state) => state.active)
  const percent = useMapExploreStore((state) => state.percent)
  const mapRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const mapCanvas = mapRef.current
    if (!mapCanvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mapCtx = prepareCanvas(mapCanvas, MAP_PX, dpr)
    if (!mapCtx) return

    // Repainting the whole grid every frame is wasteful, so cache the coverage
    // in an offscreen canvas and only rebuild it when a cell is revealed.
    const coverage = document.createElement('canvas')
    coverage.width = WORLD_PX
    coverage.height = WORLD_PX
    const coverageCtx = coverage.getContext('2d')
    if (!coverageCtx) return
    let cachedRevision = -1

    const rebuildCoverage = (divisions: number, visited: Uint8Array) => {
      const cellPx = WORLD_PX / divisions
      coverageCtx.clearRect(0, 0, WORLD_PX, WORLD_PX)
      coverageCtx.fillStyle = COLOR_UNEXPLORED
      coverageCtx.fillRect(0, 0, WORLD_PX, WORLD_PX)
      coverageCtx.fillStyle = COLOR_EXPLORED
      for (let row = 0; row < divisions; row++) {
        const y = row * cellPx
        for (let col = 0; col < divisions; col++) {
          if (visited[row * divisions + col]) coverageCtx.fillRect(col * cellPx, y, cellPx + 0.5, cellPx + 0.5)
        }
      }
      coverageCtx.strokeStyle = COLOR_GRID
      coverageCtx.lineWidth = 1
      for (let i = 1; i < divisions; i++) {
        const p = i * cellPx
        coverageCtx.beginPath()
        coverageCtx.moveTo(p, 0)
        coverageCtx.lineTo(p, WORLD_PX)
        coverageCtx.stroke()
        coverageCtx.beginPath()
        coverageCtx.moveTo(0, p)
        coverageCtx.lineTo(WORLD_PX, p)
        coverageCtx.stroke()
      }
    }

    const drawMap = () => {
      const state = useMapExploreStore.getState()
      const { size, divisions, visited, markers, revealRadiusMeters, revision } = state
      if (size <= 0) return

      if (cachedRevision !== revision) {
        rebuildCoverage(divisions, visited)
        cachedRevision = revision
      }

      const { position, heading } = usePlayerStore.getState()
      // Zoom: the disc spans the reveal radius (plus a fog ring) rather than the
      // whole world, so nearby ground fills the frame.
      const scale = MAP_PX / 2 / (revealRadiusMeters * VIEW_RADIUS_FACTOR)

      mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      mapCtx.clearRect(0, 0, MAP_PX, MAP_PX)
      mapCtx.fillStyle = COLOR_UNEXPLORED
      mapCtx.fillRect(0, 0, MAP_PX, MAP_PX)

      // World space: +x east, +z south. Rotating by the player's heading and
      // recentring on their position pins the faced direction to the top.
      mapCtx.save()
      mapCtx.translate(MAP_PX / 2, MAP_PX / 2)
      mapCtx.rotate(heading)
      mapCtx.scale(scale, scale)
      mapCtx.translate(-position.x, -position.z)
      mapCtx.drawImage(coverage, -size / 2, -size / 2, size, size)

      // Config object positions as purple dots, kept a constant size on screen.
      mapCtx.fillStyle = COLOR_MARKER
      const markerRadius = 2.6 / scale
      for (const marker of markers) {
        mapCtx.beginPath()
        mapCtx.arc(marker.x, marker.z, markerRadius, 0, Math.PI * 2)
        mapCtx.fill()
      }
      mapCtx.restore()

      // Player arrow, fixed at the centre and always pointing up.
      mapCtx.save()
      mapCtx.translate(MAP_PX / 2, MAP_PX / 2)
      mapCtx.beginPath()
      mapCtx.moveTo(0, -7)
      mapCtx.lineTo(5, 5)
      mapCtx.lineTo(0, 2)
      mapCtx.lineTo(-5, 5)
      mapCtx.closePath()
      mapCtx.fillStyle = COLOR_PLAYER
      mapCtx.fill()
      mapCtx.restore()
    }

    let frame = requestAnimationFrame(function render() {
      drawMap()
      frame = requestAnimationFrame(render)
    })
    return () => cancelAnimationFrame(frame)
  }, [active])

  if (!active) return null

  return (
    <div className='relative'>
      <SpecialCircularFrame className='w-60'>
        <canvas ref={mapRef} className='block h-full w-full' />
      </SpecialCircularFrame>
      <div className='rounded-lg border border-white/10 bg-black/45 px-2.5 py-1 font-mono text-[10.5px] 
      font-semibold uppercase tracking-[0.22em] text-white/60 shadow-2xl
       backdrop-blur-sm absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-2'>
        <span className='tabular-nums text-white'>{percent}%</span>
      </div>
    </div>
  )
}
