import { useGLTF } from "@react-three/drei";
import { type ThreeElements } from "@react-three/fiber";

export default function CharacterModel(props: ThreeElements['group']) {
    return (
        <group {...props} dispose={null}>
            <mesh castShadow receiveShadow />
        </group>
    )
}

useGLTF.preload('/models/capsule.glb')