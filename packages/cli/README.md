# @tufte/chart-cli

Render [`chart`](../core/SPEC.md) blocks to Tufte-style ASCII — from the command
line. Two modes.

```sh
npm install -g @tufte/chart-cli
```

## Pre-render markdown in place

Find every ` ```chart ` block in a file, render it, and embed the result (with its
source) back into the document. Idempotent — safe to run in a pre-commit hook or
CI so committed markdown shows real charts everywhere, no plugin required.

```sh
chart render README.md --write
```

Without `--write`, the rendered document is printed to stdout.

## Pipe a spec

```sh
printf 'line "Latency"\n0:00, 22\n8:00, 68\n12:00, 110\n' | chart
```

prints the chart to stdout.

## Ecosystem

- [`@tufte/chart-core`](../core) — the renderer + format spec
- [`@tufte/markdown-it-chart`](../markdown-it-chart) — markdown-it plugin
- [`@tufte/remark-chart`](../remark-chart) — remark/unified plugin
