import { useLoader, type ThreeElements } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { TextureLoader, RepeatWrapping, SRGBColorSpace } from 'three'

export const GROUND_TEXTURES = [
    '/texture/ground/optimized/road_damaged_diff.png',
    '/texture/ground/optimized/road_damaged_nor_gl.png',
    '/texture/ground/optimized/road_damaged_rough.png',
    '/texture/ground/optimized/road_damaged_ao.png',
]

const DEFAULT_SIZE = 2000
const WALL_HEIGHT = 4
const WALL_THICKNESS = 1

export const OpenPlainsSpawnZones: Array<[number, number, number]> = [
    [0, 0, 20],
    [400, 300, 20],
    [-400, -300, 20],
    [600, -500, 20],
    [-600, 500, 20],
]

export function OpenPlains({ size = DEFAULT_SIZE, ...props }: ThreeElements['group'] & { size?: number }) {
    const half = size / 2
    const [diffuse, normal, roughness, ao] = useLoader(TextureLoader, GROUND_TEXTURES)

    diffuse.colorSpace = SRGBColorSpace;
    const textureRepeat = size / 10;
    [diffuse, normal, roughness, ao].forEach((texture) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.repeat.set(textureRepeat, textureRepeat)
        texture.anisotropy = 4
    })

    return (
        <group {...props} dispose={null}>
            <RigidBody type="fixed" colliders={false} position={[0, -1, 0]}>
                <CuboidCollider args={[half, 1, half]} />
                <mesh receiveShadow rotation-x={-Math.PI / 2}>
                    <planeGeometry args={[size, size]} />
                    <meshStandardMaterial map={diffuse} normalMap={normal} roughnessMap={roughness} aoMap={ao} />
                </mesh>
            </RigidBody>

            {/* Invisible boundary walls (no mesh, colliders only) */}
            <RigidBody type="fixed" colliders={false}>
                <CuboidCollider args={[WALL_THICKNESS, WALL_HEIGHT / 2, half]} position={[-half, WALL_HEIGHT / 2, 0]} />
                <CuboidCollider args={[WALL_THICKNESS, WALL_HEIGHT / 2, half]} position={[half, WALL_HEIGHT / 2, 0]} />
                <CuboidCollider args={[half, WALL_HEIGHT / 2, WALL_THICKNESS]} position={[0, WALL_HEIGHT / 2, -half]} />
                <CuboidCollider args={[half, WALL_HEIGHT / 2, WALL_THICKNESS]} position={[0, WALL_HEIGHT / 2, half]} />
            </RigidBody>
        </group>
    )
}