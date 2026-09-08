import { useGLTF } from '@react-three/drei';

export default function ForestHouseModel() {
  const { scene } = useGLTF("/models/forest_house.glb")
  return (
    <primitive object={scene} scale={20} />
  )
}