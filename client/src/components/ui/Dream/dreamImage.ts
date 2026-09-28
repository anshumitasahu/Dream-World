/**
 * Placeholder preview image for a dream card. Seeded by the dream id so each
 * dream keeps a stable image across reloads. Swap this for real thumbnails
 * (or a `Dream.imageUrl` field) when available.
 */
export function dreamImageUrl(_dreamId: string): string {
  // return `https://picsum.photos/seed/${_dreamId}/900/600`
  return '/img/bg2.jpg'
}

/**
 * Curated art for the featured row. Cycled by position so each of the three
 * featured cards gets a distinct image.
 */
const FEATURED_IMAGES = ['/img/feature/skybound.png', '/img/feature/stronghold.png', '/img/feature/dragon.png']

export function featuredDreamImageUrl(index: number): string {
  return FEATURED_IMAGES[index % FEATURED_IMAGES.length]
}
