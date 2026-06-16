#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { render, renderInPlace } from "@tufte/chart-core";

const HELP = `chart — render \`chart\` blocks to ASCII

Usage:
  chart render <file.md> [--write]   Render every \`\`\`chart block in a markdown
                                     file in place. Prints to stdout, or edits
                                     the file with --write. Idempotent.
  chart < spec.txt                   Read one chart spec from stdin, print ASCII.

Examples:
  printf 'line "x"\\n0:00, 22\\n8:00, 68\\n' | chart
  chart render README.md --write
`;

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === "-h" || cmd === "--help" || cmd === "help") {
  process.stdout.write(HELP);
  process.exit(0);
}

if (cmd === "render") {
  const write = rest.includes("--write");
  const file = rest.find((a) => !a.startsWith("--"));
  if (!file) {
    process.stderr.write("chart render: missing <file>\n");
    process.exit(1);
  }
  const input = readFileSync(file, "utf8");
  const output = renderInPlace(input);
  if (write) {
    writeFileSync(file, output);
    process.stderr.write(`chart: rendered ${file}\n`);
  } else {
    process.stdout.write(output);
  }
  process.exit(0);
}

// Default: stdin → single chart.
const spec = readStdin().trim();
if (!spec) {
  process.stdout.write(HELP);
  process.exit(0);
}
try {
  process.stdout.write(render(spec) + "\n");
} catch (err) {
  process.stderr.write(`chart: ${err.message}\n`);
  process.exit(1);
}
