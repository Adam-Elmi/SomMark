# SomMark <img src="assets/smark.logo.png" width="80" align="right">

[![npm version](https://img.shields.io/npm/v/sommark.svg)](https://www.npmjs.com/package/sommark)
[![Browser Support](https://img.shields.io/badge/browser-supported-brightgreen)](https://www.npmjs.com/package/sommark)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/sommark.svg)](https://github.com/Adam-Elmi/SomMark/blob/master/LICENSE)

SomMark is a high-performance markup language designed for structured content. It acts as an extensible source language that can be transformed into multiple formats like HTML, JSON, MDX, XML, and Markdown.

SomMark uses explicit structural boundaries to ensure your document remains stable and predictable. It enables infinite nesting and provides total control over your contents.

> **v4.2.0 — Browser Support**: SomMark now compiles templates directly in the browser with no Node.js dependencies. Use the `sommark/browser` entry point with any bundler (Vite, Webpack, Rollup, esbuild). See [Browser API docs](docs/api/Browser/) for `resolveBaseDir` and `renderCompiledHTML`.

---

## Install

#### 1. Global (Command Line)
Install SomMark globally to use the `sommark` command.
```bash
npm install -g sommark
```

To verify it is working, check the version:
```bash
sommark --version
```

#### 2. Local (Project API)
Add SomMark to your project as a dependency:
```bash
npm install sommark
```

---

## Features

### Blocks

Blocks are the primary containers in SomMark, used to group, style, and organize structural content. A block starts with `[identifier]` and closes with a matching `[end]` or self-closing `!` if the block does not have any content, for example `[br!]` or `[img = src: "logo.png" !]`. 

```ini
[div = class: "container"]
  [h1]Welcome to SomMark[end]
  [p]Structured content, zero guesswork.[end]
  [hr = class: "divider" !]
[end]
```
[Read more about blocks](./docs/syntax/block.md)

### Self-Closing Blocks

Blocks that carry no body content close instantly with `!`.

```ini
[br!]
[hr = class: "divider" !]
[img = src: "logo.png", alt: "SomMark Logo" !]
```
[Read more about self-closing blocks](./docs/syntax/self-closing.md)

### Inline Elements

Apply styling or formatting to specific spans of text within a block using `(inline text)->(identifier = args)` or `(inline text)->(identifier: args)`. Internal newlines and duplicate spaces are automatically collapsed into a single space.

```ini
[p]
  This is (important text)->(bold).
  Visit the (SomMark Website)->(link = "https://sommark.org", target: "_blank").
[end]
```
[Read more about inline elements](./docs/syntax/inline.md)

### Props (Properties)

Pass metadata (called **Props**, similar to component properties in React/Vue) to Blocks, Inline Elements, and At-Blocks. SomMark supports positional, named, and mixed props with multiple value types (JS data, placeholders, and variables).

> [!NOTE]
> In the current major version, SomMark passes these properties under the **`args`** key to custom JavaScript `render` functions for backward compatibility. This will be renamed to `props` in the next major version.

* **Blocks**: Passed after `=` (e.g., `[div = "container"][end]`).
* **Inline Elements**: Passed after `=` or `:` inside the identifier parenthesis (e.g., `(text)->(link = "url")`).
* **At-Blocks**: Passed after `:` and terminated with `;` (e.g., `@_code: lang: "js";`).

**Blocks** — props come after `=`, separated by commas. Positional args have no key; named args use `key: value`.
```ini
[div = "container", class: "flex"][end]
#      ↑ positional   ↑ named
```

**Inline Elements** — same prop syntax, after `=` or `:` inside the identifier.
```ini
(Visit Website)->(link = "https://sommark.org", target: "_blank")
#                       ↑ positional url         ↑ named prop
```

**At-Blocks** — props follow `:` on the opening line and are terminated with `;`. The body is captured as raw text.
```ini
@_code: lang: "js", active: js{true}, user: v{userId};
#               ↑ string   ↑ native JS value  ↑ local variable
  console.log("Hello World");
@_end_@
```

**Static logic as a prop value** — any prop value can be a compile-time expression.
```ini
[Date = year: static ${ new Date().getFullYear() }$][end]
```

### At-Blocks -- Raw Content

At-blocks capture raw text. Brackets, tags, and comments inside them are treated as literal characters and never parsed.

```ini
@_code_@: lang: "javascript";
  const items = [1, 2, 3];
  // This [div] won't be parsed
@_end_@
```

### Comments

Single-line and multi-line. Completely removed from the compiled output.

```ini
# This is a single-line comment

###
  This is a multi-line comment.
  Nothing here reaches the output.
###
```

### Static Logic -- Compile-Time JavaScript

Run JavaScript during compilation inside a sandboxed QuickJS VM. The result replaces the block inline.

```ini
[footer]
  Copyright static ${ new Date().getFullYear() }$
[end]
```

Use it in props too:

```ini
[Date = year: static ${ new Date().getFullYear() }$][end]
```

### Runtime Logic -- Client-Side JavaScript

Preserve JavaScript in the compiled output. It runs in the browser, not during compilation.

```ini
[button]
  runtime ${
    self.addEventListener("click", () => alert("Hello from SomMark"))
  }$
  Click Me
[end]
```

### For-Each Loop

Iterate over arrays and render blocks for each item. Access the current item and its index.

```ini
[for-each = static ${ [{name: "Adam"}, {name: "Hawa"}, {name: "Ilham"}] }$, as: "user"]
  [li]static ${ user.name }$ -- position static ${ user_index }$[end]
[end]
```

### Modules and Components

Split your project into reusable `.smark` files. Import them, pass props, and inject body content through slots.

**`components/Card.smark`**
```ini
[div = class: "card"]
  [h2]v{title}[end]
  [div = class: "card-body"]
    [slot][end]
  [end]
[end]
```

**`page.smark`**
```ini
[import = Card: "./components/Card.smark"][end]

[Card = title: "Featured Product"]
  This content fills the slot inside the card.
[end]
```

You can also inject a module without passing body content:

```ini
[import = Card: "./components/Card.smark"][end]
[$use-module = Card][end]
```

---

## Output Formats

Write once, compile to any of these:

| Format   | CLI Flag     | Extension |
|----------|--------------|-----------|
| HTML     | `--html`     | `.html`   |
| Markdown | `--markdown` | `.md`     |
| MDX      | `--mdx`      | `.mdx`    |
| JSON     | `--json`     | `.json`   |
| JSONC    | `--jsonc`    | `.jsonc`  |
| XML      | `--xml`      | `.xml`    |
| Text     | `--text`     | `.txt`    |

---

## CLI

```
sommark init                           Create a smark.config.js file
sommark --html <file>                  Compile to HTML
sommark --markdown <file>              Compile to Markdown
sommark --html <file> -o <name> <dir>  Set output filename and directory
sommark --html --print <file>          Print compiled output to terminal
sommark --lex <file>                   Show the token stream
sommark --parse <file>                 Show the syntax tree
sommark show config [file]             Show the resolved configuration
sommark -v                             Show version
sommark -h                             Show help
```

---

## Programmatic Usage

**Node.js**
```js
import SomMark from "sommark";

const engine = new SomMark({
  src: '[h1]Hello World[end]',
  format: "html",
});

const output = await engine.transpile();
// <h1>Hello World</h1>
```

**Browser** (v4.2.0+)
```js
import SomMark, { resolveBaseDir, renderCompiledHTML } from "sommark/browser";

const src = await fetch("./main.smark").then(r => r.text());

const engine = new SomMark({
  src,
  format: "html",
  baseDir: resolveBaseDir("./templates/"), // resolves imports via fetch
});

renderCompiledHTML(document.getElementById("output"), await engine.transpile());
```

---

## Configuration

Run `sommark init` to generate a `smark.config.js` with all available settings:

```js
export default {
  format: "html",
  removeComments: true,
  generateRuntimeOutput: false,
  hideRuntimeOutput: false,
  customProps: [],
  placeholders: {},
  importAliases: { "@": "./" },
  fallbackTarget: "style",
  outputValidator: null,
  baseDir: null,
  showSpinner: true,
  security: {
    allowRaw: true,
    maxDepth: 5,
    timeout: 5000,
    allowFetch: true,
    allowHttp: false,
    allowedOrigins: [],
    allowedExtensions: [],
    sanitize: null,
  },
  outputDir: "./",
  outputFile: "output",
};
```

---

## Security

All embedded JavaScript runs inside a **QuickJS sandbox** with strict restrictions:

| Setting             | Default | What it does                                 |
|---------------------|---------|----------------------------------------------|
| `allowRaw`          | `true`  | Allow raw code in static blocks              |
| `maxDepth`          | `5`     | Maximum import nesting depth                 |
| `timeout`           | `5000`  | Script execution time limit (ms)             |
| `allowFetch`        | `true`  | Allow network requests from scripts          |
| `allowHttp`         | `false` | Block insecure HTTP (HTTPS only by default)  |
| `allowedOrigins`    | `null`  | Restrict fetch to specific domains           |
| `allowedExtensions` | `null`  | Restrict which file types can be imported    |
| `sanitize`          | `null`  | Custom function to sanitize HTML output      |

---

## Custom Output Rules

Define your own tags and rendering logic with the Mapper API:

```js
import SomMark, { Mapper } from "sommark";

const mapper = new Mapper("custom");

mapper.register("alert", (node) => {
  return `<div class="alert">${node.body}</div>`;
});

const engine = new SomMark({
  src: '[alert]Check your configuration.[end]',
  format: "html",
  mapperFile: mapper,
});

const output = await engine.transpile();
```

Full reference in [`docs/api/Mapper`](docs/api/Mapper).

---

## Documentation

| Topic            | Location                                      |
|------------------|-----------------------------------------------|
| Syntax Reference | [`docs/syntax/`](docs/syntax)                 |
| Core API         | [`docs/api/Core/`](docs/api/Core)             |
| Browser API      | [`docs/api/Browser/`](docs/api/Browser)       |
| Mapper API       | [`docs/api/Mapper/`](docs/api/Mapper)         |
| Sandbox API      | [`docs/api/Sandbox/`](docs/api/Sandbox)       |
| Output Formats   | [`docs/languages/`](docs/languages)           |
| CLI Guide        | [`docs/cli/`](docs/cli)                       |
| Configuration    | [`docs/cli/config.md`](docs/cli/config.md)    |

---

## License

[MIT](LICENSE) -- Adam Elmi
