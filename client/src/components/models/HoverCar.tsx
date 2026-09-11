import { useRef, type JSX } from 'react'
import { useGLTF } from '@react-three/drei'
import { Mesh, type Group } from 'three'
import { RigidBody } from '@react-three/rapier'


export function HoverCar(props: JSX.IntrinsicElements['group']) {
    const group = useRef<Group | null>(null)
    const { nodes, materials } = useGLTF('/models/cyberpunk_hovercar.glb')

    return (
        <RigidBody type="fixed" colliders="hull" position={[0, 0, 0]}>
            <group ref={group} {...props} dispose={null}>
                <group name="Sketchfab_Scene">
                    <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]} scale={0.208}>
                        <group name="Root">
                            <group
                                name="Cube010"
                                position={[5.638, 0.672, 3.939]}
                                rotation={[0.062, 0.041, -0.035]}
                                scale={[0.896, 1.767, 0.799]}>
                                <mesh
                                    name="Cube010_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube010_0 as Mesh).geometry}
                                    material={materials.white_light}
                                />
                            </group>
                            <group name="Cube005" position={[1.458, 14.952, 3.951]}>
                                <mesh
                                    name="Cube005_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube005_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group
                                name="Cylinder"
                                position={[5.773, -2.749, 1.017]}
                                rotation={[0, -0.349, -1.215]}
                                scale={0.131}>
                                <mesh
                                    name="Cylinder_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group
                                name="Cylinder001"
                                position={[5.965, -3.927, 1.485]}
                                rotation={[0, -0.349, -1.215]}
                                scale={0.131}>
                                <mesh
                                    name="Cylinder001_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder001_0 as Mesh).geometry}
                                    material={materials.cdp_body}
                                />
                                <mesh
                                    name="Cylinder001_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder001_1 as Mesh).geometry}
                                    material={materials.gloss}
                                />
                                <mesh
                                    name="Cylinder001_2"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder001_2 as Mesh).geometry}
                                    material={materials.white_light}
                                />
                                <mesh
                                    name="Cylinder001_3"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder001_3 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                                <group
                                    name="Cylinder005"
                                    position={[21.97, -12.672, -2.085]}
                                    rotation={[0.001, -0.001, -1.773]}
                                    scale={6.122}>
                                    <mesh
                                        name="Cylinder005_0"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder005_0 as Mesh).geometry}
                                        material={materials.cdp_metal}
                                        morphTargetDictionary={(nodes.Cylinder005_0 as Mesh).morphTargetDictionary}
                                        morphTargetInfluences={(nodes.Cylinder005_0 as Mesh).morphTargetInfluences}
                                    />
                                </group>
                            </group>
                            <group
                                name="Cylinder002"
                                position={[5.773, -2.749, 1.017]}
                                rotation={[0, -0.349, 0.094]}
                                scale={0.131}>
                                <mesh
                                    name="Cylinder002_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder002_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group
                                name="Cylinder003"
                                position={[4.836, -0.934, 0.803]}
                                rotation={[0, -Math.PI / 9, 0.053]}
                                scale={0.801}>
                                <mesh
                                    name="Cylinder003_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder003_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                    morphTargetDictionary={(nodes.Cylinder003_0 as Mesh).morphTargetDictionary}
                                    morphTargetInfluences={(nodes.Cylinder003_0 as Mesh).morphTargetInfluences}
                                />
                            </group>
                            <group
                                name="Cylinder006"
                                position={[2.514, -10.75, 1.388]}
                                rotation={[-1.8, 1.145, 1.513]}
                                scale={0.175}>
                                <mesh
                                    name="Cylinder006_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder006_0 as Mesh).geometry}
                                    material={materials.cdp_body}
                                />
                                <mesh
                                    name="Cylinder006_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder006_1 as Mesh).geometry}
                                    material={materials.gloss}
                                />
                                <mesh
                                    name="Cylinder006_2"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder006_2 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                                <mesh
                                    name="Cylinder006_3"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder006_3 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <mesh
                                    name="Cylinder006_4"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder006_4 as Mesh).geometry}
                                    material={materials.white_light}
                                />
                            </group>
                            <group
                                name="Cylinder007"
                                position={[2.413, -10.795, 1.399]}
                                rotation={[1.342, -1.145, -1.811]}
                                scale={0.175}>
                                <mesh
                                    name="Cylinder007_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder007_0 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                            </group>
                            <group name="car011">
                                <mesh
                                    name="car011_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car011_0 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                            </group>
                            <group name="car002">
                                <mesh
                                    name="car002_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car002_0 as Mesh).geometry}
                                    material={materials.cdp_body}
                                />
                            </group>
                            <group name="car004">
                                <mesh
                                    name="car004_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car004_0 as Mesh).geometry}
                                    material={materials.white_light}
                                />
                            </group>
                            <group name="Plane006" position={[4.637, -8.238, 0]}>
                                <mesh
                                    name="Plane006_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane006_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="Plane001" position={[4.637, -8.238, 0]}>
                                <mesh
                                    name="Plane001_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane001_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="Plane003" position={[4.637, -8.238, -0.153]}>
                                <mesh
                                    name="Plane003_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane003_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="Cylinder012" position={[5.289, 4.289, 1.612]} rotation={[-0.873, 0, 0]}>
                                <mesh
                                    name="Cylinder012_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder012_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <group
                                    name="Cylinder004"
                                    position={[0, 1.635, -0.547]}
                                    rotation={[0, Math.PI / 2, 0]}>
                                    <mesh
                                        name="Cylinder004_0"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder004_0 as Mesh).geometry}
                                        material={materials.cdp_metal}
                                    />
                                    <mesh
                                        name="Cylinder004_1"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder004_1 as Mesh).geometry}
                                        material={materials.white_light}
                                    />
                                    <group
                                        name="Torus000"
                                        position={[0.001, 2.419, -0.027]}
                                        rotation={[-1.584, -1.549, -1.584]}
                                        scale={[1.266, 1, 1]}>
                                        <mesh
                                            name="Torus000_0"
                                            castShadow
                                            receiveShadow
                                            geometry={(nodes.Torus000_0 as Mesh).geometry}
                                            material={materials.cdp_plastic}
                                        />
                                        <mesh
                                            name="Torus000_1"
                                            castShadow
                                            receiveShadow
                                            geometry={(nodes.Torus000_1 as Mesh).geometry}
                                            material={materials.cdp_metal}
                                        />
                                    </group>
                                </group>
                            </group>
                            <group name="car014" position={[1.979, 0, 0]}>
                                <mesh
                                    name="car014_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car014_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <mesh
                                    name="car014_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car014_1 as Mesh).geometry}
                                    material={materials.white_light}
                                />
                                <mesh
                                    name="car014_2"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car014_2 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                            </group>
                            <group
                                name="Cylinder017"
                                position={[4.761, 11.355, 3.661]}
                                rotation={[0.205, -0.172, 0.183]}>
                                <mesh
                                    name="Cylinder017_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder017_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <group name="Cylinder015" rotation={[0, 0.262, 0]}>
                                    <mesh
                                        name="Cylinder015_0"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder015_0 as Mesh).geometry}
                                        material={materials.cdp_metal}
                                    />
                                    <mesh
                                        name="Cylinder015_1"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder015_1 as Mesh).geometry}
                                        material={materials.cdp_body}
                                    />
                                    <mesh
                                        name="Cylinder015_2"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder015_2 as Mesh).geometry}
                                        material={materials.gloss}
                                    />
                                    <mesh
                                        name="Cylinder015_3"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder015_3 as Mesh).geometry}
                                        material={materials.white_light}
                                    />
                                </group>
                            </group>
                            <group
                                name="Cylinder018"
                                position={[3.821, 14.727, 4.705]}
                                rotation={[-0.237, 0.99, 0.386]}>
                                <mesh
                                    name="Cylinder018_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder018_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <group name="Cylinder019" rotation={[0, -0.593, 0]}>
                                    <mesh
                                        name="Cylinder019_0"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder019_0 as Mesh).geometry}
                                        material={materials.cdp_metal}
                                    />
                                    <mesh
                                        name="Cylinder019_1"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder019_1 as Mesh).geometry}
                                        material={materials.cdp_body}
                                    />
                                    <mesh
                                        name="Cylinder019_2"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder019_2 as Mesh).geometry}
                                        material={materials.gloss}
                                    />
                                </group>
                            </group>
                            <group name="Cube002">
                                <mesh
                                    name="Cube002_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube002_0 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                            </group>
                            <group
                                name="Cube006"
                                position={[2.812, -6.537, 0.418]}
                                rotation={[0, 0, -1.553]}
                                scale={0.919}>
                                <mesh
                                    name="Cube006_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube006_0 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                            </group>
                            <group name="Plane004" position={[2.634, -10.819, 1.921]} scale={[0.913, 1.028, 1.07]}>
                                <mesh
                                    name="Plane004_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane004_0 as Mesh).geometry}
                                    material={materials.cdp_body}
                                />
                                <mesh
                                    name="Plane004_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane004_1 as Mesh).geometry}
                                    material={materials.gloss}
                                />
                                <mesh
                                    name="Plane004_2"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane004_2 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <mesh
                                    name="Plane004_3"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane004_3 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                            </group>
                            <group
                                name="Cylinder023"
                                position={[5.965, -3.927, 1.485]}
                                rotation={[0, -0.349, -1.215]}
                                scale={0.131}>
                                <mesh
                                    name="Cylinder023_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder023_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="Cube000">
                                <mesh
                                    name="Cube000_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube000_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group
                                name="Cube001"
                                position={[2.812, -6.537, 0.418]}
                                rotation={[0, 0, -1.553]}
                                scale={0.919}>
                                <mesh
                                    name="Cube001_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube001_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group
                                name="Cube007"
                                position={[1.458, 14.952, 3.951]}
                                rotation={[0.066, 0, 0.005]}
                                scale={[1.009, 1.09, 1.009]}>
                                <mesh
                                    name="Cube007_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube007_0 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                            </group>
                            <group name="Cube008">
                                <mesh
                                    name="Cube008_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube008_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="Cube009">
                                <mesh
                                    name="Cube009_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube009_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="Cube013">
                                <mesh
                                    name="Cube013_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube013_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group
                                name="Cube011"
                                position={[1.458, 14.952, 3.951]}
                                rotation={[0.066, 0, 0.005]}
                                scale={[1.009, 1.09, 1.009]}>
                                <mesh
                                    name="Cube011_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube011_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="car">
                                <mesh
                                    name="car_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="Cylinder009" position={[0, -10.001, 1.024]} rotation={[-0.698, 0, 0]}>
                                <mesh
                                    name="Cylinder009_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder009_0 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                                <group name="Cylinder010" position={[0, 1.435, -0.547]} rotation={[0, 1.571, 0]}>
                                    <mesh
                                        name="Cylinder010_0"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder010_0 as Mesh).geometry}
                                        material={materials.cdp_metal}
                                    />
                                    <group
                                        name="Torus001"
                                        position={[0, 2.42, 0]}
                                        rotation={[0, -Math.PI / 2, 0]}
                                        scale={[1.266, 1, 1]}>
                                        <mesh
                                            name="Torus001_0"
                                            castShadow
                                            receiveShadow
                                            geometry={(nodes.Torus001_0 as Mesh).geometry}
                                            material={materials.cdp_plastic}
                                        />
                                        <mesh
                                            name="Torus001_1"
                                            castShadow
                                            receiveShadow
                                            geometry={(nodes.Torus001_1 as Mesh).geometry}
                                            material={materials.cdp_metal}
                                        />
                                    </group>
                                </group>
                            </group>
                            <group
                                name="Cylinder011"
                                position={[0, -7.4, 1.587]}
                                rotation={[2.197, 0, 0]}
                                scale={0.644}>
                                <mesh
                                    name="Cylinder011_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder011_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                    morphTargetDictionary={(nodes.Cylinder011_0 as Mesh).morphTargetDictionary}
                                    morphTargetInfluences={(nodes.Cylinder011_0 as Mesh).morphTargetInfluences}
                                />
                            </group>
                            <group name="car015">
                                <mesh
                                    name="car015_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car015_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="Cylinder016">
                                <mesh
                                    name="Cylinder016_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder016_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="car016">
                                <mesh
                                    name="car016_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car016_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="Cube003">
                                <mesh
                                    name="Cube003_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube003_0 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                            </group>
                            <group name="car013">
                                <mesh
                                    name="car013_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car013_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="Plane">
                                <mesh
                                    name="Plane_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="Cube004">
                                <mesh
                                    name="Cube004_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cube004_0 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                            </group>
                            <group name="car017">
                                <mesh
                                    name="car017_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car017_0 as Mesh).geometry}
                                    material={materials.white_light}
                                />
                            </group>
                            <group name="car001">
                                <mesh
                                    name="car001_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car001_0 as Mesh).geometry}
                                    material={materials.cdp_body}
                                />
                                <mesh
                                    name="car001_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car001_1 as Mesh).geometry}
                                    material={materials.gloss}
                                />
                            </group>
                            <group name="car006">
                                <mesh
                                    name="car006_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car006_0 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                            </group>
                            <group name="car018" position={[0, 6.49, 6.724]}>
                                <mesh
                                    name="car018_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car018_0 as Mesh).geometry}
                                    material={materials.cdp_body}
                                />
                                <mesh
                                    name="car018_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car018_1 as Mesh).geometry}
                                    material={materials.gloss}
                                />
                            </group>
                            <group name="car005">
                                <mesh
                                    name="car005_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car005_0 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                                <mesh
                                    name="car005_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car005_1 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="car019">
                                <mesh
                                    name="car019_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car019_0 as Mesh).geometry}
                                    material={materials.cdp_body}
                                />
                                <mesh
                                    name="car019_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car019_1 as Mesh).geometry}
                                    material={materials.gloss}
                                />
                            </group>
                            <group name="car003">
                                <mesh
                                    name="car003_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car003_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="Cylinder020" position={[0, -10.001, 1.024]} rotation={[-0.698, 0, 0]}>
                                <mesh
                                    name="Cylinder020_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder020_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="car009">
                                <mesh
                                    name="car009_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car009_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group name="car007" position={[-1.979, 0, 0]}>
                                <mesh
                                    name="car007_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car007_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <mesh
                                    name="car007_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car007_1 as Mesh).geometry}
                                    material={materials.white_light}
                                />
                                <mesh
                                    name="car007_2"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car007_2 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                            </group>
                            <group name="Cylinder021" position={[-5.289, 4.289, 1.612]} rotation={[-0.873, 0, 0]}>
                                <mesh
                                    name="Cylinder021_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder021_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <group
                                    name="Cylinder022"
                                    position={[0.001, 1.641, -0.53]}
                                    rotation={[Math.PI / 2, 0, 0]}>
                                    <mesh
                                        name="Cylinder022_0"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder022_0 as Mesh).geometry}
                                        material={materials.cdp_metal}
                                    />
                                    <mesh
                                        name="Cylinder022_1"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder022_1 as Mesh).geometry}
                                        material={materials.white_light}
                                    />
                                    <group
                                        name="Torus002"
                                        position={[0.008, -0.001, -2.419]}
                                        rotation={[1.549, 0, -0.008]}>
                                        <mesh
                                            name="Torus002_0"
                                            castShadow
                                            receiveShadow
                                            geometry={(nodes.Torus002_0 as Mesh).geometry}
                                            material={materials.cdp_plastic}
                                        />
                                        <mesh
                                            name="Torus002_1"
                                            castShadow
                                            receiveShadow
                                            geometry={(nodes.Torus002_1 as Mesh).geometry}
                                            material={materials.cdp_metal}
                                        />
                                    </group>
                                </group>
                            </group>
                            <group name="Plane002" position={[-2.634, -10.819, 1.921]} rotation={[-Math.PI, 0, 0]}>
                                <mesh
                                    name="Plane002_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane002_0 as Mesh).geometry}
                                    material={materials.cdp_body}
                                />
                                <mesh
                                    name="Plane002_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane002_1 as Mesh).geometry}
                                    material={materials.gloss}
                                />
                                <mesh
                                    name="Plane002_2"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane002_2 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <mesh
                                    name="Plane002_3"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane002_3 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                            </group>
                            <group
                                name="Cylinder024"
                                position={[-2.514, -10.75, 1.388]}
                                rotation={[1.342, 1.145, 1.513]}>
                                <mesh
                                    name="Cylinder024_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder024_0 as Mesh).geometry}
                                    material={materials.cdp_body}
                                />
                                <mesh
                                    name="Cylinder024_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder024_1 as Mesh).geometry}
                                    material={materials.gloss}
                                />
                                <mesh
                                    name="Cylinder024_2"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder024_2 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                                <mesh
                                    name="Cylinder024_3"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder024_3 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <mesh
                                    name="Cylinder024_4"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder024_4 as Mesh).geometry}
                                    material={materials.white_light}
                                />
                            </group>
                            <group
                                name="Cylinder025"
                                position={[-4.836, -0.934, 0.803]}
                                rotation={[Math.PI, -Math.PI / 9, 0.053]}>
                                <mesh
                                    name="Cylinder025_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder025_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                    morphTargetDictionary={(nodes.Cylinder025_0 as Mesh).morphTargetDictionary}
                                    morphTargetInfluences={(nodes.Cylinder025_0 as Mesh).morphTargetInfluences}
                                />
                            </group>
                            <group
                                name="Cylinder026"
                                position={[-5.965, -3.927, 1.485]}
                                rotation={[3.142, -0.349, -1.215]}>
                                <mesh
                                    name="Cylinder026_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder026_0 as Mesh).geometry}
                                    material={materials.cdp_body}
                                />
                                <mesh
                                    name="Cylinder026_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder026_1 as Mesh).geometry}
                                    material={materials.gloss}
                                />
                                <mesh
                                    name="Cylinder026_2"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder026_2 as Mesh).geometry}
                                    material={materials.white_light}
                                />
                                <mesh
                                    name="Cylinder026_3"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder026_3 as Mesh).geometry}
                                    material={materials.cdp_plastic}
                                />
                                <mesh
                                    name="Cylinder026_4"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder026_4 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <group
                                    name="Cylinder027"
                                    position={[-2.875, 1.659, 0.273]}
                                    rotation={[0.001, -0.001, -1.773]}>
                                    <mesh
                                        name="Cylinder027_0"
                                        castShadow
                                        receiveShadow
                                        geometry={(nodes.Cylinder027_0 as Mesh).geometry}
                                        material={materials.cdp_metal}
                                        morphTargetDictionary={(nodes.Cylinder027_0 as Mesh).morphTargetDictionary}
                                        morphTargetInfluences={(nodes.Cylinder027_0 as Mesh).morphTargetInfluences}
                                    />
                                </group>
                            </group>
                            <group
                                name="Cylinder028"
                                position={[-5.773, -2.749, 1.017]}
                                rotation={[3.142, -0.349, -1.215]}>
                                <mesh
                                    name="Cylinder028_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder028_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                            </group>
                            <group
                                name="Cylinder014"
                                position={[-4.761, 11.355, 3.661]}
                                rotation={[-2.984, 0.086, 0.181]}>
                                <mesh
                                    name="Cylinder014_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder014_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <mesh
                                    name="Cylinder014_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder014_1 as Mesh).geometry}
                                    material={materials.cdp_body}
                                />
                                <mesh
                                    name="Cylinder014_2"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder014_2 as Mesh).geometry}
                                    material={materials.gloss}
                                />
                                <mesh
                                    name="Cylinder014_3"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder014_3 as Mesh).geometry}
                                    material={materials.white_light}
                                />
                            </group>
                            <group
                                name="Cylinder013"
                                position={[-3.821, 14.727, 4.705]}
                                rotation={[3.137, 0.421, 0.228]}>
                                <mesh
                                    name="Cylinder013_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder013_0 as Mesh).geometry}
                                    material={materials.cdp_metal}
                                />
                                <mesh
                                    name="Cylinder013_1"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder013_1 as Mesh).geometry}
                                    material={materials.cdp_body}
                                />
                                <mesh
                                    name="Cylinder013_2"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Cylinder013_2 as Mesh).geometry}
                                    material={materials.gloss}
                                />
                            </group>
                            <group name="Plane005">
                                <mesh
                                    name="Plane005_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane005_0 as Mesh).geometry}
                                    material={materials['Plane.005_0']}
                                />
                            </group>
                            <group name="car008">
                                <mesh
                                    name="car008_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.car008_0 as Mesh).geometry}
                                    material={materials.thruster}
                                    morphTargetDictionary={(nodes.car008_0 as Mesh).morphTargetDictionary}
                                    morphTargetInfluences={(nodes.car008_0 as Mesh).morphTargetInfluences}
                                />
                            </group>
                            <group name="Plane007" position={[8.057, -19.92, 1.196]} scale={0}>
                                <mesh
                                    name="Plane007_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane007_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="Plane008" position={[-9.164, -15.834, 1.196]} scale={0}>
                                <mesh
                                    name="Plane008_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane008_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="Plane009" position={[-2.505, -25.327, -1.805]} scale={0}>
                                <mesh
                                    name="Plane009_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane009_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="Plane010" position={[4.268, -20.196, 1.196]} scale={0}>
                                <mesh
                                    name="Plane010_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane010_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="Plane011" position={[-4.457, -30.773, 6.362]} scale={0}>
                                <mesh
                                    name="Plane011_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane011_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="Plane012" position={[-2.505, -5.961, 10.229]} scale={0}>
                                <mesh
                                    name="Plane012_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane012_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="Plane013" position={[0.709, 8.7, 5.385]} scale={[0.561, 1.011, 0.561]}>
                                <mesh
                                    name="Plane013_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane013_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="Plane014" position={[0.11, 8.076, 4.462]}>
                                <mesh
                                    name="Plane014_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane014_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="Plane015" position={[1.494, 8.824, 4.785]} scale={[0.561, 1.011, 0.561]}>
                                <mesh
                                    name="Plane015_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane015_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="Plane016" position={[-1.321, 6.89, 4.462]} scale={[0.561, 1.011, 0.561]}>
                                <mesh
                                    name="Plane016_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane016_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="Plane017" position={[-0.951, 10.143, 4.462]} scale={[0.561, 1.011, 0.561]}>
                                <mesh
                                    name="Plane017_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane017_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="Plane018" position={[-0.582, 6.869, 4.462]} scale={[0.561, 1.011, 0.561]}>
                                <mesh
                                    name="Plane018_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane018_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                            <group name="Plane019" position={[-0.582, -24.914, 7.175]} scale={0}>
                                <mesh
                                    name="Plane019_0"
                                    castShadow
                                    receiveShadow
                                    geometry={(nodes.Plane019_0 as Mesh).geometry}
                                    material={materials.thruster}
                                />
                            </group>
                        </group>
                    </group>
                </group>
            </group>
        </RigidBody>
    )
}

useGLTF.preload('/models/cyberpunk_hovercar.glb')