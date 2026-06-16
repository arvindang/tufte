import { parseCSVData } from "./parse.js";

// Type aliases → canonical generator id.
const TYPE_ALIASES = {
  bar: "hbar",
  hbar: "hbar",
  column: "vbar",
  vbar: "vbar",
  sparkline: "sparkline",
  line: "line",
  table: "table",
  histogram: "histogram",
  progress: "progress",
  scatter: "scatter",
};

// Parse the inner body of a ```chart fenced block into a spec.
//
// Grammar:
//   <type> ["optional quoted title"]
//   @<directive> <value>      (zero or more, e.g. @width 60)
//   <csv data rows…>
//
// Returns { type, title, options, data } where `data` is the parsed 2D array.
// Throws on an unknown / missing chart type.
export function parseChartBlock(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  // First non-empty line is the header.
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i >= lines.length) throw new Error("chart: empty block");

  const header = lines[i].trim();
  i++;

  const typeToken = header.split(/\s+/)[0].toLowerCase();
  const type = TYPE_ALIASES[typeToken];
  if (!type) {
    throw new Error(
      `chart: unknown type "${typeToken}". Expected one of: ${Object.keys(TYPE_ALIASES).join(", ")}`
    );
  }

  const titleMatch = header.match(/"([^"]*)"/);
  const title = titleMatch ? titleMatch[1] : "";

  // Remaining lines: @directives become options, everything else is data.
  const options = {};
  const dataLines = [];
  for (; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("@")) {
      const m = trimmed.match(/^@(\w+)\s+(.+)$/);
      if (m) {
        const key = m[1].toLowerCase();
        const raw = m[2].trim();
        const num = Number(raw);
        options[key] = Number.isNaN(num) ? raw : num;
      }
      continue;
    }
    dataLines.push(line);
  }

  const data = parseCSVData(dataLines.join("\n"));
  return { type, title, options, data };
}
