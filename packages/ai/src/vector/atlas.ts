import type { MongoClient, Collection, Document } from 'mongodb';
import type { ScoredMatch, VectorRecord, VectorStore } from '../types.js';

export interface AtlasVectorStoreOptions {
  /** MongoDB Atlas connection string (mongodb+srv://…). */
  uri: string;
  db: string;
  collection: string;
  /** Name of the Atlas Vector Search index on the `embedding` field. */
  indexName: string;
  /** Embedding dimensionality — must match the provider (MiniLM = 384). */
  dimensions?: number;
  /** ANN candidates to consider; higher = better recall, slower. */
  numCandidates?: number;
}

/**
 * Production vector store backed by MongoDB Atlas Vector Search. Implements the
 * same `VectorStore` interface as the in-memory store, so switching is a config
 * change (VECTOR_STORE=atlas) with no advisor code changes.
 *
 * Requires an Atlas cluster and a vector search index — see docs/ai-advisor.md.
 * The driver is imported lazily so this module is free to load when unused.
 */
export class AtlasVectorStore implements VectorStore {
  readonly id = 'atlas';
  private client: MongoClient | null = null;
  private indexEnsured = false;

  constructor(private readonly options: AtlasVectorStoreOptions) {}

  private async collection(): Promise<Collection<Document>> {
    if (!this.client) {
      const { MongoClient } = await import('mongodb');
      this.client = new MongoClient(this.options.uri);
      await this.client.connect();
    }
    return this.client.db(this.options.db).collection(this.options.collection);
  }

  /** Best-effort programmatic index creation; safe to call repeatedly. */
  private async ensureIndex(collection: Collection<Document>): Promise<void> {
    if (this.indexEnsured) return;
    try {
      const existing = await collection.listSearchIndexes().toArray();
      if (!existing.some((i) => i.name === this.options.indexName)) {
        await collection.createSearchIndex({
          name: this.options.indexName,
          type: 'vectorSearch',
          definition: {
            fields: [
              {
                type: 'vector',
                path: 'embedding',
                numDimensions: this.options.dimensions ?? 384,
                similarity: 'cosine',
              },
            ],
          },
        });
      }
    } catch {
      // Index may need to be created manually depending on cluster tier/perms.
      // Querying will surface a clear error until the index is ready.
    }
    this.indexEnsured = true;
  }

  async upsert(records: VectorRecord[]): Promise<void> {
    if (records.length === 0) return;
    const collection = await this.collection();
    await this.ensureIndex(collection);
    await collection.bulkWrite(
      records.map((r) => ({
        updateOne: {
          filter: { _id: r.id as unknown as Document['_id'] },
          update: { $set: { embedding: r.vector, metadata: r.metadata ?? {} } },
          upsert: true,
        },
      })),
    );
  }

  async query(vector: number[], topK: number): Promise<ScoredMatch[]> {
    const collection = await this.collection();
    const docs = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: this.options.indexName,
            path: 'embedding',
            queryVector: vector,
            numCandidates: this.options.numCandidates ?? Math.max(100, topK * 10),
            limit: topK,
          },
        },
        {
          $project: {
            _id: 1,
            metadata: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ])
      .toArray();

    return docs.map((d) => ({
      id: String(d._id),
      score: typeof d.score === 'number' ? d.score : 0,
      metadata: d.metadata as Record<string, unknown> | undefined,
    }));
  }

  async clear(): Promise<void> {
    const collection = await this.collection();
    await collection.deleteMany({});
  }

  async close(): Promise<void> {
    await this.client?.close();
    this.client = null;
  }
}
