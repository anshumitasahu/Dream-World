import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { BorderBeam } from 'border-beam'
import { getChatErrorMessage, useCreateChat } from '../../../hooks/useChat'
import { getToken } from '../../../lib/auth'

const DRAFT_KEY = 'dream-draft'
const MAX_LENGTH = 1000

const SUGGESTIONS = [
  'a floating island with a dragon perched above the clouds',
  'a neon cyberpunk city street at midnight in the rain',
  'an enchanted forest with glowing mushrooms and fireflies',
  'a dreamy colorscape with floating islands',
]

function autoresize(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 200)}px`
}

interface LandingChatBoxProps {
  hideSuggestion?: boolean
  suggestionsAlign?: 'left' | 'center'
  initialValue?: string
  controlledValue?: string
  onControlledChange?: (value: string) => void
}

export function LandingChatBox({
  hideSuggestion,
  suggestionsAlign = 'left',
  initialValue = '',
  controlledValue,
  onControlledChange,
}: LandingChatBoxProps) {
  const navigate = useNavigate()
  const createChat = useCreateChat()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isControlled = controlledValue !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState(initialValue)
  const value = isControlled ? (controlledValue ?? '') : uncontrolledValue
  const disabled = value.trim().length === 0 || createChat.isPending

  useEffect(() => {
    const el = inputRef.current
    if (el) autoresize(el)
  }, [value])

  function submit() {
    const trimmed = value.trim()
    if (trimmed.length === 0 || createChat.isPending) return
    if (!getToken()) {
      try {
        sessionStorage.setItem(DRAFT_KEY, trimmed)
      } catch {
        /* storage unavailable — continue to signup anyway */
      }
      void navigate({ to: '/auth/signup' })
      return
    }
    createChat.mutate(trimmed)
  }

  function applySuggestion(text: string) {
    if (isControlled) {
      onControlledChange?.(text)
      requestAnimationFrame(() => inputRef.current?.focus())
      return
    }
    setUncontrolledValue(text)
    const el = inputRef.current
    if (el) {
      el.value = text
      el.focus()
    }
  }

  const suggestionsJustify = suggestionsAlign === 'center' ? 'justify-center' : 'justify-start'

  return (
    <div className='w-full'>
      <BorderBeam size='line' colorVariant='ocean' borderRadius={20}>
        <div className='rounded-[20px] border border-blue-400/70 bg-black/70 shadow-[0_20px_80px_-20px_rgba(34,211,238,0.35)] backdrop-blur-xl'>
          <label htmlFor='dream-input' className='sr-only'>
            Describe your dream world
          </label>
          <textarea
            id='dream-input'
            ref={inputRef}
            rows={3}
            maxLength={MAX_LENGTH}
            defaultValue={isControlled ? undefined : initialValue}
            value={isControlled ? controlledValue : undefined}
            onChange={
              isControlled
                ? (event) => {
                    onControlledChange?.(event.target.value)
                  }
                : (event) => {
                    setUncontrolledValue(event.target.value)
                  }
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            placeholder='i dream a world where lives a dragon…'
            className='max-h-50 w-full resize-none bg-transparent px-5 pt-4 text-base leading-relaxed text-white outline-none placeholder:text-white/35 sm:text-lg'
          />
          <div className='flex items-center justify-between border-t border-white/10 px-4 pt-3 pb-2'>
            <div className='flex items-center gap-3 px-4 pb-3 pt-1'>
              <span className='hidden items-center gap-1.5 text-xs text-white/40 sm:flex'>
                <kbd className='rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans text-[11px] text-white/60'>
                  Enter
                </kbd>
                to dream
                <span className='text-white/25'>·</span>
                <kbd className='rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans text-[11px] text-white/60'>
                  Shift + Enter
                </kbd>
                new line
              </span>
              <span className='ml-auto text-xs tabular-nums text-white/30 sm:ml-0'>
                {value.length}/{MAX_LENGTH}
              </span>
            </div>
            <div>
              <button
                type='button'
                onClick={submit}
                disabled={disabled}
                aria-label='Create your dream world'
                className={`ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:bg-blue-200 disabled:cursor-not-allowed sm:ml-0 ${disabled ? 'opacity-40' : ''}`}
              >
                {createChat.isPending ? (
                  <span className='h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black' />
                ) : (
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
                    <path
                      d='M12 19V5m0 0-6 6m6-6 6 6'
                      stroke='currentColor'
                      strokeWidth='2.2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </BorderBeam>

      {createChat.isError && (
        <p role='alert' className='mt-3 text-center text-sm text-red-400'>
          {getChatErrorMessage(createChat.error)}
        </p>
      )}

      {
        !hideSuggestion && (
          <div className={`mt-12 flex flex-wrap items-start gap-2 ${suggestionsJustify}`}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type='button'
                onClick={() => applySuggestion(s)}
                className='max-w-full truncate rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/60 backdrop-blur transition hover:border-blue-300/40 hover:text-white sm:max-w-[320px]'
              >
                {s}
              </button>
            ))}
          </div>
        )
      }
    </div>
  )
}
