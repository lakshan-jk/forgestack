import type { ScoredMatch, VectorRecord, VectorStore } from '../types.js';
import { cosineSimilarity } from '../math.js';

/**
 * In-process vector store using cosine similarity. Perfect for a small catalog
 * (the module set) and for local dev / tests with zero external services.
 * The Atlas-backed store implements the same interface for production scale.
 */
export class MemoryVectorStore implements VectorStore {
  readonly id = 'memory';
  private records = new Map<string, VectorRecord>();

  async upsert(records: VectorRecord[]): Promise<void> {
    for (const record of records) this.records.set(record.id, record);
  }

  async query(vector: number[], topK: number): Promise<ScoredMatch[]> {
    return [...this.records.values()]
      .map((r) => ({ id: r.id, score: cosineSimilarity(vector, r.vector), metadata: r.metadata }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async clear(): Promise<void> {
    this.records.clear();
  }
}
