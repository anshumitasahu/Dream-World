import { memo, useEffect, useRef, useState } from 'react'
import type { ChatHistoryEntry } from '../../../api/chat'
import { describeObject, objectCount, objectModelNames, parseAgentTurn } from './worldUtils'
import Logo from '../../../assets/Logo'
import { CoinsIcon, SparkleIcon, TerminalIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { ThinkingOrb } from 'thinking-orbs'

interface ChatThreadProps {
  histories: ChatHistoryEntry[]
  isPending: boolean
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function formatTokens(tokens: number): string {
  if (tokens < 1000) return String(tokens)
  const k = tokens / 1000
  const rounded = Math.round(k * 10) / 10
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}k`
}

export const ChatThread = memo(function ChatThread({ histories, isPending }: ChatThreadProps) {
  const threadRef = useRef<HTMLDivElement>(null)
  const [stickToBottom, setStickToBottom] = useState(true)

  function handleScroll() {
    const el = threadRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    setStickToBottom(distance < 120)
  }

  useEffect(() => {
    if (!stickToBottom) return
    const el = threadRef.current
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [histories.length, isPending, stickToBottom])

  if (histories.length === 0 && !isPending) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center px-6 py-12 text-center'>
        <div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5'>
          <Logo className='w-7' />
        </div>
        <h3 className='mt-5 text-[15px] font-semibold text-white'>Shape your dream world</h3>
        <p className='mt-1.5 max-w-[26ch] text-[13px] leading-relaxed text-white/45'>
          Describe a scene, creature, or change and watch it appear in 3D.
        </p>
        <div className='mt-5 flex flex-col gap-2 text-[12px] text-white/40'>
          <p className='rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5'>
            “a floating island at sunset”
          </p>
          <p className='rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5'>
            “add glowing trees around the lake”
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={threadRef} onScroll={handleScroll} className='flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-6'>
      {histories.map((h) => {
        const turn = parseAgentTurn(h.response)
        const count = objectCount(turn.world)
        return (
          <div key={h.id} className='space-y-4'>
            <div className='flex justify-end'>
              <div className='max-w-[85%]'>
                <div className='rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-[13.5px] leading-relaxed text-black'>
                  {h.message}
                </div>
                {h.createdAt && (
                  <p className='mt-1.5 text-right text-[11px] text-white/30'>{formatTime(h.createdAt)}</p>
                )}
              </div>
            </div>

            <div className='flex gap-3'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5'>
                <Logo className='w-5' />
              </div>
              <div className='min-w-0 max-w-[85%]'>
                {h.response ? (
                  <div className='rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-3'>
                    {turn.message ? (
                      <p className='text-[13.5px] leading-relaxed text-white/85'>{turn.message}</p>
                    ) : (
                      <p className='flex items-center gap-1.5 text-[13px] font-medium text-white'>
                        <SparkleIcon className='h-3.5 w-3.5 text-blue-300' />
                        World updated
                      </p>
                    )}
                    <p className={`flex items-center gap-1.5 text-[12px] text-white/50 ${turn.message ? 'mt-2' : 'mt-1'}`}>
                      <TerminalIcon className='h-3 w-3' />
                      {count} {count === 1 ? 'object' : 'objects'} placed
                      {h.updatedAt && <span className='text-white/30'>· {formatTime(h.updatedAt)}</span>}
                    </p>
                    {turn.usage && (
                      <p className='mt-1.5 flex items-center gap-1.5 text-[12px] text-white/45'>
                        <CoinsIcon className='h-3 w-3 text-blue-300' weight='fill' />
                        <span className='tabular-nums'>{formatTokens(turn.usage.totalTokens)} </span>
                        <span className='text-white/25'>·</span>
                        <span className='tabular-nums'>{turn.usage.creditsUsed} dream coin used</span>
                        <span className='text-white/25'>·</span>
                        <span className='tabular-nums'>{turn.usage.creditsLeft} left</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className='flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-[13px] text-white/50'>
                    <WarningCircleIcon className='h-4 w-4 text-amber-300/80' />
                    No world data in this response
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {isPending && (
        <div className='flex gap-3'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5'>
            <ThinkingOrb state='searching' size={20} />
          </div>
          <div className='rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-3'>
            <p className='animate-pulse text-[13px] text-white/60'>Dreaming up your world…</p>
          </div>
        </div>
      )}
    </div>
  )
})
