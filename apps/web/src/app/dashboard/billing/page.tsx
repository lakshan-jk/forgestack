import { Check } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-[var(--color-fg-muted)]">Plans and usage.</p>
      </header>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--color-fg-muted)]">Current plan</p>
            <p className="mt-1 text-xl font-semibold">Free</p>
          </div>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-fg-muted)]">
            Active
          </span>
        </div>

        <ul className="mt-5 space-y-2">
          {['Unlimited project generation', 'All modules', 'Community support'].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="size-4 text-[var(--color-accent)]" /> {f}
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled
          className="mt-6 w-full cursor-not-allowed rounded-md border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-fg-muted)]"
        >
          Upgrade — coming soon
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-[var(--color-fg-muted)]">
        Billing is a placeholder. Stripe / Razorpay integration is planned.
      </p>
    </div>
  );
}
