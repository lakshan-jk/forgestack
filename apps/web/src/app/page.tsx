import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Boxes,
  ShieldCheck,
  Github,
  Terminal,
  Wind,
  Check,
} from 'lucide-react';
import { StackHeroCanvas } from '@/components/landing/stack-hero-canvas';
import { CodeBackground } from '@/components/three/code-background';
import { API_URL, type ApiModule } from '@/lib/api';
import { moduleMeta } from '@/components/dashboard/module-meta';

async function getModules(): Promise<ApiModule[]> {
  try {
    const res = await fetch(`${API_URL}/api/modules`, { cache: 'no-store' });
    if (!res.ok) return [];
    return ((await res.json()) as { modules: ApiModule[] }).modules;
  } catch {
    return [];
  }
}

const SHOWCASE = [
  {
    title: 'REST API',
    desc: 'Fastify + Mongo, auth, docs, containerized.',
    stack: ['fastify', 'mongodb', 'jwt', 'swagger', 'docker'],
  },
  {
    title: 'RAG chatbot',
    desc: 'Local LLM + vector search, retrieval to answer.',
    stack: ['fastify', 'ollama', 'qdrant', 'rag'],
  },
  {
    title: 'Full-stack app',
    desc: 'Next.js, Tailwind, Prisma — front to back.',
    stack: ['next', 'tailwind', 'prisma'],
  },
];

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: 'Production-ready',
    body: 'Autoloading, env validation, graceful shutdown, security, Docker, CI and tests — baked in, not bolted on.',
  },
  {
    icon: Boxes,
    title: 'Config-driven',
    body: 'Modules are data, not code. Adding a stack is a JSON file — the engine composes, it never hardcodes.',
  },
  {
    icon: Github,
    title: 'Open source',
    body: 'MIT licensed, no vendor lock-in. Self-host the whole thing; own every line it generates.',
  },
  {
    icon: Sparkles,
    title: 'Local-first AI',
    body: 'Ollama, Qdrant and HuggingFace. Bring your own keys, or run it entirely offline. No SaaS in the loop.',
  },
];

export default async function HomePage() {
  const modules = await getModules();

  return (
    <main className="relative isolate overflow-hidden">
      <CodeBackground />
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-[var(--color-accent)] text-sm font-bold text-[var(--color-accent-fg)]">
            F
          </div>
          <span className="text-sm font-semibold tracking-tight">ForgeStack</span>
        </div>
        <nav className="flex items-center gap-5 text-sm text-[var(--color-fg-muted)]">
          <a className="hidden transition-colors hover:text-[var(--color-fg)] sm:inline" href="#modules">
            Modules
          </a>
          <a
            className="hidden items-center gap-1.5 transition-colors hover:text-[var(--color-fg)] sm:inline-flex"
            href="https://github.com/lakshan-jk/forgestack"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="size-4" /> GitHub
          </a>
          <Link
            className="rounded-md bg-[var(--color-surface-2)] px-3 py-1.5 text-[var(--color-fg)] ring-1 ring-[var(--color-border)] transition-colors hover:bg-[var(--color-border)]"
            href="/signin"
          >
            Sign in
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-fg-muted)]">
          <span className="size-1.5 rounded-full bg-[var(--color-accent)]" />
          AI stack advisor · config-driven generator
        </span>

        <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Production backends,
          <br />
          composed — <span className="text-[var(--color-accent)]">not boilerplated</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-[var(--color-fg-muted)]">
          Describe what you&apos;re building. ForgeStack composes real-world architecture —
          Fastify, Nest, Prisma, RAG and more — into a downloadable, ready-to-ship project. Not a
          boilerplate. A compiler for backends.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-accent-fg)] transition-opacity hover:opacity-90"
            href="/dashboard/new"
          >
            Start building <ArrowRight className="size-4" />
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-fg)] transition-colors hover:bg-[var(--color-surface)]"
            href="/dashboard/new"
          >
            <Sparkles className="size-4 text-[var(--color-accent)]" /> Describe your backend
          </Link>
        </div>
      </section>

      {/* 3D product visual */}
      <div className="mx-auto -mt-4 mb-16 w-full max-w-4xl px-6">
        <StackHeroCanvas />
      </div>

      {/* Showcase */}
      <Section>
        <SectionLabel>Generate anything</SectionLabel>
        <SectionTitle>One picker. Very different backends.</SectionTitle>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {SHOWCASE.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <p className="font-medium">{s.title}</p>
              <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{s.desc}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {s.stack.map((id) => (
                  <span
                    key={id}
                    className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 font-mono text-xs text-[var(--color-fg-muted)]"
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Feature: AI advisor */}
      <Section>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <SectionLabel>AI stack advisor</SectionLabel>
            <SectionTitle>Say it in plain English.</SectionTitle>
            <p className="mt-4 text-[var(--color-fg-muted)]">
              Type what you&apos;re building. Semantic search ranks the right modules, then the
              dependency resolver expands them into a coherent stack — you review and download.
            </p>
            <Link
              href="/dashboard/new"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Try the advisor <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 font-mono text-sm">
            <p className="text-[var(--color-fg-muted)]">
              <span className="text-[var(--color-accent)]">$</span> a REST API with auth and
              background jobs
            </p>
            <div className="mt-4 space-y-1.5">
              {[
                ['bullmq', '0.62'],
                ['jwt', '0.34'],
                ['fastify', '0.26'],
              ].map(([id, score]) => (
                <div key={id} className="flex items-center gap-3">
                  <span className="w-20 text-[var(--color-fg)]">{id}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)]"
                      style={{ width: `${Math.min(1, Number(score) / 0.7) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--color-fg-muted)]">{score}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-fg-muted)]">
              → typescript → fastify → redis → bullmq → jwt
            </p>
          </div>
        </div>
      </Section>

      {/* Feature: config-driven */}
      <Section>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="order-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 font-mono text-xs leading-relaxed text-[var(--color-fg-muted)] md:order-1">
            <pre className="overflow-x-auto">{`{
  "id": "rag",
  "category": "ai",
  "dependsOn": ["qdrant", "ollama"],
  "files": [
    "src/modules/rag/rag.route.ts",
    "src/lib/chunk.ts"
  ]
}`}</pre>
          </div>
          <div className="order-1 md:order-2">
            <SectionLabel>Config-driven engine</SectionLabel>
            <SectionTitle>Modules are data, not code.</SectionTitle>
            <p className="mt-4 text-[var(--color-fg-muted)]">
              Every module is a JSON definition — dependencies, conflicts, files, env. The engine
              resolves and composes them. Adding a new stack never touches the generator.
            </p>
          </div>
        </div>
      </Section>

      {/* Module manifest */}
      <Section id="modules">
        <SectionLabel>The building blocks</SectionLabel>
        <SectionTitle>{modules.length || 26} modules. Composable by design.</SectionTitle>
        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {modules.map((m) => {
            const meta = moduleMeta(m.id, m.category);
            const Icon = meta.icon;
            return (
              <div
                key={m.id}
                className="flex items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5"
              >
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-md"
                  style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                >
                  <Icon className="size-4" />
                </span>
                <span className="truncate text-sm">{m.name}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Core principles */}
      <Section>
        <SectionLabel>What we believe</SectionLabel>
        <SectionTitle>Built for developers who ship.</SectionTitle>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                    <Icon className="size-4" />
                  </span>
                  <p className="font-medium">{p.title}</p>
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">{p.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Philosophy / comparison */}
      <Section>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(109,94,252,0.08),transparent)] p-8 sm:p-12">
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Boilerplate rots. A compiler composes.
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-[var(--color-fg-muted)]">
            A cloned template is frozen the day you clone it. ForgeStack generates fresh, coherent
            architecture every time — verified to install, typecheck and build.
          </p>
          <div className="mt-6 grid max-w-xl gap-2 text-sm">
            {[
              'Dependency-resolved — pick a module, its stack follows',
              'Strict TypeScript, tested output, Docker + CI included',
              'Swap MongoDB for Postgres, Fastify for Nest — same picker',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-[var(--color-fg-muted)]">
                <Check className="size-4 shrink-0 text-[var(--color-accent)]" /> {f}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Terminal className="mx-auto size-8 text-[var(--color-accent)]" />
        <h2 className="mt-5 text-balance text-4xl font-semibold tracking-tight">
          Compose your stack. Ship today.
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-accent-fg)] transition-opacity hover:opacity-90"
            href="/dashboard/new"
          >
            Start building <ArrowRight className="size-4" />
          </Link>
          <a
            className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-fg)] transition-colors hover:bg-[var(--color-surface)]"
            href="https://github.com/lakshan-jk/forgestack"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="size-4" /> Star on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-[var(--color-border)] px-6 py-8 text-sm text-[var(--color-fg-muted)] sm:flex-row">
        <div className="flex items-center gap-2">
          <Wind className="size-4 text-[var(--color-accent)]" />
          <span>ForgeStack — MIT licensed, open source.</span>
        </div>
        <div className="flex items-center gap-4">
          <a className="hover:text-[var(--color-fg)]" href="#modules">
            Modules
          </a>
          <a
            className="hover:text-[var(--color-fg)]"
            href="https://github.com/lakshan-jk/forgestack"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <Link className="hover:text-[var(--color-fg)]" href="/signin">
            Sign in
          </Link>
        </div>
      </footer>
    </main>
  );
}

function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mx-auto max-w-5xl px-6 py-16">
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-balance text-3xl font-semibold tracking-tight">{children}</h2>;
}
