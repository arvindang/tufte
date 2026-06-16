# The `chart` format

A Mermaid-style fenced code block for **Tufte-style ASCII charts**. Because the
rendered output is itself plain text, a `chart` block works everywhere — even
where no renderer is installed.

## Block

A fenced code block tagged `chart`:

````
```chart
<type> ["optional quoted title"]
@<directive> <value>
<data rows…>
```
````

### Line 1 — type and title

The first non-empty line names the chart **type**, optionally followed by a
quoted **title**.

| Type        | Aliases    | Data shape                                  |
| ----------- | ---------- | ------------------------------------------- |
| `hbar`      | `bar`      | `label, value` per row                      |
| `vbar`      | `column`   | `label, value` per row                      |
| `sparkline` |            | `series, v1 v2 v3 …` per row (multi-series)  |
| `line`      |            | `label, value` per row                      |
| `table`     |            | first row = header, rest = cells            |
| `histogram` |            | `bin, count` per row                        |
| `progress`  |            | `label, percent` (0–100) per row            |
| `scatter`   |            | `x, y` per row                              |

### Directives (optional)

Lines beginning with `@` set rendering options. The `@` sigil keeps directives
from colliding with data labels that contain colons (e.g. `0:00, 22`).

- `@width N` — chart width (per-type meaning; default is the type's natural width)
- `@height N` — chart height (for `vbar`, `line`, `scatter`)

### Data

Every remaining line is CSV: comma-separated, trimmed. Rows with a blank label or
fewer than two cells are ignored.

## Example

````
```chart
line "Latency (ms) over 24h"
@width 60
0:00, 22
8:00, 68
12:00, 110
````

## Round-trip (dual mode)

A rendered chart can carry its own source, so it stays both readable and
editable everywhere:

```
<!-- chart:begin
line "Latency (ms) over 24h"
0:00, 22
8:00, 68
-->
​```
  <rendered ASCII chart>
​```
<!-- chart:end -->
```

Re-running the renderer refreshes the chart from the embedded source; editing the
source in the comment and re-rendering updates the chart. The operation is
idempotent.

## Reference implementation

`@tufte/chart-core` (`render`, `parseChartBlock`, `renderSpec`, `renderInPlace`)
and the `@tufte/chart-cli` pre-render tool.
