import { useGLTF } from '@react-three/drei';
import type { ModelParams } from '../../types/types';

export default function ToonTree({position, scale, rotation} : ModelParams) {
  const { scene } = useGLTF("/models/toon_tree.glb")
  return (
    <primitive object={scene} scale={scale} position={position} rotation={rotation}/>
  )
}