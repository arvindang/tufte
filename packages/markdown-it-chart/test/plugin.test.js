import { describe, it, expect } from "vitest";
import MarkdownIt from "markdown-it";
import chart from "../src/index.js";

const md = new MarkdownIt().use(chart);

describe("markdown-it-chart", () => {
  it("renders a ```chart fence to a <pre class=tufte-chart>", () => {
    const html = md.render(
      ['```chart', 'hbar "Revenue"', "Q1, 36", "Q2, 43", "```"].join("\n")
    );
    expect(html).toContain('<pre class="tufte-chart">');
    expect(html).toContain("█"); // the bars rendered
    expect(html).toContain("Revenue");
  });

  it("leaves ordinary code fences untouched", () => {
    const html = md.render(["```js", "const x = 1;", "```"].join("\n"));
    expect(html).toContain("<code");
    expect(html).not.toContain("tufte-chart");
  });

  it("falls back to a normal code block on a broken spec", () => {
    const html = md.render(["```chart", "piechart", "A, 1", "```"].join("\n"));
    expect(html).not.toContain("tufte-chart");
    expect(html).toContain("piechart");
  });

  it("respects a custom className option", () => {
    const md2 = new MarkdownIt().use(chart, { className: "chart" });
    const html = md2.render(["```chart", "bar", "Q1, 1", "```"].join("\n"));
    expect(html).toContain('<pre class="chart">');
  });

  it("renders an inline `sparkline: …` span to a <code> of glyphs", () => {
    const html = md.render("CPU `sparkline: 1 5 9` steady.");
    expect(html).toContain('<code class="tufte-chart-spark"');
    expect(html).toContain("▁▅█");
    // the source is kept for accessibility
    expect(html).toContain('aria-label="sparkline: 1 5 9"');
    expect(html).toContain('title="sparkline: 1 5 9"');
  });

  it("leaves ordinary inline code untouched", () => {
    const html = md.render("Call `render()` here.");
    expect(html).not.toContain("tufte-chart-spark");
    expect(html).toContain("render()");
  });
});
