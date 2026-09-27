const BASE_URL = "http://r2.geckostack.store"
const MODEL_PATH = `${BASE_URL}/models`

const assetUrl = {
  // creatures
  animated_bird_pigeon: `${MODEL_PATH}/creatures/animated_bird_pigeon.glb`,
  'animated-haunted-zombie': `${MODEL_PATH}/creatures/animated-haunted-zombie.glb`,
  horse: `${MODEL_PATH}/creatures/horse.glb`,
  deer: `${MODEL_PATH}/creatures/deer.glb`,
  forest_guardian: `${MODEL_PATH}/creatures/forest_guardian.glb`,
  girl_nilou: `${MODEL_PATH}/creatures/girl_nilou.glb`,
  phoenix_bird: `${MODEL_PATH}/creatures/phoenix_bird.glb`,
  skeleton_dragon: `${MODEL_PATH}/creatures/skeleton_dragon.glb`,
  the_human_deer_animated_horror: `${MODEL_PATH}/creatures/the_human_deer_animated_horror.glb`,
  unicorn: `${MODEL_PATH}/creatures/unicorn.glb`,
  girl_yelan: `${MODEL_PATH}/creatures/girl_yelan.glb`,

  // maps
  stronghold: `${MODEL_PATH}/map/the_last_stronghold_animated_floating.glb`,
  stronghold_collider: `${MODEL_PATH}/map/the_last_stronghold_animated_floating_collider.glb`,
  mobile_home: `${MODEL_PATH}/map/mobile_home_with_collider.glb`,

  // fantasy
  blue_scrub_bush: `${MODEL_PATH}/fantacy/blue_scrub_bush.glb`,
  'glowing-big-mushroom': `${MODEL_PATH}/fantacy/glowing-big-mushroom.glb`,

  // nature
  bush: `${MODEL_PATH}/nature/bush.glb`,
  flower_bush: `${MODEL_PATH}/nature/flower_bush.glb`,
  spider_lily: `${MODEL_PATH}/nature/spider-lily.glb`,
  mushroom: `${MODEL_PATH}/nature/mushroom.glb`,
  oak_trees: `${MODEL_PATH}/nature/oak-tree.glb`,
  rock: `${MODEL_PATH}/nature/rock.glb`,
  pine_tree: `${MODEL_PATH}/nature/pine-tree.glb`,
  brown_rock: `${MODEL_PATH}/nature/brown-rock.glb`,
  sakura_tree_with_bench: `${MODEL_PATH}/nature/sakura-tree-with-bench.glb`,
  toon_tree: `${MODEL_PATH}/nature/toon-tree.glb`,

  // props
  animated_old_chest: `${MODEL_PATH}/props/animated-old-chest.glb`,
  wooden_bench: `${MODEL_PATH}/props/wodden-bench.glb`,
  campfire: `${MODEL_PATH}/props/campfire.glb`,
  lantern: `${MODEL_PATH}/props/lantern.glb`,
  chair: `${MODEL_PATH}/props/chair.glb`,
  rusty_car: `${MODEL_PATH}/props/rusty-car.glb`,

  // special
  crystal: `${MODEL_PATH}/special/crystal.glb`,
  portal: `${MODEL_PATH}/special/portal.glb`,

  // structure
  ruins: `${MODEL_PATH}/structure/runis.glb`,
  city_ruins: `${MODEL_PATH}/structure/city-runis.glb`,
  farm_house: `${MODEL_PATH}/structure/farm-house.glb`,
  high_school: `${MODEL_PATH}/structure/high_school.glb`,
  house: `${MODEL_PATH}/structure/house.glb`,
  hut: `${MODEL_PATH}/structure/hut.glb`,
  kickelhahn_tower: `${MODEL_PATH}/structure/kickelhahn_tower.glb`,
  old_brick_building: `${MODEL_PATH}/structure/old_brick_building.glb`,

  // terrain
  grass: `${MODEL_PATH}/terrain/grass.glb`,

  // weapon
  'm4a1': `${MODEL_PATH}/weapon/m4a1.glb`,

  // character
  'm4a1-gun-fps': `${MODEL_PATH}/character/m4a1-gun-fps.glb`,

} as const

export type AssetName = keyof typeof assetUrl

export const getAssetUrl = (name: AssetName): string => assetUrl[name]