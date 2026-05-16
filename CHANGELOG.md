# Changelog

All notable changes to this project will be documented in this file.

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
