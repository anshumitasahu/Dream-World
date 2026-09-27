import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useLogout, useMe } from '../../hooks/useAuth'
import { useChats } from '../../hooks/useChat'
import { getToken } from '../../lib/auth'
import { ChatHistorySidebar } from '../../components/ui/Chat'
import { LandingChatBox } from '../../components/ui/landing/LandingChatBox'

export const Route = createFileRoute('/chat/new')({
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
  const [message, setMessage] = useState(() => {
    try {
      const draft = sessionStorage.getItem('dream-draft')
      if (draft) sessionStorage.removeItem('dream-draft')
      return draft ?? ''
    } catch {
      return ''
    }
  })

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
        <img
          src='/img/bg.jpg'
          alt=''
          aria-hidden='true'
          className='pointer-events-none fixed inset-0 h-full w-full object-cover'
        />
        <div className='pointer-events-none fixed inset-0 bg-linear-to-b from-black via-[#002c50]/90 to-black' />
        <div className='pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,transparent_0%,rgba(0,0,0,0.5)_100%)]' />

        <div className='relative z-10 flex min-h-screen flex-col items-center px-6 sm:px-12'>
          <div className='flex w-full justify-end pt-6'>
            <button>credits</button>
          </div>

          <div className='flex w-full max-w-3xl flex-col items-center pt-[30vh] pb-16'>
            <h1 className='mb-8 text-center text-4xl  tracking-tight text-white sm:text-5xl'>
              What&apos;s Your <span className='text-blue-400'>Dream</span> ?
            </h1>
            <LandingChatBox
              suggestionsAlign='center'
              controlledValue={message}
              onControlledChange={setMessage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
