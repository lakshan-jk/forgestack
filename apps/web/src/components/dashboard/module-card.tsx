'use client';

import { Check, Lock } from 'lucide-react';
import type { ApiModule } from '@/lib/api';
import { cn } from '@/lib/cn';

interface ModuleCardProps {
  module: ApiModule;
  selected: boolean;
  /** True when included as a dependency of another selection (not directly chosen). */
  auto: boolean;
  onToggle: (id: string) => void;
}

export function ModuleCard({ module, selected, auto, onToggle }: ModuleCardProps) {
  const locked = module.required;
  const active = selected || auto;

  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onToggle(module.id)}
      aria-pressed={active}
      className={cn(
        'group relative flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-all',
        active
          ? 'border-[var(--color-accent)]/60 bg-[var(--color-accent)]/[0.06]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-fg-muted)]/40',
        locked ? 'cursor-default' : 'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors',
          active
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-fg)]'
            : 'border-[var(--color-border)] bg-transparent',
        )}
      >
        {active && <Check className="size-3.5" strokeWidth={3} />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-medium text-[var(--color-fg)]">{module.name}</span>
          {locked && (
            <span className="inline-flex items-center gap-1 rounded bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--color-fg-muted)]">
              <Lock className="size-2.5" /> required
            </span>
          )}
          {auto && !selected && !locked && (
            <span className="rounded bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--color-fg-muted)]">
              dependency
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm text-[var(--color-fg-muted)]">
          {module.description}
        </span>
      </span>
    </button>
  );
}
