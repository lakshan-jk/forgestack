import { z } from 'zod';

/**
 * A single anonymous telemetry event. Contains NO personal data — no IP, no
 * account, no project names, no prompts. Just an anonymous install id and
 * coarse, aggregate-friendly properties.
 */
export const TelemetryEvent = z.object({
  name: z.string().min(1),
  /** Random per-install UUID; the only identifier, and it is anonymous. */
  installId: z.string().uuid(),
  timestamp: z.string(),
  version: z.string(),
  source: z.enum(['api', 'web', 'cli']).default('api'),
  properties: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]))
    .optional(),
});
export type TelemetryEvent = z.infer<typeof TelemetryEvent>;

/** Payload accepted by the collector endpoint. */
export const TelemetryBatch = z.object({
  events: z.array(TelemetryEvent).max(100),
});
export type TelemetryBatch = z.infer<typeof TelemetryBatch>;

/** Well-known event names (kept small and stable). */
export const TelemetryEventName = {
  ServerStarted: 'server.started',
  ProjectGenerated: 'project.generated',
  AdvisorUsed: 'advisor.used',
} as const;
