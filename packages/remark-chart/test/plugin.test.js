import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkChart from "../src/index.js";

function toHtml(md, options) {
  return unified()
    .use(remarkParse)
    .use(remarkChart, options)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(md)
    .toString();
}

describe("remark-chart", () => {
  it("renders a ```chart fence to a <pre class=tufte-chart>", () => {
    const html = toHtml(
      ['```chart', 'hbar "Revenue"', "Q1, 36", "Q2, 43", "```"].join("\n")
    );
    expect(html).toContain('<pre class="tufte-chart">');
    expect(html).toContain("█");
    expect(html).toContain("Revenue");
  });

  it("leaves ordinary code fences untouched", () => {
    const html = toHtml(["```js", "const x = 1;", "```"].join("\n"));
    expect(html).toContain("<code");
    expect(html).not.toContain("tufte-chart");
  });

  it("leaves a broken spec as a normal code block", () => {
    const html = toHtml(["```chart", "piechart", "A, 1", "```"].join("\n"));
    expect(html).not.toContain("tufte-chart");
    expect(html).toContain("piechart");
  });

  it("respects a custom className option", () => {
    const html = toHtml(["```chart", "bar", "Q1, 1", "```"].join("\n"), {
      className: "chart",
    });
    expect(html).toContain('<pre class="chart">');
  });

  it("renders an inline `sparkline: …` span to a <code> of glyphs", () => {
    const html = toHtml("CPU `sparkline: 1 5 9` steady.");
    expect(html).toContain('<code class="tufte-chart-spark"');
    expect(html).toContain("▁▅█");
    expect(html).toContain('title="sparkline: 1 5 9"');
  });

  it("leaves ordinary inline code untouched", () => {
    const html = toHtml("Call `render()` here.");
    expect(html).not.toContain("tufte-chart-spark");
    expect(html).toContain("render()");
  });
});
