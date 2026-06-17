# @tufte/markdown-it-chart

A [markdown-it](https://github.com/markdown-it/markdown-it) plugin that renders
` ```chart ` fenced blocks as Tufte-style ASCII charts. Powers any markdown-it
pipeline — VitePress, Eleventy, and many CMSs.

```js
import MarkdownIt from "markdown-it";
import chart from "@tufte/markdown-it-chart";

const md = new MarkdownIt().use(chart);

md.render(`
\`\`\`chart
hbar "Revenue by Quarter ($M)"
Q1, 36
Q2, 43
Q3, 30
Q4, 52
\`\`\`
`);
```

Produces `<pre class="tufte-chart">…</pre>` containing the rendered chart.

## Options

| Option      | Default        | Description                       |
| ----------- | -------------- | --------------------------------- |
| `className` | `tufte-chart`  | CSS class on the `<pre>` wrapper. |

A code block whose info string is `chart` is rendered as a chart; every other
fence renders normally. A spec that fails to parse falls back to a plain code
block, so a typo never breaks the page.

## Inline sparklines

A sparkline is a single line, so it also works inline. A one-backtick
`` `sparkline: 12 24 36` `` span renders to a `<code class="tufte-chart-spark">`
of glyphs (`▁▅█`), with the source kept as `title`/`aria-label`. Any other inline
code is left untouched.

## Use from a CDN

This plugin is ESM, so it loads directly in the browser. It has a peer
dependency on `markdown-it` and depends on `@tufte/chart-core`; use esm.sh's
`?bundle` so those load in a single request.

```js
// esm.sh — bundles markdown-it + @tufte/chart-core in one request
import MarkdownIt from "https://esm.sh/markdown-it@14?bundle";
import chart from "https://esm.sh/@tufte/markdown-it-chart@0.1.0?bundle";

const md = new MarkdownIt().use(chart);

// jsDelivr serves the raw source (you resolve deps yourself)
// import chart from "https://cdn.jsdelivr.net/npm/@tufte/markdown-it-chart@0.1.0/src/index.js";
```

npm-backed CDNs (esm.sh, jsDelivr, unpkg) mirror npm automatically, so they
require the package to be **published to npm** first.

The zero-dependency renderer alone is also self-hosted on tufte.ai if you only
need ASCII output: `import { render } from "https://tufte.ai/chart-core@0.1.0.js"`.

See [`@tufte/chart-core`](../core/SPEC.md) for the `chart` format.
