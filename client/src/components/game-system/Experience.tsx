import { Physics } from '@react-three/rapier';
import { useMemo } from 'react';
import Lights from '../Rendering/Lights';
import { World } from '../World/World';
import MissionZones from '../World/MissionZones';
import Fog from '../World/weather/Fog';
import Weather from '../World/weather/Weather';
import { getWeatherTheme } from '../World/weather/weatherRegistry';
import type { WorldConfig } from '../World/worldTypes';
import { useMissionStore } from '../../store/missionStore';
import EcctrlWrapper from './EcctrlWrapper';
import { useEffect, useState } from 'react';
import { EffectComposer, HueSaturation, Vignette } from '@react-three/postprocessing';
import { useTexture } from '@react-three/drei';
import { GROUND_TEXTURES } from '../Rendering/map/OpenPlains';

useTexture.preload(GROUND_TEXTURES)

export default function Experience({ config }: { config: WorldConfig }) {
    const worldConfig = config
    const mapId = worldConfig.mode === 'open' ? 'openPlains' : worldConfig.map
    const environment = worldConfig.mode === 'open' ? worldConfig.environment : undefined
    const weather = environment?.weather ?? 'clear'
    const time = environment?.time ?? 'day'
    const theme = useMemo(
        () => getWeatherTheme(weather, time, environment?.fogColor),
        [weather, time, environment?.fogColor],
    )

    const [physicsActive, setPhysicsActive] = useState(false)

    useEffect(() => {
        const timeout = setTimeout(() => setPhysicsActive(true), 1000);
        return () => clearTimeout(timeout);
    }, []);

    const missions = useMemo(() => worldConfig.missions ?? [], [worldConfig.missions])

    useEffect(() => {
        useMissionStore.getState().setMissions(missions)
    }, [missions])

    return (
        <>
            <Fog sky={theme.sky} fog={theme.fog} near={theme.fogNear} far={theme.fogFar} />
            <Weather weather={weather} />
            <EffectComposer multisampling={0}>
                <HueSaturation saturation={-0.25} />
                <Vignette offset={0.25} darkness={0.8} />
            </EffectComposer>
            <Lights
                sunIntensity={theme.sunIntensity}
                sunColor={theme.sunColor}
                sunPosition={theme.sunPosition}
                hemiIntensity={theme.hemiIntensity}
                hemiSky={theme.hemiSky}
                hemiGround={theme.hemiGround}
            />
            <Physics timeStep="vary" gravity={[0, 0, 0]} paused={!physicsActive}>
                <World config={worldConfig} />
                <MissionZones missions={missions} debug />
                <EcctrlWrapper mapId={mapId} config={worldConfig} />
            </Physics>
        </>
    );
}
