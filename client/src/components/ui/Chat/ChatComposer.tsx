import { useRef, useState } from 'react'
import { ArrowUpIcon, SpinnerGapIcon, WarningCircleIcon } from '@phosphor-icons/react'

interface ChatComposerProps {
  isPending: boolean
  isError: boolean
  errorMessage: string | null
  onSend: (message: string, opts: { onSuccess: () => void }) => void
}

export function ChatComposer({ isPending, isError, errorMessage, onSend }: ChatComposerProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const canSend = value.trim().length > 0 && !isPending

  function autoresize() {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  function submit() {
    const message = value.trim()
    if (message.length === 0 || isPending) return
    onSend(message, {
      onSuccess: () => {
        setValue('')
        requestAnimationFrame(() => {
          if (taRef.current) taRef.current.style.height = 'auto'
        })
      },
    })
    taRef.current?.focus()
  }

  return (
    <div className='border-t border-white/10 px-4 pb-4 pt-3 sm:px-5'>
      {isError && errorMessage && (
        <p className='mb-2.5 flex items-start gap-1.5 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[12.5px] leading-snug text-red-300'>
          <WarningCircleIcon className='mt-0.5 h-4 w-4 shrink-0' />
          {errorMessage}
        </p>
      )}
      <div
        className={`rounded-2xl border transition-colors ${
          focused ? 'border-white/25 bg-white/[0.06]' : 'border-white/10 bg-white/[0.04]'
        }`}
      >
        <textarea
          ref={taRef}
          rows={1}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            autoresize()
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder='Describe a change to your world…'
          aria-label='Message the dream builder'
          className='max-h-40 w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-[13.5px] leading-relaxed text-white placeholder:text-white/30 focus:outline-none'
        />
        <div className='flex items-center gap-2 px-3 pb-3 pt-1'>
          <p className='hidden text-[11px] text-white/30 sm:block'>Enter to send · Shift + Enter for a new line</p>
          <button
            type='button'
            onClick={submit}
            disabled={!canSend}
            title='Send message'
            aria-label='Send message'
            className='ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-blue-100 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30'
          >
            {isPending ? (
              <SpinnerGapIcon className='h-4 w-4 animate-spin' />
            ) : (
              <ArrowUpIcon className='h-4 w-4' weight='bold' />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
