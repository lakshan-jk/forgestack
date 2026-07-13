import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * User store. Two accounts: a read-only demo user, and an admin account (the
 * maintainer) who can view usage metrics. Swap this for a Prisma-backed store
 * when a database is available — the Auth.js config never changes.
 *
 * Demo credentials: demo@forgestack.dev / forgestack
 * Admin: ADMIN_EMAIL / ADMIN_PASSWORD (from .env.local; never committed)
 */
export interface AppUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

/** The single admin allowed to see usage metrics. Overridable via env. */
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'kumarlakshan1032@gmail.com').toLowerCase();

interface StoredUser extends AppUser {
  passwordHash: string; // `salt:key` (hex, scrypt)
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const hashed = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  return keyBuffer.length === hashed.length && timingSafeEqual(hashed, keyBuffer);
}

const users: StoredUser[] = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@forgestack.dev',
    isAdmin: false,
    // scrypt hash of "forgestack"
    passwordHash:
      '7e516ef42ce8794e5038c809c061195a:20721c5b3eab33c944d50847044b1c6abae0d4ff1809be2fd0cf245085987aecf0708de2d7c23cdd16cf9d5db8a374dd305da9369aea934d1609c878b18cf8a9',
  },
];

// The admin account is enabled only when ADMIN_PASSWORD is configured (kept in
// .env.local, never committed). The password is hashed at load — no plaintext.
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminPassword) {
  users.push({
    id: 'admin',
    name: 'Admin',
    email: ADMIN_EMAIL,
    isAdmin: true,
    passwordHash: hashPassword(adminPassword),
  });
}

/** Returns the user when credentials are valid, otherwise null. */
export async function verifyUser(email: string, password: string): Promise<AppUser | null> {
  const user = users.find((u) => u.email === email.toLowerCase());
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
}

/** True only for the configured admin email — gates the metrics dashboard. */
export function isAdminEmail(email?: string | null): boolean {
  return Boolean(email) && email!.toLowerCase() === ADMIN_EMAIL;
}
