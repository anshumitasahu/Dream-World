import { create } from 'zustand'
import * as THREE from 'three'

interface PlayerStore {
  /**
   * Live Ecctrl body position, updated every frame. The Vector3 is mutated
   * in place (stable identity) so React subscribers never re-render from it;
   * read it imperatively via `usePlayerStore.getState().position`.
   */
  position: THREE.Vector3
  /**
   * Camera yaw in radians, updated every frame; 0 faces north (−Z). Like
   * `position`, read it imperatively so per-frame writes never re-render React.
   */
  heading: number
  setPlayerPosition: (position: THREE.Vector3) => void
  setPlayerHeading: (heading: number) => void
}

export const usePlayerStore = create<PlayerStore>()((set, get) => ({
  position: new THREE.Vector3(),
  heading: 0,
  setPlayerPosition: (position) => {
    get().position.copy(position)
    set({ position: get().position })
  },
  setPlayerHeading: (heading) => set({ heading }),
}))
