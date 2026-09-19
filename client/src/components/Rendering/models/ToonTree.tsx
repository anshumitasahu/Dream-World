import { useGLTF } from '@react-three/drei';

interface ModelParams {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export default function ToonnTree({ position, scale, rotation }: ModelParams) {
  const { scene } = useGLTF("/models/tree.glb");
  return (
    <primitive object={scene} scale={scale} position={position} rotation={rotation} color={"#111"} />
  );
};