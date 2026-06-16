// Sample data shared between the web app and the format's docs/tests.
// Single source of truth so the app no longer hardcodes these.

export const CHART_TYPES = [
  { id: "hbar", label: "Bar", icon: "▌" },
  { id: "vbar", label: "Column", icon: "▄" },
  { id: "sparkline", label: "Sparkline", icon: "▁▃▇" },
  { id: "line", label: "Line", icon: "╭╯" },
  { id: "table", label: "Table", icon: "┼" },
  { id: "histogram", label: "Histogram", icon: "█▆▃" },
  { id: "progress", label: "Progress", icon: "░█" },
  { id: "scatter", label: "Scatter", icon: "·:" },
];

export const SAMPLE_DATA = {
  hbar: `Q1, 36\nQ2, 43\nQ3, 30\nQ4, 52`,
  vbar: `Jan, 25\nFeb, 40\nMar, 20\nApr, 45\nMay, 35\nJun, 28`,
  sparkline: `CPU, 12 25 38 55 72 88 72 55 38 25 12 12 25 55 72 88 72 55 38 12\nMemory, 30 30 30 32 40 55 58 65 68 72 75 78 85 88 85 72 68 62 55 50\nNetwork, 5 8 15 8 5 72 88 18 5 5 5 8 32 72 88 32 5 5 5 5`,
  line: `0:00, 22\n4:00, 35\n8:00, 68\n10:00, 95\n12:00, 110\n14:00, 85\n16:00, 72\n18:00, 90\n20:00, 65\n22:00, 40\n24:00, 25`,
  table: `Feature, Status, Sprint, Owner\nExplode View, Done, 12, Marcus\nAnnotations, WIP, 13, Arvin\nCross-Section, Next, 14, Sara\nAnalytics, Planned, 15, TBD`,
  histogram: `0-50, 340\n50-100, 240\n100-150, 150\n150-200, 82\n200-250, 41\n250-300, 18\n300+, 7`,
  progress: `Build, 100\nTest, 80\nStaging, 40\nProduction, 0`,
  scatter: `120, 5\n280, 8\n350, 12\n420, 10\n500, 15\n550, 18\n620, 20\n700, 22\n480, 14\n300, 9\n650, 25\n200, 7`,
};

export const SAMPLE_TITLES = {
  hbar: "Revenue by Quarter ($M)",
  vbar: "Monthly Active Users (k)",
  sparkline: "System Metrics — 24h",
  line: "Latency (ms) over 24h",
  table: "Sprint Tracker",
  histogram: "Response Time Distribution (ms)",
  progress: "Deployment Pipeline",
  scatter: "Bug Count vs. Lines Changed",
};
