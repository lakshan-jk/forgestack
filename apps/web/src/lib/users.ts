import { scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * User store. This is intentionally a single hashed demo user so auth works
 * with zero external services. Swap this module for a Prisma-backed store when
 * a database is available — the Auth.js config never changes.
 *
 * Demo credentials: demo@forgestack.dev / forgestack
 */
export interface AppUser {
  id: string;
  name: string;
  email: string;
}

const DEMO_USER: AppUser = {
  id: '1',
  name: 'Demo User',
  email: 'demo@forgestack.dev',
};

// scrypt hash of "forgestack" as `salt:key` (hex). Generated once, never plaintext.
const DEMO_PASSWORD_HASH =
  '7e516ef42ce8794e5038c809c061195a:20721c5b3eab33c944d50847044b1c6abae0d4ff1809be2fd0cf245085987aecf0708de2d7c23cdd16cf9d5db8a374dd305da9369aea934d1609c878b18cf8a9';

function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const hashed = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  return keyBuffer.length === hashed.length && timingSafeEqual(hashed, keyBuffer);
}

/** Returns the user when credentials are valid, otherwise null. */
export async function verifyUser(email: string, password: string): Promise<AppUser | null> {
  if (email.toLowerCase() !== DEMO_USER.email) return null;
  if (!verifyPassword(password, DEMO_PASSWORD_HASH)) return null;
  return DEMO_USER;
}
