import z from "zod";

const vec3Schema = z.tuple([z.number(), z.number(), z.number()]);

const vec2Schema = z.tuple([z.number(), z.number()]);

export const scatterSchema = z.object({
  count: z.number().int().positive(),
  center: vec2Schema.optional(),
  radius: z.number().positive().optional(),
  spacing: z.number().nonnegative().optional(),
  seed: z.string().optional(),
  offsetY: z.number().optional(),
});

export const worldObjectSchema = z.object({
  model: z.string().trim().min(1, "Model name is required"),
  position: vec3Schema.optional(),
  zone: z.number().int().nonnegative().optional(),
  rotationY: z.number().optional(),
  offsetY: z.number().optional(),
  scale: z.number().positive().optional(),
  footprint: vec3Schema.optional(),
  physics: z.enum(["fixed", "decor"]).optional(),
  scatter: scatterSchema.optional(),
});

export const worldEnvironmentSchema = z.object({
  weather: z.enum(["clear", "wind", "rain", "snow", "forest", "desert"]).optional(),
  time: z.enum(["day", "night"]).optional(),
  fogColor: z.string().optional(),
});

export const missionZoneSchema = z.object({
  position: vec3Schema,
  radius: z.number().positive(),
});

export const missionSchema = z.object({
  id: z.string().trim().min(1, "Mission id is required"),
  name: z.string().trim().min(1, "Mission name is required"),
  description: z.string().optional(),
  zone: missionZoneSchema,
});

const openGroundSchema = z.object({
  size: z.number().positive().optional(),
  texture: z.enum(["default", "grass", "soil", "snow", "sand", "mud"]).optional(),
});

const spawnZoneSchema = z.union([
  z.tuple([z.number(), z.number(), z.number()]),
  z.tuple([z.number(), z.number(), z.number(), z.number()]),
]);

const baseWorldFields = {
  playerSpawn: vec3Schema.optional(),
  spawnZones: z.array(spawnZoneSchema).optional(),
  objects: z.array(worldObjectSchema),
  environment: worldEnvironmentSchema.optional(),
  missions: z.array(missionSchema).optional(),
};

export const presetWorldSchema = z.object({
  ...baseWorldFields,
  mode: z.literal("preset").optional().default("preset"),
  map: z.string().trim().min(1, "Map name is required"),
});

export const openWorldSchema = z.object({
  ...baseWorldFields,
  mode: z.literal("open"),
  ground: openGroundSchema.optional(),
});

export const worldSchema = z.union([openWorldSchema, presetWorldSchema]);

export type scatterConfig = z.infer<typeof scatterSchema>;
export type worldObjectConfig = z.infer<typeof worldObjectSchema>;
export type worldEnvironmentConfig = z.infer<typeof worldEnvironmentSchema>;
export type missionZoneConfig = z.infer<typeof missionZoneSchema>;
export type missionConfig = z.infer<typeof missionSchema>;
export type presetWorldConfig = z.infer<typeof presetWorldSchema>;
export type openWorldConfig = z.infer<typeof openWorldSchema>;
export type worldConfig = z.infer<typeof worldSchema>;
