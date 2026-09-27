import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { LandingChatBox } from '../components/ui/landing/LandingChatBox'
import { getToken } from '../lib/auth'
import LogoLong from '../assets/LogoLong'
import { GithubLogoIcon } from '@phosphor-icons/react'


export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: '/chat/new' })
    }
  },
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className='relative flex min-h-screen flex-col overflow-hidden bg-black text-white'>
      <img
        src="/img/bg.jpg"
        alt=''
        aria-hidden='true'
        className='pointer-events-none fixed inset-0 h-full w-full object-cover'
      />
      {/* <div className='pointer-events-none fixed inset-0 bg-linear-to-r from-black via-black/5 to-transparent' />` */}
      {/* <div className='pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,transparent_0%,rgba(0,0,0,0.5)_100%)]' /> */}

      <header className='relative z-10 flex items-center justify-between px-5 py-5 sm:px-10'>
        <Link to='/' className='flex items-center gap-2.5'>
          <LogoLong className='h-7.5' />
        </Link>
        <nav className='flex items-center gap-2 sm:gap-3'>
          <Link
            to='/auth/login'
            className='rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10'
          >
            Log in
          </Link>
          <Link
            to='/auth/signup'
            className='rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-blue-100'
          >
            Start dreaming
          </Link>
        </nav>
      </header>

      <main className='relative z-10 mx-auto flex w-full  flex-1 flex-col items-start justify-end px-5 pb-16 pt-8 text-left sm:px-8'>
        <p className='mb-5 inline-flex items-center gap-2  text-xs font-medium text-white/70 backdrop-blur'>
          
        </p>
        <h1 className='text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl'>
          Dreamworld
        </h1>
        <p className='mt-3 text-blue-400 text-3xl font-semibold italic sm:text-5xl'>
          dream ✦ live ✦
        </p>
        <p className='mt-5 max-w-xl text-balance text-sm leading-relaxed text-white/60 sm:text-base'>
          Type a dream, wake up inside a playable 3D world. AI builds the terrain, places the creatures, and drops
          you in, ready to walk around.
        </p>

        <div className='flex justify-between w-full items-end'>
          <div className='mt-12 w-full max-w-2xl'>
            <LandingChatBox hideSuggestion={false} />
          </div>
          <a
            href='https://github.com'
            target='_blank'
            rel='noreferrer'
            className='ml-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur transition hover:border-white/30 hover:text-white'
          >
            <GithubLogoIcon className='h-4 w-4' weight='fill'/>
            GitHub
          </a>
        </div>
      </main>
    </div>
  )
}
