import { create } from 'zustand'

interface PlayerHudValues {
    isPointerLocked: Boolean;
    isGrounded: Boolean;
};

interface PlayerHudStore extends PlayerHudValues {
    setPlayerHud: (patch: Partial<PlayerHudValues>) => void;
};

export const usePlayerHudStore = create<PlayerHudStore>()((set, get) => ({
    isPointerLocked: false,
    isGrounded: false,
    setPlayerHud: (patch) => {
        const currentState = get();
        const nextIsPointerLocked = patch.isPointerLocked ?? currentState.isPointerLocked;
        const nextIsGrounded = patch.isGrounded ?? currentState.isGrounded;
        if (
            nextIsPointerLocked === currentState.isPointerLocked &&
            nextIsGrounded === currentState.isGrounded
        )
            return;
        set(patch);
    }
}));