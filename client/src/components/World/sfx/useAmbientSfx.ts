import { useEffect } from 'react'
import { Howl } from 'howler'

/**
 * Plays one clip as a looping ambient bed (wind, rain, ...) and tears the
 * Howl down on unmount or when the clip/volume changes.
 */
export function useAmbientSfx(src: string, volume: number) {
  useEffect(() => {
    const howl = new Howl({ src: [src], loop: true, volume, preload: true })
    howl.play()
    return () => howl.unload()
  }, [src, volume])
}
