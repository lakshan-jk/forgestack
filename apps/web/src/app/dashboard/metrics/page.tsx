import { redirect } from 'next/navigation';
import { Activity, Download, Sparkles, Users } from 'lucide-react';
import { auth } from '@/auth';
import { isAdminEmail } from '@/lib/users';
import { getMetrics } from '@/lib/api';

/**
 * Usage metrics — admin only. Non-admins are redirected; the underlying API
 * endpoint is separately protected by METRICS_TOKEN.
 */
export default async function MetricsPage() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) redirect('/dashboard');

  const data = await getMetrics(process.env.METRICS_TOKEN);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Usage metrics</h1>
        <p className="mt-1 text-[var(--color-fg-muted)]">
          Anonymous, aggregate usage across installs. Visible to you only.
        </p>
      </header>

      {!data ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-fg-muted)]">
          Couldn&apos;t load metrics — check the API is running and{' '}
          <code className="font-mono">METRICS_TOKEN</code> matches on both apps.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Unique installs" value={data.uniqueInstalls} icon={Users} />
            <Stat label="Generations" value={data.generations} icon={Download} />
            <Stat label="Advisor runs" value={data.advisorRuns} icon={Sparkles} />
            <Stat label="Total events" value={data.totalEvents} icon={Activity} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Panel title="Most-used modules">
              {data.topModules.length === 0 ? (
                <Empty />
              ) : (
                <ul className="space-y-2">
                  {data.topModules.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 text-sm">
                      <span className="w-28 shrink-0 truncate font-mono">{m.id}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-accent)]"
                          style={{ width: barWidth(m.count, data.topModules[0]!.count) }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-xs text-[var(--color-fg-muted)]">
                        {m.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Events">
              <ul className="space-y-2">
                {Object.entries(data.eventsByName).map(([name, count]) => (
                  <li key={name} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-[var(--color-fg-muted)]">{name}</span>
                    <span className="font-mono">{count}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function barWidth(count: number, max: number): string {
  return `${Math.round((count / Math.max(1, max)) * 100)}%`;
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-[var(--color-fg-muted)]">{label}</span>
        <Icon className="size-4 text-[var(--color-fg-muted)]" />
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value.toLocaleString()}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="mb-4 text-sm font-medium">{title}</h2>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-[var(--color-fg-muted)]">No data yet.</p>;
}
