import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getToken } from '../../lib/auth'
import { getChatErrorMessage, useChat, useChats, useSendMessage } from '../../hooks/useChat'
import { getDreamErrorMessage, usePublishDream } from '../../hooks/useDream'
import { useLogout, useMe } from '../../hooks/useAuth'
import {
  ChatHistorySidebar,
  ChatSidebar,
  PostDreamDrawer,
  WorldViewport,
  parseWorld,
} from '../../components/ui/Chat'
import {
  ArrowClockwiseIcon,
  CheckIcon,
  CloudArrowUpIcon,
  CornersInIcon,
  CornersOutIcon,
} from '@phosphor-icons/react'

export const Route = createFileRoute('/chat/$chatid')({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: App,
})

function App() {
  const { chatid } = Route.useParams()
  const logout = useLogout()
  const meQuery = useMe()
  const chatsQuery = useChats()
  const chatQuery = useChat(chatid)
  const sendMessage = useSendMessage(chatid)
  const publishDream = usePublishDream(chatid)
  const [showPostDrawer, setShowPostDrawer] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)

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

  const histories = chatQuery.data?.userChatHistories ?? []
  const latestResponse = histories.length > 0 ? histories[histories.length - 1]?.response : null
  const latestWorld = useMemo(() => parseWorld(latestResponse ?? null), [latestResponse])
  const alreadyPosted = !!chatQuery.data?.dream
  const title = chatQuery.data?.title ?? 'Untitled dream'
  const refreshing = chatQuery.isFetching

  const historyList = chatsQuery.data ?? []
  const user = meQuery.data ?? null

  const buttonStyle = ["relative text-white text-sm",
    "px-4 py-1 rounded-xl cursor-pointer transition-all duration-200 ease-out",
    "border border-[#54A1FD] bg-[radial-gradient(95%_60%_at_50%_75%,#005FD6_0%,#209BFF_100%)]",
    "shadow-[0px_4px_48px_-12px_#1187FF,inset_0px_1px_8px_-4px_#FFFFFF]",
    "active:scale-95 active:rotate-1",
    "after:absolute after:top-[1px] after:right-[10%] after:w-[60%] after:h-[1px]",
    "after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent",
    "hover:brightness-110",
    "flex items-center gap-2.5",
  ].join(" ")

  return (
    <div className='flex gap-4 h-screen w-full flex-col overflow-hidden bg-black text-white lg:flex-row'>
      <div className='hidden shrink-0 lg:block'>
        <ChatHistorySidebar
          chats={historyList}
          isLoading={chatsQuery.isPending}
          isError={chatsQuery.isError}
          activeChatId={chatid}
          user={user}
          collapsed={!historyOpen}
          onToggle={() => setHistoryOpen((v) => !v)}
          onLogout={logout}
        />
      </div>

      {mobileHistoryOpen && (
        <div className='fixed inset-0 z-40 lg:hidden'>
          <div
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            onClick={() => setMobileHistoryOpen(false)}
          />
          <div className='absolute inset-y-0 left-0'>
            <ChatHistorySidebar
              chats={historyList}
              isLoading={chatsQuery.isPending}
              isError={chatsQuery.isError}
              activeChatId={chatid}
              user={user}
              collapsed={false}
              onToggle={() => setMobileHistoryOpen(false)}
              onLogout={logout}
            />
          </div>
        </div>
      )}

      <main className='relative order-1 flex h-[38vh] min-h-0 shrink-0 flex-col border-b border-white/10 lg:order-2 lg:h-auto lg:min-w-0 lg:flex-1 lg:border-b-0'>
        <header className='flex justify-between h-14 shrink-0 items-center gap-1.5 border-b border-white/10 bg-[#0a0a0a] px-3'>
        {/* full screen button */}
          <button
            type='button'
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit full screen' : 'Full screen'}
            aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
            className='cursor-pointer transition hover:opacity-80'
          >
            {isFullscreen ? (
              <CornersInIcon className='text-white/60 w-6 h-6' />
            ) : (
              <CornersOutIcon className='text-white/60 w-6 h-6' />
            )}
          </button>

          <div className="flex gap-2">
            <button
              type='button'
              onClick={() => void chatQuery.refetch()}
              disabled={refreshing}
              title='Refresh world'
              aria-label='Refresh world'
              className='flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-white/25 hover:text-white disabled:opacity-50'
            >
              <ArrowClockwiseIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {alreadyPosted ? (
              <span className='flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3.5 text-[13px] font-medium text-emerald-300'>
                <CheckIcon className='h-4 w-4' weight='bold' />
                Published
              </span>
            ) : (
              <button
                type='button'
                onClick={() => setShowPostDrawer(true)}
                title='Publish dream'
                aria-label='Publish dream'
                className={buttonStyle}
              >
                <CloudArrowUpIcon className='h-4 w-4' weight='bold' />
                Publish
              </button>
            )}
          </div>
        </header>

        <div ref={viewportRef} className='relative min-h-0 flex-1 bg-black'>
          <WorldViewport world={latestWorld} loadFailed={chatQuery.isError} />
        </div>
      </main>

      <section className='order-2 flex min-h-0 flex-1 flex-col bg-[#0a0a0a] lg:order-1 lg:my-3 lg:mr-0 lg:w-[380px] lg:flex-none lg:overflow-hidden lg:rounded-2xl lg:border lg:border-white/10 xl:w-[400px]'>
        <ChatSidebar
          title={title}
          historyOpen={historyOpen}
          isLoading={chatQuery.isPending}
          loadError={chatQuery.isError}
          histories={histories}
          sendPending={sendMessage.isPending}
          sendError={sendMessage.isError}
          sendErrorMessage={sendMessage.isError ? getChatErrorMessage(sendMessage.error) : null}
          onSend={(message, opts) => sendMessage.mutate(message, opts)}
          onToggleHistory={() => {
            if (window.innerWidth < 1024) setMobileHistoryOpen(true)
            else setHistoryOpen((v) => !v)
          }}
        />
      </section>

      <PostDreamDrawer
        open={showPostDrawer}
        isPending={publishDream.isPending}
        isError={publishDream.isError}
        isSuccess={publishDream.isSuccess}
        errorMessage={publishDream.isError ? getDreamErrorMessage(publishDream.error) : null}
        onPublish={(input) =>
          publishDream.mutate(input, {
            onSuccess: () => {
              setShowPostDrawer(false)
              void chatQuery.refetch()
            },
          })
        }
        onClose={() => {
          publishDream.reset()
          setShowPostDrawer(false)
        }}
      />
    </div>
  )
}
