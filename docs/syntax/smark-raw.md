# smark-raw

`smark-raw` is a reserved prop that tells SomMark to skip parsing a block's body. The body is collected exactly as written — SomMark syntax inside it is **not** processed, and the raw text is passed straight into the `content` and `textContent` of your render function.

---

## Syntax

```ini
[tag = smark-raw: true] raw body here [end:tag]
```

Both `true` (unquoted) and `"true"` (quoted) are accepted:

```ini
[code = smark-raw: true]...[end:code]
[code = smark-raw: "true"]...[end:code]
```

---

## How It Works

- The body is collected **at the lexer level** — SomMark does not parse blocks, run expressions, or process anything inside it.
- The `smark-raw` prop is **removed** before your render function is called — it does not appear in `props` and will never show up as an attribute in the mapper's output (e.g. an HTML or MDX attribute). All other props are passed through normally.
- `content` and `textContent` both receive the raw body string exactly as written.
- The block is still closed with `[end]` or `[end:name]` as normal.
- **No mapper escaping is applied.** Each mapper (html, mdx, markdown, xml…) normally runs the body through its own escape logic before passing it to the render function. With `smark-raw`, that step is skipped entirely. If your render function outputs the content into an escape-sensitive format, handle escaping yourself inside the function.

---

## Why You Need It

Without `smark-raw`, SomMark tries to parse everything inside a block. This breaks the moment the body contains `[` characters or `#` that would be misread as SomMark syntax.

**JavaScript arrays** — `[` and `]` get parsed as block tags:
```ini
# This breaks — SomMark tries to parse [1, 2, 3] as a block
[code]
const colors = ["red", "green", "blue"];
const nums = [1, 2, 3];
[end]
```

**Python comments** — `#` gets parsed as a SomMark comment and removed:
```ini
# This breaks — the # lines disappear
[code]
# load the file
with open("data.txt") as f:
    lines = f.readlines()
[end]
```

With `smark-raw: true`, the body is left completely alone:

```ini
[code = lang: "js", smark-raw: true]
const colors = ["red", "green", "blue"];
const nums = [1, 2, 3];
[end]
```

```ini
[code = lang: "python", smark-raw: true]
# load the file
with open("data.txt") as f:
    lines = f.readlines()
[end]
```

---

## Escaping `[end]` Inside a Raw Body

The only character sequence that needs escaping is one that would be read as the closing tag. Use `\[` to write a literal `[` in that position:

```ini
[code = lang: "ini", smark-raw: true]
[server]
host = localhost
\[end]
[end]
```

Output passed to render: `[server]\nhost = localhost\n[end]`

Any `[` that is **not** followed by the exact end tag text does not need escaping:

```ini
[code = lang: "js", smark-raw: true]
const a = [1, 2, 3];
const b = [4, 5, 6];
[end]
```

---

## Combining with Other Props

`smark-raw` can appear alongside other props. The other props reach your render function as usual:

```ini
[code = lang: "js", smark-raw: true]
const nums = [1, 2, 3];
[end]
```

```js
// Example: HTML mapper — escape the content before inserting into a tag
const escapeForHtml = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

sm.register("code", ({ props, content }) => {
    return `<pre data-lang="${props.lang}"><code>${escapeForHtml(content.trim())}</code></pre>`;
});

// <pre data-lang="js"><code>const nums = [1, 2, 3];</code></pre>
```

> `content` arrives unescaped — the mapper's normal escape step is skipped. If your render function writes into a format that needs escaping (html, xml, mdx…), apply it yourself as shown above.

---

## With `handleAst: true`

When `smark-raw: true` and `handleAst: true` are both set, `ast.body` contains a single `Text` node with the raw body string — the same value as `content`:

```js
sm.register("code", function({ content, ast }) {
    const raw = ast.body[0]?.text; // same value as content
    return `<pre><code>${raw.trim()}</code></pre>`;
}, { handleAst: true });
```

---

[← Back to Syntax Reference](syntax.md)
