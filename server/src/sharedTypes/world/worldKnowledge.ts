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
    armored_horse:
      'a horse in full armor, suited as a knight mount or war companion.',
    armored_horse_edited:
      'an edited variant of the armored horse with adjusted proportions, usable as a knight mount.',
    deer: 'a wild deer for forests and meadows, good for ambient wildlife.',
    dragon_animated:
      'an animated dragon that can fly and attack, ideal as a boss or flying threat.',
    the_human_deer_animated_horror:
      'an animated human-deer horror creature, ideal for haunted forests and jump scares.',
    unicorn:
      'a magical unicorn, good as a friendly companion or fantasy mount.',
    unicorn_wip:
      'a work-in-progress unicorn variant, usable as a fantasy horse or companion.',
    skeleton_dragon:
      'a giant skeletal dragon, ideal as a landmark boss or ancient remains.',
  },
  characters: {
    forest_guardian:
      'a mystical forest guardian NPC that can guide or protect the player.',
    nilou_1_genshin_impact:
      'Nilou from Genshin Impact, a dancer character usable as an NPC or companion.',
    ryuri:
      'Ryuri, a stylized character usable as an NPC or playable avatar.',
    yelan_genshin_impact:
      'Yelan from Genshin Impact, usable as an NPC or playable character.',
  },
  vehicles: {
    'derby_car._free':
      'a derby car for driving, crashing, or racing gameplay.',
    drone:
      'a flying drone, good for scouting, companions, or sci-fi patrols.',
  },
  fantasy: {
    blue_scrub_bush:
      'a blue-tinted scrub bush for fantasy or alien vegetation.',
    glowing_mushroom:
      'a glowing mushroom that lights up caves and fantasy forests.',
  },
  nature: {
    bush: 'a leafy bush for filling out forests, gardens, and paths.',
    flower_bush:
      'a bush covered in flowers, good for gardens and cheerful areas.',
    flowers:
      'small scattered flowers for meadows, gardens, and path edges.',
    mushroom:
      'a small forest mushroom for ground detail in woods and caves.',
    oak_trees: 'broad oak trees for forests, parks, and shading paths.',
    obj_nat_rock_01:
      'a natural rock for cliffs, paths, and landscape detail.',
    pine_tree:
      'a tall pine tree for forests, mountains, and snowy areas.',
    rock_b: 'a rounded boulder rock for scattering around terrain.',
    sakura_tree_1mb:
      'a cherry blossom tree with pink petals, ideal for serene gardens.',
    stylized_hand_painted_tree_toon:
      'a stylized toon tree with hand-painted look, good for cute worlds.',
  },
  props: {
    animated_old_chest:
      'an old animated chest that opens, ideal for loot and rewards.',
    bench: 'a wooden bench for parks, porches, and rest areas.',
    campfire:
      'a campfire with light and warmth, good as a checkpoint or rest spot.',
    chair: 'a simple chair for houses, camps, and interiors.',
    lantern: 'a handheld or hanging lantern that lights up dark paths.',
    'sci_fi_chest_treasurechestchallenge.':
      'a sci-fi treasure chest, ideal for futuristic loot containers.',
    table: 'a wooden table for houses, camps, and market stalls.',
  },
  special: {
    crystal:
      'a glowing crystal for caves, magic zones, and collectibles.',
    'portal-animated':
      'an animated portal with swirling effects, for fast travel or level gates.',
    portal: 'a static portal gate for teleporting between areas.',
  },
  structures: {
    ancient_ruins_pack:
      'a set of ancient broken ruins, pillars and stones for lost temples.',
    city_ruins_environment:
      'a ruined city environment with collapsed buildings, for post-apocalyptic zones.',
    farm_house:
      'a cozy farm house with barn style, good for villages and countryside.',
    high_school:
      'a large school building, usable for town or horror-school maps.',
    house_asset: 'a generic house asset for villages and neighborhoods.',
    house: 'a simple house for shelter, villages, and towns.',
    kickelhahn_tower: 'a tall historic tower, good as a lookout landmark.',
    old_brick_building__lowpoly:
      'a lowpoly old brick building for towns and city streets.',
  },
  terrain: {
    grass: 'a grassy ground patch for natural terrain cover.',
    'moist-stones': 'wet stones for riverbanks, caves, and damp paths.',
    pile_burned_trash:
      'a pile of burned trash for wasteland and ruined zones.',
    sand_rock_pack: 'sand and rock terrain pieces for deserts and canyons.',
    water_animation: 'animated water surface for lakes, rivers, and ponds.',
    water_wave_long: 'a long rolling water wave, good for oceans and shores.',
  },
  weapon: {
    'm4a1-gun': 'an M4A1 rifle pickup for shooter combat.',
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
