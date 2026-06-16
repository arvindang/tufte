# Tufte Chart for Obsidian

Render ` ```chart ` fenced code blocks as Tufte-style ASCII charts live in
Obsidian's reading/preview view. Because the output is plain text, the rendered
chart stays readable everywhere — including the raw note, search, and exports.

This plugin is a thin, fail-safe wrapper around
[`@tufte/chart-core`](https://www.npmjs.com/package/@tufte/chart-core): a chart
spec that fails to parse is shown as its raw source rather than breaking the
note.

## Usage

Add a fenced code block with the `chart` language:

````markdown
```chart
line "Heart rate"
0:00, 22
8:00, 68
12:00, 74
18:00, 90
```
````

In reading view this renders to an ASCII line chart. See the
[`chart` format spec](https://github.com/arvindang/tufte) for all chart types
(`line`, `bar`, `column`, `sparkline`, `table`, `histogram`, `progress`,
`scatter`) and directives (`@width`, `@height`).

## Manual installation

1. Build (or download) the plugin artifacts: `main.js`, `manifest.json`, and
   `styles.css`.
2. Copy them into your vault at
   `<vault>/.obsidian/plugins/tufte-chart/`.
3. Reload Obsidian and enable **Tufte Chart** under
   Settings → Community plugins.

To build from source in this monorepo:

```bash
npm run build -w obsidian-tufte-chart
```

This bundles `main.ts` (with `@tufte/chart-core` inlined) to `main.js` at the
package root.

## Releasing / submission

This plugin is hosted from **this monorepo** — no separate repository. Obsidian's
registry points at a repo (there is no subdirectory field) and reads
`manifest.json` from the **repo root**, so the root manifest is kept in sync with
the canonical one here.

**Cut a release:**

1. Bump `version` in `packages/obsidian-chart/manifest.json` (and add the matching
   `version → minAppVersion` entry to `versions.json`).
2. Sync the manifest to the repo root: `npm run sync:obsidian-manifest`.
3. Commit, then tag with the **exact** version (no `v` prefix) and push:
   ```bash
   git tag 1.0.0 && git push origin 1.0.0
   ```
   The [`Release Obsidian plugin`](../../.github/workflows/release-obsidian.yml)
   workflow builds `main.js` and publishes a GitHub Release with `main.js`,
   `manifest.json`, and `styles.css` attached. (Bare semver tags are reserved for
   this plugin; package releases use Changesets' `@tufte/<name>@x.y.z` tags.)

**First-time registry submission (one-time, outside this repo):** open a PR to
[`obsidianmd/obsidian-releases`](https://github.com/obsidianmd/obsidian-releases)
adding an entry to `community-plugins.json`:

```json
{
  "id": "tufte-chart",
  "name": "Tufte Chart",
  "author": "Arvin Dang",
  "description": "Render `chart` code blocks as Tufte-style ASCII charts.",
  "repo": "arvindang/tufte"
}
```

The validator reads the root `manifest.json` (synced in step 2) and downloads the
assets from the matching release.
