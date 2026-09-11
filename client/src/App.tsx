import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from 'three';
import PlayerHud from "./components/game-system/PlayerHud";
import Experience from './components/game-system/Experience';

export default function App() {
  return (
    <>
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        style={{
          width: "100vw",
          height: "100vh",
        }}
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0.3, 0] }}
      >
        {/* <color attach="background" args={['#111111']} />
        <fog attach="fog" args={['#111111', 5, 25]} />
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <gridHelper args={[10, 10, 20]} />
        <axesHelper args={[10]} /> */}
        <Suspense fallback={null}>
          {/* <RigidBody colliders="trimesh" position={[-3, 0, 5]} type="fixed" >
              <ForestHouseModel scale={100} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
            </RigidBody>
            <RigidBody colliders="trimesh" position={[0, 0, 0]} type="fixed">
              <ToonTree scale={30} />
            </RigidBody>
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[0, -0.05, 0]}>
                <boxGeometry args={[2000, 0.1, 2000]} />
                <meshStandardMaterial color="#3a3a3a" />
              </mesh>
            </RigidBody> */}
          <Experience />
        </Suspense>
      </Canvas >
      <PlayerHud />
    </>
  );
};