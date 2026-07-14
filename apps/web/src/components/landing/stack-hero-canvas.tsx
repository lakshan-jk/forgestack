'use client';

import dynamic from 'next/dynamic';

// WebGL is client-only — load it lazily so it never blocks first paint or SSR.
const StackHero = dynamic(() => import('./stack-hero'), {
  ssr: false,
  loading: () => <StackFallback />,
});

/** Lightweight CSS stand-in shown while the 3D scene loads (and if WebGL is off). */
function StackFallback() {
  const modules = ['fastify', 'typescript', 'mongodb', 'redis', 'jwt', 'rag'];
  return (
    <div className="flex h-full items-center justify-center" aria-hidden>
      <div className="space-y-2">
        {modules.map((m, i) => (
          <div
            key={m}
            className="flex h-9 w-56 items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 font-mono text-xs text-[var(--color-fg-muted)]"
            style={{ marginLeft: i * 10, opacity: 1 - i * 0.08 }}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StackHeroCanvas() {
  return (
    <div className="h-[420px] w-full sm:h-[460px]" role="img" aria-label="A floating 3D stack of generated backend modules">
      <StackHero />
    </div>
  );
}
