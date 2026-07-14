import Link from 'next/link';
import { Plus, Boxes, ArrowRight, Github } from 'lucide-react';
import { auth } from '@/auth';
import { API_URL } from '@/lib/api';

async function getModuleCount(): Promise<number> {
  try {
    const res = await fetch(`${API_URL}/api/modules`, { cache: 'no-store' });
    if (!res.ok) return 0;
    const data = (await res.json()) as { modules: unknown[] };
    return data.modules.length;
  } catch {
    return 0;
  }
}

export default async function OverviewPage() {
  const session = await auth();
  const firstName = (session?.user?.name ?? 'there').split(' ')[0];
  const moduleCount = await getModuleCount();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
        <p className="mt-1 text-[var(--color-fg-muted)]">
          Compose a production-ready backend and download it in seconds.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Modules available" value={moduleCount || '—'} icon={Boxes} />
        <Stat label="Projects generated" value="—" icon={Plus} hint="Not persisted yet" />
        <Stat label="License" value="MIT" icon={Github} hint="Free & open source" />
      </div>

      <Link
        href="/dashboard/new"
        className="group mt-6 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-accent)]/50"
      >
        <div className="flex items-center gap-4">
          <div className="grid size-11 place-items-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <Plus className="size-5" />
          </div>
          <div>
            <p className="font-medium">Start a new project</p>
            <p className="text-sm text-[var(--color-fg-muted)]">
              Pick your stack — we resolve dependencies and generate the code.
            </p>
          </div>
        </div>
        <ArrowRight className="size-5 text-[var(--color-fg-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-fg)]" />
      </Link>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-[var(--color-fg-muted)]">{label}</span>
        <Icon className="size-4 text-[var(--color-fg-muted)]" />
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{hint}</p>}
    </div>
  );
}
