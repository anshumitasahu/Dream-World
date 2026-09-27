import { useLoader, type ThreeElements } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useMemo } from 'react'
import { TextureLoader, RepeatWrapping, SRGBColorSpace } from 'three'
import { textureRegistry, type TextureKind } from '../../World/texture/textureRegistry'

const GROUND_TEXTURE_FILES = ['diff.png', 'nor_gl.png', 'rough.png', 'ao.png']

/** [diffuse, normal, roughness, ao] texture paths for a ground texture, resolved from textureRegistry */
export function groundTexturePaths(texture: TextureKind = 'default'): string[] {
    const { url } = textureRegistry[texture]
    return GROUND_TEXTURE_FILES.map((file) => `${url}/${file}`)
}

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

export function OpenPlains({ size = DEFAULT_SIZE, texture = 'default', ...props }: ThreeElements['group'] & { size?: number; texture?: TextureKind }) {
    const half = size / 2
    const texturePaths = useMemo(() => groundTexturePaths(texture), [texture])
    const [diffuse, normal, roughness, ao] = useLoader(TextureLoader, texturePaths)

    diffuse.colorSpace = SRGBColorSpace;
    const textureRepeat = size / 10;
    [diffuse, normal, roughness, ao].forEach((map) => {
        map.wrapS = RepeatWrapping
        map.wrapT = RepeatWrapping
        map.repeat.set(textureRepeat, textureRepeat)
        map.anisotropy = 4
    })

    return (
        <group {...props} dispose={null}>
            <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
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
