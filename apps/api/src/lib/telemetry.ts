import { TelemetryEmitter, telemetryEnabledFromEnv, getInstallId } from '@forgestack/telemetry';
import { env } from '../config/env.js';

const enabled = telemetryEnabledFromEnv(process.env);

/**
 * Shared telemetry emitter. By default it reports to this instance's own
 * collector; set TELEMETRY_ENDPOINT to a central URL to aggregate self-hosted
 * installs. Anonymous, opt-out via FORGESTACK_TELEMETRY_DISABLED=1.
 */
export const telemetry = new TelemetryEmitter({
  endpoint: env.TELEMETRY_ENDPOINT ?? `http://127.0.0.1:${env.PORT}/api/telemetry`,
  enabled,
  installId: getInstallId(),
  version: '0.1.0',
  source: 'api',
});

export const telemetryEnabled = enabled;
