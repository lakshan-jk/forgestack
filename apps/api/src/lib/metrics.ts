import type { TelemetryEvent } from '@forgestack/telemetry';

/**
 * In-memory usage aggregate. Phase A keeps counts in process memory; Phase B
 * swaps this for a durable store (Prisma/SQLite) behind the same shape.
 */
class MetricsStore {
  private totalEvents = 0;
  private readonly eventsByName = new Map<string, number>();
  private readonly moduleCounts = new Map<string, number>();
  private readonly installs = new Set<string>();
  private generations = 0;
  private advisorRuns = 0;

  record(event: TelemetryEvent): void {
    this.totalEvents += 1;
    this.installs.add(event.installId);
    this.eventsByName.set(event.name, (this.eventsByName.get(event.name) ?? 0) + 1);

    if (event.name === 'project.generated') {
      this.generations += 1;
      const modules = event.properties?.modules;
      if (Array.isArray(modules)) {
        for (const id of modules) this.moduleCounts.set(id, (this.moduleCounts.get(id) ?? 0) + 1);
      }
    }
    if (event.name === 'advisor.used') this.advisorRuns += 1;
  }

  snapshot() {
    const topModules = [...this.moduleCounts.entries()]
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: this.totalEvents,
      uniqueInstalls: this.installs.size,
      generations: this.generations,
      advisorRuns: this.advisorRuns,
      eventsByName: Object.fromEntries(this.eventsByName),
      topModules,
    };
  }
}

export const metrics = new MetricsStore();
export type MetricsSnapshot = ReturnType<MetricsStore['snapshot']>;
