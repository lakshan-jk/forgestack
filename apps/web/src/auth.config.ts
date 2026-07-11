import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe auth configuration shared by the middleware and the full auth
 * instance. It must NOT import anything Node-only (e.g. `node:crypto`), because
 * the middleware runs on the edge runtime. Providers that need Node live in
 * `auth.ts` instead.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    /** Gate the dashboard. Returning false redirects to the sign-in page. */
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtected = request.nextUrl.pathname.startsWith('/dashboard');
      if (isProtected) return isLoggedIn;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
