import { Physics } from '@react-three/rapier'
import { useMemo } from 'react'
import Lights from '../Rendering/Lights'
import { World } from '../World/World'
import MissionZones from '../World/MissionZones'
import MapCoverage from '../World/MapCoverage'
import Fog from '../World/weather/Fog'
import Weather from '../World/weather/Weather'
import { getWeatherTheme } from '../World/weather/weatherRegistry'
import type { WorldConfig } from '../World/worldTypes'
import { useMissionStore } from '../../store/missionStore'
import { usePlayerLoadoutStore } from '../../store/playerLoadoutStore'
import EcctrlWrapper from './EcctrlWrapper'
import { useEffect, useState } from 'react'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import { useTexture } from '@react-three/drei'
import { groundTexturePaths } from '../Rendering/map/OpenPlains'

export default function Experience({ config }: { config: WorldConfig }) {
  const worldConfig = config
  const mapId = worldConfig.mode === 'open' ? 'openPlains' : worldConfig.map
  const environment = worldConfig.mode === 'open' ? worldConfig.environment : undefined

  // note for me: player + ground before first paint, everything else streams via Suspense, else things will get fucked !! :)
  useTexture.preload(groundTexturePaths(worldConfig.mode === 'open' ? worldConfig.ground?.texture : undefined))
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

  // A freshly generated world starts the player unarmed: the previous world's
  // weapon (and its already-consumed pickup) must not carry over.
  useEffect(() => {
    usePlayerLoadoutStore.getState().resetLoadout()
  }, [worldConfig])

  return (
    <>
      {/* note for me: background + fog must share one color so distant
          geometry melts into the sky (CSS background can never blend with fog) */}
      <Fog sky={theme.sky} fog={theme.fog} near={theme.fogNear} far={theme.fogFar} />
      <Weather weather={weather} time={time} />
      <EffectComposer multisampling={0}>
        {/* <HueSaturation saturation={-0.25} /> */}
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
      {/*  note for me: gravty set through Ecctrl in EcctrlWrapper */}
      <Physics timeStep="vary" gravity={[0, 0, 0]} paused={!physicsActive}>
        <World config={worldConfig} />
        <MissionZones missions={missions} debug/>
        <EcctrlWrapper mapId={mapId} config={worldConfig} />
        <MapCoverage config={worldConfig} />
      </Physics>
    </>
  );
}
