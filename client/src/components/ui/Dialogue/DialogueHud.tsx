import AvatarFrame from '../Hud/AvatarFrame'
import DialogueBox from '../Hud/DialogueBox'
import { useDialogueStore } from '../../../store/dialogueStore'

export default function DialogueHud() {
  const dialogue = useDialogueStore((state) => state.dialogue)
  const version = useDialogueStore((state) => state.version)

  if (!dialogue) return null

  return (
    <div className='pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center px-4'>
      <div
        key={version}
        className='flex w-full max-w-2xl animate-dialogue-in items-center gap-3 drop-shadow-2xl'
      >
        {dialogue.avatar && (
          <AvatarFrame className='h-45 w-auto shrink-0' imgSrc={dialogue.avatar} />
        )}
        <DialogueBox className='w-full'>
          <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/90'>
            {dialogue.speaker}
          </p>
          <p className='text-[15px] font-normal leading-snug text-white/90'>{dialogue.text}</p>
        </DialogueBox>
      </div>
    </div>
  )
}
