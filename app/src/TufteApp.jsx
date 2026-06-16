import { useState, useCallback, useRef, useEffect } from "react";
import {
  GENERATORS,
  parseCSVData,
  CHART_TYPES,
  SAMPLE_DATA,
  SAMPLE_TITLES,
} from "@tufte/chart-core";

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
            <p style={{
              fontSize: "12px",
              color: "#B0A593",
              margin: "10px 0 0",
              lineHeight: 1.6,
            }}>
              <a
                href="https://www.threads.com/@arvindang"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#7A6E60", textDecoration: "underline" }}
              >
                Message me on Threads
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
