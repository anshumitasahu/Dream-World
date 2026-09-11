import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Ecctrl, type EcctrlHandle } from 'ecctrl';
import { usePlayerHudStore } from './PlayerHudStore';
import CharacterModel from '../models/CharacterModel';

const MOUSE_SENSITIVITY = 0.0025;
const MAX_LOOK_PITCH = 1.56;
const EYE_HEIGHT_ABOVE_CENTER = 0.62;
const WALK_SPEED = 4;
const RUN_SPEED = 8;
const CAPSULE_RADIUS = 0.5;
const CAPSULE_HALF_HEIGHT = 0.5;

export default function EcctrlWrapper() {
    const ecctrlRef = useRef<EcctrlHandle>(null);
    const pressedKeysRef = useRef<Set<string>>(new Set());
    const lookYawRef = useRef(0);
    const lookPitchRef = useRef(0);
    const lookEulerRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'),);
    const renderer = useThree((s) => s.gl);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            pressedKeysRef.current.add(event.code);
        }
        const handleKeyUp = (event: KeyboardEvent) => {
            pressedKeysRef.current.delete(event.code);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    }, []);

    useEffect(() => {
        const canvas = renderer.domElement;

        const handlePointerLockChange = () => {
            usePlayerHudStore.getState().setPlayerHud({
                isPointerLocked: document.pointerLockElement === canvas,
            });
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (document.pointerLockElement !== canvas) return;
            lookYawRef.current -= event.movementX * MOUSE_SENSITIVITY;

            const nextPitch = lookPitchRef.current - event.movementY * MOUSE_SENSITIVITY;

            lookPitchRef.current = Math.min(MAX_LOOK_PITCH, Math.max(-MAX_LOOK_PITCH, nextPitch),
            );
        };

        document.addEventListener('pointerlockchange', handlePointerLockChange);
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('pointerlockchange', handlePointerLockChange);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [renderer]);

    useFrame((state) => {
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

            run:
                keys.has('ShiftLeft'),

            jump:
                keys.has('Space')
        });

        const bodyPosition = controller.currPos;

        state.camera.position.set(
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
        state.camera.quaternion.setFromEuler(lookEuler);

        usePlayerHudStore.getState().setPlayerHud({
            isGrounded: controller.isOnGround,
        });
    });

    return (
        <Ecctrl
            ref={ecctrlRef}
            position={[20, 2, 20]}
            capsuleRadius={CAPSULE_RADIUS}
            capsuleHalfHeight={CAPSULE_HALF_HEIGHT}
            maxWalkVel={WALK_SPEED}
            maxRunVel={RUN_SPEED}
            enableToggleRun={true}
        >
            <CharacterModel position={[0, -0.6, 0]} />
        </Ecctrl>
    );
};