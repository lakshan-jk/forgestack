import { describe, it, expect } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import { zipProject } from './zip.js';

describe('zipProject', () => {
  const result = {
    projectName: 'my-api',
    resolvedModules: ['fastify'],
    files: [
      { path: 'package.json', content: '{"name":"my-api"}', executable: false },
      { path: 'src/server.ts', content: 'export const x = 1;\n', executable: false },
    ],
    warnings: [],
  };

  it('nests every file under a project-named folder', () => {
    const bytes = zipProject(result);
    const unzipped = unzipSync(bytes);
    const paths = Object.keys(unzipped).sort();

    expect(paths).toEqual(['my-api/package.json', 'my-api/src/server.ts']);
  });

  it('round-trips file content exactly', () => {
    const unzipped = unzipSync(zipProject(result));
    expect(strFromU8(unzipped['my-api/src/server.ts']!)).toBe('export const x = 1;\n');
  });

  it('is deterministic for identical input', () => {
    expect(Array.from(zipProject(result))).toEqual(Array.from(zipProject(result)));
  });
});
