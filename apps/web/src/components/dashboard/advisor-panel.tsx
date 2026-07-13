'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Wand2, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { getAdvisorSuggestion, type ApiModule } from '@/lib/api';
import { cn } from '@/lib/cn';

const EXAMPLES = [
  'a REST API with authentication and background jobs',
  'a real-time service that needs caching and API docs',
  'a containerized backend with CI and a Mongo database',
];

interface AdvisorPanelProps {
  modules: ApiModule[];
  /** Apply the resolved stack to the builder's selection. */
  onApply: (moduleIds: string[]) => void;
}

export function AdvisorPanel({ modules, onApply }: AdvisorPanelProps) {
  const [prompt, setPrompt] = useState('');
  const nameOf = (id: string) => modules.find((m) => m.id === id)?.name ?? id;

  const mutation = useMutation({
    mutationFn: (p: string) => getAdvisorSuggestion(p),
  });
  const result = mutation.data;

  const submit = () => {
    const trimmed = prompt.trim();
    if (trimmed) mutation.mutate(trimmed);
  };

  return (
    <section className="rounded-xl border border-[var(--color-accent)]/30 bg-[linear-gradient(180deg,rgba(109,94,252,0.08),transparent)] p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-[var(--color-accent)]" />
        <h2 className="text-sm font-medium">Describe your backend</h2>
        <span className="ml-auto text-xs text-[var(--color-fg-muted)]">AI suggests a stack</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
          }}
          rows={2}
          placeholder="e.g. a REST API with auth, background jobs and caching…"
          className="flex-1 resize-none rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none transition-colors placeholder:text-[var(--color-fg-muted)]/60 focus:border-[var(--color-accent)]"
        />
        <button
          type="button"
          onClick={submit}
          disabled={mutation.isPending || prompt.trim().length === 0}
          className="flex shrink-0 items-center justify-center gap-2 self-stretch rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-50 sm:self-auto"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Analyzing…
            </>
          ) : (
            <>
              <Wand2 className="size-4" /> Suggest
            </>
          )}
        </button>
      </div>

      {!result && !mutation.isPending && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setPrompt(ex)}
              className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-fg-muted)]/50 hover:text-[var(--color-fg)]"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {mutation.isError && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            Couldn&apos;t reach the advisor. Is the API running on{' '}
            <code className="font-mono">localhost:4000</code>?
          </span>
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="mb-3 text-xs text-[var(--color-fg-muted)]">
            Top matches{' '}
            <span className="rounded bg-[var(--color-surface-2)] px-1.5 py-0.5 font-mono">
              {result.provider}
            </span>
          </p>

          <div className="mb-4 space-y-1.5">
            {result.suggested.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-sm">{s.name}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    style={{ width: `${Math.round(Math.min(1, s.score / 0.5) * 100)}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-xs text-[var(--color-fg-muted)]">
                  {s.score.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
            <p className="text-xs text-[var(--color-fg-muted)]">
              Resolves to{' '}
              <span className="text-[var(--color-fg)]">{result.resolvedStack.length} modules</span>:{' '}
              {result.resolvedStack.map(nameOf).join(', ')}
            </p>
            <button
              type="button"
              onClick={() => onApply(result.resolvedStack)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--color-accent)]/50 px-3 py-1.5 text-sm font-medium text-[var(--color-fg)] transition-colors hover:bg-[var(--color-accent)]/10',
              )}
            >
              Use this stack <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
