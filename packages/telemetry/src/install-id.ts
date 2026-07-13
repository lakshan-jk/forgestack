import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * Returns a stable, anonymous install id — a random UUID persisted to
 * `~/.forgestack/install-id`. It identifies an *installation*, never a person.
 * On any filesystem error we fall back to an ephemeral id so telemetry never
 * breaks the host process.
 */
export function getInstallId(): string {
  try {
    const dir = join(homedir(), '.forgestack');
    const file = join(dir, 'install-id');
    if (existsSync(file)) {
      const existing = readFileSync(file, 'utf8').trim();
      if (existing) return existing;
    }
    mkdirSync(dir, { recursive: true });
    const id = randomUUID();
    writeFileSync(file, id, 'utf8');
    return id;
  } catch {
    return randomUUID();
  }
}
