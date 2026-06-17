---
"@tufte/chart-core": minor
"@tufte/markdown-it-chart": minor
"@tufte/remark-chart": minor
"@tufte/chart-cli": minor
---

Add inline sparklines. A sparkline is a single line of glyphs, so it can now flow
inside a sentence via a one-backtick code span: `` `sparkline: 12 24 36` `` renders
to `▁▅█`. Only `sparkline` is inline-capable; other chart types remain block-only.

- **core**: new `renderInline`, `parseInlineSpark`, `sparkGlyphs` exports; `renderInPlace`
  bakes inline spans into a regenerable one-line carrier
  (`` <!-- chart:inline sparkline: 12 24 36 -->`▁▅█` ``), keeping the source recoverable.
- **markdown-it-chart / remark-chart**: render inline `sparkline:` code spans to `<code>`
  glyphs (with the source kept as `title`/`aria-label`), fail-safe for ordinary inline code.
- **chart-cli**: `chart render --write` now bakes inline sparklines via `renderInPlace`.
