import { useGLTF } from '@react-three/drei';
import type { ModelParams } from '../../types/types';

export default function ToonTree({ position, scale, rotation }: ModelParams) {
  const { scene } = useGLTF("/models/tree.glb")
  return (
    <primitive object={scene} scale={scale} position={position} rotation={rotation} color={"#111"} />
  )
}