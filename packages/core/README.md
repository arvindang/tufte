# @tufte/chart-core

Deterministic CSV → Tufte-style **ASCII chart** renderer, and the reference
implementation of the [`chart` format](./SPEC.md). No dependencies. Because the
output is plain text, a rendered chart works anywhere text goes — READMEs,
terminals, diffs, LLM context.

```js
import { render } from "@tufte/chart-core";

render(`hbar "Revenue by Quarter ($M)"
Q1, 36
Q2, 43
Q3, 30
Q4, 52`);
```

```
Revenue by Quarter ($M)

Q1  ██████████████████████████████  36
Q2  ████████████████████████████████████  43
Q3  █████████████████████████  30
Q4  ████████████████████████████████████████████  52
```

## API

| Export                  | Purpose                                                        |
| ----------------------- | ------------------------------------------------------------- |
| `render(blockText)`     | Parse a `chart` block and return ASCII.                       |
| `parseChartBlock(text)` | Parse to `{ type, title, options, data }`.                    |
| `renderSpec(spec)`      | Render an already-parsed spec.                                |
| `renderInPlace(doc)`    | Round-trip: render every ` ```chart ` block in a doc in place. |
| `GENERATORS`            | Map of chart type → generator function.                       |

Chart types: `hbar`/`bar`, `vbar`/`column`, `sparkline`, `line`, `table`,
`histogram`, `progress`, `scatter`. See [SPEC.md](./SPEC.md) for the full format.

## Use from a CDN

Because core is zero-dependency ESM, it loads directly in the browser or Deno —
no install, no build step.

**Self-hosted (no npm required).** A pre-bundled, pinned build is served off
[tufte.ai](https://tufte.ai):

```js
import { render } from "https://tufte.ai/chart-core@0.1.0.js";
// or the always-latest convenience build:
import { render } from "https://tufte.ai/chart-core.js";
```

**npm-backed CDNs** (these mirror npm automatically, so they require the package
to be **published to npm** first):

```js
// esm.sh
import { render } from "https://esm.sh/@tufte/chart-core@0.1.0";

// jsDelivr
import { render } from "https://cdn.jsdelivr.net/npm/@tufte/chart-core@0.1.0/src/index.js";

// unpkg
import { render } from "https://unpkg.com/@tufte/chart-core@0.1.0/src/index.js";
```

## Ecosystem

- [`@tufte/chart-cli`](../cli) — pre-render markdown / stdin → ASCII
- [`@tufte/markdown-it-chart`](../markdown-it-chart) — markdown-it plugin
- [`@tufte/remark-chart`](../remark-chart) — remark/unified plugin
