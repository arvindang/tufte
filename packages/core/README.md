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

## Ecosystem

- [`@tufte/chart-cli`](../cli) — pre-render markdown / stdin → ASCII
- [`@tufte/markdown-it-chart`](../markdown-it-chart) — markdown-it plugin
- [`@tufte/remark-chart`](../remark-chart) — remark/unified plugin
