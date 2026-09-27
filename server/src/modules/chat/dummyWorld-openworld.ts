const dummyWorld = {
  mode: "open",
  ground: { size: 600, texture: "grass" },
  playerSpawn: [0, 1, 40],
  objects: [
    {
      model: "house",
      position: [28, 0, -14],
      scale: 0.01,
    },
    {
      model: "campfire",
      position: [10, 0, 12],
    },
    {
      model: "bench",
      position: [13, 0, 14],
      rotationY: 2.2,
      scale: 0.5,
    },
    {
      model: "lantern",
      position: [7, 0, 10],
      scale: 0.002,
    },
    {
      model: "animated_old_chest",
      position: [-8, 0, 6],
      rotationY: 0.7,
      scale: 0.02,
    },
    {
      model: "oak_trees",
      scatter: { count: 10, center: [-80, -40], radius: 70, spacing: 4 },
      scale: 10,
    },
    {
      model: "oak_trees",
      scatter: { count: 12, center: [-30, 80], radius: 35, spacing: 3 },
      scale: 10,
    },
    {
      model: "grass",
      scatter: { count: 60, radius: 120, spacing: 2 },
      physics: "decor",
      offsetY: 0,
    },
    {
      model: "deer",
      scatter: { count: 5, center: [-50, -60], radius: 40, spacing: 5 },
      scale: 10,
    },
    {
      model: "unicorn",
      position: [20, 0, 30],
    },
    {
      model: "armored_horse_edited",
      position: [-15, 0, -10],
      rotationY: 1.8,
      scale: 3,
    },
    {
      model: "velkhana",
      position: [-140, 0, 120],
      scale: 1,
    },
    {
      model: "crystal",
      scatter: { count: 8, center: [110, 90], radius: 30, spacing: 3 },
      physics: "decor",
    },
    {
      model: "portal",
      position: [60, 0, 60],
      scale: 0.008,
    },
    {
      model: "rock_b",
      scatter: { count: 5, radius: 180, spacing: 5 },
      scale: 0.5,
    },
    {
      model: "stylized_hand_painted_tree_toon",
      scatter: { count: 15, center: [40, -90], radius: 45, spacing: 4 },
      offsetY: 0,
    },
    {
      model: "bush",
      scatter: { count: 40, radius: 150, spacing: 2 },
      offsetY: 0,
    },
    {
      model: "flower_bush",
      scatter: { count: 25, center: [0, 40], radius: 40, spacing: 1.5 },
      physics: "decor",
      offsetY: 0,
    },
    {
      model: "flowers",
      scatter: { count: 30, center: [10, 20], radius: 45, spacing: 1 },
      physics: "decor",
      offsetY: -1,
    },
    {
      model: "mushroom",
      scatter: { count: 20, center: [-60, 30], radius: 30, spacing: 1 },
      physics: "decor",
      offsetY: 0,
    },
    {
      model: "blue_scrub_bush",
      scatter: { count: 20, center: [70, -40], radius: 40, spacing: 1.5 },
      offsetY: 0,
    },
    {
      model: "skeleton_dragon",
      position: [-60, 0, -60],
      scale: 100,
    },
    {
      model: "glowing_mushroom",
      scatter: { count: 15, center: [-90, 70], radius: 25, spacing: 1 },
      physics: "decor",
      offsetY: 0,
    },
  ],
  environment: {
    weather: "rain",
    time: "night"
  },
  missions: [
    {
      id: "mission_find_dragon",
      name: "Find the Dragon",
      description: "Discover the mysterious dragon.",
      zone: {
        position: [-60, 0, -60],
        radius: 50
      }
    },
    {
      id: "mission_mushroom_forest",
      name: "Visit the Magic Mushroom Forest",
      description: "Explore the magical mushroom forest.",
      zone: {
        position: [-60, 0, 30],
        radius: 40
      }
    }
  ]
};

export default dummyWorld;
