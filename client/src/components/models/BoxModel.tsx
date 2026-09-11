import { useFrame } from "@react-three//fiber";
import { useRef, useState } from "react";

export default function BoxModel(props: any) {
    const meshRef = useRef<any>(null);
    const [hovered, setHover] = useState(false);
    const [active, setActive] = useState(false);
    useFrame((_state, delta) => (meshRef.current.rotation.x += delta))

    return (
        <mesh
            {...props}
            ref={meshRef}
            scale={active ? 1.5 : 1}
            onClick={() => setActive(!active)}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    )
}