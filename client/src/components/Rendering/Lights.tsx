interface LightsProps {
  sunIntensity?: number
  sunColor?: string
  sunPosition?: [number, number, number]
  hemiIntensity?: number
  hemiSky?: string
  hemiGround?: string
}

export default function Lights({
  sunIntensity = 0.5,
  sunColor = '#ffffff',
  sunPosition = [0, 150, 0],
  hemiIntensity = 0.5,
  hemiSky = '#ffffff',
  hemiGround = '#d9e7ff',
}: LightsProps) {
  return (
    <>
      <directionalLight castShadow position={sunPosition} shadow-mapSize={[1024, 1024]} intensity={sunIntensity} color={sunColor} >
        <orthographicCamera attach='shadow-camera' args={[-100, 100, 200, -200, 1, 160]} />
      </directionalLight>
      <hemisphereLight intensity={hemiIntensity} groundColor={hemiGround} color={hemiSky} />
    </>
  );
}
