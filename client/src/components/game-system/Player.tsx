import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { Html } from '@react-three/drei';

const CAM_DIST = 3;
const MOUSE_SENS = 0.0025;
const MIN_PITCH = 0.05;
const MAX_PITCH = 1.3;

export default function Player() {
    const yaw = useRef(0);
    const pitch = useRef(0.42);
    const [locked, setLocked] = useState(false);
    const gl = useThree((s) => s.gl);
    const keys = useRef({
        w: false,
        s: false,
        a: false,
        d: false,
        space: false,
    });
    const body = useRef<any>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            console.log(e.key)
            if (e.key === 'w' || e.key === 'ArrowUp') {
                keys.current.w = true
            };
            if (e.key === 's' || e.key === 'ArrowDown') {
                keys.current.s = true
            };
            if (e.key === 'a' || e.key === 'ArrowLeft') {
                keys.current.a = true
            };
            if (e.key === 'd' || e.key === 'ArrowRight') {
                keys.current.d = true
            };
            if (e.key === ' ') {
                keys.current.space = true
            };
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'w' || e.key === 'ArrowUp') {
                keys.current.w = false
            };
            if (e.key === 's' || e.key === 'ArrowDown') {
                keys.current.s = false
            };
            if (e.key === 'a' || e.key === 'ArrowLeft') {
                keys.current.a = false
            };
            if (e.key === 'd' || e.key === 'ArrowRight') {
                keys.current.d = false
            };
            if (e.key === ' ') {
                keys.current.space = false
            };
        };


        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        }
    }, [])

    useEffect(() => {
        const canvas = gl.domElement;
        const onLockChange = () => setLocked(document.pointerLockElement === canvas);
        const onMouseMove = (e: MouseEvent) => {
            if (document.pointerLockElement !== canvas) return;
            yaw.current -= e.movementX * MOUSE_SENS;
            const next = pitch.current + e.movementY * MOUSE_SENS
            pitch.current = Math.min(MAX_PITCH, Math.max(MIN_PITCH, next))
        }
        document.addEventListener('pointerlockchange', onLockChange);
        document.addEventListener('mousemove', onMouseMove);

        return () => {
            document.removeEventListener('pointerlockchange', onLockChange);
            document.removeEventListener('mousemove', onMouseMove);
        }
    }, [gl]);

    const unlockPointer = () => {
        gl.domElement.requestPointerLock();
    }

    useFrame((_, delta) => {
        const SPEED = 2;
        const b = body.current
        if (!b) return
        const JUMP = 3

        const CAM_SMOOTH = 5
        const LOOK_HEIGHT = 1

        const k = keys.current;
        let x = 0;
        let z = 0;
        if (k["w"]) z -= 1;
        if (k["s"]) z += 1;
        if (k["a"]) x -= 1;
        if (k["d"]) x += 1;

        if (x !== 0 && z !== 0) {
            x *= Math.SQRT1_2
            z *= Math.SQRT1_2
        };

        const s = Math.sin(yaw.current)
        const c = Math.cos(yaw.current)
        const wx = x * c + z * s
        const wz = -x * s + z * c

        const vel = b.linvel();
        let jumpY = vel.y
        if (k['space'])
            jumpY = JUMP;
        b.setLinvel({ x: wx * SPEED, y: jumpY, z: wz * SPEED }, true);

        const cam = _.camera;
        const t = b.translation();
        const cp = Math.cos(pitch.current);
        const targetX = t.x + Math.sin(yaw.current) * cp * CAM_DIST;
        const targetY = t.y + Math.sin(pitch.current) * CAM_DIST;
        const targetZ = t.z + Math.cos(yaw.current) * CAM_DIST;
        const a = 1 - Math.exp(-CAM_SMOOTH * delta);
        cam.position.x += (targetX - cam.position.x) * a;
        cam.position.y += (targetY - cam.position.y) * a;
        cam.position.z += (targetZ - cam.position.z) * a;
        cam.lookAt(t.x, t.y + LOOK_HEIGHT, t.z);
    });

    return (
        <>
            <Html fullscreen>
                {locked ? (
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            width: 6,
                            height: 6,
                            marginLeft: -3,
                            marginTop: -3,
                            borderRadius: '50%',
                            background: 'white',
                            pointerEvents: 'none',
                        }}
                    />
                ) : (
                    <div
                        onClick={unlockPointer}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0, 0, 0, 0.45)',
                            color: 'white',
                            fontSize: 20,
                            cursor: 'pointer',
                            userSelect: 'none',
                        }}
                    >
                        Click to look around (WASD to move, ESC to release)
                    </div>
                )}
            </Html>
            <RigidBody
                colliders={false}
                position={[0, 100, 0]}
                lockRotations
                friction={1}
                restitution={0}
                ref={body}
            >
                <CapsuleCollider args={[0.1, 0.1]} />
                <mesh>
                    <capsuleGeometry args={[0.2, 0.2, 100, 100, 100]} />
                    <meshStandardMaterial color="#e63b3b" />
                </mesh>
            </RigidBody>
        </>
    )
}