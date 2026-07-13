import { describe, it, expect, beforeEach } from 'vitest';
import { FakeEmbeddings } from '../embeddings/fake.js';
import { MemoryVectorStore } from '../vector/memory.js';
import { StackAdvisor, type AdvisorModule } from './advisor.js';

/** A slice of the real catalog, enough to exercise semantic ranking. */
const MODULES: AdvisorModule[] = [
  {
    id: 'fastify',
    name: 'Fastify',
    description: 'Fastify HTTP server with routing, plugins, health checks and graceful shutdown.',
    category: 'core',
    tags: ['fastify', 'http', 'server', 'api'],
  },
  {
    id: 'jwt',
    name: 'JWT Authentication',
    description: 'User authentication with JWT — a login route that issues tokens and a protected route.',
    category: 'auth',
    tags: ['jwt', 'auth', 'authentication', 'login'],
  },
  {
    id: 'bullmq',
    name: 'BullMQ',
    description: 'Background jobs and task queue processing with a worker and an enqueue route.',
    category: 'queue',
    tags: ['bullmq', 'jobs', 'queue', 'worker', 'background'],
  },
  {
    id: 'redis',
    name: 'Redis',
    description: 'Redis connection for caching and shared state.',
    category: 'cache',
    tags: ['redis', 'cache'],
  },
  {
    id: 'swagger',
    name: 'Swagger / OpenAPI',
    description: 'Interactive OpenAPI documentation served at a docs endpoint.',
    category: 'docs',
    tags: ['swagger', 'openapi', 'docs'],
  },
  {
    id: 'mongodb',
    name: 'MongoDB (Mongoose)',
    description: 'MongoDB database access with Mongoose models and a sample resource.',
    category: 'database',
    tags: ['mongodb', 'mongoose', 'database'],
  },
];

describe('StackAdvisor', () => {
  let advisor: StackAdvisor;

  beforeEach(async () => {
    advisor = new StackAdvisor(new FakeEmbeddings(), new MemoryVectorStore());
    await advisor.index(MODULES);
  });

  it('surfaces the auth module for an authentication prompt', async () => {
    const results = await advisor.suggest('user authentication and login with tokens');
    expect(results[0]?.id).toBe('jwt');
  });

  it('surfaces the queue module for a background-jobs prompt', async () => {
    const results = await advisor.suggest('background jobs and task queue processing');
    expect(results[0]?.id).toBe('bullmq');
  });

  it('surfaces the docs module for an API documentation prompt', async () => {
    const results = await advisor.suggest('interactive openapi documentation for my api');
    expect(results[0]?.id).toBe('swagger');
  });

  it('returns scores in descending order', async () => {
    const results = await advisor.suggest('caching with redis');
    for (let i = 1; i < results.length; i += 1) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
    }
  });

  it('respects topK', async () => {
    const results = await advisor.suggest('a backend api', { topK: 2 });
    expect(results).toHaveLength(2);
  });

  it('is deterministic across runs', async () => {
    const a = await advisor.suggest('authentication and background jobs');
    const b = await advisor.suggest('authentication and background jobs');
    expect(a).toEqual(b);
  });

  it('returns nothing for an empty prompt', async () => {
    expect(await advisor.suggest('   ')).toEqual([]);
  });

  it('filters out matches below minScore', async () => {
    const results = await advisor.suggest('authentication', { minScore: 0.99 });
    expect(results.every((r) => r.score >= 0.99)).toBe(true);
  });
});
