import { Link } from '@tanstack/react-router'
import type { ChatHistoryEntry } from '../../../api/chat'
import { PlusIcon, SidebarSimpleIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { ChatComposer } from './ChatComposer'
import { ChatThread } from './ChatThread'

interface ChatSidebarProps {
	title: string
	historyOpen: boolean
	isLoading: boolean
	loadError: boolean
	histories: ChatHistoryEntry[]
	sendPending: boolean
	sendError: boolean
	sendErrorMessage: string | null
	onSend: (message: string, opts: { onSuccess: () => void }) => void
	onToggleHistory: () => void
}

export function ChatSidebar({
	title,
	historyOpen,
	isLoading,
	loadError,
	histories,
	sendPending,
	sendError,
	sendErrorMessage,
	onSend,
	onToggleHistory,
}: ChatSidebarProps) {
	return (
		<div className='flex h-full min-h-0 w-full flex-col bg-[#0a0a0a] text-white'>
			<header className='flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-3'>
				<button
					type='button'
					onClick={onToggleHistory}
					title={historyOpen ? 'Hide dream history' : 'Show dream history'}
					aria-label={historyOpen ? 'Hide dream history' : 'Show dream history'}
					className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/5 hover:text-white'
				>
					<SidebarSimpleIcon className='h-5 w-5' />
				</button>
				<div className='max-w-[60%] flex-1'>
					<h2 className='truncate text-[13.5px] font-semibold leading-tight'>{title}</h2>
				</div>
			</header>

			<div className='flex min-h-0 flex-1 flex-col'>
				{isLoading ? (
					<div className='flex-1 space-y-6 overflow-hidden px-5 py-6'>
						{[0, 1, 2].map((i) => (
							<div key={i} className='space-y-2.5'>
								<div className='ml-auto h-10 w-3/4 animate-pulse rounded-2xl rounded-br-md bg-white/10' />
								<div className='h-14 w-4/5 animate-pulse rounded-2xl rounded-tl-md bg-white/5' />
							</div>
						))}
					</div>
				) : loadError ? (
					<div className='flex flex-1 flex-col items-center justify-center px-6 text-center'>
						<WarningCircleIcon className='h-8 w-8 text-red-300/70' />
						<p className='mt-3 text-sm font-medium text-white'>Couldn&apos;t load this chat</p>
						<p className='mt-1 text-[12.5px] text-white/40'>It may have been deleted or the link is wrong.</p>
					</div>
				) : (
					<ChatThread histories={histories} isPending={sendPending} />
				)}
			</div>

			<ChatComposer
				isPending={sendPending}
				isError={sendError}
				errorMessage={sendErrorMessage}
				onSend={onSend}
			/>
		</div>
	)
}