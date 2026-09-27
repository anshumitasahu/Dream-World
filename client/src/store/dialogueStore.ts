import { create } from 'zustand'

export interface Dialogue {
  id: string
  speaker: string
  avatar?: string
  text: string
}

interface ShowDialogueOptions {
  /** Automatically hide the dialogue after this many milliseconds. Omit to keep it open until closed/replaced. */
  autoCloseMs?: number
}

interface DialogueStore {
  /** Bumped on every showDialogue call so the HUD can replay its enter animation. */
  version: number
  dialogue: Dialogue | null
  showDialogue: (dialogue: Dialogue, options?: ShowDialogueOptions) => void
  /** Close the active dialogue. Pass a dialogue id to only close when it is still the one on screen. */
  closeDialogue: (dialogueId?: string) => void
}

let autoCloseTimer: ReturnType<typeof setTimeout> | null = null

function clearAutoCloseTimer() {
  if (autoCloseTimer !== null) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
}

export const useDialogueStore = create<DialogueStore>()((set, get) => ({
  version: 0,
  dialogue: null,
  showDialogue: (dialogue, options) => {
    if (get().dialogue === dialogue) return
    clearAutoCloseTimer()
    set({ dialogue, version: get().version + 1 })
    if (options?.autoCloseMs !== undefined) {
      autoCloseTimer = setTimeout(() => {
        autoCloseTimer = null
        get().closeDialogue(dialogue.id)
      }, options.autoCloseMs)
    }
  },
  closeDialogue: (dialogueId) => {
    const current = get().dialogue
    if (!current) return
    if (dialogueId !== undefined && current.id !== dialogueId) return
    clearAutoCloseTimer()
    set({ dialogue: null })
  },
}))
