export default function Fog({ sky, fog, near, far }: {
    sky: string; fog: string;
    near: number; far: number
}) {
    return (
        <>
            <color attach="background" args={[sky]} />
            <fog attach="fog" args={[fog, near, far]} />
        </>
    )
}