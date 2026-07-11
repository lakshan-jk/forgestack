import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Shell } from '@/components/dashboard/shell';

/**
 * Server-side guard for every dashboard route. The middleware already blocks
 * unauthenticated access at the edge; this is defence-in-depth and gives the
 * shell the current user.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/signin');

  return (
    <Shell user={{ name: session.user.name, email: session.user.email }}>{children}</Shell>
  );
}
