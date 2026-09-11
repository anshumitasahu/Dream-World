import { useGLTF } from "@react-three/drei";

interface ModelProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    modelPath: string;
}

export default function Model({ position, rotation, scale, modelPath }: ModelProps) {
    const gltf = useGLTF(modelPath, true);

    return (
        <primitive
            object={gltf.scene}
            position={position}
            rotation={rotation}
            scale={scale}
        />
    )
}