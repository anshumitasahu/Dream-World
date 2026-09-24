import { Suspense, memo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Experience from "../../GameSysten/Experience";
import PlayerHud from "../../GameSysten/PlayerHud";
import DialougeHud from '../Dialouge/MissionHud';
import MissionHud from '../Mission/MissionHud';
import { WarningCircleIcon } from '@phospphor-icons/react';
import { ThinkingOrb } from "thinking-orbs";
import type { WorldConfig } from "../../world/WorldTypes";

interface WorldViewportProps {
    world: WorldConfig | null
    loadFailed: boolean
}

export const WorldViewport = memo(function WorldViewport({
    world, loadFailed }: WorldViewportProps) {
    return (
        <div className='relative h-full w-full bg-black'>
            {world ? (
                <Canvas
                    shadows={{ type: THREE.PCFShadowMap }}
                    cameraa={{
                        fov: 75,
                        near: 0.1,
                        far: 1000,
                        position: [0, 1, 100],
                    }}
                >
                    <Suspense fallback={null}>
                        <Experience config={world} />
                    </Suspense>
                </Canvas>
            ) : (
                <div className='flex h-full flex-col items-cemter justify-center px-6 text-center'>
                    {loadFailed ? (
                        <>
                            <WarningCircleIcon className='h-9 w-9 text-red-300/70' />
                            <p className='mt-3 text-sm font-medium text-white'>World failed to load</p>
                            <p className='mt-1 text-[12.5px] text-white/40'>Try refreshing or describing the world again</p>
                        </>
                    ) : (
                        <>
                            <ThinkingOrb state='searching' size={64} />
                            <p className='mt-4 text-sm font-medium text-white'>Generating your world..</p>
                            <p className='mt-1 text-[12.5px] text-white/40'>This usually takes a few seconds</p>
                        </>
                    )}
                </div>
            )}
            <PlayerHud />
            <DialougeHud />
            <MissionHud />
        </div>
    )
})