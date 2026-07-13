import type { TelemetryEvent } from '@forgestack/telemetry';
import { prisma } from './db.js';

/**
 * Durable usage aggregate backed by Prisma/SQLite. Counts are maintained as
 * running totals (per install, per event name, per module) so a snapshot is a
 * few indexed reads, and everything survives restarts.
 */
export const metrics = {
  async record(event: TelemetryEvent): Promise<void> {
    await prisma.install.upsert({
      where: { installId: event.installId },
      create: { installId: event.installId },
      update: { lastSeen: new Date() },
    });

    await prisma.eventCount.upsert({
      where: { name: event.name },
      create: { name: event.name, count: 1 },
      update: { count: { increment: 1 } },
    });

    if (event.name === 'project.generated') {
      const modules = event.properties?.modules;
      if (Array.isArray(modules)) {
        await Promise.all(
          modules.map((moduleId) =>
            prisma.moduleUsage.upsert({
              where: { moduleId },
              create: { moduleId, count: 1 },
              update: { count: { increment: 1 } },
            }),
          ),
        );
      }
    }
  },

  async snapshot() {
    const [uniqueInstalls, eventCounts, topModules] = await Promise.all([
      prisma.install.count(),
      prisma.eventCount.findMany(),
      prisma.moduleUsage.findMany({ orderBy: { count: 'desc' }, take: 10 }),
    ]);

    const eventsByName = Object.fromEntries(eventCounts.map((e) => [e.name, e.count]));
    const totalEvents = eventCounts.reduce((sum, e) => sum + e.count, 0);

    return {
      totalEvents,
      uniqueInstalls,
      generations: eventsByName['project.generated'] ?? 0,
      advisorRuns: eventsByName['advisor.used'] ?? 0,
      eventsByName,
      topModules: topModules.map((m) => ({ id: m.moduleId, count: m.count })),
    };
  },
};

export type MetricsSnapshot = Awaited<ReturnType<typeof metrics.snapshot>>;
