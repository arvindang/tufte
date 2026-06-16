// Parse the CSV-style data body into rows of trimmed string cells.
// Identical behaviour to the original tufte.ai web app: split on newlines,
// split each line on commas, drop rows that are empty or have a blank label.
export function parseCSVData(raw) {
  return raw
    .trim()
    .split("\n")
    .map((line) => {
      const parts = line.split(",").map((s) => s.trim());
      return parts;
    })
    .filter((p) => p.length >= 2 && p[0] !== "");
}
