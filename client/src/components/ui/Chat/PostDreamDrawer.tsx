import { useEffect, useRef, useState } from 'react'
import { CheckIcon, CloudArrowUpIcon, SpinnerGapIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react'

interface PostDreamDrawerProps {
  open: boolean
  isPending: boolean
  isError: boolean
  isSuccess: boolean
  errorMessage: string | null
  onPublish: (input: { title: string; tags: string[] }) => void
  onClose: () => void
}

export function PostDreamDrawer({ open, isPending, isError, isSuccess, errorMessage, onPublish, onClose }: PostDreamDrawerProps) {
  const titleRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [touched, setTouched] = useState(false)
  const titleEmpty = title.trim().length === 0

  useEffect(() => {
    if (open) titleRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function submit() {
    setTouched(true)
    if (titleEmpty || isPending) return
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onPublish({ title: title.trim(), tags: tagList })
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      />
      <aside
        role='dialog'
        aria-modal='true'
        aria-label='Publish dream'
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/10 bg-[#111113] text-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='flex items-start justify-between gap-3 border-b border-white/10 p-6 pb-5'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black'>
              <CloudArrowUpIcon className='h-5 w-5' weight='bold' />
            </div>
            <div>
              <h2 className='text-[15px] font-semibold'>Publish dream</h2>
              <p className='text-[12.5px] text-white/45'>Share this world to Explore for others to visit.</p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            title='Close'
            aria-label='Close'
            className='flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white'
          >
            <XIcon className='h-4 w-4' />
          </button>
        </div>

        <div className='flex-1 space-y-3.5 overflow-y-auto p-6'>
          <label className='block'>
            <span className='mb-1.5 block text-[12px] font-medium text-white/60'>Title</span>
            <input
              ref={titleRef}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  submit()
                }
              }}
              placeholder='A name for your dream…'
              aria-label='Dream title'
              tabIndex={open ? 0 : -1}
              className={`w-full rounded-xl border bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 transition focus:outline-none ${
                touched && titleEmpty
                  ? 'border-red-400/50 focus:border-red-400/70'
                  : 'border-white/10 focus:border-white/30'
              }`}
            />
            {touched && titleEmpty && <span className='mt-1 block text-[12px] text-red-300'>Give your dream a title.</span>}
          </label>

          <label className='block'>
            <span className='mb-1.5 block text-[12px] font-medium text-white/60'>Tags <span className='font-normal text-white/35'>(optional, comma separated)</span></span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  submit()
                }
              }}
              placeholder='sunset, floating islands, cozy…'
              aria-label='Dream tags'
              tabIndex={open ? 0 : -1}
              className='w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 transition focus:border-white/30 focus:outline-none'
            />
          </label>

          {isError && errorMessage && (
            <p className='flex items-start gap-1.5 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[12.5px] leading-snug text-red-300'>
              <WarningCircleIcon className='mt-0.5 h-4 w-4 shrink-0' />
              {errorMessage}
            </p>
          )}
          {isSuccess && (
            <p className='flex items-center gap-1.5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-[12.5px] text-emerald-300'>
              <CheckIcon className='h-4 w-4' weight='bold' />
              Dream published!
            </p>
          )}
        </div>

        <div className='flex justify-end gap-2 border-t border-white/10 p-6 pt-5'>
          <button
            type='button'
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className='rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/25 hover:text-white'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={submit}
            disabled={isPending}
            tabIndex={open ? 0 : -1}
            className='flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-blue-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isPending && <SpinnerGapIcon className='h-4 w-4 animate-spin' />}
            {isPending ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </aside>
    </div>
  )
}
