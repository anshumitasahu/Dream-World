import type { exploreDream } from '../../../sharedTypes/dream/dream.model'
import { DreamCard } from './DreamCard'

interface DreamGridProps {
  dreams: exploreDream[]
  title?: string
}

export function DreamGrid({ dreams, title = 'All dreams' }: DreamGridProps) {
  if (dreams.length === 0) return null

  return (
    <section className='flex flex-col gap-5'>
      <h2 className='text-[11px] font-semibold uppercase tracking-wider text-white/40'>{title}</h2>
      <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {dreams.map((dream) => (
          <DreamCard key={dream.id} dream={dream} />
        ))}
      </div>
    </section>
  )
}

export function DreamGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className='overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]'>
          <div className='aspect-[16/9] animate-pulse bg-white/5' />
          <div className='flex flex-col gap-3 p-4'>
            <div className='h-4 w-2/3 animate-pulse rounded bg-white/10' />
            <div className='h-3 w-full animate-pulse rounded bg-white/5' />
            <div className='mt-2 h-6 w-1/3 animate-pulse rounded-full bg-white/5' />
          </div>
        </div>
      ))}
    </div>
  )
}
