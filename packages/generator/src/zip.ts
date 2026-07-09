import { zipSync, strToU8 } from 'fflate';
import type { GenerationResult } from '@forgestack/shared';

/**
 * Packs a generation result into a ZIP archive (as bytes). Pure and
 * synchronous — no filesystem — so it runs identically in the API, a CLI, or
 * an edge function.
 *
 * Files are nested under a top-level `<projectName>/` folder so unzipping
 * yields a single tidy directory, matching the download UX of Vercel/Railway.
 */
export function zipProject(result: GenerationResult): Uint8Array {
  const entries: Record<string, Uint8Array> = {};

  for (const file of result.files) {
    const key = `${result.projectName}/${file.path}`;
    entries[key] = strToU8(file.content);
  }

  // Deterministic archive: a fixed mtime so identical inputs produce identical
  // bytes (useful for caching / content-addressing). ZIP timestamps must fall
  // in 1980–2099, so we use 2000-01-01 (ms since the Unix epoch).
  return zipSync(entries, { level: 6, mtime: 946684800000 });
}
