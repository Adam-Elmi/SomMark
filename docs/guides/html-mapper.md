# Creating an HTML Mapper

This guide walks you through building a mapper that renders SomMark blocks as
HTML. Every concept is shown with a SomMark input and its HTML output so you
can see exactly what each piece does.

By the end you will know:

- How to create a mapper and override its core methods
- How to register blocks that wrap content in HTML tags
- How to read props with `safeArg`
- How to build elements with `this.tag()`
- When to use `escape: false` and validator `rules`
- How `getUnknownTag` makes every HTML element work without registration
- Why HTML mappers almost never need `handleAst: true`

---

## Step 1 — Create the mapper

Use `Mapper.define()` to create a mapper and override its built-in methods in
one call.

```js
import { Mapper } from "sommark";

const HTML = Mapper.define({
    comment(text) { /* ... */ },
    text(text, options) { /* ... */ },
    runtimeLogic(code, isGlobal, parentId) { /* ... */ },
    getUnknownTag(node) { /* ... */ },
    options: { trimAndWrapBlocks: true }
});
```

`Mapper.define()` is a factory — it creates a `new Mapper()` and copies your
properties onto it. You could write `new Mapper()` and assign methods manually;
`define()` is just cleaner.

The methods you override here are called automatically by the engine. You are
not registering blocks yet — you are setting up how the mapper handles text,
comments, and logic that appear anywhere in the document.

---

## Step 2 — Handle plain text with `text()`

`text()` is called for every plain text node — any text between or around
blocks. Whatever you return from it goes into the final output.

For HTML, you want to escape special characters by default so that raw text
like `<script>` in user content does not break the page:

```js
text(text, options) {
    if (options?.escape === false) return text;
    return this.escapeHTML(text);
}
```

`this.escapeHTML` converts `<`, `>`, `&`, `"`, and `'` to their HTML entities.
It is built into every mapper — you do not need to import it.

The `options?.escape === false` check lets individual blocks opt out. A
`[script]` block passes `escape: false` in its options so its text content
passes through untouched.

> If you are building a non-HTML mapper and do not need text transformation,
> just `return text` — the base Mapper class does this by default and you can
> skip overriding `text()` entirely.

---

## Step 3 — Handle comments with `comment()`

`comment()` is called for every `# comment` or `### block ###` in the source.

For HTML, turn them into HTML comments:

```js
comment(text) {
    return `<!-- ${text} -->`;
}
```

SomMark source:
```ini
# This is a comment
[p]Hello[end:p]
```

Output:
```html
<!-- This is a comment -->
<p>Hello</p>
```

To strip all comments from the output, return `""`.

---

## Step 4 — Handle runtime logic with `runtimeLogic()`

`runtimeLogic()` is called for `@{ }@` blocks — JavaScript that runs in the
browser. For HTML, wrap them in `<script>` tags:

```js
runtimeLogic(code, isGlobal, parentId) {
    if (isGlobal) {
        return this.tag("script").body(`\n${code}\n`);
    }
    const self = parentId
        ? `const self = document.querySelector('[data-sommark-id="${parentId}"]');`
        : `const self = document.currentScript.parentElement;`;
    return this.tag("script").body(`\n(async function(){${self}\n${code}\n})();\n`);
}
```

For output formats that have no concept of runtime scripts (YAML, JSON, plain
text), leave this out — the default returns `""`.

---

## Step 5 — Register your first block

`register(id, renderFn, options?)` links a block name to a render function.

The simplest case: receive the rendered inner content and wrap it in an HTML
tag. The engine renders all children automatically and gives you the combined
result as `content`:

```js
HTML.register("section", function({ content }) {
    return this.tag("section").body(content);
});
```

SomMark input:
```ini
[section]
  [p]Hello[end:p]
  [p]World[end:p]
[end:section]
```

Output:
```html
<section>
  <p>Hello</p>
  <p>World</p>
</section>
```

The engine rendered `[p]` blocks for you. Your renderer never saw them
individually — it received the combined `<p>Hello</p><p>World</p>` string as
`content` and wrapped it.

> Use a standard `function` (not an arrow function `=>`) when you need `this`
> to access mapper utilities like `this.tag()`, `this.escapeHTML()`, or
> `this.md`. Arrow functions do not bind `this`.

---

## Step 6 — Build HTML elements with `this.tag()`

`this.tag(tagName)` returns a **TagBuilder** — a chainable object for
constructing HTML strings without manual string concatenation.

The main methods:

| Method | What it produces |
| ------ | ---------------- |
| `.body(content)` | `<tag>content</tag>` |
| `.selfClose()` | `<tag />` |
| `.attributes(props)` | Adds attributes from a plain object, one-to-one |
| `.smartAttributes(props, customProps, options)` | Like `.attributes()`, but maps unknown props to inline `style` automatically |

**`.body(content)` — wrap content:**

```js
HTML.register("article", function({ content }) {
    return this.tag("article").body(content);
});
```

Input: `[article]Text here[end:article]`
Output: `<article>Text here</article>`

**`.selfClose()` — void element:**

```js
HTML.register("br", () => {
    return this.tag("br").selfClose();
}, { rules: { is_empty_body: true } });
```

Input: `[br !]`
Output: `<br />`

**`.attributes(props)` — direct attribute mapping:**

Use for SVG or any tag where every prop maps directly to an HTML attribute:

```js
HTML.register("link", function({ props }) {
    return this.tag("link").attributes(props).selfClose();
}, { rules: { is_empty_body: true } });
```

Input: `[link = rel: "stylesheet", href: "/style.css" !]`
Output: `<link rel="stylesheet" href="/style.css" />`

**`.smartAttributes(props, this.customProps, this.options)` — intelligent mapping:**

Use for standard HTML elements. Props that are not valid HTML attributes are
converted to inline `style` values automatically:

```js
HTML.register("box", function({ props, content }) {
    return this.tag("div")
        .smartAttributes(props, this.customProps, this.options)
        .body(content);
});
```

Input: `[box = id: "main", color: "blue", padding: "10px"]Content[end:box]`
Output: `<div id="main" style="color:blue;padding:10px;">Content</div>`

---

## Step 7 — Read props with `safeArg`

`props` is a plain object. Positional args (no key name) get numeric string
keys starting at `"0"`. Named args also exist under their own key.

```ini
[img = "/photo.jpg", alt: "My photo" !]
```

```json
{ "0": "/photo.jpg", "alt": "My photo" }
```

`safeArg` reads the prop safely — it tries the positional index first, then
the named key, and returns a fallback if neither exists:

```js
HTML.register("img", function({ props }) {
    const src = this.safeArg({ props, index: 0, key: "src", fallBack: "" });
    const alt = this.safeArg({ props, index: 1, key: "alt", fallBack: "" });
    return this.tag("img").attributes({ src, alt }).selfClose();
}, { rules: { is_empty_body: true } });
```

This block works however the user writes it:

```ini
[img = "/photo.jpg", "My photo" !]         # positional
[img = src: "/photo.jpg", alt: "My photo" !]  # named
[img = "/photo.jpg", alt: "My photo" !]    # mixed
```

All three produce: `<img src="/photo.jpg" alt="My photo" />`

---

## Step 8 — Self-closing and void blocks

### Void elements — `rules.is_empty_body: true`

Some HTML elements never have a body (`<br>`, `<hr>`, `<!DOCTYPE>`). Tell the
engine this with `rules.is_empty_body: true`. If the user writes `[end:id]`,
the engine throws a build error instead of producing broken HTML:

```js
HTML.register(["DOCTYPE", "doctype"], () => {
    return "<!DOCTYPE html>";
}, { rules: { is_empty_body: true } });
```

Input: `[DOCTYPE !]`
Output: `<!DOCTYPE html>`

### Dual-mode blocks — `isSelfClosing`

Some blocks work in two modes depending on whether the user wrote `[id !]`
(inline) or `[id]...[end]` (fenced). `isSelfClosing` is `true` when the user
used the `!` form. Use it to branch:

```js
HTML.register("code", function({ props, content, isSelfClosing }) {
    if (isSelfClosing) {
        const text = this.safeArg({ props, index: 0, key: "text", fallBack: "" });
        return `<code>${this.escapeHTML(text)}</code>`;
    }
    const lang = this.safeArg({ props, index: 0, key: "lang", fallBack: "" });
    return `<pre><code class="language-${lang}">${content}</code></pre>`;
});
```

Inline:
```ini
The function [code = "greet()" !] returns a string.
```
```html
The function <code>greet()</code> returns a string.
```

Fenced:
```ini
[code = "js", smark-raw: true]
function greet() {
  const names = ["Ali", "Adam", "Elmi"];
  return names[0];
}
[end:code]
```
```html
<pre><code class="language-js">function greet() {
  const names = ["Ali", "Adam", "Elmi"];
  return names[0];
}</code></pre>
```

> `smark-raw: true` tells the lexer to skip parsing the body entirely — it is
> collected as a single raw text node. Without it, `[` and `]` inside code
> (arrays, bracket syntax) and `#` (Python/shell comments) would be misread as
> SomMark syntax and corrupt the output. Always use it for code blocks.
> See [`smark-raw`](../syntax/smark-raw.md).

---

## Step 9 — Raw output with `escape: false`

By default the engine escapes special characters inside every block's text
nodes. For blocks that must output raw HTML — `<script>`, `<style>`, `<pre>` —
that would corrupt the content.

Set `escape: false` to let text through unescaped:

```js
HTML.register("script", function({ content }) {
    return this.tag("script").body(content);
}, { escape: false });
```

Without `escape: false`, text like `if (a < b)` inside `[script]` would become
`if (a &lt; b)` — broken JavaScript.

```ini
[script = smark-raw: true]
  if (count < 10) {
    console.log("low");
  }
[end:script]
```

```html
<script>
  if (count < 10) {
    console.log("low");
  }
</script>
```

---

## Step 10 — Fall back for unknown blocks with `getUnknownTag`

When the engine encounters a block with no registered renderer, it calls
`getUnknownTag(node)`. You can return a renderer on the fly — or return `null`
to let the engine use its default error behavior.

The built-in HTML mapper uses this to make every HTML element work
automatically, without registering `[div]`, `[p]`, `[span]`, `[table]`, etc.
one by one:

```js
HTML.getUnknownTag = function(node) {
    const idLower = node.id.toLowerCase();
    const isVoid = VOID_ELEMENTS.has(idLower);
    const noEscape = ["code", "style", "script"].includes(idLower);

    return {
        render: function({ props, content, isSelfClosing }) {
            const el = this.tag(node.id)
                .smartAttributes(props, this.customProps, this.options);
            return (isVoid || isSelfClosing) ? el.selfClose() : el.body(content);
        },
        options: {
            escape: !noEscape,
            rules: { is_empty_body: isVoid }
        }
    };
};
```

Because of this, the user can write `[div]`, `[article]`, `[nav]`, `[main]`,
`[figure]` — any valid HTML tag — and the mapper renders it correctly.

If you want unknown blocks to be a hard error instead, return `null` from
`getUnknownTag`. The engine will throw a build-time error when it encounters an
unregistered block.

---

## Step 11 — Why HTML mappers almost never need `handleAst: true`

HTML rendering is about **wrapping** content, not **structuring** it.

When the engine renders `[div]`, it:
1. Renders all children inside it automatically
2. Gives you the combined result as `content`
3. You return `<div>` + content + `</div>` — done

You never need to see the individual children. The engine handles all of that
for you.

Compare this to YAML's `[seq]` block, which must use `handleAst: true`:

| | HTML `[div]` | YAML `[seq]` |
| - | ------------ | ------------ |
| **What children need to know** | Nothing — they just render | Whether they are inside a sequence (`inSeq: true`) and how deep (`depth`) |
| **What the parent does** | Wraps the combined output | Walks children with `renderChild`, passes `depth` and `inSeq` to each one |
| **Why `handleAst`?** | Not needed | Needed — each child renders differently based on where it lives |

**When you would use `handleAst: true` in an HTML mapper:**

- You need to **reorder** children — e.g. a card block that always renders
  `[head]`, then `[body]`, then `[foot]`, regardless of the order in the source
- You need to **filter** children — e.g. a menu that only renders `[item]`
  blocks and ignores everything else
- You need to **read a child's props** before deciding how to wrap it — e.g. a
  table where `child.props.span` controls the `colspan` attribute

For everything else, use `content`. The engine already rendered it for you.

---

## Putting it all together

A minimal self-contained HTML mapper that covers all the patterns above:

```js
import { Mapper } from "sommark";

const VOID = new Set(["br", "hr", "img", "input", "link", "meta", "source"]);
const RAW  = new Set(["script", "style", "code", "pre"]);

const HTML = Mapper.define({
    comment(text) {
        return `<!-- ${text} -->`;
    },
    text(text, options) {
        if (options?.escape === false) return text;
        return this.escapeHTML(text);
    },
    runtimeLogic(code, isGlobal) {
        return this.tag("script").body(`\n${isGlobal ? code : `(function(){\n${code}\n})();`}\n`);
    },
    getUnknownTag(node) {
        const id = node.id.toLowerCase();
        return {
            render: function({ props, content, isSelfClosing }) {
                const el = this.tag(node.id).smartAttributes(props, this.customProps, this.options);
                return (VOID.has(id) || isSelfClosing) ? el.selfClose() : el.body(content);
            },
            options: {
                escape: !RAW.has(id),
                rules: { is_empty_body: VOID.has(id) }
            }
        };
    },
    options: { trimAndWrapBlocks: true }
});

HTML.register(["DOCTYPE", "doctype"], () => "<!DOCTYPE html>", {
    rules: { is_empty_body: true }
});

HTML.register("img", function({ props }) {
    const src = this.safeArg({ props, index: 0, key: "src", fallBack: "" });
    const alt = this.safeArg({ props, index: 1, key: "alt", fallBack: "" });
    return this.tag("img").attributes({ src, alt }).selfClose();
}, { rules: { is_empty_body: true } });

HTML.register("code", function({ props, content, isSelfClosing }) {
    if (isSelfClosing) {
        const text = this.safeArg({ props, index: 0, key: "text", fallBack: "" });
        return `<code>${this.escapeHTML(text)}</code>`;
    }
    const lang = this.safeArg({ props, index: 0, key: "lang", fallBack: "" });
    return `<pre><code class="language-${lang}">${content}</code></pre>`;
}, { escape: false });

HTML.register("script", function({ content }) {
    return this.tag("script").body(content);
}, { escape: false });

export default HTML;
```

SomMark input:
```ini
[DOCTYPE !]
[html]
  [head]
    [title]My Page[end:title]
    [link = rel: "stylesheet", href: "/style.css" !]
  [end:head]
  [body]
    [h1]Hello World[end:h1]
    [img = "/photo.jpg", alt: "A photo" !]
    [p]Welcome to [code = "SomMark" !].[end:p]
  [end:body]
[end:html]
```

Output:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <h1>Hello World</h1>
    <img src="/photo.jpg" alt="A photo" />
    <p>Welcome to <code>SomMark</code>.</p>
  </body>
</html>
```

`[html]`, `[head]`, `[body]`, `[h1]`, `[p]`, `[title]`, `[link]` are all
unregistered — `getUnknownTag` handles every one of them.