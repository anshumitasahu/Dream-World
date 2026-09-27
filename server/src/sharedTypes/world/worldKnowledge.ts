/**
 * Shared world knowledge.
 *
 * Single source of truth for what the world builder can place. The server feeds
 * it to the model as prompt context; the client uses it to interpret the models
 * named in a generated world config. Kept in sharedTypes so it is synced to the
 * client by `bun scripts/copyTypes.ts` and never drifts between the two sides.
 */

export const worldObjectKnowledge = {
  creatures: {
    animated_bird_pigeon:
      'a small animated pigeon that flaps and wanders, good for ambient wildlife.',
    bone_claw_undead:
      'a skeletal undead warrior with a bony claw, ideal as an enemy or haunted-area threat.',
    deer: 'a wild deer for forests and meadows, good for ambient wildlife.',
    horse:
      "a horse, good as a rider's mount, a stable animal, or meadow wildlife.",
    phoenix_bird:
      'a phoenix bird wreathed in fire, ideal as a mythical creature, guardian, or boss.',
    skeleton_dragon:
      'a giant skeletal dragon, ideal as a landmark boss or ancient remains.',
    the_human_deer_animated_horror:
      'an animated human-deer horror creature, ideal for haunted forests and jump scares.',
    unicorn:
      'a magical unicorn, good as a friendly companion or fantasy mount.',
  },
  characters: {
    forest_guardian:
      'a mystical forest guardian NPC that can guide or protect the player.',
    girl_nilou:
      'Nilou from Genshin Impact, a dancer character usable as an NPC or companion.',
    girl_yelan:
      'Yelan from Genshin Impact, usable as an NPC or playable character.',
  },
  fantasy: {
    blue_scrub_bush:
      'a blue-tinted scrub bush for fantasy or alien vegetation.',
    glowing_big_mushroom:
      'a large glowing mushroom that lights up caves and fantasy forests.',
  },
  maps: {
    stronghold:
      'a fortress stronghold building, good as a major landmark or enemy base.',
    stronghold_collider:
      'the invisible collision geometry for the stronghold; place it only together with "stronghold", never on its own.',
    mobile_home:
      'a mobile home, good for camps, outposts, and modern roadside scenes.',
  },
  nature: {
    bush: 'a leafy bush for filling out forests, gardens, and paths.',
    flower_bush:
      'a bush covered in flowers, good for gardens and cheerful areas.',
    mushroom:
      'a small forest mushroom for ground detail in woods and caves.',
    oak_trees: 'broad oak trees for forests, parks, and shading paths.',
    pine_tree:
      'a tall pine tree for forests, mountains, and snowy areas.',
    rock: 'a natural rock for cliffs, paths, and landscape detail.',
    brown_rock:
      'a rounded brown boulder for scattering around terrain.',
    sakura_tree_with_bench:
      'a cherry blossom tree with a wooden bench beneath it, ideal for serene gardens.',
    spider_lily:
      'a red spider lily bloom, good for moody, mystical, or memorial scenes.',
    toon_tree:
      'a stylized toon tree with a hand-painted look, good for cute worlds.',
  },
  props: {
    animated_old_chest:
      'an old animated chest that opens, ideal for loot and rewards.',
    wooden_bench: 'a wooden bench for parks, porches, and rest areas.',
    campfire:
      'a campfire with light and warmth, good as a checkpoint or rest spot.',
    chair: 'a simple chair for houses, camps, and interiors.',
    lantern: 'a handheld or hanging lantern that lights up dark paths.',
    rusty_car:
      'a rusty abandoned car, good for post-apocalyptic, overgrown, or roadside scenes.',
  },
  special: {
    crystal:
      'a glowing crystal for caves, magic zones, and collectibles.',
    portal:
      'a portal gate for teleporting between areas or gating levels.',
  },
  structures: {
    ruins:
      'a set of ancient broken ruins, pillars and stones for lost temples.',
    city_ruins:
      'a ruined city environment with collapsed buildings, for post-apocalyptic zones.',
    farm_house:
      'a cozy farm house with barn style, good for villages and countryside.',
    high_school:
      'a large school building, usable for town or horror-school maps.',
    house: 'a simple house for shelter, villages, and towns.',
    hut: 'a small wooden hut or cabin, good for wilderness shelters and villages.',
    kickelhahn_tower: 'a tall historic tower, good as a lookout landmark.',
    old_brick_building:
      'a lowpoly old brick building for towns and city streets.',
  },
  terrain: {
    grass: 'a grassy ground patch for natural terrain cover.',
  },
  weapon: {
    m4a1: 'an M4A1 rifle pickup for shooter combat.',
  },
} as const;

/** Ground textures the client's texture registry can resolve (open mode `ground.texture`). */
export const worldTextureKnowledge = {
  default: 'neutral soil ground.',
  grass: 'grassy meadow ground.',
  soil: 'dark dirt soil ground.',
  snow: 'snow-covered ground.',
  sand: 'sandy desert ground.',
  mud: 'wet muddy ground.',
} as const;

/** Weather presets the client can render (`environment.weather`). */
export const worldWeatherKnowledge = {
  clear: 'a calm, bright sky.',
  wind: 'a breezy, windswept sky.',
  rain: 'rain with an overcast sky.',
  snow: 'falling snow with a cold, pale sky.',
  forest: 'a lush, green forest ambience.',
  desert: 'a hot, hazy desert ambience.',
} as const;

/** Time of day the client can render (`environment.time`). */
export const worldTimeKnowledge = {
  day: 'bright daylight.',
  night: 'dark night lit by moonlight.',
} as const;

/** How the two world modes work. */
export const worldModeKnowledge = {
  open: 'a flat generated ground that you populate freely with objects. Always use this mode.',
  preset:
    'a hand-built map from the client map registry; objects spawn into its zones. Only use when the player explicitly asks for a preset map.',
} as const;

/**
 * Preset map ids the client map registry understands, keyed by id.
 * Used only in `preset` mode (`world.map`).
 */
export const presetMapsKnowledge = {
  strongHold:
    'the last stronghold: a floating shrine in the sky with bridges wobbling in the wind the player must cross.',
  mobileHome:
    'a floating fortress in the sky with a mobile home on top that bridges areas with mechanical moving parts.',
  openPlains: 'a wide open grassy plains map.',
  testMap: 'a small flat development test map.',
} as const;
