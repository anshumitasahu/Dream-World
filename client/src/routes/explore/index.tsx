import { useMemo } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { CompassIcon, PlusIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { getToken } from '../../lib/auth'
import { useLogout, useMe } from '../../hooks/useAuth'
import { useChats } from '../../hooks/useChat'
import { useExploreDreams } from '../../hooks/useDream'
import { ChatHistorySidebar } from '../../components/ui/Chat'
import { DreamGrid, DreamGridSkeleton, FeaturedRow } from '../../components/ui/Dream'

export const Route = createFileRoute('/explore/')({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const logout = useLogout()
  const meQuery = useMe()
  const chatsQuery = useChats()
  const dreamsQuery = useExploreDreams()

  const dreams = dreamsQuery.data ?? []
  const { featured, rest } = useMemo(() => {
    const sorted = [...dreams].sort((a, b) => b.likes - a.likes)
    return { featured: sorted.slice(0, 3), rest: sorted.slice(3) }
  }, [dreams])

  const isEmpty = !dreamsQuery.isPending && !dreamsQuery.isError && dreams.length === 0

  return (
    <div className='relative flex min-h-screen w-full bg-black text-white'>
      <ChatHistorySidebar
        chats={chatsQuery.data ?? []}
        isLoading={chatsQuery.isPending}
        isError={chatsQuery.isError}
        user={meQuery.data ?? null}
        onLogout={logout}
      />

      <div className='relative min-w-0 flex-1'>
        <div className='pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(32,155,255,0.14),transparent_70%)]' />

        <main className='relative z-10 mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-14'>
          <header className='mb-10 flex flex-col gap-3'>
            <span className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-blue-300/80'>
              <CompassIcon className='h-4 w-4' weight='fill' />
              Explore
            </span>
            <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>Dreams from the community</h1>
            <p className='max-w-xl text-sm leading-relaxed text-white/50'>
              Step into worlds other dreamers have built. Open a dream to walk around inside it.
            </p>
          </header>

          {dreamsQuery.isPending ? (
            <DreamGridSkeleton />
          ) : dreamsQuery.isError ? (
            <div className='flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-20 text-center'>
              <WarningCircleIcon className='h-8 w-8 text-red-300/70' />
              <p className='text-sm font-medium text-white'>Couldn&apos;t load dreams</p>
              <p className='text-[12.5px] text-white/40'>Something went wrong while fetching the feed.</p>
            </div>
          ) : isEmpty ? (
            <div className='flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-24 text-center'>
              <CompassIcon className='h-8 w-8 text-white/30' />
              <p className='text-sm font-medium text-white'>No dreams published yet</p>
              <p className='text-[12.5px] text-white/40'>Be the first to share a world with the community.</p>
              <Link
                to='/chat/new'
                className='mt-3 flex items-center gap-2 rounded-xl border border-[#54A1FD] bg-[radial-gradient(95%_60%_at_50%_75%,#005FD6_0%,#209BFF_100%)] px-4 py-2 text-sm font-medium text-white shadow-[0px_4px_48px_-12px_#1187FF,inset_0px_1px_8px_-4px_#FFFFFF] transition hover:brightness-110'
              >
                <PlusIcon className='h-4 w-4' weight='bold' />
                Create a dream
              </Link>
            </div>
          ) : (
            <div className='flex flex-col gap-14'>
              <FeaturedRow dreams={featured} />
              <DreamGrid dreams={rest} title={featured.length > 0 ? 'More dreams' : 'All dreams'} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
