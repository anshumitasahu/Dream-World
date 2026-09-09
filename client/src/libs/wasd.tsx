import { PointerLockControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

export default function useWASD() {
    const keys = useRef({
        w: false,
        a: false,
        s: false,
        d: false,
        space: false,
    })
    const control = useRef<any>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            console.log(e.key)
            if (e.key === 'w' || e.key === 'ArrowUp') {
                keys.current.w = true
            }
            if (e.key === 's' || e.key === 'ArrowDown') {
                keys.current.s = true
            }
            if (e.key === 'a' || e.key === 'ArrowLeft') {
                keys.current.a = true
            }
            if (e.key === 'd' || e.key === 'ArrowRight') {
                keys.current.d = true
            }
            if (e.key === ' ') {
                keys.current.space = true
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'w' || e.key === 'ArrowUp') {
                keys.current.w = false
            }
            if (e.key === 's' || e.key === 'ArrowDown') {
                keys.current.s = false
            }
            if (e.key === 'a' || e.key === 'ArrowLeft') {
                keys.current.a = false
            }
            if (e.key === 'd' || e.key === 'ArrowRight') {
                keys.current.d = false
            }
            if (e.key === ' ') {
                keys.current.space = false
            }
        };


        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        }
    }, [])

    useFrame((_, delta) => {
        const speed = 0.5 * delta
        const jump = 1;
        const gravity = 1;

        if (keys.current["w"]) control?.current?.moveForward(speed);
        if (keys.current["s"]) control?.current?.moveForward(-speed);
        if (keys.current["a"]) control?.current?.moveRight(-speed);
        if (keys.current["d"]) control?.current?.moveRight(speed);
        if (keys.current["space"]) control.current.object.position.y +=  (jump * delta);

        // console.log(control.current.object.position.y);
    });

    return <PointerLockControls ref={control} />;
}