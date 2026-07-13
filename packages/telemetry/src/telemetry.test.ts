import { describe, it, expect, vi, afterEach } from 'vitest';
import { TelemetryEmitter, telemetryEnabledFromEnv } from './emitter.js';
import { getInstallId } from './install-id.js';

const baseOpts = {
  endpoint: 'http://localhost:9/collect',
  installId: '00000000-0000-4000-8000-000000000000',
  version: '0.0.0',
};

afterEach(() => vi.unstubAllGlobals());

describe('telemetryEnabledFromEnv', () => {
  it('is enabled by default and disabled only via the opt-out flag', () => {
    expect(telemetryEnabledFromEnv({})).toBe(true);
    expect(telemetryEnabledFromEnv({ FORGESTACK_TELEMETRY_DISABLED: '1' })).toBe(false);
    expect(telemetryEnabledFromEnv({ FORGESTACK_TELEMETRY_DISABLED: 'true' })).toBe(false);
    expect(telemetryEnabledFromEnv({ FORGESTACK_TELEMETRY_DISABLED: '0' })).toBe(true);
  });
});

describe('TelemetryEmitter', () => {
  it('sends an event when enabled', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    new TelemetryEmitter({ ...baseOpts, enabled: true }).track('project.generated', {
      modules: ['fastify', 'jwt'],
    });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    const body = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(body.events[0].name).toBe('project.generated');
    expect(body.events[0].installId).toBe(baseOpts.installId);
  });

  it('sends nothing when disabled (opt-out)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    new TelemetryEmitter({ ...baseOpts, enabled: false }).track('project.generated');
    await new Promise((r) => setTimeout(r, 20));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never throws even when the collector is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    expect(() => new TelemetryEmitter({ ...baseOpts, enabled: true }).track('x')).not.toThrow();
  });
});

describe('getInstallId', () => {
  it('returns a stable UUID across calls', () => {
    const a = getInstallId();
    const b = getInstallId();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).toBe(b);
  });
});
