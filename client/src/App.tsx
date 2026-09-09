import { Canvas } from "@react-three/fiber";
import ForestHouseModel from "./components/models/ForestHouseModel";
import { Suspense } from "react";
import ToonTree from "./components/models/ToonTree";
// import { PointerLockControls } from "@react-three/drei";
import useWASD from "./libs/wasd";

export default function App() {
  function Player() {
    const controls = useWASD();
    return controls;
  }

  return (
    <div>
      <Canvas style={{
        width: "100vw",
        height: "100vh"
      }}
        camera={{ position: [0, 0.3, 0] }}
        frameloop="always"
      >
        <fog attach="fog" args={['#cccccc', 5, 15]} />
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <gridHelper args={[10, 10, 20]} />
        <axesHelper args={[10]} />
        <Suspense fallback={null}>
          <ForestHouseModel scale={20} position={[0, 0, 1]} rotation={[0, Math.PI / 2, 0]} />
          <ToonTree scale={10} />
        </Suspense>
        <Player />
      </Canvas>
    </div>
  )
}