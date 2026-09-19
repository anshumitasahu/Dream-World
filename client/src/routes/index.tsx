import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { LandingChatBox } from "../components/ui/landing/LandingChatBox";
import { getToken } from "../libs/auth";
import LogoLong from "../assets/LogoLong";
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
    const imgLinks = [
        "/img/bg.jpg",
        "https://w.wallhaven.cc/full/yx/wallhaven-yx6dyk.jpg",
        "https://w.wallhaven.cc/full/85/wallhaven-85xjy1.jpg",
        "https://w.wallhaven.cc/full/vp/wallhaven-vpeew#.jpg",
    ]

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white">
            <img
                src={imgLinks[0]}
                alt=''
                aria-hidden='true'
                className="pointer-events-none fixed min-h-screen flex-col overflow-hidden bg-black text-white" />
            {/* <div className="pointer-events-none fixed inset-0 bg-linear-to-r from-black via-black/5 to-transparent"/> */}
            {/* <div className="poniter-events-none fixed inset-0 bg-[radical-gradient(ellipse_60%_50%_at_50%_40%, transparent_0%, rgba(0,0,0,0.5)_100%)]" /> */}

            <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10">
                <Link to='/' className='flex items-center gap-2.5'>
                    {/* <span className="flex h-8 w-8 items justify-center rounded-lg bg-white text-base text-black">
                        +
                    </span> */}
                    {/* <span className="text-lg font-semibold tracking-tight">Dreamworld</span> */}
                    <LogoLong className='h-7.5' />
                </Link>
                <nav className="flex items-center gap-2 sm:gap-3">
                    <Link
                        to='/auth/login'
                        className="'rounded-full border border-white/20bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10">
                        Log in
                    </Link>
                </nav>
                <nav className="flex items-center gap-2 sm:gap-3">
                    <Link
                        to='/auth/signup'
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-blue-100"
                    >
                        Start Dreaming
                    </Link>
                </nav>
            </header>

            <main className="relative z-10 mx-auto flex w-full flex-1 flex-col items-start justify-end px-5 pb-16 pt-8 text-left sm:px-8">
                <p className="mb-5 inline-flex items-center gap-2 text-xs font-medium test-white/70 backdrop-blur">

                </p>
                <h1 className="text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
                    Dreamworld
                </h1>
                <p className="mt-3 textt-blue-400 text-3xl font-semibold italic sm:text-5xl">
                    dream • live •
                </p>
                <p className="mt-5 max-w-xl text-valance text-sm leading-relaxed text-white/60 sm:text-base">
                    Type a dream, wake up inside a playable 3D world. AI builds the terrain, places the creatures, and drops you in, ready to walk around
                </p>

                <div className="flex justify-between w-full items-end">
                    <div className="mt-12 w-full max-w-2xl">
                        <LandingChatBox hideSuggestion={false} />
                    </div>
                    <a
                        href="https://github.com"
                        target='_blank'
                        rel='noreferrer'
                        className="ml-auto flex items-center gap-1.5 rounded-full border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur transition hover:border-white/30 hover:text-white">
                        <GithubLogoIcon className="h-4 w-4" weight="fill" />
                        Github
                    </a>
                </div>
            </main>
        </div>
    )
}