import { GenerationRequest, type GenerationResult } from '@forgestack/shared';
import type { ModuleRegistry } from './registry.js';
import type { TemplateSource } from './source.js';
import { resolveModules } from './resolver.js';
import { compose } from './compose.js';

export interface GenerateOptions {
  registry: ModuleRegistry;
  templates: TemplateSource;
}

/**
 * The engine's single entry point: validate the request, resolve the module
 * graph, and compose the project tree. Pure and synchronous — no filesystem,
 * no network — so it can run in a Fastify handler, a CLI, or an edge function.
 */
export function generateProject(
  rawRequest: unknown,
  { registry, templates }: GenerateOptions,
): GenerationResult {
  const request = GenerationRequest.parse(rawRequest);
  const { ordered } = resolveModules(request.modules, registry);
  return compose({ request, ordered, templates });
}
