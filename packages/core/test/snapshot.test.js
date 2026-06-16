import { describe, it, expect } from "vitest";
import { render, SAMPLE_DATA, SAMPLE_TITLES } from "../src/index.js";

// Build the inner text of a ```chart block from a sample.
function block(type) {
  return `${type} "${SAMPLE_TITLES[type]}"\n${SAMPLE_DATA[type]}`;
}

describe("rendered output is stable for every chart type", () => {
  for (const type of Object.keys(SAMPLE_DATA)) {
    it(type, () => {
      expect(render(block(type))).toMatchSnapshot();
    });
  }
});
