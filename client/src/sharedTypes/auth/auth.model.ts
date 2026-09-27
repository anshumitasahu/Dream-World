import z from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1),
});

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

export const authResponseSchema = z.object({
  token: z.string(),
  user: authUserSchema,
});

export type loginParams = z.infer<typeof loginSchema>;
export type signupParams = z.infer<typeof signupSchema>;
export type googleAuthParams = z.infer<typeof googleAuthSchema>;
export type authUser = z.infer<typeof authUserSchema>;
export type authResponse = z.infer<typeof authResponseSchema>;
