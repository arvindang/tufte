import { describe, it, expect } from "vitest";
import { renderInline, parseInlineSpark } from "../src/index.js";

describe("inline sparklines", () => {
  it("renders ascending data low → high", () => {
    expect(renderInline("sparkline: 1 5 9")).toBe("▁▅█");
  });

  it("accepts comma-separated data", () => {
    expect(renderInline("sparkline: 1, 5, 9")).toBe("▁▅█");
  });

  it("is case-insensitive on the prefix and tolerates extra spaces", () => {
    expect(renderInline("SPARKLINE:   1 5 9")).toBe("▁▅█");
  });

  it("parses to a numeric array", () => {
    expect(parseInlineSpark("sparkline: 12 24 36")).toEqual([12, 24, 36]);
  });

  it("throws on a non-sparkline span", () => {
    expect(() => renderInline("const x = 1")).toThrow();
  });

  it("throws when there is no numeric data", () => {
    expect(() => renderInline("sparkline: abc")).toThrow();
  });
});
