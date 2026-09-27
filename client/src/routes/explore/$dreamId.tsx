import { useEffect, useRef, useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  ChatCircleDotsIcon,
  CornersInIcon,
  CornersOutIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import { ThinkingOrb } from 'thinking-orbs'
import { getToken } from '../../lib/auth'
import { useMe } from '../../hooks/useAuth'
import { useDreamWorld } from '../../hooks/useDream'
import { WorldViewport } from '../../components/ui/Chat'
import { LikeButton } from '../../components/ui/Dream'

export const Route = createFileRoute('/explore/$dreamId')({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: RouteComponent,
})

const iconBtn =
  'flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/50 text-white/70 backdrop-blur transition hover:border-blue-300/40 hover:text-white'

function RouteComponent() {
  const { dreamId } = Route.useParams()
  const query = useDreamWorld(dreamId)
  const meQuery = useMe()
  const viewportRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === viewportRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else if (viewportRef.current) {
      void viewportRef.current.requestFullscreen()
    }
  }

  const dream = query.data?.dream ?? null
  const world = query.data?.world ?? null
  const isMine = !!dream && !!meQuery.data && dream.author.id === meQuery.data.id
  const initial = (dream?.author.name ?? '?').trim().charAt(0).toUpperCase() || '?'

  return (
    <div ref={viewportRef} className='relative h-screen w-screen overflow-hidden bg-black text-white'>
      {world ? (
        <WorldViewport world={world} loadFailed={false} />
      ) : (
        <div className='flex h-full flex-col items-center justify-center px-6 text-center'>
          {query.isError ? (
            <>
              <WarningCircleIcon className='h-9 w-9 text-red-300/70' />
              <p className='mt-3 text-sm font-medium text-white'>Dream failed to load</p>
              <p className='mt-1 text-[12.5px] text-white/40'>It may have been removed or has no world yet.</p>
              <Link
                to='/explore'
                className='mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white'
              >
                Back to explore
              </Link>
            </>
          ) : (
            <>
              <ThinkingOrb state='searching' size={64} />
              <p className='mt-4 text-sm font-medium text-white'>Loading dream…</p>
            </>
          )}
        </div>
      )}

      {!isFullscreen && (
        <div className='pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 sm:p-6'>
        <div className='pointer-events-auto flex items-center gap-3'>
          <Link to='/explore' title='Back to explore' aria-label='Back to explore' className={iconBtn}>
            <ArrowLeftIcon className='h-5 w-5' />
          </Link>

          {dream && (
            <div className='rounded-2xl border border-white/10 bg-black/50 px-4 py-2.5 backdrop-blur-xl'>
              <h1 className='max-w-[52vw] truncate text-sm font-semibold sm:text-base'>{dream.title}</h1>
              <div className='mt-1 flex items-center gap-2 text-[11.5px] text-white/50'>
                {dream.author.avatarUrl ? (
                  <img src={dream.author.avatarUrl} alt='' className='h-4 w-4 rounded-full object-cover' />
                ) : (
                  <span className='flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[9px] font-semibold text-white/70'>
                    {initial}
                  </span>
                )}
                <span className='truncate'>{dream.author.name ?? 'Dreamer'}</span>
                {dream.tags.length > 0 && (
                  <span className='hidden truncate sm:inline'>
                    · {dream.tags.slice(0, 3).map((tag) => `#${tag}`).join(' ')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='pointer-events-auto flex items-center gap-2'>
          {isMine && dream && (
            <Link
              to='/chat/$chatid'
              params={{ chatid: dream.userChatId }}
              title='Open in chat'
              className='flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3.5 text-sm text-white/70 backdrop-blur transition hover:border-blue-300/40 hover:text-white'
            >
              <ChatCircleDotsIcon className='h-4 w-4' />
              <span className='hidden sm:inline'>Open chat</span>
            </Link>
          )}

          {dream && <LikeButton dreamId={dream.id} liked={dream.likedByMe} likes={dream.likes} />}

          <button
            type='button'
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit full screen' : 'Full screen'}
            aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
            className={iconBtn}
          >
            {isFullscreen ? <CornersInIcon className='h-5 w-5' /> : <CornersOutIcon className='h-5 w-5' />}
          </button>
        </div>
        </div>
      )}
    </div>
  )
}
