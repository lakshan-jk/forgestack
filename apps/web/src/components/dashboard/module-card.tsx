'use client';

import { Check } from 'lucide-react';
import type { ApiModule } from '@/lib/api';
import { cn } from '@/lib/cn';
import { categoryMeta } from './module-meta';

interface ModuleCardProps {
  module: ApiModule;
  selected: boolean;
  /** True when included as a dependency of another selection (not directly chosen). */
  auto: boolean;
  onToggle: (id: string) => void;
}

export function ModuleCard({ module, selected, auto, onToggle }: ModuleCardProps) {
  // Only the user's explicit picks look "selected". Dependencies get a subtle
  // tag instead, so choosing MongoDB doesn't make Fastify/TypeScript look chosen.
  const active = selected;
  const meta = categoryMeta(module.category);
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={() => onToggle(module.id)}
      aria-pressed={active}
      className={cn(
        'group relative flex min-h-[76px] w-full items-start gap-3 overflow-hidden rounded-xl border p-3.5 text-left transition-all',
        active
          ? 'border-[var(--color-accent)]/60 bg-[var(--color-accent)]/[0.07] ring-1 ring-[var(--color-accent)]/15'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:-translate-y-0.5 hover:border-[var(--color-fg-muted)]/40 hover:bg-[var(--color-surface-2)]/40',
      )}
    >
      {/* category icon */}
      <span
        className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
      >
        <Icon className="size-[18px]" />
      </span>

      {/* content */}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 pr-6">
          <span className="truncate font-medium text-[var(--color-fg)]">{module.name}</span>
          {auto && !selected && (
            <span className="shrink-0 rounded bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">
              dep
            </span>
          )}
        </span>
        <span className="mt-1 line-clamp-2 block text-[13px] leading-snug text-[var(--color-fg-muted)]">
          {module.description}
        </span>
      </span>

      {/* selected check, top-right */}
      <span
        className={cn(
          'absolute right-3 top-3 grid size-5 place-items-center rounded-full border transition-all',
          active
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-fg)]'
            : 'border-[var(--color-border)] bg-transparent opacity-0 group-hover:opacity-100',
        )}
      >
        {active && <Check className="size-3" strokeWidth={3} />}
      </span>
    </button>
  );
}
