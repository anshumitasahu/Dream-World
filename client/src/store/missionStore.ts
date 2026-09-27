import { create } from 'zustand'
import type { MissionConfig } from '../components/World/worldTypes'

interface MissionStore {
  /** Missions for the active world, in server order. */
  missions: MissionConfig[]
  /** Ids of missions the player has completed, in completion order. */
  completedIds: string[]
  /** Bumped on every completed mission so the HUD can replay its feedback animation. Monotonic across world loads. */
  version: number
  /** Replace the mission set when a new world loads; resets progress only when the set actually changes. */
  setMissions: (missions: MissionConfig[]) => void
  /** Mark a mission complete. No-op if it was already completed. */
  completeMission: (missionId: string) => void
}

function sameMissionIds(a: MissionConfig[], b: MissionConfig[]): boolean {
  return a.length === b.length && a.every((mission, index) => mission.id === b[index]?.id)
}

export const useMissionStore = create<MissionStore>()((set, get) => ({
  missions: [],
  completedIds: [],
  version: 0,
  setMissions: (missions) => {
    if (sameMissionIds(get().missions, missions)) return
    set({ missions, completedIds: [] })
  },
  completeMission: (missionId) => {
    const completedIds = get().completedIds
    if (completedIds.includes(missionId)) return
    set({ completedIds: [...completedIds, missionId], version: get().version + 1 })
  },
}))
