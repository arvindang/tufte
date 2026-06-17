import { describe, it, expect } from "vitest";
import { renderInPlace, extractSource, render } from "../src/index.js";

const doc = [
  "# Report",
  "",
  "```chart",
  'line "Latency (ms) over 24h"',
  "0:00, 22",
  "8:00, 68",
  "12:00, 110",
  "```",
  "",
  "Done.",
  "",
].join("\n");

describe("round-trip / dual mode", () => {
  it("converts a raw ```chart fence into a carrier with rendered ASCII", () => {
    const out = renderInPlace(doc);
    expect(out).toContain("<!-- chart:begin");
    expect(out).toContain("<!-- chart:end -->");
    // The rendered chart (with axis marks) is present as plain text.
    expect(out).toContain("│");
    // Source survives inside the carrier.
    expect(out).toContain('line "Latency (ms) over 24h"');
    // Surrounding prose is untouched.
    expect(out).toContain("# Report");
    expect(out).toContain("Done.");
  });

  it("is idempotent — rendering twice yields the same document", () => {
    const once = renderInPlace(doc);
    const twice = renderInPlace(once);
    expect(twice).toBe(once);
  });

  it("recovers source from a rendered carrier", () => {
    const out = renderInPlace(doc);
    expect(extractSource(out)).toEqual([
      'line "Latency (ms) over 24h"\n0:00, 22\n8:00, 68\n12:00, 110',
    ]);
  });

  it("re-renders edited source inside a carrier", () => {
    const out = renderInPlace(doc);
    // User edits the embedded source: change a data point.
    const edited = out.replace("12:00, 110", "12:00, 500");
    const rerendered = renderInPlace(edited);
    const expectedChart = render(
      'line "Latency (ms) over 24h"\n0:00, 22\n8:00, 68\n12:00, 500'
    );
    expect(rerendered).toContain(expectedChart);
  });
});

const prose = "CPU held steady `sparkline: 1 5 9` all morning.";

describe("round-trip / inline sparklines", () => {
  it("converts a raw inline span into an inline carrier", () => {
    const out = renderInPlace(prose);
    expect(out).toBe(
      "CPU held steady <!-- chart:inline sparkline: 1 5 9 -->`▁▅█` all morning."
    );
  });

  it("is idempotent — rendering twice yields the same document", () => {
    const once = renderInPlace(prose);
    const twice = renderInPlace(once);
    expect(twice).toBe(once);
  });

  it("recovers inline source from an inline carrier", () => {
    const out = renderInPlace(prose);
    expect(extractSource(out)).toEqual(["sparkline: 1 5 9"]);
  });

  it("re-renders edited source inside an inline carrier", () => {
    const out = renderInPlace(prose);
    const edited = out.replace("sparkline: 1 5 9", "sparkline: 9 5 1");
    const rerendered = renderInPlace(edited);
    expect(rerendered).toContain("<!-- chart:inline sparkline: 9 5 1 -->`█▅▁`");
  });

  it("leaves ordinary inline code untouched", () => {
    const text = "Use the `render()` helper.";
    expect(renderInPlace(text)).toBe(text);
  });
});
