import { loadRegistry, createTemplateSource } from '@forgestack/templates';

/**
 * The registry and template source are immutable and read from disk, so we load
 * them once at process start and share them across every request.
 */
export const registry = loadRegistry();
export const templates = createTemplateSource();
