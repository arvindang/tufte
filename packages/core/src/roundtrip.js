import { render } from "./index.js";
import { renderInline } from "./inline.js";

// Round-trip / dual-mode rendering.
//
// A rendered chart carries its own source inside an HTML comment, so the
// artifact is BOTH readable everywhere (the ASCII shows in any markdown/text)
// AND regenerable (the source can be re-rendered or edited in place):
//
//   <!-- chart:begin
//   line "Latency (ms) over 24h"
//   0:00, 22
//   8:00, 68
//   -->
//   ```
//   <rendered ASCII chart>
//   ```
//   <!-- chart:end -->
//
// In rendered markdown the comment is invisible; in raw text the source is
// recoverable. `renderInPlace` is idempotent.

const FENCE = "```";

// A raw authoring fence: ```chart … ```
const RAW_FENCE_RE = /^```chart[ \t]*\r?\n([\s\S]*?)\r?\n```[ \t]*$/gm;

// An already-rendered carrier block.
const CARRIER_RE =
  /<!-- chart:begin\r?\n([\s\S]*?)\r?\n-->\r?\n[\s\S]*?<!-- chart:end -->/g;

// Inline sparklines (see inline.js). The inline carrier is the one-line mirror
// of the block carrier: an HTML comment holds the source (invisible when
// rendered, recoverable in raw text) and an adjacent code span shows the glyphs.
//   raw authoring span:  `sparkline: 12 24 36`
//   baked inline carrier: <!-- chart:inline sparkline: 12 24 36 -->`▁▅█`
const INLINE_RAW_RE = /`(sparkline:[^`]+)`/gi;
const INLINE_CARRIER_RE = /<!-- chart:inline (sparkline:[^>]+?) -->(?:`[^`]*`)?/gi;

// Build an inline carrier from an inline sparkline source.
export function embedInline(source) {
  const src = source.trim();
  return `<!-- chart:inline ${src} -->\`${renderInline(src)}\``;
}

// Build a carrier block from source text and its rendered ASCII.
export function embedSource(source, ascii) {
  const src = source.trim();
  return (
    `<!-- chart:begin\n${src}\n-->\n` +
    `${FENCE}\n${ascii}\n${FENCE}\n` +
    `<!-- chart:end -->`
  );
}

// Extract every chart source found in a document (block fences + carriers, and
// inline sparklines — both raw spans and inline carriers).
export function extractSource(text) {
  const out = [];
  let m;
  CARRIER_RE.lastIndex = 0;
  while ((m = CARRIER_RE.exec(text)) !== null) out.push(m[1].trim());
  RAW_FENCE_RE.lastIndex = 0;
  while ((m = RAW_FENCE_RE.exec(text)) !== null) out.push(m[1].trim());
  INLINE_CARRIER_RE.lastIndex = 0;
  while ((m = INLINE_CARRIER_RE.exec(text)) !== null) out.push(m[1].trim());
  INLINE_RAW_RE.lastIndex = 0;
  while ((m = INLINE_RAW_RE.exec(text)) !== null) out.push(m[1].trim());
  return out;
}

// Render (or re-render) every chart in a document in place. Idempotent:
// existing carriers are refreshed from their embedded source, and raw
// ```chart fences are converted to carriers.
export function renderInPlace(text) {
  // 1. Refresh existing carriers (picks up edits to the embedded source).
  let out = text.replace(CARRIER_RE, (_m, source) =>
    embedSource(source, render(source))
  );
  // 2. Convert raw authoring fences into carriers.
  out = out.replace(RAW_FENCE_RE, (_m, source) =>
    embedSource(source, render(source))
  );
  // 3. Refresh existing inline carriers (picks up edits to the embedded source).
  out = out.replace(INLINE_CARRIER_RE, (_m, source) => embedInline(source));
  // 4. Convert raw inline sparkline spans into inline carriers. A baked
  //    carrier's code span holds bare glyphs (no "sparkline:" prefix), so this
  //    pass never re-matches output from step 3 — keeping renderInPlace idempotent.
  out = out.replace(INLINE_RAW_RE, (_m, source) => embedInline(source));
  return out;
}
