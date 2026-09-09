import { useGLTF } from '@react-three/drei';
import type { ModelParams } from '../../types/types';

export default function ForestHouseModel({ position, scale, rotation }: ModelParams) {
  const { scene } = useGLTF("/models/forest_house.glb");
  return (
    <primitive object={scene} scale={scale} position={position} rotation={rotation} color={"#111"} onPointerMissed={console.log("you clikced me but missed me")} />
  );
};