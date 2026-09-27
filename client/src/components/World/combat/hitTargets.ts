import type * as THREE from 'three'

/**
 * A shootable object in the world. Only registered targets are ever fed to the
 * weapon's raycaster, so a shot costs O(targets) instead of walking the whole
 * scene (and the viewmodel can never clip its own ray).
 *
 * Environment geometry is deliberately absent: a ray that misses every target
 * resolves to "no effect".
 */
export interface HitTarget {
  /** Root of the shootable subtree; its descendants are tested recursively. */
  root: THREE.Object3D
  /** Called when a shot lands on `root`, with the world hit point and ray distance. */
  onHit: (point: THREE.Vector3, distance: number) => void
}

const targets = new Set<HitTarget>()

/** Register a shootable object. Returns an unregister callback for cleanup. */
export function registerHitTarget(target: HitTarget): () => void {
  targets.add(target)
  return () => {
    targets.delete(target)
  }
}

export function getHitTargets(): HitTarget[] {
  return [...targets]
}

/** Resolve the target a ray hit belongs to by walking up the parent chain. */
export function ownerOf(object: THREE.Object3D): HitTarget | undefined {
  for (const target of targets) {
    let node: THREE.Object3D | null = object
    while (node) {
      if (node === target.root) return target
      node = node.parent
    }
  }
  return undefined
}
