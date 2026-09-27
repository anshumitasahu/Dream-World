import { Link } from '@tanstack/react-router'
import { HeartIcon } from '@phosphor-icons/react'
import type { dreamWorldSummary, exploreDream } from '../../../sharedTypes/dream/dream.model'
import { dreamImageUrl } from './dreamImage'
import { LikeButton } from './LikeButton'

interface DreamCardProps {
  dream: exploreDream
  featured?: boolean
}

function summaryLabel(summary: dreamWorldSummary): string {
  if (summary.mode === 'preset') {
    const bits = [summary.map ?? 'map', summary.weather].filter((value): value is string => Boolean(value))
    return `Preset · ${bits.join(' · ')}`
  }
  const bits = [summary.texture, summary.time].filter((value): value is string => Boolean(value))
  return bits.length > 0 ? `Open · ${bits.join(' · ')}` : 'Open world'
}

export function DreamCard({ dream, featured }: DreamCardProps) {
  const initial = (dream.author.name ?? '?').trim().charAt(0).toUpperCase() || '?'

  return (
    <div className='group relative'>
      <Link
        to='/explore/$dreamId'
        params={{ dreamId: dream.id }}
        aria-label={`Explore ${dream.title}`}
        className='relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:border-blue-300/40 hover:bg-white/[0.06]'
      >
        <div className={`relative overflow-hidden ${featured ? 'aspect-[16/10]' : 'aspect-[16/9]'}`}>
          <img
            src={dreamImageUrl(dream.id)}
            alt=''
            loading='lazy'
            className='h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
          <span className='absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur'>
            {summaryLabel(dream.summary)}
          </span>
        </div>

        {featured && (
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 bottom-0 h-1/2 rounded-b-2xl bg-[radial-gradient(ellipse_125%_100%_at_50%_145%,rgba(32,155,255,0.28)_0%,rgba(32,155,255,0.10)_38%,rgba(32,155,255,0.03)_62%,transparent_80%)]'
          />
        )}

        <div className={`relative flex flex-col gap-2 ${featured ? 'p-5' : 'p-4'}`}>
          <h3 className={`truncate font-semibold text-white ${featured ? 'text-lg' : 'text-[15px]'}`}>
            {dream.title}
          </h3>
          <p className='line-clamp-2 text-[13px] leading-relaxed text-white/50'>{dream.prompt}</p>

          {dream.tags.length > 0 && (
            <div className='flex flex-wrap gap-1.5 pt-1'>
              {dream.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className='rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/50'
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className='mt-1 flex items-center gap-2 border-t border-white/5 pt-3'>
            {dream.author.avatarUrl ? (
              <img src={dream.author.avatarUrl} alt='' className='h-6 w-6 rounded-full object-cover' />
            ) : (
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white/70'>
                {initial}
              </span>
            )}
            <span className='truncate text-xs text-white/60'>{dream.author.name ?? 'Dreamer'}</span>
            <span className='ml-auto flex items-center gap-1 text-xs text-white/40'>
              <HeartIcon className='h-3.5 w-3.5' weight='fill' />
              <span className='tabular-nums'>{dream.likes}</span>
            </span>
          </div>
        </div>
      </Link>

      <div className='absolute right-3 top-3 z-20'>
        <LikeButton dreamId={dream.id} liked={dream.likedByMe} likes={dream.likes} />
      </div>
    </div>
  )
}
