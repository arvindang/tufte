# @tufte/remark-chart

A [remark](https://github.com/remarkjs/remark) / [unified](https://unifiedjs.com)
plugin that renders ` ```chart ` fenced blocks as Tufte-style ASCII charts.
Powers any remark pipeline — MDX, Next.js, Astro, Gatsby, Docusaurus.

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
  .process(`
\`\`\`chart
hbar "Revenue by Quarter ($M)"
Q1, 36
Q2, 43
\`\`\`
`);
```

Produces `<pre class="tufte-chart">…</pre>`. The ASCII is emitted as escaped
text (via `node.data.hChildren`), so you do **not** need `allowDangerousHtml`.

## Options

| Option      | Default       | Description                       |
| ----------- | ------------- | --------------------------------- |
| `className` | `tufte-chart` | CSS class on the `<pre>` wrapper. |

A `chart` code block becomes a chart; any other language renders normally; a spec
that fails to parse is left as a plain code block.

See [`@tufte/chart-core`](../core/SPEC.md) for the `chart` format.
