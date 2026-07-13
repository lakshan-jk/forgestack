import {
  StackAdvisor,
  MemoryVectorStore,
  FakeEmbeddings,
  LocalEmbeddings,
  HfInferenceEmbeddings,
  type EmbeddingsProvider,
  type VectorStore,
  type AdvisorModule,
} from '@forgestack/ai';
import { env } from '../config/env.js';
import { registry } from './generator.js';

/**
 * Builds the embeddings provider from configuration. Defaults to fully-local
 * inference (no key, offline after first download); `fake` is instant and
 * deterministic for tests; `huggingface` is the hosted path.
 */
function createEmbeddings(): EmbeddingsProvider {
  switch (env.EMBEDDINGS_PROVIDER) {
    case 'huggingface':
      if (!env.HF_TOKEN) {
        throw new Error('EMBEDDINGS_PROVIDER=huggingface requires HF_TOKEN to be set.');
      }
      return new HfInferenceEmbeddings({ token: env.HF_TOKEN, model: env.HF_EMBEDDING_MODEL });
    case 'fake':
      return new FakeEmbeddings();
    case 'local':
    default:
      return new LocalEmbeddings({ model: env.LOCAL_EMBEDDING_MODEL });
  }
}

function createVectorStore(): VectorStore {
  // Atlas store lands in a later phase; memory is the default and dev fallback.
  return new MemoryVectorStore();
}

export const advisor = new StackAdvisor(createEmbeddings(), createVectorStore());
export const embeddingsProviderId = env.EMBEDDINGS_PROVIDER;

/**
 * Builds the module vector index once, lazily, on the first advisor request —
 * so the server boots instantly even when the local model must download.
 */
let indexing: Promise<void> | null = null;
export function ensureIndexed(): Promise<void> {
  if (!indexing) {
    const modules: AdvisorModule[] = registry.list().map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      category: m.category,
      tags: m.tags,
    }));
    indexing = advisor.index(modules);
  }
  return indexing;
}
