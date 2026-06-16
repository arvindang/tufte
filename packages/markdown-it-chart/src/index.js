import { render } from "@tufte/chart-core";

// markdown-it plugin: render ```chart fenced blocks as ASCII charts.
//
//   import MarkdownIt from "markdown-it";
//   import chart from "@tufte/markdown-it-chart";
//   const md = new MarkdownIt().use(chart);
//   md.render("```chart\nhbar \"Revenue\"\nQ1, 36\n```");
//
// Options:
//   className  CSS class on the <pre> wrapper (default "tufte-chart")
//
// A code block whose info string is `chart` is rendered to a <pre>. Any other
// fence falls through to markdown-it's normal rendering. If a chart spec fails
// to parse, the original code block is rendered unchanged (fail-safe).
export default function markdownItChart(md, options = {}) {
  const className = options.className || "tufte-chart";
  const defaultFence =
    md.renderer.rules.fence ||
    ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));

  md.renderer.rules.fence = function (tokens, idx, opts, env, self) {
    const token = tokens[idx];
    const info = (token.info || "").trim().split(/\s+/)[0];
    if (info !== "chart") {
      return defaultFence(tokens, idx, opts, env, self);
    }
    try {
      const ascii = render(token.content);
      return `<pre class="${md.utils.escapeHtml(className)}">${md.utils.escapeHtml(
        ascii
      )}</pre>\n`;
    } catch {
      // Broken spec: leave the source block as-is rather than break the page.
      return defaultFence(tokens, idx, opts, env, self);
    }
  };
}
