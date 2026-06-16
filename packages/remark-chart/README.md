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

## Use from a CDN

This plugin is ESM, so it loads directly in the browser. It depends on
`@tufte/chart-core` and `unist-util-visit`; use esm.sh's `?bundle` so those
(and the rest of your unified pipeline) load in a single request.

```js
// esm.sh — bundles @tufte/chart-core + unist-util-visit in one request
import { unified } from "https://esm.sh/unified@11?bundle";
import remarkParse from "https://esm.sh/remark-parse@11?bundle";
import remarkChart from "https://esm.sh/@tufte/remark-chart@0.1.0?bundle";
import remarkRehype from "https://esm.sh/remark-rehype@11?bundle";
import rehypeStringify from "https://esm.sh/rehype-stringify@10?bundle";

// jsDelivr serves the raw source (you resolve deps yourself)
// import remarkChart from "https://cdn.jsdelivr.net/npm/@tufte/remark-chart@0.1.0/src/index.js";
```

npm-backed CDNs (esm.sh, jsDelivr, unpkg) mirror npm automatically, so they
require the package to be **published to npm** first.

The zero-dependency renderer alone is also self-hosted on tufte.ai if you only
need ASCII output: `import { render } from "https://tufte.ai/chart-core@0.1.0.js"`.

See [`@tufte/chart-core`](../core/SPEC.md) for the `chart` format.
