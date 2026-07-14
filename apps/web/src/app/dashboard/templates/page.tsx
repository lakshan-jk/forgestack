import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { API_URL, type ApiModule } from '@/lib/api';
import { moduleMeta } from '@/components/dashboard/module-meta';

const CATEGORY_ORDER = [
  'framework',
  'language',
  'core',
  'database',
  'cache',
  'queue',
  'ai',
  'ui',
  'auth',
  'docs',
  'security',
  'observability',
  'devops',
  'quality',
];

async function getModules(): Promise<ApiModule[]> {
  try {
    const res = await fetch(`${API_URL}/api/modules`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as { modules: ApiModule[] };
    return data.modules;
  } catch {
    return [];
  }
}

function orderIndex(category: string): number {
  const i = CATEGORY_ORDER.indexOf(category);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

export default async function TemplatesPage() {
  const modules = await getModules();
  const groups = new Map<string, ApiModule[]>();
  for (const m of modules) {
    const list = groups.get(m.category) ?? [];
    list.push(m);
    groups.set(m.category, list);
  }
  const ordered = [...groups.entries()].sort(([a], [b]) => orderIndex(a) - orderIndex(b));

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="mt-1 text-[var(--color-fg-muted)]">
            The building blocks ForgeStack composes into a project. {modules.length} available.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-opacity hover:opacity-90"
        >
          Build a stack <ArrowRight className="size-4" />
        </Link>
      </header>

      {modules.length === 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-fg-muted)]">
          Couldn&apos;t load modules — is the API running on{' '}
          <code className="font-mono">localhost:4000</code>?
        </div>
      )}

      <div className="space-y-5">
        {ordered.map(([category, mods]) => (
          <section key={category}>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                {category}
              </p>
              <span className="text-[11px] text-[var(--color-fg-muted)]/60">{mods.length}</span>
              <div className="ml-1 h-px flex-1 bg-[var(--color-border)]" />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {mods.map((m) => (
                <TemplateCard key={m.id} module={m} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function TemplateCard({ module }: { module: ApiModule }) {
  const meta = moduleMeta(module.id, module.category);
  const Icon = meta.icon;
  return (
    <div className="flex min-h-[76px] items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
      <span
        className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
      >
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[var(--color-fg)]">{module.name}</p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[var(--color-fg-muted)]">
          {module.description}
        </p>
        {module.dependsOn.length > 0 && (
          <p className="mt-1.5 truncate font-mono text-[11px] text-[var(--color-fg-muted)]/70">
            ↳ needs {module.dependsOn.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
