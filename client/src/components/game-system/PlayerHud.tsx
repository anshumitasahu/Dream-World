import { usePlayerHudStore } from "./PlayerHudStore";

export default function PlayerHud() {
    const { isPointerLocked, isGrounded } = usePlayerHudStore();

    const requestPointerLock = () => {
        const canvas = document.querySelector('#root canvas')
        if (!(canvas instanceof HTMLCanvasElement)) return
        const lockRequest = canvas.requestPointerLock() as unknown as Promise<void> | undefined
        if (lockRequest && typeof lockRequest.catch === 'function') lockRequest.catch(() => { })
    }

    if (isPointerLocked) {
        return (
            <>
                <div
                    style={{
                        position: "fixed",
                        left: "50%",
                        top: "50%",
                        width: "6",
                        height: "6",
                        marginLeft: -3,
                        marginTop: -3,
                        borderRadius: '50%',
                        background: 'white',
                        pointerEvents: 'none',
                        zIndex: 10
                    }} />
                <div
                    style={{
                        position: 'fixed',
                        left: 16,
                        bottom: 16,
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: isGrounded ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.85)',
                        color: 'white',
                        fontSize: 14,
                        fontFamily: 'sans-serif',
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                >
                    {isGrounded ? 'Grounded' : 'AiirBorne'}
                </div>
            </>
        )
    }

    return (
        <div
            onClick={requestPointerLock}
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0 , 0 , 0.45)',
                color: 'white',
                fontSize: 20,
                cursor: 'pointer',
                userSelect: 'none',
                zIndex: 10
            }}
        >
            Click to look around (WASD to move, ESC to release)
        </div>
    )
}