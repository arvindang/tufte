import { sparkGlyphs } from "./generators.js";

// Inline sparklines.
//
// Unlike the block ```chart fence (which spans whole lines and can render any
// chart type), an inline sparkline lives inside a single-backtick code span and
// flows within a sentence:
//
//   CPU held steady `sparkline: 12 24 36` all morning.  →  …steady ▁▅█ all…
//
// Only sparkline is inline-capable; every other type produces multiple lines.

// Matches the inner text of an inline `sparkline: …` code span, capturing data.
export const INLINE_SPARK_RE = /^sparkline:\s*(.+)$/i;

// Parse "sparkline: 12 24 36" / "12, 24, 36" → number[]. Numbers may be
// separated by whitespace and/or commas (mirrors block sparkline data).
// Throws if the span is not a sparkline or carries no numeric data.
export function parseInlineSpark(source) {
  const m = source.trim().match(INLINE_SPARK_RE);
  if (!m) throw new Error("inline: not a sparkline span");
  const vals = m[1]
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => !isNaN(n));
  if (vals.length === 0) throw new Error("inline: no numeric data");
  return vals;
}

// "sparkline: 12 24 36" → "▁▅█". Throws (fail-safe) on bad input so callers can
// leave non-sparkline code spans untouched.
export function renderInline(source) {
  return sparkGlyphs(parseInlineSpark(source));
}
