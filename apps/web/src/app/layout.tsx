import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'ForgeStack — Production backends, generated',
  description:
    'Generate production-ready backend applications from a declarative stack config. Fastify, TypeScript, MongoDB, JWT, Redis, BullMQ, Docker and more.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
