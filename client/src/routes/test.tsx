import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from 'three';
import { OrbitControls, useAnimations, useGLTF } from '@react-three/drei';
import { Physics, CuboidCollider, RigidBody } from '@react-three/rapier';
import { Ecctrl, type EcctrlHandle } from 'ecctrl';
import Lights from '../components/Rendering/Lights';
import { Grid } from '@react-three/postprocessing';

export const Route = createFileRoute('/test')({
    component: RouteComponent,
})

type CamMode = 'orbit' | 'fps'

interface ModelEntry {
    label: string
    path: string
    group: string
}

const MODELS: ModelEntry[] = [
    { group: 'structure', label: 'house', path: '/model/forest_house.glb' },
    { group: 'nature', label: 'tree', path: '/model/tree.glb' },
    { group: 'creatures', label: 'dargon', path: '/models/spyro_the dragon.glb' },
    { group: 'creatures', label: 'phoenix', path: '/models/phoenix_bird.glb' },
]

const GROUPS = [...new Set(MODELS.map((m) => m.group))]

function TestSubject({
    path,
    scale,
    position,
    rotationY,
    animation,
    playing,
    animSpeed,
    collider,
    onAnimations,
}: {
    path: string
    scale: number
    position: [number, number, number]
    rotationY: number
    animation: string | null
    playing: boolean
    animSpeed: number
    collider: boolean
    onAnimations: (names: string[]) => void
}) {
    const group = useRef<THREE.Group>(null)
    const gltf = useGLTF(path, true)
    const { actions, names } = useAnimations(gltf.animations, group)

    useEffect(() => {
        onAnimations(names)
    }, [path, names.join('|')])

    useEffect(() => {
        const action = animation ? actions[animation] : undefined
        if (!action) return
        action.reset().fadeIn(0.25).play()
        return () => {
            action.fadeOut(0.25)
        }
    }, [actions, animation, path])

    useEffect(() => {
        const action = animation ? actions[animation] : undefined
        if (!action) return
        action.reset().fadeIn(0.25).play()
        return () => {
            action.fadeOut(0.25)
        }
    }, [actions, animation, path])

    useEffect(() => {
        const action = animation ? actions[animation] : undefined
        if (!action) return
        action.paused = !playing
        if (playing && !action.isRunning()) action.play()
    }, [actions, animation, playing])

    useEffect(() => {
        Object.values(actions).forEach((a) => {
            if (a) a.timeScale = animSpeed
        })
    }, [actions, animSpeed])

    useEffect(() => {
        gltf.scene.traverse((o) => {
            if ((o as THREE.Mesh).isMesh) {
                o.castShadow = true
                o.receiveShadow = true
                o.frustumCulled = false
            }
        })
    }, [gltf, path])

    const inner = (
        <group ref={group} position={position} rotation={[0, rotationY, 0]} scale={scale}>
            <primitive object={gltf.scene} />
        </group>
    )

    if (!collider) return inner
    return (
        <RigidBody type="fixed" colliders="cuboid" position={position} rotation={[0, rotationY, 0]}>
            <group ref={group} scale={scale}>
                <primitive object={gltf.scene} />
            </group>
        </RigidBody>
    )
}

const FPS_SPAWN: [number, number, number] = [0, 2.5, 12]

function FpsRig({ onLockChange }: {
    onLockChange: (locked: boolean) => void
}) {
    const ecctrlRef = useRef<EcctrlHandle>(null)
    const keys = useRef(new Set<string>())
    const yaw = useRef(Math.PI)
    const pitch = useRef(0)
    const eucler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
    const renderer = useThree((s) => s.gl)

    useEffect(() => {
        const down = (e: KeyboardEvent) => keys.current.add(e.code)
        const up = (e: KeyboardEvent) => keys.current.delete(e.code)
        window.addEventListener('keydown', down)
        window.addEventListener('keyup', up)
        return () => {
            window.removeEventListener('keydown', down)
            window.removeEventListener('keyup', up)
        }
    }, [])

    useEffect(() => {
        const canvas = renderer.domElement
        const onChange = () => onLockChange(document.pointerLockElement === canvas)
        const onMove = (e: MouseEvent) => {
            if (document.pointerLockElement !== canvas) return
            yaw.current -= e.movementX * 0.0025
            pitch.current = Math.max(-1.55, Math.min(1.55, pitch.current - e.movementY * 0.0025))
        }
        document.addEventListener('pointerlockchange', onChange)
        document.addEventListener('mousemove', onMove)
        return () => {
            document.removeEventListener('pointerlockchange', onChange)
            document.removeEventListener('mousemove', onMove)
        }
    }, [renderer, onLockChange])

    useFrame((state) => {
        const c = ecctrlRef.current
        if (!c) return
        const k = keys.current
        c.setMovement({
            forward: k.has('KeyW') || k.has('ArrowUp'),
            backward: k.has('KeyS') || k.has('ArrowDown'),
            leftward: k.has('KeyA') || k.has('ArrowLeft'),
            rightward: k.has('KeyD') || k.has('ArrowRight'),
            run: k.has('ShiftLeft') || k.has('ShiftRight'),
            jump: k.has('Space'),
        })
        const p = c.currPos
        state.camera.position.set(p.x, p.y + 0.62, p.z)
        eucler.current.set(pitch.current, yaw.current, 0)
        state.camera.quaternion.setFromEuler(eucler.current)
    })

    return (
        <Ecctrl
            ref={ecctrlRef}
            position={FPS_SPAWN}
            capsuleRadius={0.5}
            capsuleHalfHeight={0.5}
            maxWalkVel={4}
            maxRunVel={8}
            enableCustomGravity={true}
            enableToggleRun={true}
        >
            <group />
        </Ecctrl>
    )
}

const inputCls = 'w-full rouuded bg-neutral-800 px-2 py-1 text-sm text-neutral-100 outline-none focus:ring-1 focus:ring-sky-500'
const labelCls = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-400'

function RouteComponent() {
    const [mode, setMode] = useState<CamMode>('orbit')
    const [modelPath, setModelPath] = useState(MODELS[0].path)
    const [animNames, setAnimNames] = useState<string[]>([])
    const [animation, setAnimation] = useState<string | null>(null)
    const [playing, setPlaying] = useState(true)
    const [animSpeed, setAnimSpeed] = useState(1)
    const [scale, setScale] = useState(1)
    const [pos, setPos] = useState<[number, number, number]>([0, 0, 0])
    const [rotY, setRotY] = useState(0)
    const [collider, setCollider] = useState(true);
    const [autoRotate, setAutoRotate] = useState(false);
    const [showGrid, setShowGrid] = useState(true)
    const [fpsLocked, setFpsLocked] = useState(true)
    const canvasWrapRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setAnimNames([])
        setAnimation(null)
        setPlaying(true)
    }, [modelPath])

    useEffect(() => {
        if (animNames.length > 0 && animation == null) setAnimation(animNames[0])
        if (animNames.length === 0) setAnimation(null)
    }, [animNames, animation])

    const selectedLabel = useMemo(
        () => MODELS.find((m) => m.path === modelPath)?.label ?? modelPath,
        [modelPath],
    )

    const setAxis = (i: 0 | 1 | 2, v: number) =>
        setPos((p) => {
            const next: [number, number, number] = [...p]
            next[i] = Number.isFinite(v) ? v : 0
            return next
        })

    return (
        <div className='grid h-screen w-screen grid-cols-[340px_1fr] bg-neutral-950 text-neutral-100'>
            <aside className='flex h-full flex-col gap-4 overflow-y-auto border-r border-neutral-800 bg-neutral-900 p-4'>
                <div>
                    <h1 className='text-lg font-bold'>
                        Model Playground
                    </h1>
                    <p className='text-xs text-neutral-400'>Test models from public/models/ignore on an open map</p>
                </div>

                <div>
                    <span className={labelCls}>Camera mode</span>
                    <div className='grid grid-cols-2 gap-2'>
                        {(['orbit', 'fps'] as CamMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`rounded px-2 py-1.5 text-sm font-semibold ${mode == m ? 'bg-sky- 600 text-white' : 'bg-neutrsl-800 text-neutral-300 hover:bg-neutral-700'}`}
                            >
                                {m === 'orbit' ? 'Orbit' : 'FPS Walk'}
                            </button>
                        ))}
                    </div>
                    <p className='mt-1 text-neutral-500'>
                        {mode === 'orbit' ? "Drag to orbit • scroll to zoom • right-drag to pan." : 'Click canvas for pointer lock, WASD to walk around the model.'}
                    </p>
                </div>

                <div>
                    <span className={labelCls}>
                        Model ({MODELS.length})
                    </span>
                    <select value={modelPath} onChange={(e) => setModelPath(e.target.value)} className={inputCls}>
                        {GROUPS.map((g) => (
                            <optgroup key={g} label={g}>
                                {MODELS.filter((m) => m.group === g).map((m) => (
                                    <option key={m.path} value={m.path}>
                                        {m.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <p className='mt-1 break-all font-mono text-[11px] text-neutral-500'>
                        {modelPath}
                    </p>
                </div>

                <div>
                    <span className={labelCls}>Animation {animNames.length > 0 ? `(${animNames.length})` : ' '}</span>
                    {animNames.length === 0 ? (
                        <p className='rounded bg-neutral-800 px-2 py-1.5 text-sm text-neutral-400'> No animations in this model</p>
                    ) : (
                        <>
                            <select value={animation ?? ''} onChange={(e) => setAnimation(e.target.value || null)} className={inputCls}>
                                {animNames.map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                            <div className='mt-2 flex items-center gap-2'>
                                <button
                                    onClick={() => setPlaying((p) => !p)}
                                    className='rounded bg-neutral-800 px-3 py-1 text-sm font-semibold hover:bg-neutral-700'
                                >
                                    {playing ? 'Pause' : 'Play'}
                                </button>
                                <label className='flex flex-1 items-center gap-2 text-xs text-neutral-400'>
                                    Speed
                                    <input
                                        type="range"
                                        min={0.1}
                                        max={3}
                                        step={0.1}
                                        value={animSpeed}
                                        onChange={(e) => setAnimSpeed(Number(e.target.value))}
                                        className='flex-1'
                                    />
                                    <span className='w-8 text-right font-mono'>
                                        {animSpeed.toFixed(1)}x
                                    </span>
                                </label>
                            </div>
                        </>
                    )}
                </div>

                <div>
                    <span className={labelCls}>
                        Scale: {scale}
                    </span>
                    <input
                        type="range"
                        min={-2} max={1.3} step={0.01}
                        value={Math.log10(Math.max(scale, 0.0001))}
                        onChange={(e) => setScale(Number(Math.pow(10, Number(e.target.value)).toFixed(4)))}
                        className='w-full'
                    />
                    <div className='mt-1 flex gap-2'>
                        <input
                            type='number' step="any" value={scale} onChange={(e) => setScale(Math.max(0.0001, Number(e.target.value)) || 1)}
                            className={inputCls}
                        />
                        <button onClick={() => setScale(1)} className='rounded bg-neutral-600 px-3 text-sm hover:bg-neutral-700'>
                            Reset
                        </button>
                    </div>
                    <div className='mt-1 flex flex-wrap gap-1'>
                        {[0.01, 0.1, 0.5, 1, 2, 5, 10].map((s) => (
                            <button
                                key={s}
                                onClick={() => setScale(s)}
                                className={`rounded px-2 py-0.5 font-mono texr-xs ${scale === s ? 'bg-sky-600' : 'bg-neutral-800 hover:bg-neutral-700'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className='mb-1 flex items-center justify-between'>
                        <span className={labelCls}>Position (center by default)</span>
                        <button onClick={() => setPos([0, 0, 0])} className='rounded bg-neutral-800 px-2 py-0.5 text-xs hover:bg-neutral-700'>
                            Center
                        </button>
                    </div>
                    <div className='grid grid-cols-3 gap-2'>
                        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                            <label key={axis} className='text-xs text-neutral-400'>
                                {axis}
                                <input
                                    type='number' step='any' value={pos[i]}
                                    onChange={(e) => setAxis(i as 0 | 1 | 2, Number(e.target.value))}
                                    className={inputCls}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <span className={labelCls}>
                        Rotation Y: {rotY.toFixed(2)} rad
                    </span>
                    <input
                        type='range'
                        min={-Math.PI}
                        max={Math.PI}
                        step={0.01}
                        value={rotY}
                        onChange={(e) => setRotY(Number(e.target.value))}
                        className="w-full"
                    />
                    <button onClick={() => setRotY(0)} className='mt-1 rounded bg-neutral-800 px-2 py-0.5 text-xs hover:bg-neutral-700'>
                        Reset rotation
                    </button>
                </div>

                <div className='flex flex-col gap-2 text-sm'>
                    <label className='flex items-center gap-2'>
                        <input
                            type="checkbox"
                            checked={collider}
                            onChange={(e) => setCollider(e.target.checked)}
                        />
                        Fixed physis collider
                    </label>
                    <label className='flex items-center gap-2'>
                        <input
                            type="checkbox"
                            checked={showGrid}
                            onChange={(e) => setShowGrid(e.target.checked)}
                        />
                        Show grid
                    </label>
                    {mode === 'orbit' && (
                        <label className='flex items-center gap-2'>
                            <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} />
                            Auto-rotate camera
                        </label>
                    )}
                </div>

                <div className='rounded bg-neutral-800 p-2 font-mono text-[11px] leading-relaxed text-neutral-300'>
                    model: {selectedLabel}
                    <br />
                    scale: {scale} • pos: [{pos.join(', ')}] • rotY: {rotY.toFixed(2)}
                    <br />
                    anim: {animation ?? '_'} {animNames.length > 1 ? `(${animNames.length}clips)` : ''}
                </div>
            </aside>

            <div ref={canvasWrapRef} className='relative h-full w-full bg-black'>
                <Canvas
                    shadows={{ type: THREE.PCFShadowMap }}
                    camera={mode === 'orbit' ? { fov: 55, near: 0.1, far: 2000, position: [7, 4.5, 10] } : { fov: 75, near: 0.1, far: 2000, position: FPS_SPAWN }}
                >
                    <Suspense fallback={null}>
                        <color attach="background" args={['#bcc0fe']} />
                        <fog attach="fog" args={['#bcc)fe', 0, 160]} />
                        <Lights />
                        <Physics timeStep="vary" gravity={[0, 0, 0]}>
                            <RigidBody type='fixed' colliders={false} position={[0, -1, 0]}>
                                <CuboidCollider args={[200, 1, 200]} />
                                <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, 1, 0]} >
                                    <planeGeometry args={[400, 400]} />
                                    <meshStandardMaterial color='#8a9a7b' roughness={1} />s
                                </mesh>
                            </RigidBody>
                            {showGrid && (
                                <Grid
                                    position={[0, 0.2, 0]}
                                    args={[400, 400]}
                                    cellSize={1}
                                    cellThickness={1.2}
                                    cellColor="#4a5a6a"
                                    fadeDistance={180}
                                    fadeStrength={2}
                                    infiniteGrid
                                />
                            )}
                            <TestSubject
                                key={modelPath}
                                path={modelPath}
                                scale={scale}
                                position={pos}
                                rotationY={rotY}
                                animation={animation}
                                playing={playing}
                                animSpeed={animSpeed}
                                collider={collider}
                                onAnimations={setAnimNames}
                            />
                            {mode === 'fps' && <FpsRig onLockChange={setFpsLocked} />}
                        </Physics>
                        {mode === 'orbit' && <OrbitControls makeDefault target={[pos[0], pos[1] + 1, pos[2]]} autoRotate={autoRotate} maxDistance={300} />}
                    </Suspense>
                </Canvas>
                {mode === 'fps' && !fpsLocked && (
                    <div
                        onClick={() => {
                            const canvas = canvasWrapRef.current?.querySelector('canvas')
                            canvas?.requestPointerLock()
                        }}
                        className='absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/45 text-lg text-white select-none'
                    >
                        Click to look around(WASD move • Shift run • Space jump • ESC release )
                    </div>
                )}

                <div className='pointer-events-none absolute left-3 top-3 rounded bg-black/60 px-3 py-1.5 font-mono text-xs text-white'>
                    {selectedLabel} • {mode === 'orbit' ? 'orbit' : 'fps'} •{animation ?? 'no animation'}
                </div>
            </div>
        </div>
    )
}