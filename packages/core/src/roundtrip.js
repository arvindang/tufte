import { render } from "./index.js";

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

// Build a carrier block from source text and its rendered ASCII.
export function embedSource(source, ascii) {
  const src = source.trim();
  return (
    `<!-- chart:begin\n${src}\n-->\n` +
    `${FENCE}\n${ascii}\n${FENCE}\n` +
    `<!-- chart:end -->`
  );
}

// Extract every chart source found in a document (raw fences + carriers).
export function extractSource(text) {
  const out = [];
  let m;
  CARRIER_RE.lastIndex = 0;
  while ((m = CARRIER_RE.exec(text)) !== null) out.push(m[1].trim());
  RAW_FENCE_RE.lastIndex = 0;
  while ((m = RAW_FENCE_RE.exec(text)) !== null) out.push(m[1].trim());
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
  return out;
}
