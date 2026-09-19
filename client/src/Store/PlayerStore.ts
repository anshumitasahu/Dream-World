import { create } from 'zustand';
import * as THREE from 'three';

interface PlayerStore {
    position: THREE.Vector3
    setPlayerPosition: (position: THREE.Vector3) => void
}

export const usePlayerStore = create<PlayerStore>()((set, get) => ({
    position: new THREE.Vector3(),
    setPlayerPosition: (position) => {
        get().position.copy(position)
        set({
            position: get().position
        })
    },
}))