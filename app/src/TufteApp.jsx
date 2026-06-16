import { useState, useCallback, useRef, useEffect } from "react";
import {
  GENERATORS,
  parseCSVData,
  render,
  CHART_TYPES,
  SAMPLE_DATA,
  SAMPLE_TITLES,
} from "@tufte/chart-core";

const MONO = "'JetBrains Mono', monospace";
const SERIF = "'Libre Baskerville', Georgia, serif";

const PACKAGES = [
  {
    name: "@tufte/chart-core",
    blurb: "The renderer + the chart format. Zero dependencies.",
    install: "npm i @tufte/chart-core",
  },
  {
    name: "@tufte/chart-cli",
    blurb: "Pre-render ```chart blocks in markdown, or pipe a spec via stdin.",
    install: "npm i -g @tufte/chart-cli",
  },
  {
    name: "@tufte/markdown-it-chart",
    blurb: "markdown-it plugin. Powers VitePress, Eleventy, many CMSs.",
    install: "npm i @tufte/markdown-it-chart",
  },
  {
    name: "@tufte/remark-chart",
    blurb: "remark/unified plugin. Powers MDX, Next.js, Astro, Docusaurus.",
    install: "npm i @tufte/remark-chart",
  },
];

const EXAMPLE_SPEC = `line "Latency (ms) over 24h"
0:00, 22
8:00, 68
12:00, 110
24:00, 25`;
const EXAMPLE_SOURCE = "```chart\n" + EXAMPLE_SPEC + "\n```";
const EXAMPLE_OUTPUT = render(EXAMPLE_SPEC);

const MARKDOWN_IT_SNIPPET = `import MarkdownIt from "markdown-it";
import chart from "@tufte/markdown-it-chart";

const md = new MarkdownIt().use(chart);
md.render(source); // \`\`\`chart blocks become charts`;

const REMARK_SNIPPET = `import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkChart from "@tufte/remark-chart";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const html = await unified()
  .use(remarkParse)
  .use(remarkChart)
  .use(remarkRehype)
  .use(rehypeStringify)
  .process(source);`;

const CHART_TYPE_DOCS = [
  ["hbar / bar", "label, value", "horizontal bars"],
  ["vbar / column", "label, value", "vertical columns"],
  ["sparkline", "series, v1 v2 v3…", "inline trend, multi-series"],
  ["line", "label, value", "line plot with axes"],
  ["table", "header row, then cells", "bordered table"],
  ["histogram", "bin, count", "distribution"],
  ["progress", "label, percent", "progress bars"],
  ["scatter", "x, y", "scatter plot"],
];

const REPO_URL = "https://github.com/arvindang/tufte";
const SPEC_URL = "https://github.com/arvindang/tufte/blob/main/packages/core/SPEC.md";
const NPM_ORG_URL = "https://www.npmjs.com/org/tufte";

// Small copy-to-clipboard button used across the doc sections.
function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch { /* clipboard unavailable */ }
      }}
      style={{
        padding: "4px 12px",
        border: "1px solid #D4C9B8",
        borderRadius: "4px",
        background: done ? "#1A1A1A" : "transparent",
        color: done ? "#FDFBF7" : "#7A6E60",
        cursor: "pointer",
        fontFamily: MONO,
        fontSize: "11px",
        letterSpacing: "0.5px",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
      }}
    >
      {done ? "Copied ✓" : "Copy"}
    </button>
  );
}

// A monospace code block with a copy button.
function CodeBox({ code, label }) {
  return (
    <div style={{
      border: "1px solid #D4C9B8",
      borderRadius: "6px",
      background: "#F8F5EE",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        borderBottom: "1px solid #E8E0D4",
      }}>
        <span style={{
          fontFamily: MONO,
          fontSize: "10px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "#9B8E7E",
        }}>
          {label}
        </span>
        <CopyBtn text={code} />
      </div>
      <pre style={{
        margin: 0,
        padding: "14px 16px",
        fontFamily: MONO,
        fontSize: "12.5px",
        lineHeight: 1.6,
        color: "#1A1A1A",
        whiteSpace: "pre",
        overflowX: "auto",
      }}>
        {code}
      </pre>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: MONO,
      fontSize: "10px",
      letterSpacing: "1.8px",
      textTransform: "uppercase",
      color: "#9B8E7E",
      marginBottom: "10px",
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: SERIF,
      fontSize: "24px",
      fontWeight: 400,
      color: "#1A1A1A",
      margin: "0 0 8px",
      letterSpacing: "-0.3px",
    }}>
      {children}
    </h2>
  );
}

const sectionStyle = {
  maxWidth: "920px",
  margin: "0 auto",
  padding: "64px 40px",
  borderTop: "1px solid #E8E0D4",
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
        height: "min(760px, calc(100vh - 140px))",
        minHeight: "520px",
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
        </div>
      </div>

      {/* ============ THE FORMAT ============ */}
      <section style={sectionStyle}>
        <SectionLabel>The format</SectionLabel>
        <SectionTitle>Write a fenced block. Get a chart.</SectionTitle>
        <p style={{
          fontSize: "15px", fontStyle: "italic", color: "#7A6E60",
          margin: "0 0 28px", lineHeight: 1.6, maxWidth: "640px",
        }}>
          A <code style={{ fontFamily: MONO, fontSize: "13px" }}>```chart</code> block
          is just a type, an optional title, and your CSV. The output is plain text, so it
          renders anywhere text goes — READMEs, terminals, diffs, an LLM's reply.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}>
          <CodeBox label="markdown" code={EXAMPLE_SOURCE} />
          <div style={{
            border: "1px solid #D4C9B8", borderRadius: "6px",
            background: "#FFFFFF", overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{
              padding: "8px 12px", borderBottom: "1px solid #E8E0D4",
              fontFamily: MONO, fontSize: "10px", letterSpacing: "1.5px",
              textTransform: "uppercase", color: "#9B8E7E",
            }}>
              renders to
            </div>
            <pre style={{
              margin: 0, padding: "14px 16px", fontFamily: MONO,
              fontSize: "12.5px", lineHeight: 1.6, color: "#1A1A1A",
              whiteSpace: "pre", overflowX: "auto",
            }}>
              {EXAMPLE_OUTPUT}
            </pre>
          </div>
        </div>
      </section>

      {/* ============ INSTALL ============ */}
      <section style={sectionStyle}>
        <SectionLabel>Install</SectionLabel>
        <SectionTitle>Four packages on npm</SectionTitle>
        <p style={{
          fontSize: "15px", fontStyle: "italic", color: "#7A6E60",
          margin: "0 0 28px", lineHeight: 1.6, maxWidth: "640px",
        }}>
          Pure JavaScript, no server, no API key. Pick the one for where you already work.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
        }}>
          {PACKAGES.map((p) => (
            <div key={p.name} style={{
              border: "1px solid #D4C9B8", borderRadius: "6px",
              padding: "18px 20px", background: "#FFFFFF",
              display: "flex", flexDirection: "column", gap: "10px",
            }}>
              <a href={`https://www.npmjs.com/package/${p.name}`}
                 target="_blank" rel="noopener noreferrer"
                 style={{
                   fontFamily: MONO, fontSize: "14px", color: "#1A1A1A",
                   textDecoration: "none", fontWeight: 500,
                 }}>
                {p.name}
              </a>
              <p style={{
                fontSize: "13px", color: "#7A6E60", margin: 0, lineHeight: 1.5,
                flex: 1,
              }}>
                {p.blurb}
              </p>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: "10px",
                background: "#F8F5EE", border: "1px solid #E8E0D4",
                borderRadius: "4px", padding: "6px 10px",
              }}>
                <code style={{
                  fontFamily: MONO, fontSize: "12px", color: "#4A4239",
                  overflowX: "auto", whiteSpace: "nowrap",
                }}>
                  {p.install}
                </code>
                <CopyBtn text={p.install} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ INTEGRATIONS ============ */}
      <section style={sectionStyle}>
        <SectionLabel>Integrations</SectionLabel>
        <SectionTitle>Drop it into your Markdown pipeline</SectionTitle>
        <p style={{
          fontSize: "15px", fontStyle: "italic", color: "#7A6E60",
          margin: "0 0 28px", lineHeight: 1.6, maxWidth: "640px",
        }}>
          Both plugins turn <code style={{ fontFamily: MONO, fontSize: "13px" }}>```chart</code> blocks
          into <code style={{ fontFamily: MONO, fontSize: "13px" }}>&lt;pre class="tufte-chart"&gt;</code> at
          build time. A broken spec falls back to a normal code block, so a typo never breaks the page.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}>
          <CodeBox label="markdown-it — VitePress, Eleventy" code={MARKDOWN_IT_SNIPPET} />
          <CodeBox label="remark — Next, Astro, MDX, Docusaurus" code={REMARK_SNIPPET} />
        </div>
      </section>

      {/* ============ SPEC ============ */}
      <section style={sectionStyle}>
        <SectionLabel>Spec</SectionLabel>
        <SectionTitle>Eight chart types, one tiny grammar</SectionTitle>
        <div style={{
          border: "1px solid #D4C9B8", borderRadius: "6px",
          overflow: "hidden", margin: "20px 0 24px",
        }}>
          {CHART_TYPE_DOCS.map(([type, data, desc], i) => (
            <div key={type} style={{
              display: "grid",
              gridTemplateColumns: "minmax(120px, 1fr) minmax(140px, 1.3fr) 1.4fr",
              gap: "12px",
              padding: "10px 16px",
              borderTop: i === 0 ? "none" : "1px solid #E8E0D4",
              background: i % 2 ? "#F8F5EE" : "#FFFFFF",
              alignItems: "center",
            }}>
              <code style={{ fontFamily: MONO, fontSize: "13px", color: "#1A1A1A" }}>{type}</code>
              <code style={{ fontFamily: MONO, fontSize: "12px", color: "#7A6E60" }}>{data}</code>
              <span style={{ fontSize: "13px", color: "#7A6E60" }}>{desc}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href={SPEC_URL} target="_blank" rel="noopener noreferrer" style={{
            fontFamily: MONO, fontSize: "13px", color: "#FDFBF7",
            background: "#1A1A1A", padding: "10px 18px", borderRadius: "4px",
            textDecoration: "none",
          }}>
            Read the full spec →
          </a>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" style={{
            fontFamily: MONO, fontSize: "13px", color: "#4A4239",
            border: "1px solid #D4C9B8", padding: "10px 18px", borderRadius: "4px",
            textDecoration: "none",
          }}>
            View on GitHub
          </a>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={{
        borderTop: "1px solid #D4C9B8",
        padding: "32px 40px",
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{
          fontFamily: SERIF, fontStyle: "italic", fontSize: "13px", color: "#B0A593",
        }}>
          “Above all else show the data.” — Edward Tufte
        </span>
        <div style={{ display: "flex", gap: "20px", fontFamily: MONO, fontSize: "12px" }}>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer"
             style={{ color: "#7A6E60", textDecoration: "underline" }}>GitHub</a>
          <a href={NPM_ORG_URL} target="_blank" rel="noopener noreferrer"
             style={{ color: "#7A6E60", textDecoration: "underline" }}>npm</a>
          <a href="https://www.threads.com/@arvindang" target="_blank" rel="noopener noreferrer"
             style={{ color: "#7A6E60", textDecoration: "underline" }}>Threads</a>
        </div>
      </footer>
    </div>
  );
}
