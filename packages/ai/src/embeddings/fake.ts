import type { EmbeddingsProvider } from '../types.js';
import { normalize } from '../math.js';

/**
 * A deterministic, dependency-free embeddings provider: a hashed bag-of-words.
 * Texts that share tokens end up with higher cosine similarity, which is enough
 * to make the advisor's behaviour meaningful AND fully deterministic in tests —
 * no model downloads, no network. Not for production quality.
 */
export class FakeEmbeddings implements EmbeddingsProvider {
  readonly id = 'fake';

  constructor(private readonly dimensions = 128) {}

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.vectorize(t));
  }

  private vectorize(text: string): number[] {
    const vector = new Array<number>(this.dimensions).fill(0);
    for (const token of tokenize(text)) {
      const i = hash(token) % this.dimensions;
      vector[i] = (vector[i] ?? 0) + 1;
    }
    return normalize(vector);
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

/** djb2 — small, fast, deterministic string hash. */
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}
