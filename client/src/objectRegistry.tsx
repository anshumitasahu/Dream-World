import type { ComponentType } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { SkeletonDragon } from './components/Rendering/models/creature/SkeletonDragon'
import { WeaponPickup } from './components/World/WeaponPickup'
import { getAssetUrl } from './pathRegistry'
import { Pigeon } from './components/Rendering/models/creature/Pigeon'
import { BoneClawUndead } from './components/Rendering/models/creature/BoneClawUndead'
import { GirlNilou } from './components/Rendering/models/creature/GirlNilou'
import { GirlYelan } from './components/Rendering/models/creature/GirlYelan'
import { Phoenix } from './components/Rendering/models/creature/Phoenix'
import { Wendigo } from './components/Rendering/models/creature/Wendigo'

export type ObjectModelProps = ThreeElements['group']
export type ObjectModelComponent = ComponentType<ObjectModelProps>

export type ObjectModelEntry =
  | { kind: 'path'; path: string; defaultScale?: number; footprint?: [number, number, number] }
  | { kind: 'component'; component: ObjectModelComponent; defaultScale?: number; footprint?: [number, number, number] }

const BASE_URL = "http://r2.geckostack.store"
const MODEL_PATH = `${BASE_URL}/models`

/**
 * Client-owned model registry.
 * The backend sends only a model NAME (e.g. "house"); this registry decides
 * how that name loads and renders — a plain GLB path or a bespoke component.
 */
export const MODEL_REGISTRY: Record<string, ObjectModelEntry> = {
  // creatures
  animated_bird_pigeon: { kind: 'component', component: Pigeon },
  bone_claw_undead: { kind: 'component', component: BoneClawUndead },
  horse: { kind: 'path', path: getAssetUrl('horse') },
  deer: { kind: 'path', path: getAssetUrl('deer') },
  forest_guardian: { kind: 'path', path: getAssetUrl('forest_guardian') },
  girl_nilou: { kind: 'component', component: GirlNilou },
  phoenix_bird: { kind: 'component', component: Phoenix },
  skeleton_dragon: { kind: 'component', component: SkeletonDragon },
  the_human_deer_animated_horror: { kind: 'component', component: Wendigo },
  unicorn: { kind: 'path', path: getAssetUrl('unicorn') },
  girl_yelan: { kind: 'component', component: GirlYelan },


  // fantasy
  blue_scrub_bush: { kind: 'path', path: getAssetUrl('blue_scrub_bush') },
  glowing_big_mushroom: { kind: 'path', path: getAssetUrl('glowing-big-mushroom') },


  // maps
  stronghold: { kind: 'path', path: getAssetUrl('stronghold') },
  stronghold_collider: { kind: 'path', path: getAssetUrl('stronghold_collider') },
  mobile_home: { kind: 'path', path: getAssetUrl('mobile_home') },


  // nature
  bush: { kind: 'path', path: getAssetUrl('bush') },
  flower_bush: { kind: 'path', path: getAssetUrl('flower_bush') },
  spider_lily: { kind: 'path', path: getAssetUrl('spider_lily') },
  mushroom: { kind: 'path', path: getAssetUrl('mushroom') },
  oak_trees: { kind: 'path', path: getAssetUrl('oak_trees') },
  rock: { kind: 'path', path: getAssetUrl('rock') },
  pine_tree: { kind: 'path', path: getAssetUrl('pine_tree') },
  brown_rock: { kind: 'path', path: getAssetUrl('brown_rock') },
  sakura_tree_with_bench: { kind: 'path', path: getAssetUrl('sakura_tree_with_bench') },
  toon_tree: { kind: 'path', path: getAssetUrl('toon_tree') },



  // props
  animated_old_chest: { kind: 'path', path: getAssetUrl('animated_old_chest') },
  wooden_bench: { kind: 'path', path: getAssetUrl('wooden_bench') },
  campfire: { kind: 'path', path: getAssetUrl('campfire') },
  chair: { kind: 'path', path: getAssetUrl('chair') },
  lantern: { kind: 'path', path: getAssetUrl('lantern') },
  rusty_car: { kind: 'path', path: getAssetUrl('rusty_car') },



  // special
  crystal: { kind: 'path', path: getAssetUrl('crystal') },
  portal: { kind: 'path', path: getAssetUrl('portal') },



  // structure
  ruins: { kind: 'path', path: getAssetUrl('ruins') },
  city_ruins: { kind: 'path', path: getAssetUrl('city_ruins') },
  farm_house: { kind: 'path', path: getAssetUrl('farm_house') },
  high_school: { kind: 'path', path: getAssetUrl('high_school') },
  house: { kind: 'path', path: getAssetUrl('house') },
  hut: { kind: 'path', path: getAssetUrl('hut') },
  kickelhahn_tower: { kind: 'path', path: getAssetUrl('kickelhahn_tower') },
  old_brick_building: { kind: 'path', path: getAssetUrl('old_brick_building') },


  // terrain
  grass: { kind: 'path', path: getAssetUrl('grass') },


  // weapons
  'm4a1': { kind: 'component', component: WeaponPickup },
}

export function resolveObjectModel(name: string): ObjectModelEntry | undefined {
  return MODEL_REGISTRY[name]
}

export function isKnownObjectModel(name: string): boolean {
  return name in MODEL_REGISTRY
}

export function listObjectModels(): string[] {
  return Object.keys(MODEL_REGISTRY)
}
