import { describe, it, expect } from "vitest";
import {
  parseCSVData,
  SAMPLE_DATA,
  SAMPLE_TITLES,
  generateHBar,
  generateVBar,
  generateLine,
  generateHistogram,
  generateProgress,
  generateScatter,
} from "../src/index.js";

// Proves the width/height parameterization preserved the original output:
// calling a generator with no opts must equal calling it with the original
// hardcoded constants. This is the guard that the extraction didn't drift.
describe("default opts equal the original hardcoded constants", () => {
  const d = (k) => parseCSVData(SAMPLE_DATA[k]);
  const t = (k) => SAMPLE_TITLES[k];

  it("hbar width default = 44", () => {
    expect(generateHBar(d("hbar"), t("hbar"))).toBe(
      generateHBar(d("hbar"), t("hbar"), { width: 44 })
    );
  });

  it("vbar height default = 12", () => {
    expect(generateVBar(d("vbar"), t("vbar"))).toBe(
      generateVBar(d("vbar"), t("vbar"), { height: 12 })
    );
  });

  it("line height/width defaults = 10 / max(n*3,36)", () => {
    const vals = d("line").length;
    const width = Math.max(vals * 3, 36);
    expect(generateLine(d("line"), t("line"))).toBe(
      generateLine(d("line"), t("line"), { height: 10, width })
    );
  });

  it("histogram width default = 38", () => {
    expect(generateHistogram(d("histogram"), t("histogram"))).toBe(
      generateHistogram(d("histogram"), t("histogram"), { width: 38 })
    );
  });

  it("progress width default = 28", () => {
    expect(generateProgress(d("progress"), t("progress"))).toBe(
      generateProgress(d("progress"), t("progress"), { width: 28 })
    );
  });

  it("scatter height/width defaults = 12 / 40", () => {
    expect(generateScatter(d("scatter"), t("scatter"))).toBe(
      generateScatter(d("scatter"), t("scatter"), { height: 12, width: 40 })
    );
  });
});
