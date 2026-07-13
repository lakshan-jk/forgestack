import { PrismaClient } from '@prisma/client';

/**
 * Shared Prisma client. A single instance is reused across the process; in dev
 * we stash it on `globalThis` so tsx's watch-reloads don't leak connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
