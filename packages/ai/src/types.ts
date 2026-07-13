/**
 * Core contracts for the AI layer. Both the embeddings provider and the vector
 * store are abstractions with multiple implementations (hosted HF, local
 * Transformers.js, deterministic fake; Atlas, in-memory). The advisor depends
 * only on these interfaces, so swapping providers never touches its logic.
 */

export interface EmbeddingsProvider {
  /** Stable identifier, e.g. "fake" | "huggingface" | "local". */
  readonly id: string;
  /** Embed a batch of texts into vectors of a fixed dimensionality. */
  embed(texts: string[]): Promise<number[][]>;
}

export interface VectorRecord {
  id: string;
  vector: number[];
  metadata?: Record<string, unknown>;
}

export interface ScoredMatch {
  id: string;
  /** Cosine similarity in [-1, 1]; typically [0, 1] for text embeddings. */
  score: number;
  metadata?: Record<string, unknown>;
}

export interface VectorStore {
  readonly id: string;
  upsert(records: VectorRecord[]): Promise<void>;
  query(vector: number[], topK: number): Promise<ScoredMatch[]>;
  clear(): Promise<void>;
}
