# Telemetry & Privacy

ForgeStack collects **anonymous, aggregate** usage data to understand adoption
and prioritise work. This document explains exactly what is collected, why, and
how to turn it off. We treat this transparency as part of the project.

## TL;DR

- **Anonymous.** No accounts, no IP addresses, no project names, no prompts.
- **Coarse.** Which modules get generated, that the advisor ran — not what you built.
- **Opt-out, one flag:** `FORGESTACK_TELEMETRY_DISABLED=1`.
- **Web analytics is off** unless you configure a self-hosted Umami/Plausible.

## What is collected

The control-plane API emits a small set of events:

| Event | When | Properties |
|-------|------|-----------|
| `server.started` | API boots | — |
| `project.generated` | a project is generated | `modules` (ids), `moduleCount` |
| `advisor.used` | the AI advisor runs | `provider`, `matches` (count) |

Every event carries only:

- `installId` — a random UUID stored at `~/.forgestack/install-id`. It identifies
  an **installation**, never a person, and contains nothing derived from you.
- `timestamp`, `version`, `source` (`api`).

**Never collected:** IP addresses, usernames/emails, project names, descriptions,
advisor prompts, file contents, environment variables.

## Where it goes

Events POST to `TELEMETRY_ENDPOINT`, which defaults to the running instance's own
`/api/telemetry`. Aggregated counts are stored (Prisma/SQLite) and visible only to
the configured admin via `/dashboard/metrics` (protected by `METRICS_TOKEN`).

If you self-host ForgeStack and want to contribute anonymous usage to the upstream
project, point `TELEMETRY_ENDPOINT` at the upstream collector. Otherwise it stays
entirely within your own deployment.

## How to opt out

Set the environment variable before starting the API:

```bash
FORGESTACK_TELEMETRY_DISABLED=1
```

When disabled, the emitter sends **nothing** — no install id is transmitted and no
network requests are made. The API logs a one-line notice on startup whenever
telemetry is enabled, so it is never silent.

## Web analytics (optional, off by default)

The marketing/dashboard site ships with **no** analytics. If you deploy your own
instance you may opt in to a privacy-friendly, cookieless tool by setting env vars
(see `apps/web/.env.example`):

- **Umami** (self-hosted, OSS): `NEXT_PUBLIC_UMAMI_URL` + `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
- **Plausible** (OSS): `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (+ optional `NEXT_PUBLIC_PLAUSIBLE_URL`)

If none are set, no analytics script is loaded at all.

## Guarantees

- Telemetry **never** throws, blocks a request, or slows the app — failures
  (offline, endpoint down) are silently ignored.
- The full implementation is open source: `packages/telemetry`,
  `apps/api/src/lib/telemetry.ts`, `apps/api/src/modules/telemetry`.
