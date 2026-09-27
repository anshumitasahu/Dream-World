import { create } from 'zustand'

/** A world-space ground point pinned on the minimap as a purple dot. */
export interface MapMarker {
  x: number
  z: number
}

/** Cells per axis when the grid is derived from the open ground size. */
const DEFAULT_DIVISIONS = 32
/** How far around the player cells are revealed, in meters. */
const DEFAULT_REVEAL_RADIUS_METERS = 90

interface MapExploreConfig {
  /** World ground edge length in meters (open mode). */
  size: number
  /** Cells per axis; the grid is `divisions × divisions`. */
  divisions?: number
  /** Reveal radius around the player, in meters. */
  revealRadiusMeters?: number
  /** Object positions surfaced as purple dots. */
  markers?: MapMarker[]
}

interface MapExploreStore {
  /** True once an open-mode grid has been configured. Preset worlds stay inactive. */
  active: boolean
  /** World ground edge length in meters. */
  size: number
  divisions: number
  cellSize: number
  revealRadiusMeters: number
  /** `divisions²` flags; 1 = explored. Mutated in place, tracked via `revision`. */
  visited: Uint8Array
  exploredCells: number
  totalCells: number
  /** Rounded 0..100. */
  percent: number
  /** Bumped whenever the grid changes so the minimap can rebuild its cache. */
  revision: number
  markers: MapMarker[]
  /** Build (or rebuild) the grid from a world config. Resets progress. */
  configure: (config: MapExploreConfig) => void
  /**
   * Reveal the cells around a world ground position. Cheap and idempotent: it
   * early-returns while the player stays in the same cell, so calling it every
   * frame costs one integer compare.
   */
  visit: (x: number, z: number) => void
  /** Clear exploration progress but keep the grid, markers and config. */
  clearProgress: () => void
  /** Tear the grid down (leaving open mode). */
  reset: () => void
}

function emptyGrid(divisions: number): Uint8Array {
  return new Uint8Array(divisions * divisions)
}

// Module-level so the per-frame hot path never writes reactive state just to
// remember where the player is.
let lastIndex = -1

export const useMapExploreStore = create<MapExploreStore>()((set, get) => ({
  active: false,
  size: 0,
  divisions: DEFAULT_DIVISIONS,
  cellSize: 0,
  revealRadiusMeters: DEFAULT_REVEAL_RADIUS_METERS,
  visited: emptyGrid(DEFAULT_DIVISIONS),
  exploredCells: 0,
  totalCells: DEFAULT_DIVISIONS * DEFAULT_DIVISIONS,
  percent: 0,
  revision: 0,
  markers: [],

  configure: ({
    size,
    divisions = DEFAULT_DIVISIONS,
    revealRadiusMeters = DEFAULT_REVEAL_RADIUS_METERS,
    markers = [],
  }) => {
    if (!(size > 0)) {
      get().reset()
      return
    }
    lastIndex = -1
    set({
      active: true,
      size,
      divisions,
      cellSize: size / divisions,
      revealRadiusMeters,
      visited: emptyGrid(divisions),
      exploredCells: 0,
      totalCells: divisions * divisions,
      percent: 0,
      revision: get().revision + 1,
      markers,
    })
  },

  visit: (x, z) => {
    const state = get()
    if (!state.active) return

    const { size, divisions, cellSize, revealRadiusMeters } = state
    const half = size / 2
    const col = Math.min(divisions - 1, Math.max(0, Math.floor((x + half) / cellSize)))
    const row = Math.min(divisions - 1, Math.max(0, Math.floor((z + half) / cellSize)))
    const index = row * divisions + col
    if (index === lastIndex) return
    lastIndex = index

    // World positions of the player's cell center are recomputed per cell below,
    // so the reveal is a circle in world space, not a lopsided grid block.
    const visited = state.visited
    const span = Math.ceil(revealRadiusMeters / cellSize)
    const radiusSq = revealRadiusMeters * revealRadiusMeters
    let added = 0

    for (let dr = -span; dr <= span; dr++) {
      const r = row + dr
      if (r < 0 || r >= divisions) continue
      const cellZ = -half + (r + 0.5) * cellSize
      for (let dc = -span; dc <= span; dc++) {
        const c = col + dc
        if (c < 0 || c >= divisions) continue
        const cellX = -half + (c + 0.5) * cellSize
        if ((cellX - x) ** 2 + (cellZ - z) ** 2 > radiusSq) continue
        const cellIndex = r * divisions + c
        if (visited[cellIndex]) continue
        visited[cellIndex] = 1
        added++
      }
    }

    if (added === 0) return
    const exploredCells = state.exploredCells + added
    set({
      exploredCells,
      percent: Math.round((exploredCells / state.totalCells) * 100),
      revision: state.revision + 1,
    })
  },

  clearProgress: () => {
    lastIndex = -1
    set({
      visited: emptyGrid(get().divisions),
      exploredCells: 0,
      percent: 0,
      revision: get().revision + 1,
    })
  },

  reset: () => {
    lastIndex = -1
    set({
      active: false,
      size: 0,
      cellSize: 0,
      visited: emptyGrid(DEFAULT_DIVISIONS),
      exploredCells: 0,
      totalCells: DEFAULT_DIVISIONS * DEFAULT_DIVISIONS,
      percent: 0,
      revision: get().revision + 1,
      markers: [],
    })
  },
}))
