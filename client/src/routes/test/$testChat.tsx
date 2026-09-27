import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Grid, OrbitControls, useTexture } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import { useChat } from '../../hooks/useChat'
import { parseWorld } from '../../components/ui/Chat'
import Lights from '../../components/Rendering/Lights'
import { World, type DebugObjectOverride } from '../../components/World/World'
import MissionZones from '../../components/World/MissionZones'
import MapCoverage from '../../components/World/MapCoverage'
import Fog from '../../components/World/weather/Fog'
import Weather from '../../components/World/weather/Weather'
import { getWeatherTheme } from '../../components/World/weather/weatherRegistry'
import { groundTexturePaths } from '../../components/Rendering/map/OpenPlains'
import EcctrlWrapper from '../../components/GameSystem/EcctrlWrapper'
import PlayerHud from '../../components/GameSystem/PlayerHud'
import DialogueHud from '../../components/ui/Dialogue/DialogueHud'
import MissionHud from '../../components/ui/Mission/MissionHud'
import { useMissionStore } from '../../store/missionStore'
import { usePlayerLoadoutStore } from '../../store/playerLoadoutStore'
import type { WorldConfig } from '../../components/World/worldTypes'

export const Route = createFileRoute('/test/$testChat')({
  component: RouteComponent,
})

type CamMode = 'play' | 'orbit' | 'top'

const CAMERA_PRESETS: Record<CamMode, { fov: number; position: [number, number, number] }> = {
  play: { fov: 75, position: [0, 1, 100] },
  orbit: { fov: 55, position: [30, 20, 30] },
  top: { fov: 50, position: [0, 180, 0.01] },
}

const GRAVITY_PRESETS: { label: string; value: [number, number, number] }[] = [
  { label: 'Zero (actual)', value: [0, 0, 0] },
  { label: 'Earth', value: [0, -9.81, 0] },
  { label: 'Moon', value: [0, -1.62, 0] },
  { label: 'Jupiter', value: [0, -24.79, 0] },
]

/**
 * Dedicated debug copy of the production world pipeline (see
 * GameSystem/Experience). Same World + missions + player + weather, but every
 * layer is toggleable from the sidebar so a generated chat world can be
 * inspected outside the real /chat/$chatid view.
 */
function DebugExperience({
  config,
  gravity,
  physicsPaused,
  physicsDebug,
  missionDebug,
  showGrid,
  flatLights,
  showFog,
  showVignette,
  objectOverrides,
  camMode,
}: {
  config: WorldConfig
  gravity: [number, number, number]
  physicsPaused: boolean
  physicsDebug: boolean
  missionDebug: boolean
  showGrid: boolean
  flatLights: boolean
  showFog: boolean
  showVignette: boolean
  objectOverrides: Record<number, DebugObjectOverride>
  camMode: CamMode
}) {
  const mapId = config.mode === 'open' ? 'openPlains' : config.map
  const environment = config.mode === 'open' ? config.environment : undefined

  useTexture.preload(groundTexturePaths(config.mode === 'open' ? config.ground?.texture : undefined))
  const weather = environment?.weather ?? 'clear'
  const time = environment?.time ?? 'day'
  const theme = useMemo(
    () => getWeatherTheme(weather, time, environment?.fogColor),
    [weather, time, environment?.fogColor],
  )

  const [physicsActive, setPhysicsActive] = useState(false)
  useEffect(() => {
    setPhysicsActive(false)
    const timeout = setTimeout(() => setPhysicsActive(true), 1000)
    return () => clearTimeout(timeout)
  }, [config])

  const missions = useMemo(() => config.missions ?? [], [config])

  useEffect(() => {
    useMissionStore.getState().setMissions(missions)
  }, [missions])

  useEffect(() => {
    usePlayerLoadoutStore.getState().resetLoadout()
  }, [config])

  return (
    <>
      {flatLights ? (
        <>
          <color attach="background" args={['#bcc0fe']} />
          {showFog && <fog attach="fog" args={['#bcc0fe', 0, 160]} />}
        </>
      ) : (
        <>
          {showFog ? (
            <Fog sky={theme.sky} fog={theme.fog} near={theme.fogNear} far={theme.fogFar} />
          ) : (
            <color attach="background" args={[theme.sky]} />
          )}
          <Weather weather={weather} time={time} />
        </>
      )}
      {showVignette && (
        <EffectComposer multisampling={0}>
          <Vignette offset={0.25} darkness={0.8} />
        </EffectComposer>
      )}
      {flatLights ? (
        <Lights />
      ) : (
        <Lights
          sunIntensity={theme.sunIntensity}
          sunColor={theme.sunColor}
          sunPosition={theme.sunPosition}
          hemiIntensity={theme.hemiIntensity}
          hemiSky={theme.hemiSky}
          hemiGround={theme.hemiGround}
        />
      )}
      <Physics timeStep="vary" gravity={gravity} paused={physicsPaused || !physicsActive} debug={physicsDebug}>
        <World config={config} objectOverrides={objectOverrides} />
        <MissionZones missions={missions} debug={missionDebug} />
        {camMode === 'play' && <EcctrlWrapper mapId={mapId} config={config} />}
        <MapCoverage config={config} />
        {showGrid && (
          <Grid
            position={[0, 0.02, 0]}
            args={[400, 400]}
            cellSize={1}
            cellThickness={0.6}
            cellColor="#6f7f8f"
            sectionSize={10}
            sectionThickness={1.2}
            sectionColor="#4a5a6a"
            fadeDistance={180}
            fadeStrength={2}
            infiniteGrid
          />
        )}
      </Physics>
    </>
  )
}

/** FPS player that unmounts cleanly when a debug camera takes over is handled
 * inline in DebugExperience via the `camMode` prop. */
const inputCls =
  'w-full rounded bg-neutral-800 px-2 py-1 text-sm text-neutral-100 outline-none focus:ring-1 focus:ring-sky-500'
const labelCls = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-400'

function RouteComponent() {
  const { testChat: chatId } = Route.useParams()
  const chatQuery = useChat(chatId)
  const [camMode, setCamMode] = useState<CamMode>('play')
  const [turnIndex, setTurnIndex] = useState<number | null>(null)
  const [physicsDebug, setPhysicsDebug] = useState(false)
  const [physicsPaused, setPhysicsPaused] = useState(false)
  const [gravity, setGravity] = useState<[number, number, number]>([0, 0, 0])
  const [showGrid, setShowGrid] = useState(false)
  const [missionDebug, setMissionDebug] = useState(true)
  const [showHud, setShowHud] = useState(true)
  const [flatLights, setFlatLights] = useState(false)
  const [showFog, setShowFog] = useState(true)
  const [showVignette, setShowVignette] = useState(true)
  const [objectOverrides, setObjectOverrides] = useState<Record<number, DebugObjectOverride>>({})
  const [pointerLocked, setPointerLocked] = useState(false)
  const canvasWrapRef = useRef<HTMLDivElement>(null)

  const histories = chatQuery.data?.userChatHistories ?? []

  useEffect(() => {
    if (histories.length === 0) {
      setTurnIndex(null)
      return
    }
    setTurnIndex((prev) => (prev === null || prev >= histories.length ? histories.length - 1 : prev))
  }, [histories.length])

  const activeTurn = turnIndex !== null ? histories[turnIndex] ?? null : null
  const world = useMemo(() => parseWorld(activeTurn?.response ?? null), [activeTurn])
  const worldKey = activeTurn?.id ?? 'none'

  useEffect(() => {
    setObjectOverrides({})
  }, [worldKey])

  useEffect(() => {
    const canvas = canvasWrapRef.current?.querySelector('canvas')
    if (!canvas) return
    const onChange = () => setPointerLocked(document.pointerLockElement === canvas)
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [world])

  const requestPointerLock = () => {
    const canvas = canvasWrapRef.current?.querySelector('canvas')
    canvas?.requestPointerLock()
  }

  const setGravityAxis = (i: 0 | 1 | 2, v: number) =>
    setGravity((g) => {
      const next: [number, number, number] = [...g]
      next[i] = Number.isFinite(v) ? v : 0
      return next
    })

  const modelNames = useMemo(() => {
    if (!world || !Array.isArray(world.objects)) return []
    return [...new Set(world.objects.map((o) => o.model))]
  }, [world])
  const missionCount = world?.missions?.length ?? 0
  const cam = CAMERA_PRESETS[camMode]
  const visibleObjectCount = world
    ? world.objects.filter((_, i) => !objectOverrides[i]?.hidden).length
    : 0

  const updateObjectOverride = (index: number, patch: Partial<DebugObjectOverride>) =>
    setObjectOverrides((prev) => ({ ...prev, [index]: { ...prev[index], ...patch } }))

  const setObjectAxis = (index: number, i: 0 | 1 | 2, v: number) => {
    const base = world?.objects[index]?.position ?? [0, 0, 0]
    const next: [number, number, number] = [
      objectOverrides[index]?.position?.[0] ?? base[0],
      objectOverrides[index]?.position?.[1] ?? base[1],
      objectOverrides[index]?.position?.[2] ?? base[2],
    ]
    next[i] = Number.isFinite(v) ? v : 0
    updateObjectOverride(index, { position: next })
  }

  const applyScaleToAll = (scale: number) =>
    setObjectOverrides((prev) => {
      const next = { ...prev }
      world?.objects.forEach((_, i) => {
        next[i] = { ...next[i], scale }
      })
      return next
    })

  const setAllHidden = (hidden: boolean) =>
    setObjectOverrides((prev) => {
      const next = { ...prev }
      world?.objects.forEach((_, i) => {
        next[i] = { ...next[i], hidden }
      })
      return next
    })

  return (
    <div className="grid h-screen w-screen grid-cols-[360px_1fr] bg-neutral-950 text-neutral-100">
      <aside className="flex h-full flex-col gap-4 overflow-y-auto border-r border-neutral-800 bg-neutral-900 p-4">
        <div>
          <h1 className="text-lg font-bold">World Debugger</h1>
          <p className="break-all font-mono text-[11px] text-neutral-500">{chatId}</p>
          <div className="mt-2 flex gap-2 text-xs">
            <Link
              to="/chat/$chatid"
              params={{ chatid: chatId }}
              className="rounded bg-neutral-800 px-2 py-1 hover:bg-neutral-700"
            >
              Open real view
            </Link>
            <button
              onClick={() => void chatQuery.refetch()}
              disabled={chatQuery.isFetching}
              className="rounded bg-neutral-800 px-2 py-1 hover:bg-neutral-700 disabled:opacity-50"
            >
              {chatQuery.isFetching ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          {chatQuery.data && (
            <p className="mt-1 truncate text-xs text-neutral-400">{chatQuery.data.title}</p>
          )}
        </div>

        <div>
          <span className={labelCls}>Agent turn {histories.length > 0 ? `(${histories.length})` : ''}</span>
          {histories.length === 0 ? (
            <p className="rounded bg-neutral-800 px-2 py-1.5 text-sm text-neutral-400">
              {chatQuery.isPending ? 'Loading turns…' : 'No turns yet'}
            </p>
          ) : (
            <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
              {histories.map((h, i) => (
                <button
                  key={h.id}
                  onClick={() => setTurnIndex(i)}
                  className={`rounded px-2 py-1 text-left text-xs ${i === turnIndex ? 'bg-sky-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}
                >
                  <span className="font-mono text-neutral-400">#{i + 1}</span>{' '}
                  <span className="truncate">{h.message.slice(0, 60) || '(no message)'}</span>
                </button>
              ))}
            </div>
          )}
          {activeTurn && (
            <p className="mt-1 text-[11px] text-neutral-500">
              {new Date(activeTurn.createdAt).toLocaleString()} · world {world ? 'parsed ✓' : 'missing ✗'}
            </p>
          )}
        </div>

        <div>
          <span className={labelCls}>Camera mode</span>
          <div className="grid grid-cols-3 gap-2">
            {(['play', 'orbit', 'top'] as CamMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setCamMode(m)}
                className={`rounded px-2 py-1.5 text-sm font-semibold ${camMode === m ? 'bg-sky-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}
              >
                {m === 'play' ? 'Play' : m === 'orbit' ? 'Orbit' : 'Top'}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {camMode === 'play'
              ? 'Real FPS player (Ecctrl). Click canvas for pointer lock, WASD to move.'
              : camMode === 'orbit'
                ? 'Free orbit camera. FPS player unmounted.'
                : 'Top-down orthographic-style view for layout checks.'}
          </p>
        </div>

        <div>
          <span className={labelCls}>Physics</span>
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={physicsDebug} onChange={(e) => setPhysicsDebug(e.target.checked)} />
              Debug colliders (rapier)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={physicsPaused} onChange={(e) => setPhysicsPaused(e.target.checked)} />
              Pause physics
            </label>
          </div>
          <div className="mt-2">
            <span className={labelCls}>Gravity (x, y, z)</span>
            <div className="grid grid-cols-3 gap-2">
              {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                <label key={axis} className="text-xs text-neutral-400">
                  {axis}
                  <input
                    type="number" step="any" value={gravity[i]}
                    onChange={(e) => setGravityAxis(i as 0 | 1 | 2, Number(e.target.value))}
                    className={inputCls}
                  />
                </label>
              ))}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {GRAVITY_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setGravity(p.value)}
                  className="rounded bg-neutral-800 px-2 py-0.5 text-xs hover:bg-neutral-700"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <span className={labelCls}>Overlays</span>
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showHud} onChange={(e) => setShowHud(e.target.checked)} />
              HUD (dialogue / missions{camMode === 'play' ? ' / player' : ''})
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={missionDebug} onChange={(e) => setMissionDebug(e.target.checked)} />
              Mission zone rings
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
              Debug grid
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={flatLights} onChange={(e) => setFlatLights(e.target.checked)} />
              Flat debug lighting (ignore weather)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showFog} onChange={(e) => setShowFog(e.target.checked)} />
              Fog
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showVignette} onChange={(e) => setShowVignette(e.target.checked)} />
              Vignette (post-processing)
            </label>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className={labelCls}>Objects ({visibleObjectCount}/{world?.objects.length ?? 0})</span>
            {world && world.objects.length > 0 && (
              <div className="flex gap-1 text-[11px]">
                <button onClick={() => setAllHidden(false)} className="rounded bg-neutral-800 px-2 py-0.5 hover:bg-neutral-700">
                  All on
                </button>
                <button onClick={() => setAllHidden(true)} className="rounded bg-neutral-800 px-2 py-0.5 hover:bg-neutral-700">
                  All off
                </button>
              </div>
            )}
          </div>
          {!world || world.objects.length === 0 ? (
            <p className="rounded bg-neutral-800 px-2 py-1.5 text-sm text-neutral-400">No objects in this world</p>
          ) : (
            <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
              {world.objects.map((object, index) => {
                const override = objectOverrides[index]
                const hidden = override?.hidden ?? false
                const scale = override?.scale ?? object.scale ?? 1
                const pos = override?.position ?? object.position
                return (
                  <details key={`${object.model}-${index}`} className="rounded bg-neutral-800 px-2 py-1.5">
                    <summary className="flex cursor-pointer items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={!hidden}
                        onChange={(e) => updateObjectOverride(index, { hidden: !e.target.checked })}
                        onClick={(e) => e.stopPropagation()}
                        title={hidden ? 'Show object' : 'Hide object'}
                      />
                      <span className="font-mono text-neutral-400">#{index}</span>
                      <span className={`flex-1 truncate font-semibold ${hidden ? 'text-neutral-500 line-through' : ''}`}>
                        {object.model}
                      </span>
                      {object.scatter && <span className="text-[10px] text-neutral-500">×{object.scatter.count}</span>}
                    </summary>
                    <div className="mt-2 flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-[11px] text-neutral-400">
                        Scale
                        <input
                          type="number" step="any" min={0.01} value={scale}
                          onChange={(e) => updateObjectOverride(index, { scale: Math.max(0.01, Number(e.target.value) || 1) })}
                          className={inputCls}
                        />
                      </label>
                      <div>
                        <span className={labelCls}>
                          Position {pos ? `[${pos.map((n) => Number(n).toFixed(1)).join(', ')}]` : object.scatter ? '(scatter center)' : '(spawn zone)'}
                        </span>
                        <div className="grid grid-cols-3 gap-1">
                          {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                            <label key={axis} className="text-[11px] text-neutral-400">
                              {axis}
                              <input
                                type="number" step="any" value={pos?.[i as 0 | 1 | 2] ?? ''}
                                placeholder={object.scatter && i === 1 ? 'n/a' : 'auto'}
                                onChange={(e) => setObjectAxis(index, i as 0 | 1 | 2, Number(e.target.value))}
                                className={inputCls}
                              />
                            </label>
                          ))}
                        </div>
                        {override?.position && (
                          <button
                            onClick={() => updateObjectOverride(index, { position: undefined })}
                            className="mt-1 rounded bg-neutral-700 px-2 py-0.5 text-[11px] hover:bg-neutral-600"
                          >
                            Reset position
                          </button>
                        )}
                      </div>
                      <p className="font-mono text-[10px] leading-relaxed text-neutral-500">
                        zone: {object.zone ?? index} · physics: {object.physics ?? (object.scatter ? 'decor' : 'fixed')}
                        {object.rotationY !== undefined && <> · rotY: {object.rotationY.toFixed(2)}</>}
                      </p>
                    </div>
                  </details>
                )
              })}
            </div>
          )}
          {world && world.objects.length > 1 && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-400">
              Set all scales:
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => applyScaleToAll(s)}
                  className="rounded bg-neutral-800 px-2 py-0.5 font-mono hover:bg-neutral-700"
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className={labelCls}>World inspector</span>
          <div className="rounded bg-neutral-800 p-2 font-mono text-[11px] leading-relaxed text-neutral-300">
            {world ? (
              <>
                mode: {world.mode}
                <br />
                {world.mode === 'open' ? (
                  <>ground: {world.ground?.size ?? 2000}m · {world.ground?.texture ?? 'default'} · env: {world.environment?.weather ?? 'clear'}/{world.environment?.time ?? 'day'}</>
                ) : (
                  <>map: {world.map}</>
                )}
                <br />
                objects: {world.objects.length} · models: {modelNames.length} · missions: {missionCount}
                <br />
                models: {modelNames.join(', ') || '—'}
              </>
            ) : (
              <span className="text-neutral-500">
                {chatQuery.isError ? 'Chat failed to load — check login.' : 'No world parsed for this turn.'}
              </span>
            )}
          </div>
          {world && (
            <details className="mt-1 rounded bg-neutral-800 p-2">
              <summary className="cursor-pointer text-xs text-neutral-400">Raw world JSON</summary>
              <pre className="mt-1 max-h-64 overflow-auto font-mono text-[10px] text-neutral-300">
                {JSON.stringify(world, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </aside>

      <div ref={canvasWrapRef} className="relative h-full w-full bg-black">
        {world ? (
          <Canvas
            key={camMode}
            shadows={{ type: THREE.PCFShadowMap }}
            camera={{ fov: cam.fov, near: 0.1, far: 2000, position: cam.position }}
          >
            <Suspense fallback={null}>
              <DebugExperience
                config={world}
                gravity={gravity}
                physicsPaused={physicsPaused}
                physicsDebug={physicsDebug}
                missionDebug={missionDebug}
                showGrid={showGrid}
                flatLights={flatLights}
                showFog={showFog}
                showVignette={showVignette}
                objectOverrides={objectOverrides}
                camMode={camMode}
              />
              {camMode !== 'play' && (
                <OrbitControls
                  makeDefault
                  target={camMode === 'top' ? [0, 0, 0] : [0, 2, 0]}
                  maxDistance={500}
                />
              )}
            </Suspense>
          </Canvas>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-medium text-white">
              {chatQuery.isPending ? 'Loading world…' : chatQuery.isError ? 'World failed to load' : 'No world in this turn'}
            </p>
            <p className="mt-1 text-[12.5px] text-white/40">
              {chatQuery.isError ? 'Try refreshing or logging in.' : 'Pick another turn or describe the world again.'}
            </p>
          </div>
        )}
        {showHud && world && (
          <>
            {camMode === 'play' && <PlayerHud />}
            <DialogueHud />
            <MissionHud />
          </>
        )}
        {camMode === 'play' && !showHud && !pointerLocked && world && (
          <div
            onClick={requestPointerLock}
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/45 text-lg text-white select-none"
          >
            Click to lock pointer (WASD move · Shift run · Space jump · ESC release)
          </div>
        )}
        <div className="pointer-events-none absolute left-3 top-3 rounded bg-black/60 px-3 py-1.5 font-mono text-xs text-white">
          {chatId.slice(0, 8)} · turn {turnIndex !== null ? turnIndex + 1 : '—'}/{histories.length} · {camMode}
          {physicsPaused ? ' · physics paused' : ''} · gravity [{gravity.join(', ')}]
        </div>
      </div>
    </div>
  )
}
