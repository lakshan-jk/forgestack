import { z } from 'zod';

/**
 * The generation request is the contract between the web form and the engine.
 * React Hook Form validates against it client-side; the API re-validates it;
 * the engine consumes the parsed result. One schema, three consumers.
 */

export const PackageManager = z.enum(['pnpm', 'npm', 'yarn']);
export type PackageManager = z.infer<typeof PackageManager>;

/** npm package-name rules, reused for the generated project's name. */
export const projectNameSchema = z
  .string()
  .min(2, 'Project name must be at least 2 characters')
  .max(64, 'Project name is too long')
  .regex(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
    'Use lowercase letters, numbers and dashes (npm package-name rules)',
  );

export const GenerationRequest = z.object({
  projectName: projectNameSchema,
  description: z.string().max(280).optional(),

  /** Selected module ids. Dependencies are expanded by the resolver. */
  modules: z.array(z.string()).min(1, 'Select at least one module'),

  packageManager: PackageManager.default('pnpm'),

  /**
   * Free-form boolean/string options consumed by `FileSpec.when` gates and
   * template rendering (e.g. `{ "includeDockerCompose": true }`).
   */
  options: z.record(z.string(), z.union([z.boolean(), z.string(), z.number()])).default({}),
});
export type GenerationRequest = z.infer<typeof GenerationRequest>;

/** A single entry in the composed virtual file tree returned by the engine. */
export const GeneratedFile = z.object({
  path: z.string(),
  content: z.string(),
  executable: z.boolean().default(false),
});
export type GeneratedFile = z.infer<typeof GeneratedFile>;

/** The engine's output: everything needed to write the project or a ZIP. */
export const GenerationResult = z.object({
  projectName: z.string(),
  /** Fully resolved module ids in topological (install/apply) order. */
  resolvedModules: z.array(z.string()),
  files: z.array(GeneratedFile),
  /** Warnings that did not stop generation (e.g. a skipped optional file). */
  warnings: z.array(z.string()).default([]),
});
export type GenerationResult = z.infer<typeof GenerationResult>;
