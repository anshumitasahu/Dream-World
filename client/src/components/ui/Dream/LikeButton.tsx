import { HeartIcon } from '@phosphor-icons/react'
import { useSetLike } from '../../../hooks/useDream'

interface LikeButtonProps {
  dreamId: string
  liked: boolean
  likes: number
  className?: string
}

export function LikeButton({ dreamId, liked, likes, className }: LikeButtonProps) {
  const setLike = useSetLike()

  return (
    <button
      type='button'
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setLike.mutate({ dreamId, liked: !liked })
      }}
      disabled={setLike.isPending}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike dream' : 'Like dream'}
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur transition disabled:opacity-70 ${
        liked
          ? 'border-rose-400/40 bg-rose-500/20 text-rose-200'
          : 'border-white/15 bg-black/50 text-white/80 hover:border-white/35 hover:text-white'
      } ${className ?? ''}`}
    >
      <HeartIcon className='h-3.5 w-3.5' weight={liked ? 'fill' : 'regular'} />
      <span className='tabular-nums'>{likes}</span>
    </button>
  )
}
