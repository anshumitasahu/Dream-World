import { create } from 'zustand'

interface ShakeOptions {
  /** How long the shake lasts, in milliseconds. */
  durationMs: number
  /** Peak camera displacement in world units. Defaults to the store default. */
  intensity?: number
}

interface CameraShakeStore {
  /**
   * Wall-clock timestamp (ms) the shake stops, or null while the camera is
   * still. Stored as an absolute time (not a countdown) so the per-frame camera
   * code can derive the current strength from any tick without the store
   * owning a timer — same idea as `alarmEndsAt` in playerHudStore.
   */
  shakeEndsAt: number | null
  /** Total length of the active shake, used to fade the offset out. */
  shakeDurationMs: number
  /** Peak camera displacement in world units. */
  intensity: number
  /** Begin a shake. Restarts and overrides any shake already in progress. */
  startShake: (options: ShakeOptions) => void
  /** Stop the shake immediately. No-op while idle. */
  stopShake: () => void
  /**
   * Wall-clock stop time (ms) of the additive weapon-recoil jolt, or null while
   * still. Kept separate from the trauma shake so firing composes with a dragon
   * roar instead of cutting it short.
   */
  recoilEndsAt: number | null
  /** Total length of the active recoil jolt, used to fade it out. */
  recoilDurationMs: number
  /** Peak recoil displacement in world units. */
  recoilIntensity: number
  /** Begin a recoil jolt. Restarts (does not stack) on rapid fire. */
  kickRecoil: (options: ShakeOptions) => void
  /** Stop the recoil jolt immediately. No-op while idle. */
  stopRecoil: () => void
}

export const DEFAULT_SHAKE_INTENSITY = 0.35
export const DEFAULT_SHAKE_DURATION_MS = 1200
export const DEFAULT_RECOIL_INTENSITY = 0.2
export const DEFAULT_RECOIL_DURATION_MS = 80

export const useCameraShakeStore = create<CameraShakeStore>()((set, get) => ({
  shakeEndsAt: null,
  shakeDurationMs: DEFAULT_SHAKE_DURATION_MS,
  intensity: DEFAULT_SHAKE_INTENSITY,
  startShake: ({ durationMs, intensity }) => {
    set({
      shakeEndsAt: Date.now() + durationMs,
      shakeDurationMs: durationMs,
      intensity: intensity ?? DEFAULT_SHAKE_INTENSITY,
    })
  },
  stopShake: () => {
    if (get().shakeEndsAt === null) return
    set({ shakeEndsAt: null })
  },
  recoilEndsAt: null,
  recoilDurationMs: DEFAULT_RECOIL_DURATION_MS,
  recoilIntensity: DEFAULT_RECOIL_INTENSITY,
  kickRecoil: ({ durationMs, intensity }) => {
    set({
      recoilEndsAt: Date.now() + durationMs,
      recoilDurationMs: durationMs,
      recoilIntensity: intensity ?? DEFAULT_RECOIL_INTENSITY,
    })
  },
  stopRecoil: () => {
    if (get().recoilEndsAt === null) return
    set({ recoilEndsAt: null })
  },
}))
