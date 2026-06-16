import { describe, it, expect } from "vitest";
import { parseChartBlock } from "../src/index.js";

describe("parseChartBlock grammar", () => {
  it("resolves type aliases bar→hbar and column→vbar", () => {
    expect(parseChartBlock("bar\nQ1, 1").type).toBe("hbar");
    expect(parseChartBlock("column\nJan, 1").type).toBe("vbar");
  });

  it("reads a quoted title", () => {
    expect(parseChartBlock('line "My Title"\n0:00, 1').title).toBe("My Title");
  });

  it("has empty title when none given", () => {
    expect(parseChartBlock("line\n0:00, 1").title).toBe("");
  });

  it("parses @directives as numbers and keeps them out of data", () => {
    const spec = parseChartBlock("line\n@width 60\n0:00, 22\n8:00, 68");
    expect(spec.options.width).toBe(60);
    expect(spec.data).toEqual([
      ["0:00", "22"],
      ["8:00", "68"],
    ]);
  });

  it("preserves colon-containing labels in data (no directive collision)", () => {
    const spec = parseChartBlock("line\n0:00, 22\n12:00, 110");
    expect(spec.data[0]).toEqual(["0:00", "22"]);
    expect(spec.data[1]).toEqual(["12:00", "110"]);
  });

  it("throws on unknown type", () => {
    expect(() => parseChartBlock("piechart\nA, 1")).toThrow(/unknown type/);
  });
});
