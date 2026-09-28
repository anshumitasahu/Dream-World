import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import MagicWand from '../../../assets/MagicWand'

const LOADING_MESSAGES = [
  'Summoning your world…',
  'Shaping the terrain…',
  'Painting the sky…',
  'Awakening its creatures…',
  'Almost there…',
]

export function WorldLoader() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 bg-black px-6 text-center'>
      <MagicWand className='w-44 sm:w-65' />
      <div className='relative h-6'>
        <AnimatePresence mode='wait'>
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className='text-sm font-medium tracking-wide text-white/70'
          >
            {LOADING_MESSAGES[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
