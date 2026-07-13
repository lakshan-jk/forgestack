import type { EmbeddingsProvider } from '../types.js';

export interface HfInferenceOptions {
  /** HuggingFace access token (free tier works). */
  token: string;
  /** Feature-extraction model. Default: MiniLM sentence embeddings (384-dim). */
  model?: string;
  /** Override the inference endpoint base. */
  endpoint?: string;
}

/**
 * Hosted embeddings via the HuggingFace Inference API. No local model download —
 * just an HTTP call. Requires a token but keeps the runtime footprint tiny.
 */
export class HfInferenceEmbeddings implements EmbeddingsProvider {
  readonly id = 'huggingface';
  private readonly token: string;
  private readonly model: string;
  private readonly endpoint: string;

  constructor(options: HfInferenceOptions) {
    this.token = options.token;
    this.model = options.model ?? 'sentence-transformers/all-MiniLM-L6-v2';
    this.endpoint =
      options.endpoint ?? 'https://api-inference.huggingface.co/pipeline/feature-extraction';
  }

  async embed(texts: string[]): Promise<number[][]> {
    const res = await fetch(`${this.endpoint}/${this.model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: texts, options: { wait_for_model: true } }),
    });

    if (!res.ok) {
      throw new Error(`HuggingFace inference failed (${res.status}): ${await res.text()}`);
    }

    // feature-extraction returns one embedding array per input.
    return (await res.json()) as number[][];
  }
}
