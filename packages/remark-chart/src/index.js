import { visit } from "unist-util-visit";
import { render, renderInline } from "@tufte/chart-core";

// remark/unified plugin: render ```chart fenced blocks as ASCII charts.
//
//   import { unified } from "unified";
//   import remarkParse from "remark-parse";
//   import remarkChart from "@tufte/remark-chart";
//   import remarkRehype from "remark-rehype";
//   import rehypeStringify from "rehype-stringify";
//
//   const html = await unified()
//     .use(remarkParse)
//     .use(remarkChart)
//     .use(remarkRehype)
//     .use(rehypeStringify)
//     .process(markdown);
//
// Options:
//   className  CSS class on the <pre> wrapper (default "tufte-chart")
//
// Every `code` node with language `chart` is turned into a <pre> containing the
// rendered ASCII (escaped by the hast stringifier — no raw HTML, so no
// allowDangerousHtml needed). A spec that fails to parse is left untouched.
//
// Every `inlineCode` node of the form `sparkline: 12 24 36` becomes an inline
// <code> of glyphs (the source kept as title/aria-label for accessibility).
// Any other inline code is left untouched (fail-safe).
export default function remarkChart(options = {}) {
  const className = options.className || "tufte-chart";
  return (tree) => {
    visit(tree, "code", (node) => {
      if ((node.lang || "") !== "chart") return;
      let ascii;
      try {
        ascii = render(node.value);
      } catch {
        return; // leave the broken block as a normal code block
      }
      node.data = {
        hName: "pre",
        hProperties: { className: [className] },
        hChildren: [{ type: "text", value: ascii }],
      };
    });

    visit(tree, "inlineCode", (node) => {
      let glyphs;
      try {
        glyphs = renderInline(node.value); // throws unless a sparkline span
      } catch {
        return; // leave ordinary inline code untouched
      }
      const label = node.value.trim();
      node.data = {
        hName: "code",
        hProperties: {
          className: [className + "-spark"],
          title: label,
          ariaLabel: label,
        },
        hChildren: [{ type: "text", value: glyphs }],
      };
    });
  };
}
