// Copies the Obsidian plugin's canonical manifest to the repo root, where
// Obsidian's community-plugin validator expects it: the registry points at a
// repo (no subdirectory field), and the bot reads manifest.json from the repo
// root to discover the plugin id and version. Run after bumping the version in
// packages/obsidian-chart/manifest.json.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "packages", "obsidian-chart", "manifest.json");
const dest = join(root, "manifest.json");

writeFileSync(dest, readFileSync(src, "utf8"));
console.log(`synced ${src} -> ${dest}`);
