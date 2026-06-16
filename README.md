# tufte

**ASCII charts that go anywhere text goes**, and a Mermaid-style `chart` format
for Markdown. Paste CSV, get a clean Tufte-style chart in plain text — drop it in
a README, a terminal, a commit message, a diff, or an LLM's reply. No images, no
server, no renderer required at the other end.

🔗 **Live playground:** [tufte.ai](https://tufte.ai) · 📦 **npm:** [@tufte](https://www.npmjs.com/org/tufte) · 📄 **Format spec:** [SPEC.md](packages/core/SPEC.md)

```
Revenue by Quarter ($M)

Q1  ██████████████████████████████  36
Q2  ████████████████████████████████████  43
Q3  █████████████████████████  30
Q4  ████████████████████████████████████████████  52
```

That chart is just text. It renders identically on GitHub, in your terminal,
and anywhere else — because there's nothing to render. That's the whole idea, and
it's the one thing Mermaid can't do (its output is an image; ours is the artifact).

---

## The `chart` format

A fenced code block tagged `chart`: a type, an optional `"title"`, optional
`@directives`, then your CSV. You write this:

````markdown
```chart
hbar "Revenue by Quarter ($M)"
Q1, 36
Q2, 43
Q3, 30
Q4, 52
```
````

…and a [plugin](#use-it-in-markdown) (or the [CLI](#cli)) turns it into the chart
above. Lines starting with `@` set options (`@width`, `@height`); the `@` sigil
keeps them from colliding with data labels that contain colons, like `0:00, 22`.

### More examples

**Sparklines** (multi-series — one row per series):

````markdown
```chart
sparkline "System Metrics — 24h"
CPU, 12 25 38 55 72 88 72 55 38 25
Mem, 30 32 40 55 65 72 78 85 80 70
Net, 5 8 15 8 72 88 18 5 8 32
```
````

```
System Metrics — 24h

CPU  ▁▂▃▅▇█▇▅▃▂
Mem  ▁▁▂▄▅▆▇█▇▆
Net  ▁▁▂▁▇█▂▁▁▃
```

**Tables** (first row is the header):

````markdown
```chart
table "Sprint Tracker"
Feature, Status, Owner
Explode View, Done, Marcus
Annotations, WIP, Arvin
Cross-Section, Next, Sara
```
````

```
Sprint Tracker

┌───────────────┬────────┬────────┐
│    Feature    │ Status │ Owner  │
├───────────────┼────────┼────────┤
│ Explode View  │  Done  │ Marcus │
│  Annotations  │  WIP   │ Arvin  │
│ Cross-Section │  Next  │  Sara  │
└───────────────┴────────┴────────┘
```

### Chart types

| Type        | Aliases  | Data per row              |
| ----------- | -------- | ------------------------- |
| `hbar`      | `bar`    | `label, value`            |
| `vbar`      | `column` | `label, value`            |
| `sparkline` |          | `series, v1 v2 v3 …`      |
| `line`      |          | `label, value`            |
| `table`     |          | header row, then cells    |
| `histogram` |          | `bin, count`              |
| `progress`  |          | `label, percent` (0–100)  |
| `scatter`   |          | `x, y`                    |

Full grammar and directives: **[SPEC.md](packages/core/SPEC.md)**.

---

## Packages

| Package | Install | What it does |
| ------- | ------- | ------------ |
| [`@tufte/chart-core`](packages/core) | `npm i @tufte/chart-core` | The renderer + format. Zero deps. |
| [`@tufte/chart-cli`](packages/cli) | `npm i -g @tufte/chart-cli` | Pre-render Markdown, or pipe a spec via stdin. |
| [`@tufte/markdown-it-chart`](packages/markdown-it-chart) | `npm i @tufte/markdown-it-chart` | markdown-it plugin (VitePress, Eleventy, CMSs). |
| [`@tufte/remark-chart`](packages/remark-chart) | `npm i @tufte/remark-chart` | remark/unified plugin (Next, Astro, MDX, Docusaurus). |

---

## Usage

### Library

```js
import { render } from "@tufte/chart-core";

render(`hbar "Revenue by Quarter ($M)"
Q1, 36
Q2, 43
Q3, 30
Q4, 52`);
// → the ASCII chart as a string
```

Also exported: `parseChartBlock`, `renderSpec`, `renderInPlace`, `GENERATORS`.

### Use it in Markdown

**markdown-it** — VitePress, Eleventy, many CMSs:

```js
import MarkdownIt from "markdown-it";
import chart from "@tufte/markdown-it-chart";

const md = new MarkdownIt().use(chart);
md.render(source); // ```chart blocks become <pre class="tufte-chart">
```

**remark / unified** — Next.js, Astro, MDX, Docusaurus:

```js
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkChart from "@tufte/remark-chart";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const html = await unified()
  .use(remarkParse)
  .use(remarkChart)
  .use(remarkRehype)
  .use(rehypeStringify)
  .process(source);
```

Both emit `<pre class="tufte-chart">…</pre>`. A broken spec falls back to a normal
code block, so a typo never breaks the page.

### CLI

```sh
# Pipe a spec → ASCII
printf 'line "Latency"\n0:00, 22\n8:00, 68\n12:00, 110\n' | chart

# Pre-render every ```chart block in a Markdown file, in place (idempotent).
# Great in a pre-commit hook or CI so committed Markdown shows real charts
# everywhere — no plugin needed.
chart render README.md --write
```

The pre-render embeds the source in an HTML comment alongside the rendered ASCII,
so the chart stays both readable (anywhere) **and** re-editable. Re-running picks
up edits to the embedded source. This round-trip is what makes a `chart` block
degrade gracefully where Markdown can't.

---

## Development

This is an npm-workspaces monorepo.

```sh
npm install        # install all workspaces
npm test           # run every package's tests
npm run build -w app   # build the tufte.ai site
```

Layout:

```
packages/core              @tufte/chart-core   — renderer + format + SPEC.md
packages/cli               @tufte/chart-cli    — pre-render / stdin CLI
packages/markdown-it-chart @tufte/markdown-it-chart
packages/remark-chart      @tufte/remark-chart
app/                       the tufte.ai web app (playground + docs)
```

Releases use [Changesets](https://github.com/changesets/changesets):
`npm run changeset` → `npm run version-packages` → `npm run release`.

## License

MIT © Arvin Dang
