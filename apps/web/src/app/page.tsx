const STACK = [
  'Fastify',
  'TypeScript',
  'MongoDB',
  'JWT',
  'Redis',
  'BullMQ',
  'Swagger',
  'Pino',
  'Docker',
  'GitHub Actions',
];

export default function HomePage() {
  return (
    <main className="relative isolate overflow-hidden">
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-[var(--color-accent)] text-sm font-bold text-[var(--color-accent-fg)]">
            F
          </div>
          <span className="text-sm font-semibold tracking-tight">ForgeStack</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-[var(--color-fg-muted)]">
          <a className="transition-colors hover:text-[var(--color-fg)]" href="#stack">
            Stack
          </a>
          <a
            className="rounded-md bg-[var(--color-surface-2)] px-3 py-1.5 text-[var(--color-fg)] ring-1 ring-[var(--color-border)] transition-colors hover:bg-[var(--color-border)]"
            href="/signin"
          >
            Sign in
          </a>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-20 text-center sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-fg-muted)]">
          <span className="size-1.5 rounded-full bg-[var(--color-accent)]" />
          Config-driven generator engine
        </span>

        <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Production backends,
          <br />
          <span className="text-[var(--color-accent)]">generated</span> in seconds.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-[var(--color-fg-muted)]">
          ForgeStack composes real-world architecture — not boilerplate — into a
          downloadable, ready-to-ship Fastify + TypeScript backend. Pick your
          modules; we resolve the rest.
        </p>

        <div className="mt-9 flex items-center justify-center gap-3">
          <a
            className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-accent-fg)] transition-opacity hover:opacity-90"
            href="/dashboard"
          >
            Start building
          </a>
          <a
            className="rounded-md border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-fg)] transition-colors hover:bg-[var(--color-surface)]"
            href="#stack"
          >
            View the stack
          </a>
        </div>
      </section>

      <section id="stack" className="mx-auto max-w-4xl px-6 pb-28">
        <p className="mb-4 text-center text-xs uppercase tracking-widest text-[var(--color-fg-muted)]">
          Every generated project ships with
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 font-mono text-sm text-[var(--color-fg-muted)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
