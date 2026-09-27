/**
 * Placeholder preview image for a dream card. Seeded by the dream id so each
 * dream keeps a stable image across reloads. Swap this for real thumbnails
 * (or a `Dream.imageUrl` field) when available.
 */
export function dreamImageUrl(dreamId: string): string {
  return `https://picsum.photos/seed/${dreamId}/900/600`
}
