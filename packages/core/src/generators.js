// Pure ASCII chart generators, extracted verbatim from the tufte.ai web app.
// Each takes (data, title, opts) and returns a multi-line string.
//   data  — array of string cells per row, as produced by parseCSVData
//   title — optional string, rendered as a heading
//   opts  — optional { width, height }; each generator reads what applies.
// Width/height defaults equal the original hardcoded constants, so output is
// byte-for-byte identical to the pre-extraction app when no opts are given.

export function generateHBar(data, title, opts = {}) {
  const maxVal = Math.max(...data.map((d) => parseFloat(d[1])));
  const maxLabelLen = Math.max(...data.map((d) => d[0].length));
  const barWidth = opts.width ?? 44;
  let out = title ? `${title}\n\n` : "";
  data.forEach(([label, val]) => {
    const v = parseFloat(val);
    const len = Math.round((v / maxVal) * barWidth);
    const bar = "█".repeat(len);
    const pad = " ".repeat(maxLabelLen - label.length);
    out += `${pad}${label}  ${bar}  ${val}\n`;
  });
  return out.trimEnd();
}

export function generateVBar(data, title, opts = {}) {
  const vals = data.map((d) => parseFloat(d[1]));
  const maxVal = Math.max(...vals);
  const height = opts.height ?? 12;
  const colWidth = 5;
  let out = title ? `${title}\n\n` : "";
  for (let row = height; row >= 1; row--) {
    const threshold = (row / height) * maxVal;
    const labelVal = Math.round(threshold);
    const label = String(labelVal).padStart(4);
    let line = `${label} │`;
    vals.forEach((v) => {
      if (v >= threshold) {
        line += "  ██ ";
      } else {
        line += "     ";
      }
    });
    out += line + "\n";
  }
  out += "   0 └" + "─".repeat(vals.length * colWidth) + "\n";
  out += "      ";
  data.forEach(([label]) => {
    const l = label.substring(0, 4);
    out += l.padEnd(colWidth);
  });
  return out.trimEnd();
}

export function generateSparkline(data, title) {
  const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  let out = title ? `${title}\n\n` : "";
  const maxLabelLen = Math.max(...data.map((d) => d[0].length));
  data.forEach(([label, ...rest]) => {
    const vals = rest
      .join(",")
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const spark = vals
      .map((v) => {
        const idx = Math.round(((v - min) / range) * (blocks.length - 1));
        return blocks[idx];
      })
      .join("");
    const pad = " ".repeat(maxLabelLen - label.length);
    out += `${pad}${label}  ${spark}\n`;
  });
  return out.trimEnd();
}

export function generateLine(data, title, opts = {}) {
  const vals = data.map((d) => parseFloat(d[1]));
  const labels = data.map((d) => d[0]);
  const maxVal = Math.max(...vals);
  const minVal = Math.min(...vals);
  const height = opts.height ?? 10;
  const width = opts.width ?? Math.max(vals.length * 3, 36);
  const range = maxVal - minVal || 1;
  const grid = Array.from({ length: height + 1 }, () =>
    Array(width).fill(" ")
  );
  const points = vals.map((v, i) => {
    const y = height - Math.round(((v - minVal) / range) * height);
    const x = Math.round((i / (vals.length - 1)) * (width - 1));
    return { x, y };
  });
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;
    for (let x = p1.x; x <= p2.x; x++) {
      const t = dx === 0 ? 0 : (x - p1.x) / dx;
      const y = Math.round(p1.y + t * (p2.y - p1.y));
      if (y >= 0 && y <= height) {
        if (x === p1.x && p1.y < p2.y) grid[y][x] = "╮";
        else if (x === p2.x && p2.y < p1.y) grid[y][x] = "╭";
        else if (x === p1.x && p1.y > p2.y) grid[y][x] = "╯";
        else if (x === p2.x && p2.y > p1.y) grid[y][x] = "╰";
        else if (p1.y === p2.y) grid[y][x] = "─";
        else grid[y][x] = "│";
      }
    }
  }
  points.forEach(({ x, y }) => {
    if (y >= 0 && y <= height) grid[y][x] = "●";
  });
  let out = title ? `${title}\n\n` : "";
  for (let row = 0; row <= height; row++) {
    const labelVal = Math.round(maxVal - (row / height) * range);
    out += String(labelVal).padStart(5) + " │" + grid[row].join("") + "\n";
  }
  out += "      └" + "─".repeat(width) + "\n";
  out += "       ";
  const step = Math.max(1, Math.floor(labels.length / 5));
  for (let i = 0; i < labels.length; i += step) {
    const x = Math.round((i / (vals.length - 1)) * (width - 1));
    const l = labels[i].substring(0, 5);
    while (out.length < 7 + x) out += " ";
    out += l;
  }
  return out.trimEnd();
}

export function generateTable(data, title) {
  if (data.length === 0) return "";
  const cols = data[0].length;
  const colWidths = [];
  for (let c = 0; c < cols; c++) {
    colWidths[c] = Math.max(...data.map((row) => (row[c] || "").length)) + 2;
  }
  const hr = (l, m, r) =>
    l +
    colWidths.map((w) => "─".repeat(w)).join(m) +
    r;
  const row = (cells) =>
    "│" +
    cells.map((c, i) => {
      const pad = colWidths[i] - c.length;
      const left = Math.floor(pad / 2);
      const right = pad - left;
      return " ".repeat(left) + c + " ".repeat(right);
    }).join("│") +
    "│";
  let out = title ? `${title}\n\n` : "";
  out += hr("┌", "┬", "┐") + "\n";
  out += row(data[0]) + "\n";
  out += hr("├", "┼", "┤") + "\n";
  for (let i = 1; i < data.length; i++) {
    const cells = [];
    for (let c = 0; c < cols; c++) cells.push(data[i][c] || "");
    out += row(cells) + "\n";
  }
  out += hr("└", "┴", "┘");
  return out;
}

export function generateHistogram(data, title, opts = {}) {
  const maxVal = Math.max(...data.map((d) => parseFloat(d[1])));
  const maxLabelLen = Math.max(...data.map((d) => d[0].length));
  const barWidth = opts.width ?? 38;
  let out = title ? `${title}\n\n` : "";
  data.forEach(([label, val]) => {
    const v = parseFloat(val);
    const len = Math.round((v / maxVal) * barWidth);
    const bar = "█".repeat(len) + "░".repeat(barWidth - len);
    const pad = " ".repeat(maxLabelLen - label.length);
    out += `${pad}${label}  ${bar}  ${val}\n`;
  });
  return out.trimEnd();
}

export function generateProgress(data, title, opts = {}) {
  const barWidth = opts.width ?? 28;
  let out = title ? `${title}\n\n` : "";
  const maxLabelLen = Math.max(...data.map((d) => d[0].length));
  data.forEach(([label, val]) => {
    const v = parseFloat(val);
    const filled = Math.round((v / 100) * barWidth);
    const bar = "█".repeat(filled) + "░".repeat(barWidth - filled);
    const pad = " ".repeat(maxLabelLen - label.length);
    const pct = `${Math.round(v)}%`.padStart(4);
    const icon = v >= 100 ? " ✓" : v > 0 ? " ◉" : " ○";
    out += `${pad}${label}  [${bar}] ${pct}${icon}\n`;
  });
  return out.trimEnd();
}

export function generateScatter(data, title, opts = {}) {
  const xs = data.map((d) => parseFloat(d[0]));
  const ys = data.map((d) => parseFloat(d[1]));
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const height = opts.height ?? 12, width = opts.width ?? 40;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const grid = Array.from({ length: height + 1 }, () =>
    Array(width).fill(" ")
  );
  data.forEach(([xStr, yStr]) => {
    const x = Math.round(((parseFloat(xStr) - minX) / rangeX) * (width - 1));
    const y = height - Math.round(((parseFloat(yStr) - minY) / rangeY) * height);
    if (grid[y][x] === "·") grid[y][x] = "∴";
    else grid[y][x] = "·";
  });
  let out = title ? `${title}\n\n` : "";
  for (let row = 0; row <= height; row++) {
    const labelVal = Math.round(maxY - (row / height) * rangeY);
    out += String(labelVal).padStart(4) + " │ " + grid[row].join("") + "\n";
  }
  out += "     └─" + "─".repeat(width) + "\n";
  out += "       " + String(Math.round(minX)).padEnd(10) + String(Math.round((minX + maxX) / 2)).padStart(width / 2 - 5).padEnd(width / 2) + String(Math.round(maxX));
  return out.trimEnd();
}
