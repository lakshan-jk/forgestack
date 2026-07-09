import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry, type TemplateSource } from '@forgestack/generator';

/**
 * Resolve the package root regardless of whether we run from TS source (tsx)
 * or compiled `dist`. `definitions/` and `files/` sit at the package root.
 */
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const definitionsDir = join(packageRoot, 'definitions');
const filesDir = join(packageRoot, 'files');

/** Filesystem-backed template source rooted at `files/`. */
export class FsTemplateSource implements TemplateSource {
  private readonly cache = new Map<string, string>();

  read(templatePath: string): string {
    const cached = this.cache.get(templatePath);
    if (cached !== undefined) return cached;

    const full = join(filesDir, templatePath);
    if (!full.startsWith(filesDir)) {
      throw new Error(`Template path "${templatePath}" escapes the files directory.`);
    }
    const content = readFileSync(full, 'utf8');
    this.cache.set(templatePath, content);
    return content;
  }

  has(templatePath: string): boolean {
    return existsSync(join(filesDir, templatePath));
  }
}

/** Load and validate every module definition under `definitions/`. */
export function loadRegistry(): ModuleRegistry {
  const registry = new ModuleRegistry();
  const files = readdirSync(definitionsDir).filter((f) => f.endsWith('.json'));

  for (const file of files.sort()) {
    const raw = readFileSync(join(definitionsDir, file), 'utf8');
    try {
      registry.add(JSON.parse(raw));
    } catch (err) {
      throw new Error(`Failed to load module definition "${file}": ${(err as Error).message}`);
    }
  }

  return registry;
}

export function createTemplateSource(): TemplateSource {
  return new FsTemplateSource();
}
