# ForgeStack

Generate production-ready backend applications from a declarative stack config.

ForgeStack is a **compiler**, not a boilerplate repo. The source language is a set
of declarative JSON module definitions; the target is a composed project tree
emitted as a downloadable ZIP. New stacks ship as data — no engine changes.

## Monorepo layout

| Path | Package | Role |
|------|---------|------|
| `apps/web` | `@forgestack/web` | Next.js 15 SaaS control-plane (dashboard, generate UI) |
| `apps/api` | `@forgestack/api` | Fastify control-plane API (generation, ZIP streaming) |
| `packages/shared` | `@forgestack/shared` | Zod contracts + types shared everywhere |
| `packages/generator` | `@forgestack/generator` | Pure engine: resolve → compose → emit |
| `packages/templates` | `@forgestack/templates` | Module **definitions** (JSON) + template files |

## Requirements

- Node.js >= 20
- pnpm 9 (`corepack enable`, or `npm i -g pnpm`)

## Getting started

```bash
pnpm install

# copy env files
cp apps/api/.env.example apps/api/.env

# run everything (web on :3000, api on :4000)
pnpm dev

# quality gates
pnpm typecheck
pnpm test
```

## The generation pipeline

```
GenerationRequest ─▶ Resolver ─▶ Composer ─▶ Emitter ─▶ ZIP
  (validated zod)     expand &     merge      render
                      topo-sort    files +    templates
                      modules,     deps +
                      conflicts    env
```

## Milestones

- [x] **M1** — Monorepo foundation (workspace, contracts, resolver, booting apps)
- [x] **M2** — Generator engine + templates (13 modules: Fastify, TS, MongoDB, Redis, BullMQ, JWT, Swagger, Docker, CI, ESLint, Prettier, Husky, Commitlint)
- [x] **M3** — ZIP generation + API endpoint
- [x] **M4** — Auth (Auth.js v5) + dashboard shell
- [x] **M5** — Generate UI (stack builder → download)
- [x] **M6** — AI Stack Advisor (HuggingFace embeddings + vector search)
- [x] **M7** — Usage analytics (anonymous telemetry, persisted metrics, admin dashboard)

## Telemetry & Privacy

ForgeStack collects **anonymous, aggregate** usage data (which modules get
generated, that the advisor ran) to understand adoption — no accounts, IPs,
project names, or prompts. It is **opt-out** with a single flag:

```bash
FORGESTACK_TELEMETRY_DISABLED=1
```

Web analytics is **off** unless you configure a self-hosted Umami/Plausible.
Full details: [`docs/telemetry.md`](docs/telemetry.md).

## License

MIT
