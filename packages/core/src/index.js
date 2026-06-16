import {
  generateHBar,
  generateVBar,
  generateSparkline,
  generateLine,
  generateTable,
  generateHistogram,
  generateProgress,
  generateScatter,
} from "./generators.js";
import { parseChartBlock } from "./parseBlock.js";

export { parseCSVData } from "./parse.js";
export { parseChartBlock } from "./parseBlock.js";
export { CHART_TYPES, SAMPLE_DATA, SAMPLE_TITLES } from "./samples.js";
export {
  generateHBar,
  generateVBar,
  generateSparkline,
  generateLine,
  generateTable,
  generateHistogram,
  generateProgress,
  generateScatter,
} from "./generators.js";
export { embedSource, extractSource, renderInPlace } from "./roundtrip.js";

// chartType string → generator function.
export const GENERATORS = {
  hbar: generateHBar,
  vbar: generateVBar,
  sparkline: generateSparkline,
  line: generateLine,
  table: generateTable,
  histogram: generateHistogram,
  progress: generateProgress,
  scatter: generateScatter,
};

// Render a parsed spec ({ type, title, options, data }) to ASCII.
export function renderSpec({ type, title, options = {}, data }) {
  const gen = GENERATORS[type];
  if (!gen) throw new Error(`chart: no renderer for type "${type}"`);
  if (!data || data.length === 0) return "No data to chart.";
  return gen(data, title, options);
}

// Convenience: parse the inner text of a ```chart block and render it.
export function render(blockText) {
  return renderSpec(parseChartBlock(blockText));
}
