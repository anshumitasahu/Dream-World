import type { exploreDream } from '../../../sharedTypes/dream/dream.model'
import { DreamCard } from './DreamCard'
import { featuredDreamImageUrl } from './dreamImage'

interface FeaturedRowProps {
  dreams: exploreDream[]
}

export function FeaturedRow({ dreams }: FeaturedRowProps) {
  if (dreams.length === 0) return null

  return (
    <section className='flex flex-col gap-5'>
      <h2 className='text-[11px] font-semibold uppercase tracking-wider text-blue-300/80'>Featured</h2>
      <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {dreams.map((dream, index) => (
          <DreamCard key={dream.id} dream={dream} featured imageUrl={featuredDreamImageUrl(index)} />
        ))}
      </div>
    </section>
  )
}
