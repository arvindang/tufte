import { Plugin } from "obsidian";
import { render } from "@tufte/chart-core";

// Tufte Chart plugin: renders ```chart fenced code blocks as Tufte-style
// ASCII charts in reading/preview view.
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
  }
}
