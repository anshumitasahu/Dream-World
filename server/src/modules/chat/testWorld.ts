export const testResponse = {
  "world": {
    "mode": "open",
    "ground": {
      "size": 600,
      "texture": "snow"
    },
    "objects": [
      {
        "model": "city_ruins_environment",
        "scale": 0.01,
        "position": [
          0,
          0,
          0
        ]
      },
      {
        "model": "dragon_animated",
        "scale": 1,
        "position": [
          50,
          30,
          50
        ],
        "rotationY": 1.57
      },
      {
        "model": "campfire",
        "position": [
          5,
          0,
          35
        ]
      },
      {
        "model": "campfire",
        "position": [
          -5,
          0,
          35
        ]
      },
      {
        "model": "obj_nat_rock_01",
        "position": [
          10,
          0,
          30
        ]
      },
      {
        "model": "obj_nat_rock_01",
        "position": [
          -10,
          0,
          30
        ]
      },
      {
        "model": "rock_b",
        "scatter": {
          "count": 30,
          "center": [
            0,
            0
          ],
          "radius": 150,
          "spacing": 8
        }
      }
    ],
    "environment": {
      "time": "day",
      "weather": "snow"
    },
    "playerSpawn": [
      0,
      1,
      40
    ]
  },
  "message": "I've built a frozen ruined city with a hunting dragon circling above. You spawn in a cleared military outpost near a campfire — the dragon_animated is your target, and the city_ruins_environment provides the shattered battlefield. No military cop model exists in the catalog, so you'll play as the default avatar."
}