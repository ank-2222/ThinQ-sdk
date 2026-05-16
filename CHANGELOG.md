# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-05-16

### Added
- `createThinQAdapter({ name, capabilities, secret, handler })` — registers an Express router as a ThinQ agent
- `POST /run` — authenticated SSE endpoint; streams `message`, `error`, and `done` events
- `GET /info` — returns `{ name, capabilities }` without auth
- Secret validation via `x-thinq-secret` header (401 on mismatch)
- Handler errors caught and forwarded as `error` SSE events
