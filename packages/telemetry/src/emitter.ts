import type { TelemetryEvent } from './types.js';

export interface TelemetryEmitterOptions {
  /** Collector URL that receives batches. */
  endpoint: string;
  /** When false, nothing is ever sent (opt-out). */
  enabled: boolean;
  installId: string;
  version: string;
  source?: TelemetryEvent['source'];
  /** Abort a send after this many ms so telemetry never blocks the app. */
  timeoutMs?: number;
}

/**
 * Fire-and-forget telemetry emitter. Every guarantee here is about *not*
 * affecting the host: it never throws, never blocks a request, and sends
 * nothing when disabled. Failures (offline, endpoint down) are swallowed.
 */
export class TelemetryEmitter {
  constructor(private readonly options: TelemetryEmitterOptions) {}

  get enabled(): boolean {
    return this.options.enabled;
  }

  track(name: string, properties?: TelemetryEvent['properties']): void {
    if (!this.options.enabled) return;
    const event: TelemetryEvent = {
      name,
      installId: this.options.installId,
      timestamp: new Date().toISOString(),
      version: this.options.version,
      source: this.options.source ?? 'api',
      properties,
    };
    void this.send([event]);
  }

  private async send(events: TelemetryEvent[]): Promise<void> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.options.timeoutMs ?? 3000);
      await fetch(this.options.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        signal: controller.signal,
      });
      clearTimeout(timer);
    } catch {
      // Telemetry must never affect the application. Swallow all errors.
    }
  }
}

/** Reads the standard opt-out flag. Telemetry is on unless explicitly disabled. */
export function telemetryEnabledFromEnv(env: Record<string, string | undefined>): boolean {
  const flag = env.FORGESTACK_TELEMETRY_DISABLED;
  return !(flag === '1' || flag === 'true');
}
