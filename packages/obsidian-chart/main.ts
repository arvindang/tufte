import { Plugin } from "obsidian";
import { render, renderInline } from "@tufte/chart-core";

// Tufte Chart plugin: renders ```chart fenced code blocks as Tufte-style
// ASCII charts, and inline `sparkline: …` code spans as glyphs, in
// reading/preview view.
//
// Fail-safe by design (matching the project's adapter convention): a spec that
// fails to parse or render is shown as its raw source in a <pre>, never
// throwing or breaking the note.
export default class TufteChartPlugin extends Plugin {
  onload(): void {
    this.registerMarkdownCodeBlockProcessor("chart", (source, el) => {
      try {
        const ascii = render(source);
        el.createEl("pre", { text: ascii, cls: "tufte-chart" });
      } catch {
        // Bad spec: fall back to the raw source as a plain code block.
        el.createEl("pre", { text: source, cls: "tufte-chart" });
      }
    });

    // Inline sparklines. Code-block processors only see fenced blocks, so the
    // inline `sparkline: 12 24 36` syntax is handled with a DOM post-processor:
    // rewrite matching inline <code> spans to glyphs, keeping the source as a
    // title/aria-label. Non-sparkline code spans are left untouched.
    this.registerMarkdownPostProcessor((el) => {
      el.findAll("code").forEach((code) => {
        if (code.parentElement?.tagName === "PRE") return; // fenced block
        const src = (code.textContent ?? "").trim();
        let glyphs: string;
        try {
          glyphs = renderInline(src);
        } catch {
          return; // ordinary inline code
        }
        code.textContent = glyphs;
        code.addClass("tufte-chart-spark");
        code.setAttr("title", src);
        code.setAttr("aria-label", src);
      });
    });
  }
}
