# Repository Guidelines

## Project Structure & Module Organization

Source lives in `src/` organised into `types.ts` (model contracts), `schemas.ts`, `tools.ts`, `integration/`, `transformers/`, `validators/`. CLI at `src/cli.ts`, worker entry `src/worker.ts`, local server `src/index.ts`. Tests under `test/` mirroring source directories with `*.test.ts`. Docs in `docs/`, runnable examples in `examples/`, automation in `scripts/`, compiled assets emitted to `dist/`.

## Build, Test, and Development Commands

Use Bun for everything. `bun install` seeds dependencies. `bun run dev` launches the stdio MCP server with watch reload. `bun run dev:worker` spins up Wrangler for the Cloudflare Worker. `bun run build` emits Node targets to `dist/`; `bun run build:worker` creates the browser bundle consumed by Workers. `bun test` runs the Bun test suite (`bun test --watch` for rapid feedback). Quality gates: `bun run lint`, `bun run lint:fix`, `bun run format`, and `bun run format:check`. Deploy the worker with `bun run deploy`.

## Coding Style & Naming Conventions

TypeScript strictness is enforced via ESLint + `@typescript-eslint` (see `eslint.config.js`). Follow Prettier defaults: 2-space indentation, semicolons, single quotes, 100-char line width, trailing commas where valid. Prefer named exports and keep files cohesive to their domain (`transformers`, `validators`, `integration`). Branch prefixes mirror change intent (`feature/*`, `fix/*`, `docs/*`). Use descriptive entity IDs and tool names aligned with the MCP schema.

## Testing Guidelines

Place tests in `test/` mirroring the source path (e.g., `src/validators/system-runtime.ts` → `test/validators/system-runtime.test.ts`). Write Bun tests with `describe`/`test` from `bun:test`, favouring behaviour-focused descriptions. Target ≥95% coverage for new logic and include regression assertions for model/system runtime conversions. Run `bun test` before PRs and `bun run dev:worker` when touching Worker paths to confirm SSE behaviour.

## Commit & Pull Request Guidelines

Adopt Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`) as seen in git history (`fix: update Cloudflare Worker…`). Keep commits atomic and reference issues when available. PRs should summarise scope, list validation commands, and include screenshots for CLI output or worker logs when relevant. Ensure CI prerequisites (tests, lint, format, build) are satisfied, update docs/examples alongside code, and request review once the branch is rebased on `main`.

## Deployment & Configuration Tips

Local servers read `.env` (see `.env.example` for defaults like `PORT` and `LOG_LEVEL`). The Cloudflare Worker relies on `wrangler.toml`; adjust environment names before running `bun run deploy`. For agent integrations, export bundles via `bun run src/cli.ts …` and confirm compatibility with System Designer before release.
