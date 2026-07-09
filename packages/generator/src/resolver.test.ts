import { describe, it, expect } from 'vitest';
import { ModuleRegistry } from './registry.js';
import { resolveModules } from './resolver.js';
import {
  DependencyCycleError,
  ModuleConflictError,
  UnknownModuleError,
} from './errors.js';

/** Minimal module factory for tests — only the fields the resolver cares about. */
const mod = (
  id: string,
  opts: Partial<{ dependsOn: string[]; conflictsWith: string[] }> = {},
) => ({
  id,
  name: id,
  description: `${id} module`,
  category: 'core' as const,
  dependsOn: opts.dependsOn ?? [],
  conflictsWith: opts.conflictsWith ?? [],
});

const ids = (r: ReturnType<typeof resolveModules>) => r.ordered.map((m) => m.module.id);

describe('resolveModules', () => {
  it('expands transitive dependencies and orders them before dependents', () => {
    const reg = ModuleRegistry.from([
      mod('fastify'),
      mod('mongoose', { dependsOn: ['fastify'] }),
      mod('jwt', { dependsOn: ['mongoose'] }),
    ]);

    const result = resolveModules(['jwt'], reg);

    // Only jwt was requested, but fastify + mongoose are pulled in.
    expect(result.autoIncluded).toEqual(['fastify', 'mongoose']);

    const order = ids(result);
    expect(order.indexOf('fastify')).toBeLessThan(order.indexOf('mongoose'));
    expect(order.indexOf('mongoose')).toBeLessThan(order.indexOf('jwt'));
  });

  it('marks directly requested vs auto-included modules', () => {
    const reg = ModuleRegistry.from([mod('fastify'), mod('redis', { dependsOn: ['fastify'] })]);
    const result = resolveModules(['redis'], reg);

    const fastify = result.ordered.find((m) => m.module.id === 'fastify')!;
    const redis = result.ordered.find((m) => m.module.id === 'redis')!;
    expect(fastify.requestedDirectly).toBe(false);
    expect(redis.requestedDirectly).toBe(true);
  });

  it('throws UnknownModuleError for a missing dependency', () => {
    const reg = ModuleRegistry.from([mod('a', { dependsOn: ['ghost'] })]);
    expect(() => resolveModules(['a'], reg)).toThrow(UnknownModuleError);
  });

  it('throws ModuleConflictError when incompatible modules are both selected', () => {
    const reg = ModuleRegistry.from([
      mod('mongoose', { conflictsWith: ['prisma'] }),
      mod('prisma'),
    ]);
    expect(() => resolveModules(['mongoose', 'prisma'], reg)).toThrow(ModuleConflictError);
  });

  it('detects conflicts introduced transitively', () => {
    const reg = ModuleRegistry.from([
      mod('mongoose', { conflictsWith: ['prisma'] }),
      mod('prisma'),
      mod('needs-prisma', { dependsOn: ['prisma'] }),
    ]);
    expect(() => resolveModules(['mongoose', 'needs-prisma'], reg)).toThrow(ModuleConflictError);
  });

  it('throws DependencyCycleError on a cyclic graph', () => {
    const reg = ModuleRegistry.from([
      mod('a', { dependsOn: ['b'] }),
      mod('b', { dependsOn: ['a'] }),
    ]);
    expect(() => resolveModules(['a'], reg)).toThrow(DependencyCycleError);
  });

  it('produces deterministic ordering regardless of request order', () => {
    const reg = ModuleRegistry.from([
      mod('fastify'),
      mod('mongoose', { dependsOn: ['fastify'] }),
      mod('redis', { dependsOn: ['fastify'] }),
      mod('bullmq', { dependsOn: ['redis'] }),
      mod('swagger', { dependsOn: ['fastify'] }),
    ]);

    const a = ids(resolveModules(['bullmq', 'swagger', 'mongoose'], reg));
    const b = ids(resolveModules(['mongoose', 'swagger', 'bullmq'], reg));
    expect(a).toEqual(b);
    expect(a.indexOf('redis')).toBeLessThan(a.indexOf('bullmq'));
  });
});
