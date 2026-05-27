# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-05-27

### Added
- `agentId` option — unique agent identifier (defaults to slugified `name`)
- `accepts` and `produces` options — declare semantic input/output types for agent discovery
- `inputSchema` option — Zod schema; request body validated before handler is called, returns `400` with Zod issues on failure
- `outputSchema` option — Zod schema; envelope payload validated when `stream.end()` is called, streams an `error` event on failure
- `createEnvelope(agentId, type, payload, metadata?)` — helper to construct a typed `OutputEnvelope`
- `GET /info` now returns full agent metadata: `agentId`, `accepts`, `produces`, `inputSchema` (as JSON Schema), `outputSchema` (as JSON Schema)
- Built-in semantic type library under `src/types/`:
  - `QuerySchema` — `{ query, context? }`
  - `ResearchReportSchema` — findings, sources, confidence
  - `IssueSchema`, `IssueListSchema`, `IssueRefsSchema` — GitHub-style issues
  - `RepoContextSchema`, `CodeDiffSchema` — code/repo context
  - `TrendReportSchema`, `IdeaSchema`, `IdeaListSchema`, `ScriptSchema`, `MultiPlatformPackSchema` — content pipeline types
- New dependencies: `zod`, `zod-to-json-schema`

### Changed
- Main logic extracted into `src/adapter.ts`; `src/index.ts` is now a clean re-export barrel
- `GET /info` response extended (backward-compatible — `name` and `capabilities` still present)

## [0.0.1] - 2026-05-16

### Added
- `createThinQAdapter({ name, capabilities, secret, credentials, handler })` — registers an Express router as a ThinQ agent
- `POST /run` — authenticated SSE endpoint; streams `message`, `error`, and `done` events
- `GET /info` — returns `{ name, capabilities }` without auth
- Secret validation via `x-thinq-secret` header (401 on mismatch)
- `credentials` option — injects developer API keys into `task.context` server-side, never exposed over the wire
- Handler errors caught and forwarded as `error` SSE events
- Full TypeScript source with exported types (`Task`, `Stream`, `ThinQAdapterOptions`)
- GitHub Actions workflow for automated npm publish on release
