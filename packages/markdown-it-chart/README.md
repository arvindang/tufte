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

See [`@tufte/chart-core`](../core/SPEC.md) for the `chart` format.
