import { z } from 'zod';

/**
 * A ForgeStack "module" is the atomic unit of the generator.
 *
 * Modules are DATA, not code — every module lives as a JSON definition in
 * `@forgestack/templates`. The engine never hardcodes what a module produces;
 * it only knows how to *compose* modules described by this schema. Adding a new
 * technology (e.g. Postgres, gRPC, Kafka) means adding a JSON file + template
 * files, with zero changes to the engine.
 */

/** Broad grouping used for UI organisation and ordering heuristics. */
export const ModuleCategory = z.enum([
  'core', // framework, server bootstrap
  'framework', // alternative app frameworks (nest, next, react, vite)
  'language', // typescript, build tooling
  'database', // mongoose, prisma, ...
  'auth', // jwt, oauth
  'cache', // redis
  'queue', // bullmq
  'ai', // llm, embeddings, vector store, rag
  'ui', // styling: tailwind
  'docs', // swagger
  'observability', // pino, health checks, metrics
  'security', // helmet, cors, rate-limit
  'devops', // docker, github actions
  'quality', // eslint, prettier, husky, commitlint, tests
]);
export type ModuleCategory = z.infer<typeof ModuleCategory>;

/**
 * A single environment variable a module requires. Merged across all selected
 * modules into `.env.example` and consumed by the generated env-validation.
 */
export const EnvVarSpec = z.object({
  key: z.string().regex(/^[A-Z][A-Z0-9_]*$/, 'ENV keys must be SCREAMING_SNAKE_CASE'),
  description: z.string(),
  required: z.boolean().default(true),
  /** Zod validator kind emitted into the generated env schema. */
  type: z.enum(['string', 'number', 'boolean', 'url', 'port']).default('string'),
  default: z.string().optional(),
  example: z.string().optional(),
  /** Marks values that must never be committed (rendered as a placeholder). */
  secret: z.boolean().default(false),
});
export type EnvVarSpec = z.infer<typeof EnvVarSpec>;

/** How a composed file behaves when two modules target the same path. */
export const FileMergeStrategy = z.enum([
  'overwrite', // last module wins (default)
  'skip-if-exists', // first module wins; later modules are ignored
  'error', // collision is a hard failure (used for files that must be unique)
]);
export type FileMergeStrategy = z.infer<typeof FileMergeStrategy>;

/**
 * A file a module contributes to the generated project. Either `content`
 * (inline) or `template` (a path into the templates package that is rendered
 * with the generation context) must be provided — validated by the engine.
 */
export const FileSpec = z.object({
  /** Destination path within the generated project (POSIX, no leading slash). */
  path: z
    .string()
    .min(1)
    .refine((p) => !p.startsWith('/') && !p.includes('..'), 'path must be project-relative'),
  /** Path to a template file inside `@forgestack/templates` `files/`. */
  template: z.string().optional(),
  /** Inline content, used for tiny files that do not warrant a template file. */
  content: z.string().optional(),
  /** Whether the rendered output should be executable (chmod +x on emit). */
  executable: z.boolean().default(false),
  merge: FileMergeStrategy.default('overwrite'),
  /**
   * Optional gate — the file is only emitted when the named boolean option is
   * truthy in the generation request's `options`. Enables intra-module choices.
   */
  when: z.string().optional(),
});
export type FileSpec = z.infer<typeof FileSpec>;

/** Fragments merged into the generated `package.json`. */
export const PackageJsonContribution = z.object({
  dependencies: z.record(z.string(), z.string()).default({}),
  devDependencies: z.record(z.string(), z.string()).default({}),
  scripts: z.record(z.string(), z.string()).default({}),
  /** Arbitrary top-level keys (e.g. "lint-staged", "prisma") merged shallowly. */
  extra: z.record(z.string(), z.unknown()).default({}),
});
export type PackageJsonContribution = z.infer<typeof PackageJsonContribution>;

export const ModuleDefinition = z.object({
  id: z
    .string()
    .regex(/^[a-z][a-z0-9-]*$/, 'module id must be kebab-case'),
  name: z.string(),
  description: z.string(),
  category: ModuleCategory,
  version: z.string().default('1.0.0'),

  /** Modules that must be present for this one to function (auto-included). */
  dependsOn: z.array(z.string()).default([]),
  /**
   * At least one of these must be present, but none is auto-included — the user
   * must have chosen one. For cross-framework add-ons (e.g. Tailwind requires
   * one of react/next/vite). Empty = no requirement.
   */
  requiresOneOf: z.array(z.string()).default([]),
  /** Modules that cannot coexist with this one (hard error if both selected). */
  conflictsWith: z.array(z.string()).default([]),
  /** Capability tags this module satisfies (used for "requires a database" gates). */
  provides: z.array(z.string()).default([]),

  /** When true, the module is always included and cannot be deselected. */
  required: z.boolean().default(false),
  /** Free-text tags for search/filtering in the UI. */
  tags: z.array(z.string()).default([]),

  files: z.array(FileSpec).default([]),
  packageJson: PackageJsonContribution.default({
    dependencies: {},
    devDependencies: {},
    scripts: {},
    extra: {},
  }),
  env: z.array(EnvVarSpec).default([]),

  /** Human-readable notes surfaced in the generated README / post-generate step. */
  notes: z.array(z.string()).default([]),
});
export type ModuleDefinition = z.infer<typeof ModuleDefinition>;

/**
 * A curated, opinionated bundle of modules the UI can offer as a one-click
 * starting point (e.g. "Production Fastify API"). Presets are also data.
 */
export const StackPreset = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string(),
  description: z.string(),
  /** Module ids included by default. Dependencies are still auto-resolved. */
  modules: z.array(z.string()).min(1),
  recommended: z.boolean().default(false),
});
export type StackPreset = z.infer<typeof StackPreset>;
