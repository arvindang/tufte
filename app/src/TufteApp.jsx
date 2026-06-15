import { useState, useCallback, useRef, useEffect } from "react";

const CHART_TYPES = [
  { id: "hbar", label: "Bar", icon: "▌" },
  { id: "vbar", label: "Column", icon: "▄" },
  { id: "sparkline", label: "Sparkline", icon: "▁▃▇" },
  { id: "line", label: "Line", icon: "╭╯" },
  { id: "table", label: "Table", icon: "┼" },
  { id: "histogram", label: "Histogram", icon: "█▆▃" },
  { id: "progress", label: "Progress", icon: "░█" },
  { id: "scatter", label: "Scatter", icon: "·:" },
];

const SAMPLE_DATA = {
  hbar: `Q1, 36\nQ2, 43\nQ3, 30\nQ4, 52`,
  vbar: `Jan, 25\nFeb, 40\nMar, 20\nApr, 45\nMay, 35\nJun, 28`,
  sparkline: `CPU, 12 25 38 55 72 88 72 55 38 25 12 12 25 55 72 88 72 55 38 12\nMemory, 30 30 30 32 40 55 58 65 68 72 75 78 85 88 85 72 68 62 55 50\nNetwork, 5 8 15 8 5 72 88 18 5 5 5 8 32 72 88 32 5 5 5 5`,
  line: `0:00, 22\n4:00, 35\n8:00, 68\n10:00, 95\n12:00, 110\n14:00, 85\n16:00, 72\n18:00, 90\n20:00, 65\n22:00, 40\n24:00, 25`,
  table: `Feature, Status, Sprint, Owner\nExplode View, Done, 12, Marcus\nAnnotations, WIP, 13, Arvin\nCross-Section, Next, 14, Sara\nAnalytics, Planned, 15, TBD`,
  histogram: `0-50, 340\n50-100, 240\n100-150, 150\n150-200, 82\n200-250, 41\n250-300, 18\n300+, 7`,
  progress: `Build, 100\nTest, 80\nStaging, 40\nProduction, 0`,
  scatter: `120, 5\n280, 8\n350, 12\n420, 10\n500, 15\n550, 18\n620, 20\n700, 22\n480, 14\n300, 9\n650, 25\n200, 7`,
};

const SAMPLE_TITLES = {
  hbar: "Revenue by Quarter ($M)",
  vbar: "Monthly Active Users (k)",
  sparkline: "System Metrics — 24h",
  line: "Latency (ms) over 24h",
  table: "Sprint Tracker",
  histogram: "Response Time Distribution (ms)",
  progress: "Deployment Pipeline",
  scatter: "Bug Count vs. Lines Changed",
};

function parseCSVData(raw) {
  return raw
    .trim()
    .split("\n")
    .map((line) => {
      const parts = line.split(",").map((s) => s.trim());
      return parts;
    })
    .filter((p) => p.length >= 2 && p[0] !== "");
}

function generateHBar(data, title) {
  const maxVal = Math.max(...data.map((d) => parseFloat(d[1])));
  const maxLabelLen = Math.max(...data.map((d) => d[0].length));
  const barWidth = 44;
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

function generateVBar(data, title) {
  const vals = data.map((d) => parseFloat(d[1]));
  const maxVal = Math.max(...vals);
  const height = 12;
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

function generateSparkline(data, title) {
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

function generateLine(data, title) {
  const vals = data.map((d) => parseFloat(d[1]));
  const labels = data.map((d) => d[0]);
  const maxVal = Math.max(...vals);
  const minVal = Math.min(...vals);
  const height = 10;
  const width = Math.max(vals.length * 3, 36);
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

function generateTable(data, title) {
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

function generateHistogram(data, title) {
  const maxVal = Math.max(...data.map((d) => parseFloat(d[1])));
  const maxLabelLen = Math.max(...data.map((d) => d[0].length));
  const barWidth = 38;
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

function generateProgress(data, title) {
  const barWidth = 28;
  const icons = { 100: "✓", 0: "○" };
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

function generateScatter(data, title) {
  const xs = data.map((d) => parseFloat(d[0]));
  const ys = data.map((d) => parseFloat(d[1]));
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const height = 12, width = 40;
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

const GENERATORS = {
  hbar: generateHBar,
  vbar: generateVBar,
  sparkline: generateSparkline,
  line: generateLine,
  table: generateTable,
  histogram: generateHistogram,
  progress: generateProgress,
  scatter: generateScatter,
};

export default function TufteApp() {
  const [chartType, setChartType] = useState("hbar");
  const [rawData, setRawData] = useState(SAMPLE_DATA.hbar);
  const [chartTitle, setChartTitle] = useState(SAMPLE_TITLES.hbar);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const outputRef = useRef(null);

  const generate = useCallback(() => {
    const parsed = parseCSVData(rawData);
    if (parsed.length === 0) {
      setOutput("No data to chart.");
      return;
    }
    const gen = GENERATORS[chartType];
    if (gen) {
      setOutput(gen(parsed, chartTitle));
    }
  }, [rawData, chartType, chartTitle]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleTypeChange = (id) => {
    setChartType(id);
    setRawData(SAMPLE_DATA[id]);
    setChartTitle(SAMPLE_TITLES[id]);
    setShowTip(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = outputRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        window.getSelection().removeAllRangeS;
        window.getSelection().addRange(range);
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FDFBF7",
      fontFamily: "'Libre Baskerville', 'Georgia', serif",
      color: "#2C2C2C",
      padding: "0",
      display: "flex",
      flexDirection: "column",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{
        padding: "32px 40px 24px",
        borderBottom: "1px solid #D4C9B8",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: 400,
            letterSpacing: "-0.5px",
            margin: 0,
            color: "#1A1A1A",
          }}>
            tufte
          </h1>
          <span style={{
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            color: "#9B8E7E",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}>
            ascii charts
          </span>
        </div>
        <p style={{
          fontSize: "14px",
          fontStyle: "italic",
          color: "#7A6E60",
          margin: "6px 0 0",
          lineHeight: 1.5,
        }}>
          Charts that go anywhere text goes.
        </p>
      </header>

      <div style={{
        display: "flex",
        flex: 1,
        minHeight: 0,
      }}>
        {/* Left Panel — Controls */}
        <div style={{
          width: "340px",
          minWidth: "340px",
          borderRight: "1px solid #D4C9B8",
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          overflowY: "auto",
        }}>
          {/* Chart Type Selector */}
          <div>
            <label style={{
              fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              color: "#9B8E7E",
              display: "block",
              marginBottom: "12px",
            }}>
              Chart Type
            </label>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
            }}>
              {CHART_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTypeChange(t.id)}
                  style={{
                    padding: "10px 12px",
                    border: chartType === t.id ? "1.5px solid #1A1A1A" : "1px solid #D4C9B8",
                    borderRadius: "4px",
                    background: chartType === t.id ? "#1A1A1A" : "transparent",
                    color: chartType === t.id ? "#FDFBF7" : "#4A4239",
                    cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "14px", opacity: 0.7 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{
              fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              color: "#9B8E7E",
              display: "block",
              marginBottom: "8px",
            }}>
              Title
            </label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #D4C9B8",
                borderRadius: "4px",
                background: "transparent",
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: "14px",
                color: "#2C2C2C",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="Chart title..."
            />
          </div>

          {/* Data Input */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label style={{
              fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              color: "#9B8E7E",
              display: "block",
              marginBottom: "8px",
            }}>
              Data
            </label>
            <textarea
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              style={{
                flex: 1,
                minHeight: "180px",
                padding: "12px",
                border: "1px solid #D4C9B8",
                borderRadius: "4px",
                background: "#F8F5EE",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                lineHeight: 1.7,
                color: "#2C2C2C",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
              }}
              spellCheck={false}
            />
            {showTip && (
              <p style={{
                fontSize: "11px",
                fontStyle: "italic",
                color: "#9B8E7E",
                margin: "8px 0 0",
                lineHeight: 1.5,
              }}>
                CSV format — label, value per line. Edit the data above and the chart updates live.
              </p>
            )}
          </div>
        </div>

        {/* Right Panel — Output */}
        <div style={{
          flex: 1,
          padding: "28px 40px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}>
            <label style={{
              fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              color: "#9B8E7E",
            }}>
              Output
            </label>
            <button
              onClick={handleCopy}
              style={{
                padding: "6px 16px",
                border: "1px solid #D4C9B8",
                borderRadius: "4px",
                background: copied ? "#1A1A1A" : "transparent",
                color: copied ? "#FDFBF7" : "#7A6E60",
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.5px",
                transition: "all 0.2s ease",
              }}
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>

          <div style={{
            flex: 1,
            background: "#FFFFFF",
            border: "1px solid #D4C9B8",
            borderRadius: "4px",
            padding: "28px 32px",
            overflow: "auto",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <pre
              ref={outputRef}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                lineHeight: 1.6,
                color: "#1A1A1A",
                margin: 0,
                whiteSpace: "pre",
                overflowX: "auto",
              }}
            >
              {output}
            </pre>
          </div>

          {/* Footer quote */}
          <div style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid #E8E0D4",
          }}>
            <p style={{
              fontSize: "12px",
              fontStyle: "italic",
              color: "#B0A593",
              margin: 0,
              lineHeight: 1.6,
            }}>
              "Above all else show the data." — Edward Tufte
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
