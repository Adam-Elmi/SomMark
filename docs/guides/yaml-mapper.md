# Creating a YAML Mapper

This guide walks you through building a mapper that renders SomMark blocks as
YAML. It is the complement to the [HTML mapper guide](html-mapper.md) — where
HTML wraps content and almost never needs `handleAst`, YAML structures data and
uses it everywhere.

By the end you will know:

- Why YAML needs `handleAst: true` on every block
- How to write helper functions for indentation and escaping
- How scalar blocks (`[str]`, `[int]`, `[float]`, `[bool]`, `[null]`) work
- How three context props (`depth`, `inSeq`, `inMapItem`) flow from parent to child
- How structural blocks (`[mapping]`, `[seq]`, `[map-item]`) pass that context
- How to validate prop values and throw build-time errors
- How `getUnknownTag` enables a shorthand syntax where the tag name is the YAML key

---

## Step 1 — Why YAML needs `handleAst: true` everywhere

In the HTML guide, blocks receive `content` — the already-rendered string of
all children — and just wrap it. That works because every HTML element is
structurally the same: open tag, content, close tag. Children do not need to
know anything about where they are.

YAML is different. The same scalar block must produce different output depending
on where it lives:

```yaml
# As a top-level key-value pair (depth 0)
port: 5432

# Indented inside a mapping (depth 1)
database:
  port: 5432

# Inside a sequence (inSeq: true)
- 5432
```

That is the same `[int]` block rendering three different ways. The block cannot
know which case applies on its own — its parent must tell it. And the only way
a parent can tell a child something is to walk children manually with
`handleAst: true` and pass context through `renderChild`.

**There is a second reason** for scalar blocks: they need raw text, not
processed output. When `handleAst: false`, the engine renders the block's body
through the `text()` method and delivers it as `content` — a processed string.
YAML scalars need the unprocessed text (`textContent`) so they can control how
it appears in the output. `handleAst: true` gives them that control.

So YAML uses `handleAst: true` on every registered block, structural or scalar.

---

## Step 2 — Create the mapper

```js
import { Mapper } from "sommark";

const YAML = Mapper.define({
    comment(text) {
        return `# ${text}`;
    },
    text(text) {
        return text.trim() === "" ? "" : text;
    }
});
```

Two overrides:

- **`comment()`** — turns SomMark comments into YAML comments. A `# remark` in
  the source becomes `# remark` in the YAML output.
- **`text()`** — blank lines between blocks produce empty text nodes. This
  returns `""` for them so they do not litter the output with whitespace.

No `runtimeLogic()` override — YAML has no concept of runtime scripts, so the
default (which returns `""`) is correct.

---

## Step 3 — Helper functions

Establish these at the top of your mapper file. Every block uses them.

```js
const getIndent = (depth) => "  ".repeat(depth);
```

`getIndent(0)` → `""`, `getIndent(1)` → `"  "`, `getIndent(2)` → `"    "`.
Every block receives a `depth` value and calls this to produce its leading
whitespace.

```js
const yamlEscape = (str) =>
    String(str ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");

const yamlStr = (val) => `"${yamlEscape(val)}"`;
```

`yamlStr` always double-quotes string values. This removes any ambiguity —
`yes`, `1.0`, `null` all stay strings when wrapped in `"..."`.

```js
const yamlKey = (key) => {
    const s = String(key ?? "");
    return /^[A-Za-z0-9_\-]+$/.test(s) ? s : `"${yamlEscape(s)}"`;
};
```

`yamlKey` writes keys bare when they are safe (`host`, `my-key`, `db_name`)
and quotes them when they contain special characters (`"my key"`, `"a:b"`).

---

## Step 4 — Scalar blocks

A scalar block produces a single YAML value — a string, integer, float,
boolean, or null. The pattern is the same for all of them:

1. Read the value from `props` (or fall back to `textContent`)
2. Check which context we are in (`inSeq`, `inMapItem`, or plain key-value)
3. Return the correct YAML line

Here is `[str]`:

```js
YAML.register(["str", "string"], ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
    if (inSeq) {
        const val = safeArg({ props, index: 0, key: "value", fallBack: textContent.trim() });
        return `${getIndent(depth)}- ${yamlStr(val)}\n`;
    }
    const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
    const val = safeArg({ props, index: 1, key: "value", fallBack: textContent.trim() });
    if (inMapItem) return `${yamlKey(key)}: ${yamlStr(val)}${ITEM_SEP}`;
    return `${getIndent(depth)}${yamlKey(key)}: ${yamlStr(val)}\n`;
}, { handleAst: true });
```

The same block, three outputs:

| Usage | Input | Output |
| ----- | ----- | ------ |
| Key-value | `[str = "name", "SomMark" !]` | `name: "SomMark"` |
| In sequence | `[str = "rust" !]` (inside `[seq]`) | `  - "rust"` |
| In map-item | `[str = "host", "localhost" !]` (inside `[map-item]`) | `host: "localhost"` |

The `depth = 0`, `inSeq = false`, `inMapItem = false` default values are
important — they mean the block works correctly when used at the top level
without a parent passing context.

**Body form** — when you need a multi-word value without quoting it in the tag:

```ini
[str = "description"]A long plain-text value[end]
```

Here `props` has only the key (`"description"`), and `textContent.trim()` is
`"A long plain-text value"`. The fallback in `safeArg` picks it up.

---

## Step 5 — The three context props

YAML blocks communicate using three props passed through `renderChild`:

| Prop | Type | Default | Meaning |
| ---- | ---- | ------- | ------- |
| `depth` | `number` | `0` | How deep in the tree — controls indentation |
| `inSeq` | `boolean` | `false` | This child is an item inside a sequence — prefix with `- ` instead of outputting a key |
| `inMapItem` | `boolean` | `false` | This child is a field inside `[map-item]` — output bare `key: value` with no newline, no indent |

These are not special engine names. They are plain object properties that the
parent passes to `renderChild(child, { depth: ..., inSeq: ..., inMapItem: ... })`,
and the child declares as named parameters to receive them. The transpiler
delivers them transparently.

---

## Step 6 — Structural block: `[mapping]`

`[mapping]` produces a YAML object — a block of key-value pairs under a shared
parent key.

```js
YAML.register(["mapping", "map"], async ({ props, ast, depth = 0, renderChild }) => {
    const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
    const childDepth = key ? depth + 1 : depth;
    let body = "";
    for (const child of ast.body) {
        body += await renderChild(child, { depth: childDepth });
    }
    if (!key) return body;
    return `${getIndent(depth)}${yamlKey(key)}:\n${body}`;
}, { handleAst: true });
```

Walk through what happens:

1. Read the key from `props`. It is optional — omitting it writes fields at the
   current level with no wrapper key.
2. `childDepth` — if this mapping has a key, children are indented one level
   deeper. If not, they stay at the same depth.
3. Walk `ast.body` and render each child, passing `{ depth: childDepth }`.
4. Wrap the result under the key, or return it bare.

SomMark input:
```ini
[mapping = "database"]
  [host = "localhost" !]
  [port = 5432 !]
[end]
```

What happens step by step:
- `[mapping]` reads `key = "database"`, sets `childDepth = 1`
- Renders `[host]` with `{ depth: 1 }` → `  host: "localhost"\n`
- Renders `[port]` with `{ depth: 1 }` → `  port: 5432\n`
- Wraps: `database:\n  host: "localhost"\n  port: 5432\n`

Output:
```yaml
database:
  host: "localhost"
  port: 5432
```

**Nested mappings** work because each `[mapping]` increments depth by one as it
passes down. A mapping at depth 0 passes `depth: 1` to its children. If a child
is itself a `[mapping]`, it receives `depth: 1` and passes `depth: 2` to its
own children:

```ini
[mapping = "app"]
  [mapping = "server"]
    [host = "0.0.0.0" !]
    [port = 3000 !]
  [end]
[end]
```

```yaml
app:
  server:
    host: "0.0.0.0"
    port: 3000
```

---

## Step 7 — Structural block: `[seq]`

`[seq]` produces a YAML sequence — a list where each child becomes one item
prefixed with `- `.

```js
YAML.register(["seq", "sequence", "list"], async ({ props, ast, depth = 0, renderChild }) => {
    const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
    let body = "";
    for (const child of ast.body) {
        body += await renderChild(child, { depth: depth + 1, inSeq: true });
    }
    if (!key) return body;
    return `${getIndent(depth)}${yamlKey(key)}:\n${body}`;
}, { handleAst: true });
```

The key difference from `[mapping]`: it passes `inSeq: true` to every child.
That single flag changes how each scalar renders — instead of `key: value`,
scalars produce `- value`.

SomMark input:
```ini
[seq = "tags"]
  [str = "rust" !]
  [str = "cli" !]
  [str = "sommark" !]
[end]
```

What happens:
- `[seq]` passes `{ depth: 1, inSeq: true }` to each child
- Each `[str]` sees `inSeq: true` and renders `  - "rust"\n`, `  - "cli"\n`, etc.
- `[seq]` wraps: `tags:\n  - "rust"\n  - "cli"\n  - "sommark"\n`

Output:
```yaml
tags:
  - "rust"
  - "cli"
  - "sommark"
```

---

## Step 8 — Structural block: `[map-item]`

`[map-item]` is used inside `[seq]` when each list item is an object, not a
scalar. It assembles multiple `key: value` pairs into one sequence entry.

The challenge: YAML formats this as:

```yaml
- host: "10.0.0.1"
  port: 8001
```

The first pair gets `- `, the rest get `  ` alignment. `[map-item]` needs to
collect all pairs first, then format them together.

The solution is an internal separator character (`\x1F`, the ASCII unit
separator — invisible and never in user text):

```js
const ITEM_SEP = "\x1F";
```

Children render with `inMapItem: true`, which tells them to append `ITEM_SEP`
instead of a newline:

```js
// [str] with inMapItem: true returns:
`host: "10.0.0.1"\x1F`   // no indent, no newline — just the pair + separator
```

Then `[map-item]` splits on the separator and formats the result:

```js
YAML.register("map-item", async ({ props, ast, depth = 0, renderChild }) => {
    let combined = "";
    for (const child of ast.body) {
        combined += await renderChild(child, { depth: 0, inMapItem: true });
    }
    const pairs = combined.split(ITEM_SEP).map(v => v.trim()).filter(v => v !== "");
    if (pairs.length === 0) return "";
    const seqIndent  = getIndent(depth);
    const bodyIndent = getIndent(depth) + "  ";
    const [first, ...rest] = pairs;
    const restLines = rest.length > 0 ? `\n${rest.map(p => `${bodyIndent}${p}`).join("\n")}` : "";
    return `${seqIndent}- ${first}${restLines}\n`;
}, { handleAst: true });
```

Step by step:

1. Render all children with `{ depth: 0, inMapItem: true }` — each returns
   `"key: value\x1F"`.
2. Split `combined` on `\x1F` to get the individual pairs.
3. The first pair gets `- ` (sequence bullet). The rest get `  ` (alignment
   under the bullet).

SomMark input:
```ini
[seq = "servers"]
  [map-item]
    [host = "10.0.0.1" !]
    [port = 8001 !]
  [end]
  [map-item]
    [host = "10.0.0.2" !]
    [port = 8002 !]
  [end]
[end]
```

Output:
```yaml
servers:
  - host: "10.0.0.1"
    port: 8001
  - host: "10.0.0.2"
    port: 8002
```

> `[map-item]` is always inside `[seq]`, which passes `{ depth: N, inSeq: true }`
> to its children. `[map-item]` receives `depth` from that context and uses it
> for its own indentation. It does NOT pass `inSeq` down to its own children —
> those children use `inMapItem: true` instead.

---

## Step 9 — Validation with `transpilerError`

Typed blocks like `[int]` and `[float]` accept only specific kinds of values.
If the user passes the wrong type, throw a build-time error using
`transpilerError`:

```js
import { transpilerError } from "sommark/errors";

const isValidInt   = (v) => v !== "" && !isNaN(Number(v)) && !v.includes(".");
const isValidFloat = (v) => v !== "" && !isNaN(Number(v)) && v.includes(".");

YAML.register(["int", "integer"], ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
    const val = String(safeArg({ props, index: inSeq ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
    if (!isValidInt(val))
        transpilerError(`[int] expects a whole number but got '${val}'. Use [float] for decimals or [number] for either.`);
    if (inSeq) return `${getIndent(depth)}- ${val}\n`;
    const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
    if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
    return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
}, { handleAst: true });
```

Two things to notice:

**`index: inSeq ? 0 : 1`** — when the block is inside a sequence, the first
positional arg is the value (there is no key). When it is a key-value pair,
the first arg is the key and the second is the value. The index shifts based on
context.

**Validation before output** — read the value, validate it, throw if wrong.
`transpilerError` stops the build and shows the message to the user.

The `[number]` type accepts both integers and floats:

```js
const isValidNumber = (v) => v !== "" && !isNaN(Number(v));

YAML.register("number", ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
    const val = String(safeArg({ props, index: inSeq ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
    if (!isValidNumber(val))
        transpilerError(`[number] expects a numeric value but got '${val}'.`);
    if (inSeq) return `${getIndent(depth)}- ${val}\n`;
    const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
    if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
    return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
}, { handleAst: true });
```

---

## Step 10 — Multi-line scalars: `[literal]` and `[folded]`

These blocks do not walk children — they use `textContent` directly. But they
still use `handleAst: true` to receive raw text without the engine processing it.

**`[literal]`** — preserves every line break. YAML writes this as `|`:

```js
YAML.register(["literal", "lit"], ({ props, textContent, depth = 0, inMapItem = false }) => {
    const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
    const childIndent = getIndent(depth + 1);
    const lines = textContent
        .split("\n")
        .map(l => l.trim())
        .filter((l, i, a) => !(i === 0 && l === "") && !(i === a.length - 1 && l === ""))
        .map(l => l === "" ? "" : `${childIndent}${l}`)
        .join("\n");
    if (inMapItem) return `${yamlKey(key)}: |\n${lines}\n${ITEM_SEP}`;
    return `${getIndent(depth)}${yamlKey(key)}: |\n${lines}\n`;
}, { handleAst: true });
```

Input:
```ini
[literal = "script"]
  set -euo pipefail
  echo "Building..."
  cargo build --release
[end]
```

Output:
```yaml
script: |
  set -euo pipefail
  echo "Building..."
  cargo build --release
```

**`[folded]`** — collapses line breaks into spaces. YAML writes this as `>`:

Same implementation, output uses `>` instead of `|`. Useful for long
descriptions that should read as one paragraph.

---

## Step 11 — `getUnknownTag` — the shorthand syntax

In the HTML mapper, `getUnknownTag` handles unknown blocks as HTML elements.
In YAML, it enables a shorthand syntax where the tag name itself is the key:

```ini
[host = "localhost" !]   → host: "localhost"
[port = 5432 !]          → port: 5432
[active = true !]        → active: true
```

Instead of writing `[str = "host", "localhost" !]` every time, the user can
write `[host = "localhost" !]` and the mapper infers the key from the tag name.

```js
YAML.getUnknownTag = function(node) {
    const key = node.id;
    return {
        render({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) {
            const raw = String(
                safeArg({ props, index: 0, key: "value", fallBack: textContent.trim() })
            ).trim();

            let val;
            if (raw === "true" || raw === "false") {
                val = raw;                              // boolean — bare
            } else if (raw !== "" && !isNaN(Number(raw))) {
                val = raw;                              // number — bare
            } else {
                val = yamlStr(raw);                     // string — double-quoted
            }

            if (inSeq) return `${getIndent(depth)}- ${val}\n`;
            if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
            return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
        },
        options: { handleAst: true }
    };
};
```

Type is inferred automatically from the value:

| Value you write | What YAML gets | Why |
| --------------- | -------------- | --- |
| `"hello"` | `key: "hello"` | String — quoted |
| `42` | `key: 42` | Number — bare |
| `3.14` | `key: 3.14` | Number — bare |
| `true` | `key: true` | Boolean — bare |

`getUnknownTag` also respects `depth`, `inSeq`, and `inMapItem` — so unknown
tags work correctly inside `[mapping]`, `[seq]`, and `[map-item]` without any
extra registration.

---

## Putting it all together

Here is a complete YAML document generated with the patterns above:

```ini
[doc-start !]

[mapping = "app"]
  [name = "myapp" !]
  [version = "1.0.0" !]
  [active = true !]

  [mapping = "server"]
    [host = "0.0.0.0" !]
    [port = 3000 !]
  [end]

  [seq = "tags"]
    [str = "web" !]
    [str = "api" !]
  [end]

  [seq = "admins"]
    [map-item]
      [str = "name", "Alice" !]
      [int = "uid", "1001" !]
    [end]
    [map-item]
      [str = "name", "Bob" !]
      [int = "uid", "1002" !]
    [end]
  [end]
[end]
```

Output:
```yaml
---
app:
  name: "myapp"
  version: "1.0.0"
  active: true
  server:
    host: "0.0.0.0"
    port: 3000
  tags:
    - "web"
    - "api"
  admins:
    - name: "Alice"
      uid: 1001
    - name: "Bob"
      uid: 1002
```

---

## HTML vs YAML — the core difference

| | HTML mapper | YAML mapper |
| - | ----------- | ----------- |
| **Does the child need to know where it is?** | No — every element just wraps content | Yes — same block renders differently at different depths and in sequences |
| **How children get their context** | They don't need it — the engine renders all children automatically | Parent passes `depth`, `inSeq`, `inMapItem` via `renderChild(child, { ... })` |
| **`handleAst: true` usage** | Only when you need to reorder, filter, or inspect children | Every block — structural and scalar |
| **`content` vs `textContent`** | `content` — the rendered HTML string | `textContent` — the raw text, picked up via `safeArg` fallback |
| **`getUnknownTag` purpose** | Render any HTML element without registering it | Enable shorthand key-value syntax using the tag name as the key |
