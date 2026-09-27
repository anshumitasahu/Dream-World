import { create } from 'zustand'

interface PlayerHudValues {
  isPointerLocked: boolean
}

interface PlayerHudStore extends PlayerHudValues {
  /**
   * Wall-clock timestamp (ms) the alarm rings, or null while no run is active.
   * Kept as an absolute time, not a countdown, so the HUD can re-derive the
   * remaining time from any tick without the store itself holding a timer.
   */
  alarmEndsAt: number | null
  /**
   * True once the alarm has rung and the run is over. Persists after pointer
   * lock is released so the wake-up screen outlives the lock.
   */
  isGameOver: boolean
  setPlayerHud: (patch: Partial<PlayerHudValues>) => void
  /** Begin the alarm countdown. No-op while a run is already in progress. */
  startAlarm: (durationMs: number) => void
  /** Clear the run back to its pre-run state. */
  resetAlarm: () => void
  /** End the run: the alarm rang, show the wake-up screen. */
  endRun: () => void
  /** Leave the wake-up screen and return to the pre-run briefing. */
  restartRun: () => void
}

export const usePlayerHudStore = create<PlayerHudStore>()((set, get) => ({
  isPointerLocked: false,
  alarmEndsAt: null,
  isGameOver: false,
  setPlayerHud: (patch) => {
    const currentState = get()
    const nextIsPointerLocked = patch.isPointerLocked ?? currentState.isPointerLocked
    if (nextIsPointerLocked === currentState.isPointerLocked) return
    set(patch)
  },
  startAlarm: (durationMs) => {
    if (get().alarmEndsAt !== null) return
    set({ alarmEndsAt: Date.now() + durationMs })
  },
  resetAlarm: () => {
    if (get().alarmEndsAt === null) return
    set({ alarmEndsAt: null })
  },
  endRun: () => {
    if (get().isGameOver) return
    set({ isGameOver: true, alarmEndsAt: null })
  },
  restartRun: () => {
    if (!get().isGameOver) return
    set({ isGameOver: false, alarmEndsAt: null })
  },
}))
