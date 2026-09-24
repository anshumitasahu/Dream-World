import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Chat } from '../../../api/chat'
import type { authUser } from '../../../sharedTypes/auth/auth.model'
import Logo from '../../../assets/Logo'
import LogoLong from '../../../assets/LogoLong'
import {
    CaretLeftIcon,
    CaretRightIcon,
    CompassIcon,
    PlusIcon,
    SignOutIcon,
} from '@phosphor-icons/react'

interface ChatHistorySidebarProps {
    chats: Chat[]
    isLoading: boolean
    isError: boolean
    activeChatId?: string | null
    user?: authUser | null
    collapsed?: boolean
    onToggle?: () => void
    onLogout: () => void
}

interface ChatGroup {
    label: string
    items: Chat[]
}

const COLLAPSED_KEY = 'dream-sidebar-collapsed'

function startOfDay(date: Date): Date {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

function groupLabel(createdAt: string, today: Date): string {
    const date = new Date(createdAt)
    if (Number.isNaN(date.getTime())) return 'Older'
    const diffDays = Math.floor((startOfDay(today).getTime() - startOfDay(date).getTime()) / 86400000)
    if (diffDays <= 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays <= 7) return 'Previous 7 days'
    if (diffDays <= 30) return 'Previous 30 days'
    return date.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

function groupRank(label: string): number {
    if (label === 'Today') return 0
    if (label === 'Yesterday') return 1
    if (label === 'Previous 7 days') return 2
    if (label === 'Previous 30 days') return 3
    return 4
}

function groupChats(chats: Chat[]): ChatGroup[] {
    const today = new Date()
    const map = new Map<string, Chat[]>()
    for (const chat of chats) {
        const label = groupLabel(chat.createdAt, today)
        const list = map.get(label)
        if (list) list.push(chat)
        else map.set(label, [chat])
    }
    return [...map.entries()]
        .map(([label, items]) => ({ label, items }))
        .sort((a, b) => {
            const rank = groupRank(a.label) - groupRank(b.label)
            if (rank !== 0) return rank
            return b.label.localeCompare(a.label)
        })
}

const iconBtn =
    'flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 backdrop-blur transition hover:border-blue-300/40 hover:text-white'

const accentButtonStyle = ["relative text-white text-sm",
    "px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ease-out",
    "border border-[#54A1FD] bg-[radial-gradient(95%_60%_at_50%_75%,#005FD6_0%,#209BFF_100%)]",
    "shadow-[0px_4px_48px_-12px_#1187FF,inset_0px_1px_8px_-4px_#FFFFFF]",
    "active:scale-95 active:rotate-1",
    "after:absolute after:top-[1px] after:right-[10%] after:w-[60%] after:h-[1px]",
    "after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent",
    "hover:brightness-110",
    "flex items-center gap-2 justify-center",
].join(" ")

export function ChatHistorySidebar({
    chats,
    isLoading,
    isError,
    activeChatId,
    user,
    collapsed,
    onToggle,
    onLogout,
}: ChatHistorySidebarProps) {
    const groups = useMemo(() => groupChats(chats), [chats])
    const initial = (user?.name ?? user?.email ?? '?').trim().charAt(0).toUpperCase() || '?'
    const [internalCollapsed, setInternalCollapsed] = useState(() => {
        try {
            return sessionStorage.getItem(COLLAPSED_KEY) === '1'
        } catch {
            return false
        }
    })
    const isCollapsed = collapsed ?? internalCollapsed

    function toggle() {
        if (onToggle) {
            onToggle()
            return
        }
        setInternalCollapsed((prev) => {
            try {
                sessionStorage.setItem(COLLAPSED_KEY, prev ? '0' : '1')
            } catch {
                /* storage unavailable — collapse state just won't persist */
            }
            return !prev
        })
    }

    if (isCollapsed) {
        return (
            <aside className='sticky top-3 z-20 flex h-[calc(100vh-1.5rem)] w-17 shrink-0 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-black/60 py-3 text-white backdrop-blur-xl transition-all'>
                <div className='flex w-10 items-center justify-center border-b border-white/10 pt-2 py-4 mb-3'>
                    <Logo className='w-8' />
                </div>
                <button type='button' onClick={toggle} title='Expand sidebar' aria-label='Expand sidebar' className={iconBtn}>
                    <CaretRightIcon className='h-4 w-4' />
                </button>
                <Link
                    to='/chat/new'
                    title='New dream'
                    aria-label='New dream'
                    className='flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition hover:bg-blue-200'
                >
                    <PlusIcon className='h-5 w-5' weight='bold' />
                </Link>
                <Link to='/explore' title='Explore dreams' aria-label='Explore dreams' className={iconBtn}>
                    <CompassIcon className='h-5 w-5' />
                </Link>
                <div className='min-h-0 flex-1' />
                {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt='' title={user.name ?? user.email} className='h-10 w-10 rounded-full object-cover' />
                ) : (
                    <span
                        title={user?.name ?? user?.email ?? 'Dreamer'}
                        className='flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold'
                    >
                        {initial}
                    </span>
                )}
                <button type='button' onClick={onLogout} title='Log out' aria-label='Log out' className={iconBtn}>
                    <SignOutIcon className='h-4 w-4' />
                </button>
            </aside>
        )
    }

    return (
        <aside className='sticky top-3 z-20 m-3 flex h-[calc(100vh-1.5rem)] w-72 shrink-0 flex-col gap-2 rounded-2xl border border-white/10 bg-black/60 text-white backdrop-blur-xl transition-all px-1'>
            <div className='flex items-center justify-between px-4 pt-4 pb-4'>
                <LogoLong className='h-6' />
                <button
                    type='button'
                    onClick={toggle}
                    title='Collapse sidebar'
                    aria-label='Collapse sidebar'
                    className='flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 backdrop-blur transition hover:border-blue-300/40 hover:text-white'
                >
                    <CaretLeftIcon className='h-4 w-4' />
                </button>
            </div>

            <div className='flex flex-col gap-2 px-3 pb-4'>
                <Link
                    to='/chat/new'
                    // className='flex items-center justify-center gap-2 rounded-xl border border-blue-400/40 bg-white/5 px-3 py-2.5 text-sm font-semibold backdrop-blur transition hover:border-blue-300/60 hover:bg-white/10'
                    className={accentButtonStyle}
                >
                    <PlusIcon className='h-4 w-4' weight='bold' />
                    new dream
                </Link>
                <Link
                    to='/explore'
                    className='flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70 backdrop-blur transition hover:border-white/30 hover:text-white'
                >
                    <CompassIcon className='h-4 w-4' />
                    explore dreams
                </Link>
            </div>

            <div className='min-h-0 flex-1 overflow-y-auto px-3 pb-3'>
                {isLoading && <p className='px-1 py-2 text-sm text-white/50'>loading chats...</p>}
                {isError && <p className='px-1 py-2 text-sm text-red-400'>could not load chats</p>}
                {!isLoading && !isError && groups.length === 0 && (
                    <p className='px-1 py-2 text-sm text-white/40'>no dreams yet</p>
                )}
                {groups.map((group) => (
                    <div key={group.label} className='mt-3 first:mt-1'>
                        <p className='px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40'>
                            {group.label}
                        </p>
                        <ul className='flex flex-col gap-0.5'>
                            {group.items.map((chat) => {
                                const isActive = activeChatId === chat.id
                                return (
                                    <li key={chat.id}>
                                        <Link
                                            to='/chat/$chatid'
                                            params={{ chatid: chat.id }}
                                            title={chat.title}
                                            className={`block truncate rounded-xl border px-2.5 py-1.5 text-sm backdrop-blur transition ${isActive
                                                ? 'border-blue-300/30 bg-white/10 text-white'
                                                : 'border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            {chat.title}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            <div className='mx-3 mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur'>
                {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt='' className='h-8 w-8 shrink-0 rounded-full object-cover' />
                ) : (
                    <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold'>
                        {initial}
                    </span>
                )}
                <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{user?.name ?? 'Dreamer'}</p>
                    <p className='truncate text-xs text-white/50'>{user?.email ?? ''}</p>
                </div>
                <button
                    type='button'
                    onClick={onLogout}
                    title='Log out'
                    aria-label='Log out'
                    className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:border-white/30 hover:text-white'
                >
                    <SignOutIcon className='h-4 w-4' />
                </button>
            </div>
        </aside>
    )
}