import { Canvas } from "@react-three/fiber";
import ForestHouseModel from "./components/models/ForestHouseModel";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

export default function App() {
  return (
    <Canvas style={{
      width: "100vw",
      height: "100vh"
    }}
      camera={{ position: [3, 3, 5] }}
      frameloop="always"
    >
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <gridHelper args={[10, 10, 20]} />
      <axesHelper args={[10]} />
      <Suspense fallback={null}>
        <ForestHouseModel />
      </Suspense>
      <OrbitControls
        autoRotate={false}
        enableDamping={true}
        dampingFactor={0.2}
      />
    </Canvas>
  )
}