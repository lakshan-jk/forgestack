import { TelemetryEventName } from '@forgestack/telemetry';
import { buildApp } from './app.js';
import { env } from './config/env.js';
import { telemetry, telemetryEnabled } from './lib/telemetry.js';

/**
 * Process entrypoint: build the app, bind the port, and wire graceful shutdown.
 * SIGINT/SIGTERM close in-flight connections before exiting so deploys and
 * local Ctrl-C never drop requests mid-flight.
 */
async function main(): Promise<void> {
  const app = await buildApp();

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'Shutting down gracefully');
    try {
      await app.close();
      process.exit(0);
    } catch (err) {
      app.log.error(err, 'Error during shutdown');
      process.exit(1);
    }
  };

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => void shutdown(signal));
  }

  try {
    await app.listen({ host: env.HOST, port: env.PORT });
    if (telemetryEnabled) {
      app.log.info(
        'Anonymous usage telemetry is on. Opt out with FORGESTACK_TELEMETRY_DISABLED=1 (see docs/telemetry.md).',
      );
      telemetry.track(TelemetryEventName.ServerStarted);
    }
  } catch (err) {
    app.log.error(err, 'Failed to start server');
    process.exit(1);
  }
}

void main();
