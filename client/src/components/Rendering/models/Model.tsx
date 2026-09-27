import { useGLTF } from "@react-three/drei";
import { useKtx2LoaderExtender } from "../../../lib/ktx2";

interface ModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  modelPath: string;
}

export default function Model({position, rotation, scale, modelPath}: ModelProps) {
  const extendWithKtx2 = useKtx2LoaderExtender();
  const gltf = useGLTF(modelPath, true, true, extendWithKtx2);

  return (
    <primitive
      object={gltf.scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  )
}