# Directive Props (`smark-*`)

Directive props are special props that start with `smark-`. They control behavior rather than carry data. Unlike regular props, they are not meant to appear in the rendered output — they tell SomMark, the editor, or your mapper how to handle a block.

Any prop that starts with `smark-` is a directive prop. Everything else is a regular prop.

---

## Two Levels

Directive props fall into two levels depending on who handles them:

### Engine-Level

Read by SomMark at the lexer level to control how the block body is collected. Unlike tooling/mapper directives, this one affects processing before rendering — but it is still available as `directives.raw` in your render function.

| Prop | Value | What it does |
|------|-------|--------------|
| `smark-raw` | `true` | Skip body parsing — pass the body to your render function as plain text |

### Tooling / Mapper-Level

The parser separates these into a `directives` object (with the `smark-` prefix stripped from the key) and passes it to your render function alongside `props`. They never appear in `props`, so output functions like `attributes`, `smartAttributes`, and `jsxProps` will never write them to the output.

| Prop | Value | What it does |
|------|-------|--------------|
| `smark-syntax` | `"js"` \| `"css"` | Tell the editor which language the raw body is in (no build effect) |
| any `smark-*` you define | any | Instruct your own mapper how to render the block |

---

## `smark-raw` (Engine-Level)

By default, SomMark parses everything inside a block — nested blocks, variables, comments. `smark-raw: true` turns that off. The body is collected as plain text and handed to your render function unchanged.

**When to use it:** any block whose body contains characters SomMark would misread — most commonly `[` in code samples, or `#` in languages that use `#` for comments.

```ini
[code = lang: "js", smark-raw: true]
const colors = ["red", "green", "blue"];
const nums = [1, 2, 3];
[end]
```

```ini
[code = lang: "python", smark-raw: true]
# load the fileing them before producing output
with open("data.txt") as f:
    lines = f.readlines()
[end]
```

Both `true` and `"true"` are accepted. `smark-raw` is available as `directives.raw` in your render function — useful if a block optionally supports raw mode and the mapper needs to know. The mapper's normal escape step is also skipped, so apply escaping yourself if your format needs it:

```js
sm.register("code", ({ props, content }) => {
    const escaped = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    return `<pre data-lang="${props.lang}"><code>${escaped.trim()}</code></pre>`;
});
```

To write a literal `[` that would be read as `[end]`, use `\[`:

```ini
[code = lang: "ini", smark-raw: true]
[server]
host = localhost
\[end]
[end]
```

> For full details see [smark-raw](smark-raw.md).

---

## `smark-syntax` (Tooling-Level)

Tells the editor which programming language the block body is written in. Enables syntax highlighting, error checking, and auto-formatting inside the block in your editor.

Has no effect on the compiled output. Requires `smark-raw: true` — without a raw body there is nothing to highlight.

```ini
[style = smark-raw: true, smark-syntax: "css"]
body {
    margin: 0;
    padding: 0;
}
[end]
```

```ini
[script = smark-raw: true, smark-syntax: "js"]
const count = document.querySelectorAll("li").length;
console.log(count);
[end]
```

Supported values: `"js"`, `"css"`.

`smark-syntax` is available in your render function inside `directives`, not `props`. It never appears in the output.

---

## Mapper-Defined Directive Props

The `smark-*` convention is not limited to built-in props. Your own mapper can define and use `smark-*` props to control how a block is rendered.

This pattern keeps control props separate from data props and avoids name conflicts with standard HTML attributes. For example, a mapper could use `smark-md-format` on a heading to switch between HTML and Markdown output:

```ini
[h2 = smark-md-format: true]Introduction[end]
```

```js
MDX.register("h2", function ({ props, content, directives }) {
    // directives = { "md-format": true }  ← "smark-" prefix is stripped
    // props      = {}                      ← smark-* keys are never in props
    if (directives["md-format"]) return this.md.heading(content, 2);
    return this.tag("h2").jsxProps(props).body(content);
});
```

No cleanup needed — `smark-*` props are separated by the engine before your render function is called. `props` only contains regular props, so you can pass it directly to `jsxProps`, `attributes`, or `smartAttributes` without worrying about directive props leaking into the output.

---

## Accessing Directive Props

Directive props are in the `directives` object, not `props`. Access them directly by key — no `safeArg` needed since there is no index ambiguity:

```js
MDX.register("h2", function ({ props, content, directives }) {
    const mdFormat = directives["md-format"];
    if (mdFormat) return this.md.heading(content, 2);
    return this.tag("h2").jsxProps(props).body(content);
});
```

If you want a fallback default, a simple `??` is enough:

```js
const lang = directives["syntax"] ?? "text";
```

> The `smark-` prefix is stripped from all directive keys: `smark-raw` → `directives["raw"]`, `smark-md-format` → `directives["md-format"]`, `smark-syntax` → `directives["syntax"]`.

---

## Summary

| | Available in `directives`? | Available in `props`? | Who uses it |
|--|--|--|--|
| `smark-raw` | Yes — as `directives["raw"]` | No | Lexer (body collection) + your mapper |
| `smark-syntax` | Yes — as `directives["syntax"]` | No | Editor / LSP |
| Custom `smark-*` | Yes — prefix stripped | No | Your mapper |

- `smark-*` keys are never in `props` — the parser separates them into `directives` at parse time, with the `smark-` prefix stripped.
- All directive keys follow the same rule: `smark-md-format` → `directives["md-format"]`, `smark-raw` → `directives["raw"]`.

---

[← Back to Syntax Reference](syntax.md)
