import { ModuleDefinition } from '@forgestack/shared';

/**
 * A ModuleRegistry is an indexed, validated collection of module definitions.
 * The engine is agnostic about where definitions come from — the templates
 * package loads JSON from disk and builds one; tests build one from literals.
 */
export class ModuleRegistry {
  private readonly modules = new Map<string, ModuleDefinition>();

  /** Validate and register a raw (unparsed) module definition. */
  add(raw: unknown): ModuleDefinition {
    const parsed = ModuleDefinition.parse(raw);
    if (this.modules.has(parsed.id)) {
      throw new Error(`Duplicate module id "${parsed.id}" in registry.`);
    }
    this.modules.set(parsed.id, parsed);
    return parsed;
  }

  has(id: string): boolean {
    return this.modules.has(id);
  }

  get(id: string): ModuleDefinition | undefined {
    return this.modules.get(id);
  }

  /** Throws UnknownModuleError-free lookups are the caller's responsibility. */
  require(id: string): ModuleDefinition {
    const m = this.modules.get(id);
    if (!m) throw new Error(`Module "${id}" not found in registry.`);
    return m;
  }

  list(): ModuleDefinition[] {
    return [...this.modules.values()];
  }

  get size(): number {
    return this.modules.size;
  }

  static from(raws: unknown[]): ModuleRegistry {
    const reg = new ModuleRegistry();
    for (const r of raws) reg.add(r);
    return reg;
  }
}
