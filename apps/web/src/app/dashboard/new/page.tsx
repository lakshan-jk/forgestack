'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Download, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { GenerationRequest } from '@forgestack/shared';
import {
  fetchModules,
  generateAndDownload,
  ApiError,
  type ApiModule,
} from '@/lib/api';
import { expandSelection } from '@/lib/resolve';
import { ModuleCard } from '@/components/dashboard/module-card';
import { AdvisorPanel } from '@/components/dashboard/advisor-panel';
import { cn } from '@/lib/cn';

const CATEGORY_ORDER = ['framework', 'language', 'core', 'database', 'cache', 'queue', 'ai', 'ui', 'auth', 'docs', 'security', 'observability', 'devops', 'quality'];
const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn'] as const;

export default function DashboardPage() {
  const modulesQuery = useQuery({ queryKey: ['modules'], queryFn: fetchModules });
  const modules = modulesQuery.data;

  const form = useForm<GenerationRequest>({
    resolver: zodResolver(GenerationRequest),
    defaultValues: { projectName: '', description: '', modules: [], packageManager: 'pnpm', options: {} },
  });
  const { register, handleSubmit, watch, setValue, formState } = form;

  const selectedModules = watch('modules') ?? [];
  const packageManager = watch('packageManager');

  // Nothing is auto-selected — the builder starts empty and the user chooses.
  // Dependencies are still surfaced (as "dependency" hints) and resolved on the
  // server at generate time.
  const selectedSet = useMemo(() => new Set(selectedModules), [selectedModules]);
  const expandedSet = useMemo(
    () => (modules ? expandSelection(selectedSet, modules) : new Set<string>()),
    [selectedSet, modules],
  );
  const resolvedModules = useMemo(
    () => (modules ?? []).filter((m) => expandedSet.has(m.id)),
    [modules, expandedSet],
  );

  const grouped = useMemo(() => groupByCategory(modules ?? []), [modules]);

  const mutation = useMutation({
    mutationFn: (values: GenerationRequest) => generateAndDownload(values),
  });

  const toggle = (id: string) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setValue('modules', [...next], { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = handleSubmit((values) => mutation.mutate(values));
  const apiIssues = mutation.error instanceof ApiError ? mutation.error.issues : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">New project</h1>
        <p className="mt-1 text-[var(--color-fg-muted)]">
          Compose your stack. We resolve dependencies and generate a production-ready backend.
        </p>
      </header>

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left: configuration */}
        <div className="space-y-8">
          <section className="space-y-4">
            <Field label="Project name" error={formState.errors.projectName?.message}>
              <input
                {...register('projectName')}
                placeholder="my-backend"
                autoComplete="off"
                spellCheck={false}
                className={inputClass}
              />
            </Field>
            <Field label="Description" hint="optional" error={formState.errors.description?.message}>
              <input
                {...register('description')}
                placeholder="A production-ready API"
                className={inputClass}
              />
            </Field>
          </section>

          <AdvisorPanel
            modules={modules ?? []}
            onApply={(ids) => setValue('modules', ids, { shouldValidate: true, shouldDirty: true })}
          />

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-medium text-[var(--color-fg)]">Modules</h2>
              <span className="text-xs text-[var(--color-fg-muted)]">
                {selectedSet.size} selected
              </span>
            </div>
            {modulesQuery.isLoading && <SkeletonList />}
            {modulesQuery.isError && (
              <Notice tone="error">
                Couldn&apos;t reach the generator API. Is it running on{' '}
                <code className="font-mono">localhost:4000</code>?
              </Notice>
            )}
            {formState.errors.modules && (
              <p className="mb-3 text-sm text-red-400">{formState.errors.modules.message}</p>
            )}
            <div className="space-y-5">
              {grouped.map(([category, mods]) => (
                <div key={category}>
                  <div className="mb-2 flex items-center gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                      {category}
                    </p>
                    <span className="text-[11px] text-[var(--color-fg-muted)]/60">{mods.length}</span>
                    <div className="ml-1 h-px flex-1 bg-[var(--color-border)]" />
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {mods.map((m) => (
                      <ModuleCard
                        key={m.id}
                        module={m}
                        selected={selectedSet.has(m.id)}
                        auto={expandedSet.has(m.id) && !selectedSet.has(m.id)}
                        onToggle={toggle}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-medium text-[var(--color-fg)]">Package manager</h2>
            <div className="flex gap-2">
              {PACKAGE_MANAGERS.map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setValue('packageManager', pm)}
                  className={cn(
                    'rounded-md border px-4 py-2 font-mono text-sm transition-colors',
                    packageManager === pm
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-fg)]'
                      : 'border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]',
                  )}
                >
                  {pm}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right: summary */}
        <aside className="lg:sticky lg:top-10 lg:self-start">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--color-accent)]" />
              <h2 className="text-sm font-medium">Your stack</h2>
            </div>

            <p className="mb-3 text-xs text-[var(--color-fg-muted)]">
              {resolvedModules.length} module{resolvedModules.length === 1 ? '' : 's'} — resolved order
            </p>
            <ol className="mb-5 space-y-1">
              {resolvedModules.map((m, i) => (
                <li key={m.id} className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-right font-mono text-xs text-[var(--color-fg-muted)]">
                    {i + 1}
                  </span>
                  <span className="text-[var(--color-fg)]">{m.name}</span>
                </li>
              ))}
              {resolvedModules.length === 0 && (
                <li className="text-sm text-[var(--color-fg-muted)]">No modules selected</li>
              )}
            </ol>

            {apiIssues.length > 0 && (
              <Notice tone="error">
                {apiIssues.map((iss, i) => (
                  <span key={i} className="block">
                    {iss.path.join('.') || 'request'}: {iss.message}
                  </span>
                ))}
              </Notice>
            )}
            {mutation.isSuccess && (
              <Notice tone="success">Downloaded — check your browser downloads.</Notice>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Download className="size-4" /> Generate &amp; download
                </>
              )}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}

const inputClass =
  'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none transition-colors placeholder:text-[var(--color-fg-muted)]/60 focus:border-[var(--color-accent)]';

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--color-fg)]">
        {label}
        {hint && <span className="text-xs font-normal text-[var(--color-fg-muted)]">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-400">{error}</span>}
    </label>
  );
}

function Notice({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'mb-3 flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
        tone === 'error'
          ? 'border-red-500/30 bg-red-500/10 text-red-300'
          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-[var(--color-surface-2)]" />
      ))}
    </div>
  );
}

function groupByCategory(modules: ApiModule[]): [string, ApiModule[]][] {
  const groups = new Map<string, ApiModule[]>();
  for (const m of modules) {
    const list = groups.get(m.category) ?? [];
    list.push(m);
    groups.set(m.category, list);
  }
  return [...groups.entries()].sort(
    ([a], [b]) => indexOrLast(CATEGORY_ORDER, a) - indexOrLast(CATEGORY_ORDER, b),
  );
}

function indexOrLast(order: string[], value: string): number {
  const i = order.indexOf(value);
  return i === -1 ? order.length : i;
}
