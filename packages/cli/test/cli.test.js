import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/chart.js", import.meta.url));

function run(args, input) {
  return execFileSync("node", [BIN, ...args], {
    input,
    encoding: "utf8",
  });
}

describe("chart CLI", () => {
  it("renders a spec from stdin", () => {
    const out = run([], 'line "x"\n0:00, 22\n8:00, 68\n12:00, 110\n');
    expect(out).toContain("x");
    expect(out).toContain("│");
  });

  it("renders a markdown file in place and is idempotent with --write", () => {
    const dir = mkdtempSync(join(tmpdir(), "chart-cli-"));
    const file = join(dir, "doc.md");
    const md = [
      "# Doc",
      "```chart",
      'hbar "Revenue"',
      "Q1, 36",
      "Q2, 43",
      "```",
      "",
    ].join("\n");
    writeFileSync(file, md);

    run(["render", file, "--write"]);
    const first = readFileSync(file, "utf8");
    expect(first).toContain("<!-- chart:begin");
    expect(first).toContain("█");

    run(["render", file, "--write"]);
    const second = readFileSync(file, "utf8");
    expect(second).toBe(first); // idempotent
  });
});
