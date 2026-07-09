import { buildApp } from './app.js';
import { env } from './config/env.js';

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
  } catch (err) {
    app.log.error(err, 'Failed to start server');
    process.exit(1);
  }
}

void main();
