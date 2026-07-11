import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { verifyUser } from './lib/users';

/**
 * The full Auth.js instance (Node runtime). Adds the Credentials provider on
 * top of the edge-safe base config. JWT session strategy means no database is
 * required — swap in an adapter later without touching the rest of the app.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === 'string' ? credentials.email : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';
        if (!email || !password) return null;
        return verifyUser(email, password);
      },
    }),
  ],
});
