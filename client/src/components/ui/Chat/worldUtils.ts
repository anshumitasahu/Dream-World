import type { ChatHistoryEntry } from '../../../api/chat'
import type { WorldConfig } from '../../World/worldTypes'
import { worldSchema } from '../../../sharedTypes/world/world.model'
import { worldObjectKnowledge } from '../../../sharedTypes/world/worldKnowledge'

export interface AgentTurn {
  message: string | null
  world: WorldConfig | null
}

function toWorld(value: unknown): WorldConfig | null {
  const parsed = worldSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

/**
 * Parses an agent config response into its message and world. Understands the
 * `{ message, world }` envelope, a bare world config, and legacy JSON strings.
 */
export function parseAgentTurn(response: ChatHistoryEntry['response'] | null | undefined): AgentTurn {
  if (!response) return { message: null, world: null }

  let value: unknown = response
  if (typeof response === 'string') {
    try {
      value = JSON.parse(response)
    } catch {
      return { message: null, world: null }
    }
  }

  if (value && typeof value === 'object' && 'world' in value) {
    const turn = value as { message?: unknown; world?: unknown }
    return {
      message: typeof turn.message === 'string' ? turn.message : null,
      world: toWorld(turn.world),
    }
  }

  return { message: null, world: toWorld(value) }
}

export function parseWorld(response: ChatHistoryEntry['response'] | null | undefined): WorldConfig | null {
  return parseAgentTurn(response).world
}

export function objectCount(world: WorldConfig | null): number {
  if (!world || !Array.isArray(world.objects)) return 0
  return world.objects.length
}

/** Unique model names placed in a world, in first-seen order. */
export function objectModelNames(world: WorldConfig | null): string[] {
  if (!world || !Array.isArray(world.objects)) return []
  return [...new Set(world.objects.map((object) => object.model))]
}

const objectDescriptions: Record<string, string> = Object.fromEntries(
  Object.values(worldObjectKnowledge).flatMap((group) => Object.entries(group as Record<string, string>)),
)

/** Human-readable description of a model from the shared knowledge base. */
export function describeObject(model: string): string | null {
  return objectDescriptions[model] ?? null
}
