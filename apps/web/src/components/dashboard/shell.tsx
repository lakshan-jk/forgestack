'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plus, Boxes, BarChart3, Settings, Github } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SignOutButton } from './sign-out-button';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true, adminOnly: false },
  { href: '/dashboard/new', label: 'New project', icon: Plus, exact: false, adminOnly: false },
  { href: '/dashboard/templates', label: 'Templates', icon: Boxes, exact: false, adminOnly: false },
  { href: '/dashboard/metrics', label: 'Metrics', icon: BarChart3, exact: false, adminOnly: true },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false, adminOnly: false },
] as const;

const REPO_URL = 'https://github.com/lakshan-jk/forgestack';

interface ShellProps {
  user: { name?: string | null; email?: string | null };
  isAdmin: boolean;
  children: ReactNode;
}

export function Shell({ user, isAdmin, children }: ShellProps) {
  const pathname = usePathname();
  const initial = (user.name ?? user.email ?? 'U').charAt(0).toUpperCase();
  const nav = NAV.filter((item) => !item.adminOnly || isAdmin);
  const active = nav.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  );
  const title = active?.label ?? 'Dashboard';

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl">
        <Link href="/dashboard" className="flex items-center gap-2 px-5 py-4">
          <div className="grid size-7 place-items-center rounded-md bg-[var(--color-accent)] text-sm font-bold text-[var(--color-accent-fg)]">
            F
          </div>
          <span className="text-sm font-semibold tracking-tight">ForgeStack</span>
        </Link>

        <p className="mb-1 mt-2 px-5 text-[10px] font-medium uppercase tracking-widest text-[var(--color-fg-muted)]">
          Menu
        </p>
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-[var(--color-surface-2)] text-[var(--color-fg)]'
                    : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)]/60 hover:text-[var(--color-fg)]',
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[var(--color-accent)]" />
                )}
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--color-border)] p-3">
          <div className="mb-2 flex items-center gap-2.5 px-2">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--color-surface-2)] text-sm font-medium">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name ?? 'User'}</p>
              <p className="truncate text-xs text-[var(--color-fg-muted)]">{user.email}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main column: top bar + content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/70 px-6 backdrop-blur-xl">
          <h1 className="text-sm font-medium">{title}</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-[var(--color-accent-fg)] transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" /> New project
            </Link>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              className="grid size-8 place-items-center rounded-md border border-[var(--color-border)] text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)]"
            >
              <Github className="size-4" />
            </a>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
