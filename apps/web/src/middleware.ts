import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Route protection at the edge. Uses only the edge-safe config (no providers),
 * so `node:crypto` never loads here. The `authorized` callback decides access.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ['/dashboard/:path*'],
};
