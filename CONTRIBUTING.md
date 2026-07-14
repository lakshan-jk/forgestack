# Contributing to ForgeStack

Thanks for your interest — ForgeStack is free and open source (MIT), and
contributions are welcome.

## Getting started

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local   # set AUTH_SECRET (npx auth secret)
pnpm dev            # web on :3100, api on :4000
```

Quality gates before opening a PR:

```bash
pnpm typecheck
pnpm test
```

## Adding a generator module

Modules are **data**, not code — no engine changes needed:

1. Add `packages/templates/definitions/<id>.json` (see existing modules).
2. Add its template files under `packages/templates/files/<id>/`.
3. Declare `dependsOn` / `conflictsWith`; the resolver handles the rest.
4. Run `pnpm --filter @forgestack/templates test` and verify a generated
   project typechecks.

## Conventions

- Strict TypeScript; keep UI, business logic, and data access separated.
- Conventional Commits (`feat:`, `fix:`, `docs:`, …).
- Telemetry must stay anonymous and opt-out — see `docs/telemetry.md`.

## License

By contributing, you agree your contributions are licensed under the MIT License.
