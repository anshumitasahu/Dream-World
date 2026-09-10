import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Physics, RigidBody } from "@react-three/rapier";
import ForestHouseModel from "./components/models/ForestHouseModel";
import ToonTree from "./components/models/ToonTree";
import Player from "./components/game-system/Player";
import PlayerHud from "./components/game-system/PlayerHud";

export default function App() {
  return (
    < div >
      <Canvas style={{
        width: "100vw",
        height: "100vh"
      }}
        camera={{ position: [0, 0.3, 0] }}
        frameloop="always"
        color="#111"
      >
        <color attach="background" args={['#111111']} />
        <fog attach="fog" args={['#111111', 5, 25]} />
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <gridHelper args={[10, 10, 20]} />
        <axesHelper args={[10]} />
        <Physics gravity={[0, -9.81, 0]} debug>
          <Suspense fallback={null}>
            <RigidBody colliders="trimesh" position={[-3, 0, 5]} type="fixed" >
              <ForestHouseModel scale={100} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
            </RigidBody>
            <RigidBody colliders="trimesh" position={[0, 0, 0]} type="fixed">
              <ToonTree scale={30} />
            </RigidBody>
            <Player />
          </Suspense>
        </Physics>
      </Canvas>
      <PlayerHud />
    </div>
  );
};