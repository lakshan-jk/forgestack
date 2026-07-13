import type { EmbeddingsProvider, VectorStore } from '../types.js';

/** The subset of a module the advisor needs to reason about it. */
export interface AdvisorModule {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
}

export interface Suggestion {
  id: string;
  score: number;
}

export interface SuggestOptions {
  /** Maximum number of modules to return (before dependency expansion). */
  topK?: number;
  /** Drop matches below this cosine score. */
  minScore?: number;
}

/**
 * Recommends modules for a natural-language prompt via semantic similarity.
 * It only ranks modules — dependency expansion into a coherent stack is done by
 * the generator's resolver, keeping a single source of truth for that logic.
 */
export class StackAdvisor {
  constructor(
    private readonly embeddings: EmbeddingsProvider,
    private readonly store: VectorStore,
  ) {}

  /** Embed every module and (re)build the vector index. Idempotent. */
  async index(modules: AdvisorModule[]): Promise<void> {
    await this.store.clear();
    if (modules.length === 0) return;

    const vectors = await this.embeddings.embed(modules.map((m) => moduleText(m)));
    await this.store.upsert(
      modules.map((m, i) => ({
        id: m.id,
        vector: vectors[i]!,
        metadata: { name: m.name, category: m.category },
      })),
    );
  }

  async suggest(prompt: string, options: SuggestOptions = {}): Promise<Suggestion[]> {
    const trimmed = prompt.trim();
    if (!trimmed) return [];

    const [queryVector] = await this.embeddings.embed([trimmed]);
    const matches = await this.store.query(queryVector!, options.topK ?? 6);
    const minScore = options.minScore ?? 0;

    return matches
      .filter((m) => m.score >= minScore)
      .map((m) => ({ id: m.id, score: round(m.score) }));
  }
}

/** The text we embed for a module — name + description carry the most signal. */
function moduleText(m: AdvisorModule): string {
  const tags = m.tags.length ? ` Tags: ${m.tags.join(', ')}.` : '';
  return `${m.name}. ${m.description}${tags}`;
}

function round(n: number): number {
  return Math.round(n * 1e4) / 1e4;
}
