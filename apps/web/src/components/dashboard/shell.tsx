'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plus, Boxes, BarChart3, Settings, CreditCard } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SignOutButton } from './sign-out-button';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true, adminOnly: false },
  { href: '/dashboard/new', label: 'New project', icon: Plus, exact: false, adminOnly: false },
  { href: '/dashboard/templates', label: 'Templates', icon: Boxes, exact: false, adminOnly: false },
  { href: '/dashboard/metrics', label: 'Metrics', icon: BarChart3, exact: false, adminOnly: true },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false, adminOnly: false },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard, exact: false, adminOnly: false },
] as const;

interface ShellProps {
  user: { name?: string | null; email?: string | null };
  isAdmin: boolean;
  children: ReactNode;
}

export function Shell({ user, isAdmin, children }: ShellProps) {
  const pathname = usePathname();
  const initial = (user.name ?? user.email ?? 'U').charAt(0).toUpperCase();
  const nav = NAV.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <Link href="/dashboard" className="flex items-center gap-2 px-5 py-5">
          <div className="grid size-7 place-items-center rounded-md bg-[var(--color-accent)] text-sm font-bold text-[var(--color-accent-fg)]">
            F
          </div>
          <span className="text-sm font-semibold tracking-tight">ForgeStack</span>
        </Link>

        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-[var(--color-surface-2)] text-[var(--color-fg)]'
                    : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)]/60 hover:text-[var(--color-fg)]',
                )}
              >
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

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
