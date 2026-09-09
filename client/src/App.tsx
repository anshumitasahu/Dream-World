import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Physics, RigidBody } from "@react-three/rapier";
import ForestHouseModel from "./components/models/ForestHouseModel";
import ToonTree from "./components/models/ToonTree";
import Player from "./components/game-system/Player";

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
            <RigidBody colliders="cuboid" position={[0, 0, 0]} type="fixed">
              <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[50, 1, 50]} />
                <meshStandardMaterial color={""} />
              </mesh>
            </RigidBody>
            <RigidBody colliders="hull" position={[0, 0, 0]} type="fixed" >
              <ForestHouseModel scale={20} position={[0, 0, 1]} rotation={[0, Math.PI / 2, 0]} />
            </RigidBody>
            <RigidBody colliders="hull" position={[0, 0, 0]} type="fixed">
              <ToonTree scale={10} />
            </RigidBody>
          </Suspense>
          <Player />
        </Physics>
      </Canvas>
    </div>
  );
};