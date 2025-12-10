# Repository Guidelines

This repository is a JavaScript/TypeScript monorepo for front.js. Keep changes small, security-minded, and aligned with the size budget of the core runtime.

## Project Structure & Module Organization
- `packages/core/src/` — core runtime; public API re-exported via `packages/core/src/index.js`.
- `packages/actions/src/` — RPC/actions layer (`client.js`, `server.js`).
- `src/` — legacy/root entry points used by the website/KB builds.
- `tests/` and `packages/core/tests/` — Vitest suites; mirror core behavior and security checks.
- `website/` and `docs/` — marketing site, KB, and generated API docs; `website/examples/` for manual verification.
- `scripts/` — utility tasks (filename validation, API docs generation).

## Build, Test, and Development Commands
- `npm install` (Node >= 18) — install workspace deps.
- `npm run build` — build all workspaces; `npm run build -w @frontjs/core` for the core only.
- `npm test` — run Vitest suites across workspaces; `npm run test:watch -w @frontjs/core` for watch mode.
- `npm run lint` / `npm run format` — enforce ESLint and Prettier on JS and Markdown.
- `npm run validate` — lint + filename checks; run before PRs.
- `npm run size-check -w @frontjs/core` — ensure gzipped core stays under the 5KB budget.
- `npm run docs:generate` / `npm run types:generate` — refresh API docs and d.ts outputs.

## Coding Style & Naming Conventions
- ES modules everywhere; 2-space indentation; prefer small, pure functions.
- Keep public APIs documented with JSDoc; avoid implicit globals and side effects in module scope.
- Filenames are lower-kebab-case; tests use `*.test.js`.
- Security first: never use `eval`/`new Function`; sanitize/serialize via JSON only; respect Islands hydration model.

## Testing Guidelines
- Framework: Vitest (`jsdom`, globals enabled). Tests live in `tests/` and `packages/core/tests/`.
- Naming: match subject (`reactivity.test.js`, `security.test.js`); colocate fixtures near suites.
- Run `npm test` before pushing; add regression tests for every bug fix and new public API.
- For manual verification, load `website/examples/index.html` via a static server to confirm hydration and XSS protections.

## Commit & Pull Request Guidelines
- Conventional Commits are expected (e.g., `feat(reactivity): add cleanup support`); keep scopes meaningful.
- Branch names: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, etc., as in existing history.
- PRs should describe motivation, testing performed (`npm test`, `npm run validate`, `npm run size-check -w @frontjs/core`), and link issues. Include screenshots/GIFs for UI-affecting changes in `website/` or examples.
- Keep diffs minimal; update docs (`docs/`, `website/docs/`) and types when APIs change.
