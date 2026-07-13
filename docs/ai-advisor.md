# AI Stack Advisor

The advisor turns a natural-language description ("a REST API with auth and
background jobs") into a recommended, dependency-resolved stack.

```
prompt ─▶ embed ─▶ vector search over module catalog ─▶ resolveModules() ─▶ stack
```

It only *ranks* modules semantically; the generator's `resolveModules()` expands
dependencies, so there is a single source of truth for what makes a valid stack.

Everything is pluggable behind two interfaces (`EmbeddingsProvider`,
`VectorStore`) and every option has a **local, keyless default** — the advisor
runs out of the box with zero external services.

---

## Configuration

All configuration is via `apps/api` environment variables (see `.env.example`).

### Embeddings — `EMBEDDINGS_PROVIDER`

| Value | What it does | Needs |
|-------|--------------|-------|
| `local` *(default)* | Runs `Xenova/all-MiniLM-L6-v2` in-process via Transformers.js. Downloads (~90 MB) once, then fully offline. | nothing |
| `huggingface` | Calls the hosted HuggingFace Inference API. Tiny footprint. | `HF_TOKEN` |
| `fake` | Deterministic hashed bag-of-words. Instant. Not semantic — for tests / fast boots. | nothing |

```bash
# Local (default)
EMBEDDINGS_PROVIDER=local
LOCAL_EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2

# Hosted HuggingFace
EMBEDDINGS_PROVIDER=huggingface
HF_TOKEN=hf_xxx            # https://huggingface.co/settings/tokens (read scope)
HF_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### Vector store — `VECTOR_STORE`

| Value | What it does | Needs |
|-------|--------------|-------|
| `memory` *(default)* | Cosine similarity in-process. Ideal for the small module catalog. | nothing |
| `atlas` | MongoDB Atlas Vector Search (`$vectorSearch`). Production scale. | Atlas cluster + index |

> **Dimensions must match the model.** MiniLM outputs **384**. If you change the
> embedding model, update `EMBEDDING_DIMENSIONS` **and** the Atlas index
> `numDimensions` to match.

---

## MongoDB Atlas Vector Search setup

1. **Create a cluster** at [cloud.mongodb.com](https://cloud.mongodb.com) (the
   free **M0** tier supports Vector Search). Add your IP to the access list and
   create a database user.

2. **Set the connection string** and switch the store on:
   ```bash
   VECTOR_STORE=atlas
   MONGODB_ATLAS_URI=mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority
   ATLAS_DB=forgestack
   ATLAS_COLLECTION=module_embeddings
   ATLAS_VECTOR_INDEX=module_vector_index
   EMBEDDING_DIMENSIONS=384
   ```

3. **The vector index.** On first run the app attempts to create it
   programmatically. If your cluster tier/permissions don't allow that, create
   it manually in **Atlas → Atlas Search → Create Search Index → JSON Editor**,
   type **Vector Search**, on `forgestack.module_embeddings`, named
   `module_vector_index`:
   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "embedding",
         "numDimensions": 384,
         "similarity": "cosine"
       }
     ]
   }
   ```

4. **Start the API.** On the first `/api/advisor` request the advisor embeds the
   module catalog, upserts the vectors into Atlas, and queries them with
   `$vectorSearch`. Index builds are asynchronous — allow a few seconds after
   first upsert before results appear.

---

## How indexing works

The module index is built **lazily on the first advisor request** so the server
boots instantly even when a local model must download. The index is rebuilt each
process start (the catalog is small); for Atlas the documents are upserted, so
repeated builds are idempotent.

## Quick test

```bash
curl -X POST http://localhost:4000/api/advisor \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"a REST API with authentication and background jobs"}'
```
```json
{
  "provider": "local",
  "suggested": [{ "id": "bullmq", "score": 0.36 }, { "id": "jwt", "score": 0.34 }],
  "resolvedStack": ["typescript", "fastify", "redis", "bullmq", "jwt"]
}
```
