import { z } from 'zod';

import { Email } from './primitives';

export const LoginRequest = z.object({
  email: Email,
  password: z.string().min(1, { error: 'Enter your password.' }).max(200),
});
export type LoginRequest = z.infer<typeof LoginRequest>;

export const AuthUser = z.object({
  email: Email,
  role: z.literal('admin'),
});
export type AuthUser = z.infer<typeof AuthUser>;

/** Body of `POST /auth/login` (200) and `GET /auth/me`. */
export const AuthSession = z.object({ user: AuthUser });
export type AuthSession = z.infer<typeof AuthSession>;
