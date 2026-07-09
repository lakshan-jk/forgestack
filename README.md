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
- [ ] **M2** — Generator engine + templates package (composer, emitter, module JSON)
- [ ] **M3** — ZIP generation + API endpoint (first Fastify + TS + MongoDB output)
- [ ] **M4** — Auth (Auth.js v5) + dashboard layout
- [ ] **M5** — Generate UI, project/template management, billing placeholder

## License

MIT
