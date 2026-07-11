import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { API_URL, type ApiModule } from '@/lib/api';

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

export default async function TemplatesPage() {
  const modules = await getModules();
  const byCategory = new Map<string, ApiModule[]>();
  for (const m of modules) {
    const list = byCategory.get(m.category) ?? [];
    list.push(m);
    byCategory.set(m.category, list);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="mt-1 text-[var(--color-fg-muted)]">
            The building blocks ForgeStack composes into a project. {modules.length} available.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-opacity hover:opacity-90"
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

      <div className="space-y-8">
        {[...byCategory.entries()].map(([category, mods]) => (
          <section key={category}>
            <h2 className="mb-3 text-xs uppercase tracking-widest text-[var(--color-fg-muted)]">
              {category}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {mods.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{m.name}</span>
                    {m.required && (
                      <span className="rounded bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--color-fg-muted)]">
                        required
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{m.description}</p>
                  {m.dependsOn.length > 0 && (
                    <p className="mt-2 font-mono text-xs text-[var(--color-fg-muted)]">
                      depends on: {m.dependsOn.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
