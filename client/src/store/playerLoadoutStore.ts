import { create } from 'zustand'

/** Which player model the world renders: the bare placeholder or the armed viewmodel. */
export type ActiveCharacterModel = 'unarmed' | 'armed'

interface PlayerLoadoutStore {
  activeCharacter: ActiveCharacterModel
  /** Pick up the world weapon and switch the player to the armed character. */
  equipWeapon: () => void
  /** Drop the loadout back to the unarmed character (new world / fresh run). */
  resetLoadout: () => void
}

export const usePlayerLoadoutStore = create<PlayerLoadoutStore>()((set, get) => ({
  activeCharacter: 'unarmed',
  equipWeapon: () => {
    if (get().activeCharacter === 'armed') return
    set({ activeCharacter: 'armed' })
  },
  resetLoadout: () => {
    if (get().activeCharacter === 'unarmed') return
    set({ activeCharacter: 'unarmed' })
  },
}))
