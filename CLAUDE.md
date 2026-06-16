# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Tufte is the `chart` format: a Mermaid-style fenced code block (` ```chart `) that renders
to **Tufte-style ASCII charts**. Because the output is plain text, a rendered chart works
anywhere text goes — READMEs, terminals, diffs, LLM context. The npm-published packages are
the product; `app/` is the tufte.ai web playground.

This is an npm **monorepo** (npm workspaces): `packages/*` are published libraries, `app/` is
a private React/Vite site deployed to GitHub Pages (tufte.ai).

## Commands

```bash
npm test                          # run every workspace's tests (vitest)
npm test -w @tufte/chart-core     # test one package
npm test -w @tufte/chart-core -- parse   # run one test file by name filter (passed to vitest)

cd app && npm run dev             # tufte.ai playground dev server
cd app && npm run build           # production build (what CI deploys)
cd app && npm run lint            # eslint (app only; packages have no lint)

# Releases (Changesets):
npm run changeset                 # author a changeset describing version bumps
npm run version-packages          # apply changesets → bump versions + changelogs
npm run release                   # test, then changeset publish
```

There is no repo-wide build step — packages ship their `src/` directly (`"main": "src/index.js"`,
ESM only, zero runtime deps in core). Tests use vitest; run individual tests with the `-- <filter>`
pattern above.

## Architecture

Everything flows through **`@tufte/chart-core`** (`packages/core`); the other packages are
thin adapters that call its `render()`. When changing chart behavior, change core — the adapters
inherit it.

Core's pipeline (`packages/core/src/`):
- `parseBlock.js` — parses a chart block's inner text into a spec `{ type, title, options, data }`.
  The grammar: line 1 is `<type> ["quoted title"]`; lines starting with `@` are directives
  (`@width`, `@height`) that become `options`; everything else is CSV data. The `@` sigil exists
  so directives don't collide with data labels containing colons (e.g. `0:00, 22`). Type aliases
  (`bar`→`hbar`, `column`→`vbar`) are resolved here.
- `parse.js` — `parseCSVData`: splits data into trimmed string-cell rows, dropping rows with a
  blank first cell or fewer than 2 cells.
- `generators.js` — one pure function per chart type `(data, title, opts) → string`. These were
  extracted **verbatim** from the original tufte.ai app; default widths/heights match the old
  hardcoded constants so output stays **byte-for-byte identical**. Snapshot tests enforce this —
  do not casually change spacing, glyphs, or defaults.
- `index.js` — wires generators into the `GENERATORS` map and exposes `render(blockText)`,
  `renderSpec(spec)`, `parseChartBlock`.
- `roundtrip.js` — `renderInPlace(doc)`: the dual-mode / round-trip feature. A rendered chart
  carries its own source inside an HTML comment (`<!-- chart:begin … --> ``` …ascii… ``` <!-- chart:end -->`),
  so the artifact is both readable everywhere and regenerable. `renderInPlace` refreshes existing
  carriers from their embedded source and converts raw ` ```chart ` fences into carriers. It is
  **idempotent** — round-trip tests depend on this.

`SPEC.md` in `packages/core` is the canonical format definition. Keep it in sync when the grammar
or chart types change.

Adapters (each ~40 lines, all **fail-safe** — a spec that fails to parse is left as a normal code
block rather than breaking the page/doc):
- `@tufte/chart-cli` (`packages/cli/bin/chart.js`) — `chart render <file.md> [--write]` runs
  `renderInPlace`; bare stdin renders one spec.
- `@tufte/markdown-it-chart` — markdown-it `fence` rule override.
- `@tufte/remark-chart` — remark/unified transformer over `code` nodes with lang `chart`.
- `obsidian-tufte-chart` (`packages/obsidian-chart`, **private — not npm-published**) — an
  Obsidian plugin registering a `chart` code-block processor. Built with esbuild to a
  self-contained `main.js` (core inlined; `main.js` is gitignored, rebuilt in CI).

`app/src/TufteApp.jsx` is the playground and imports from `@tufte/chart-core` like any consumer
(via the workspace symlink). `app/src/App.jsx` is the leftover Vite template and is unused
(`main.jsx` mounts `TufteApp`).

## Distribution channels

The product ships through several surfaces, all driven from this one repo:
- **npm** — the four `packages/*` libraries, published manually via `npm run release` (Changesets).
- **CDN** — `app/scripts/build-cdn.mjs` esbuild-bundles zero-dep `@tufte/chart-core` into
  `app/public/chart-core@<version>.js` (+ `chart-core.js`); it runs as part of `npm run build -w app`,
  so the bundle deploys to GitHub Pages and is importable at `https://tufte.ai/chart-core@<version>.js`
  with no npm. npm-backed CDNs (esm.sh/jsDelivr/unpkg) work too once published — packages carry
  `unpkg`/`jsdelivr` fields for this.
- **Obsidian** — released from this repo. Obsidian's registry needs `manifest.json` at the repo
  **root**, kept in sync from the plugin's canonical copy via `npm run sync:obsidian-manifest`.
  Pushing a **bare semver tag** (`1.0.0`, no `v` prefix — reserved namespace, distinct from
  Changesets' `@tufte/<name>@x.y.z` tags) triggers `.github/workflows/release-obsidian.yml`, which
  builds the plugin and publishes a GitHub Release with `main.js` + `manifest.json` + `styles.css`.

## Conventions worth knowing

- **Generator output is a snapshot contract.** Changing a generator's formatting will break
  `packages/core/test/snapshot.test.js`. If a change is intentional, update snapshots deliberately;
  if not, you've introduced a regression.
- Adapters must stay fail-safe and must not reimplement parsing/rendering — always delegate to core.
- Internal package versions are pinned exactly (`"@tufte/chart-core": "0.1.0"`); Changesets bumps
  them together via `updateInternalDependencies: patch`.
- CI (`.github/workflows/deploy.yml`) builds `app/` (which also emits the CDN bundle) and deploys
  to GitHub Pages on push to `main`; package publishing is manual via `npm run release`. A separate
  `release-obsidian.yml` publishes the Obsidian plugin on bare-semver tags (see Distribution channels).
