import { auth } from '@/auth';

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-[var(--color-fg-muted)]">Manage your account.</p>
      </header>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-4 text-sm font-medium">Profile</h2>
        <div className="space-y-4">
          <Row label="Name" value={session?.user?.name ?? '—'} />
          <Row label="Email" value={session?.user?.email ?? '—'} />
        </div>
        <p className="mt-6 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-fg-muted)]">
          Profile editing arrives with the Prisma-backed user store. The current demo account is
          read-only.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--color-fg-muted)]">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
