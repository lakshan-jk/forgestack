'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Loader2, ArrowRight } from 'lucide-react';
import { CodeBackground } from '@/components/three/code-background';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@forgestack.dev');
  const [password, setPassword] = useState('forgestack');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-6">
      <CodeBackground />
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-[var(--color-accent)] text-sm font-bold text-[var(--color-accent-fg)]">
            F
          </div>
          <span className="text-sm font-semibold tracking-tight">ForgeStack</span>
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          Welcome back. Enter your credentials to continue.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={inputClass}
            />
          </label>

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Signing in…
              </>
            ) : (
              <>
                Sign in <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs text-[var(--color-fg-muted)]">
          <span className="font-medium text-[var(--color-fg)]">Demo account</span> — prefilled
          above: <code className="font-mono">demo@forgestack.dev</code> /{' '}
          <code className="font-mono">forgestack</code>
        </div>
      </div>
    </main>
  );
}

const inputClass =
  'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none transition-colors placeholder:text-[var(--color-fg-muted)]/60 focus:border-[var(--color-accent)]';
