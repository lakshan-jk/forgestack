import { describe, it, expect } from 'vitest';
import { generateProject } from '@forgestack/generator';
import { loadRegistry, createTemplateSource } from '../src/index.js';

const registry = loadRegistry();
const templates = createTemplateSource();

function generate(modules: string[]) {
  return generateProject(
    { projectName: 'sample-api', description: 'A sample API', modules, packageManager: 'pnpm' },
    { registry, templates },
  );
}

const fileByPath = (result: ReturnType<typeof generate>, path: string) =>
  result.files.find((f) => f.path === path);

describe('Fastify + TypeScript + MongoDB generation', () => {
  it('resolves the dependency chain typescript → fastify → mongodb', () => {
    const result = generate(['mongodb']);
    expect(result.resolvedModules).toEqual(['typescript', 'fastify', 'mongodb']);
  });

  it('emits the expected project structure', () => {
    const result = generate(['mongodb']);
    const paths = result.files.map((f) => f.path).sort();

    for (const expected of [
      'package.json',
      'tsconfig.json',
      'tsconfig.build.json',
      '.gitignore',
      '.env.example',
      'README.md',
      'src/server.ts',
      'src/app.ts',
      'src/config/env.ts',
      'src/plugins/security.ts',
      'src/plugins/mongoose.ts',
      'src/modules/health/health.route.ts',
      'src/modules/users/user.model.ts',
      'src/modules/users/users.route.ts',
    ]) {
      expect(paths, `missing ${expected}`).toContain(expected);
    }
  });

  it('synthesizes a valid package.json merging all module deps', () => {
    const result = generate(['mongodb']);
    const pkg = JSON.parse(fileByPath(result, 'package.json')!.content);

    expect(pkg.name).toBe('sample-api');
    expect(pkg.type).toBe('module');
    expect(pkg.dependencies).toHaveProperty('fastify');
    expect(pkg.dependencies).toHaveProperty('mongoose');
    expect(pkg.devDependencies).toHaveProperty('typescript');
    expect(pkg.scripts).toHaveProperty('dev');
    expect(pkg.scripts).toHaveProperty('build');
  });

  it('generates an env schema that validates every module env var', () => {
    const result = generate(['mongodb']);
    const env = fileByPath(result, 'src/config/env.ts')!.content;

    expect(env).toContain('MONGODB_URI: z.string().min(1)');
    expect(env).toContain('PORT: z.coerce.number().int().positive().default(3000)');
    expect(env).toContain("NODE_ENV: z.string().default('development')");
  });

  it('produces a .env.example documenting each variable', () => {
    const result = generate(['mongodb']);
    const env = fileByPath(result, '.env.example')!.content;

    expect(env).toContain('MONGODB_URI=mongodb://localhost:27017/app');
    expect(env).toContain('PORT=3000');
  });

  it('renders project name into the README and root route', () => {
    const result = generate(['fastify']);
    expect(fileByPath(result, 'README.md')!.content).toContain('# sample-api');
    expect(fileByPath(result, 'src/app.ts')!.content).toContain("name: 'sample-api'");
  });
});
