import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from 'three';
import { Ecctrl, type EcctrlHandle } from "ecctrl";
import { usePlayerHudStore } from './PlayerHudStore'

const MOUSE_SENSITIVITY = 0.0020;
const MAX_LOOK_PITCH = 1.55;
const EYE_HEIGHT_ABOVE_CENTER = 0.02;
const WALK_SPEED = 4;
const RUN_SPEED = 8;

export default function Player() {
    const ecctrlRef = useRef<EcctrlHandle>(null);
    const pressedKeysRef = useRef<Set<string>>(new Set());
    const lookYawRef = useRef(0);
    const lookPitchRef = useRef(0);
    const lookEulerRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
    const renderer = useThree((s) => s.gl)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => pressedKeysRef.current.add(e.code);
        const handleKeyUp = (e: KeyboardEvent) => pressedKeysRef.current.delete(e.code);

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        }
    }, []);

    useEffect(() => {
        const canvas = renderer.domElement;
        const handlePointerLockChange = () => {
            usePlayerHudStore.getState().setPlayerHud({ isPointerLocked: document.pointerLockElement === canvas });
        }
        const handleMouseMove = (e: MouseEvent) => {
            if (document.pointerLockElement !== canvas) return;
            lookYawRef.current -= e.movementX * MOUSE_SENSITIVITY;
            const nextPitch = lookPitchRef.current + e.movementY * MOUSE_SENSITIVITY;
            lookPitchRef.current = Math.min(MAX_LOOK_PITCH, nextPitch);
        }
        document.addEventListener('pointerlockchange', handlePointerLockChange);
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('pointerlockchange', handlePointerLockChange);
            document.removeEventListener('mousemove', handleMouseMove);
        }
    }, [renderer]);

    useFrame((_) => {
        const controller = ecctrlRef.current;
        if (!controller) return;

        const keys = pressedKeysRef.current;

        controller.setMovement({
            forward:
                keys.has('KeyW') || keys.has('ArrowUp'),

            backward:
                keys.has('KeyS') || keys.has('ArrowDown'),

            leftward:
                keys.has('KeyA') || keys.has('ArrowLeft'),

            rightward:
                keys.has('KeyD') || keys.has('ArrowRight'),
            jump:
                keys.has('Space') || keys.has(' ')

        });

        const bodyPosition = controller.currPos;

        _.camera.position.set(
            bodyPosition.x,
            bodyPosition.y + EYE_HEIGHT_ABOVE_CENTER,
            bodyPosition.z,
        );

        const lookEuler = lookEulerRef.current;
        lookEuler.set(
            lookPitchRef.current,
            lookYawRef.current,
            0,
        );

        _.camera.quaternion.setFromEuler(lookEuler);

        usePlayerHudStore.getState().setPlayerHud({
            isGrounded: controller.isOnGround,
        });
    });

    return (
        <Ecctrl
            ref={ecctrlRef}
            position={[0, 2, 10]}
            capsuleRadius={0.5}
            capsuleHalfHeight={0.5}
            maxWalkVel={WALK_SPEED}
            maxRunVel={RUN_SPEED}
            enableToggleRun={true}
        />
    );
};