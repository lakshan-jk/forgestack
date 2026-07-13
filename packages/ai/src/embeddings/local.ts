import type { EmbeddingsProvider } from '../types.js';

export interface LocalEmbeddingsOptions {
  /** ONNX sentence-embedding model. Default: MiniLM (downloaded & cached once). */
  model?: string;
}

type FeatureExtractor = (
  texts: string[],
  options: { pooling: 'mean'; normalize: boolean },
) => Promise<{ tolist(): number[][] }>;

/**
 * Fully-local embeddings via Transformers.js (@huggingface/transformers). Runs
 * in-process with no API key and no network after the first model download.
 * The model + library are loaded lazily so importing this module is cheap.
 */
export class LocalEmbeddings implements EmbeddingsProvider {
  readonly id = 'local';
  private readonly model: string;
  private extractor: FeatureExtractor | null = null;

  constructor(options: LocalEmbeddingsOptions = {}) {
    this.model = options.model ?? 'Xenova/all-MiniLM-L6-v2';
  }

  private async getExtractor(): Promise<FeatureExtractor> {
    if (!this.extractor) {
      const { pipeline } = await import('@huggingface/transformers');
      this.extractor = (await pipeline('feature-extraction', this.model)) as unknown as FeatureExtractor;
    }
    return this.extractor;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const extractor = await this.getExtractor();
    const output = await extractor(texts, { pooling: 'mean', normalize: true });
    return output.tolist();
  }
}
