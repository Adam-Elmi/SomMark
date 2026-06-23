# SomMark <img src="assets/smark.logo.png" width="80" align="right">

[![npm version](https://img.shields.io/npm/v/sommark.svg)](https://www.npmjs.com/package/sommark)
[![Browser Support](https://img.shields.io/badge/browser-supported-brightgreen)](https://www.npmjs.com/package/sommark)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/sommark.svg)](https://github.com/Adam-Elmi/SomMark/blob/master/LICENSE)

**SomMark** is a template language that compiles to multiple output formats — HTML, JSON, YAML, TOML, CSV, Markdown, XML, and more.

Write your content once with a single consistent block syntax. Add loops, compile-time logic, and file imports. Compile to whatever format your project needs.

> **v5 is the official stable release and the recommended version to start with.**
> SomMark has reached its main goal — a single consistent block syntax that compiles to any output format. v5 is the last major version. Future releases will be minor updates or patches.

---

## Install

```bash
# CLI
npm install -g sommark

# Use it with your project
npm install sommark
```

---

## Showcase

**`team.smark`** (HTML mapper)

```ini
[import = Card: "./components/Card.smark" !]

${
  const team = [
    { name: "Adam",  role: "Founder",  avatar: "adam.jpg"  },
    { name: "Hawa",  role: "Engineer", avatar: "hawa.jpg"  },
    { name: "Ilham", role: "Designer", avatar: "ilham.jpg" },
  ];
  const year = new Date().getFullYear();
}$

[main = class: "team-page"]
  [h1]Our Team[end:h1]

  [section = class: "grid"]
    [for-each = ${ team }$, as: "member"]
      [Card = name: ${ member.name }$, role: ${ member.role }$]
        [img = src: ${ member.avatar }$, alt: ${ member.name }$ !]
      [end:Card]
    [end:for-each]
  [end:section]

  [footer]© ${ year }$ SomMark[end:footer]
[end:main]
```

**`components/Card.smark`**

```ini
[div = class: "card"]
  [h2]v{name}[end:h2]
  [p]v{role}[end:p]
  [slot!]
[end:div]
```

```bash
sommark --html team.smark
```

```html
<main class="team-page">
  <h1>Our Team</h1>
  <section class="grid">
    <div class="card">
      <h2>Adam</h2>
      <p>Founder</p>
      <img src="adam.jpg" alt="Adam">
    </div>
    <div class="card">
      <h2>Hawa</h2>
      <p>Engineer</p>
      <img src="hawa.jpg" alt="Hawa">
    </div>
    <div class="card">
      <h2>Ilham</h2>
      <p>Designer</p>
      <img src="ilham.jpg" alt="Ilham">
    </div>
  </section>
  <footer>© 2026 SomMark</footer>
</main>
```

---

## Output formats

| Format   | CLI Flag       |
| -------- | -------------- |
| HTML     | `--html`       |
| Markdown | `--markdown`   |
| MDX      | `--mdx`        |
| JSON     | `--json`       |
| JSONC    | `--jsonc`      |
| YAML     | `--yaml`       |
| TOML     | `--toml`       |
| CSV      | `--csv`        |
| XML      | `--xml`        |
| Text     | `--text`       |

---

## Features

### Blocks

Every tag is a block. Open with `[name]`, close with `[end:name]`. A plain `[end]` also works, but `[end:name]` is recommended for readability.

```ini
[article = class: "post"]
  [h1]Hello, SomMark[end:h1]
  [p]Structured content, zero guesswork.[end:p]
  [hr!]
[end:article]
```

Self-closing blocks carry no body — append `!` inside the tag:

```ini
[br!]
[img = src: "logo.png", alt: "Logo" !]
[input = type: "text", name: "email" !]
```

### Compile-time JavaScript

`${ }$` runs JavaScript at build time inside a sandboxed QuickJS VM. The `static` keyword is optional — `${ expr }$` and `static ${ expr }$` are identical.

The example below targets the **HTML mapper**:

```ini
${
  import pkg from "./package.json";
  const built = new Date().toISOString();
}$

[footer]
  ${ pkg.name }$ v${ pkg.version }$ — built ${ built }$
[end:footer]
```

Variables declared in one `${ }$` block are available in all blocks that follow in the same file.

### Loops

`[for-each]` iterates over any array. The current item is accessed via the `as:` alias. `${ i }$` gives the zero-based index.

The example below targets the **HTML mapper**:

```ini
${
  const links = ["Home", "Docs", "Blog", "Contact"];
}$

[nav]
  [ul]
    [for-each = ${ links }$, as: "link"]
      [li][a = href: "#"]${ link }$[end:a][end:li]
    [end:for-each]
  [end:ul]
[end:nav]
```

```html
<nav>
  <ul>
    <li><a href="#">Home</a></li>
    <li><a href="#">Docs</a></li>
    <li><a href="#">Blog</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>
```

### Shorthand key-value for data formats

When targeting JSON, YAML, or TOML, write key-value pairs using the tag name as the key. Type is inferred automatically — numbers stay numbers, `true`/`false` become booleans, everything else becomes a string.

The example below targets the **JSON mapper**:

```ini
[Object]
  [username = "Adam" !]
  [age = 25 !]
  [score = 9.8 !]
  [isAdmin = false !]
  [deletedAt = null !]
[end:Object]
```

```json
{
  "username": "Adam",
  "age": 25,
  "score": 9.8,
  "isAdmin": false,
  "deletedAt": null
}
```

Body form also works — useful for longer values:

```ini
[Object]
  [bio]Software developer based in Hargeisa.[end:bio]
[end:Object]
```

Generate config from data with a loop. The example below targets the **YAML mapper**:

```ini
${
  const services = [
    { name: "api",    port: 8080, replicas: 3 },
    { name: "worker", port: 8081, replicas: 2 },
  ];
}$

[seq = "services"]
  [for-each = ${ services }$, as: "s"]
    [map-item]
      [name = ${ s.name }$ !]
      [port = ${ s.port }$ !]
      [replicas = ${ s.replicas }$ !]
    [end:map-item]
  [end:for-each]
[end:seq]
```

```yaml
services:
  - name: "api"
    port: 8080
    replicas: 3
  - name: "worker"
    port: 8081
    replicas: 2
```

### Placeholders

Inject values at build time from your JavaScript config using `p{}`. Add a fallback with `|` in case a value is not set.

The example below targets the **HTML mapper**:

```ini
[div = class: "env-badge"]
  Environment: p{NODE_ENV}
[end:div]

[footer]Built with p{engine | "SomMark"}[end:footer]
```

```js
new SomMark({
  src,
  format: "html",
  placeholders: { NODE_ENV: "production" }
});
```

### Module system

Split templates into reusable `.smark` files. All `[import]` declarations must appear at the top of the file.

**Static injection** — insert a module with no props or body content:

```ini
[import = Nav: "./components/Nav.smark" !]
[import = Footer: "./components/Footer.smark" !]

[body]
  [$use-module = Nav !]
  [main]
    [p]Page content.[end:p]
  [end:main]
  [$use-module = Footer !]
[end:body]
```

**Component block** — pass props and body content. Inside the component, `v{}` reads the props and `[slot]` marks where the body goes:

```ini
[import = Card: "./components/Card.smark" !]

[Card = title: "Featured Post"]
  This content fills the slot inside the card.
[end:Card]
```

`Card.smark`:

```ini
[div = class: "card"]
  [h2]v{title}[end:h2]
  [div = class: "body"]
    [slot!]
  [end:div]
[end:div]
```

### Comments

Completely removed at build time — never appear in the output:

```ini
# single-line comment

###
  multi-line comment
  write as much as you need
###
```

---

## CLI

### Global

```bash
sommark -h, --help                        # show help message
sommark -v, --version                     # show version
sommark init                              # generate smark.config.js
sommark show config [file]                # show resolved config
sommark show --path-config [file]         # show path to active config file
sommark color on|off                      # help on enabling terminal colors
```

### Transpile

```bash
sommark --html input.smark                # compile to HTML
sommark --markdown input.smark            # compile to Markdown
sommark --mdx input.smark                 # compile to MDX
sommark --xml input.smark                 # compile to XML
sommark --json input.smark                # compile to JSON
sommark --jsonc input.smark               # compile to JSONC
sommark --toml input.smark                # compile to TOML
sommark --yaml input.smark                # compile to YAML
sommark --csv input.smark                 # compile to CSV
sommark --text input.smark                # compile to plain text
sommark --lex input.smark                 # print lexer token stream
sommark --parse input.smark               # print parser AST
```

### Output

```bash
sommark --html -p input.smark             # print output to console
sommark --html input.smark -o name ./dir/ # set output filename and directory
```

### Browser bundle

```bash
sommark bundle ./dist/                    # copy full bundle (JS + WASM)
sommark bundle ./dist/ --lite             # lite bundle — no WASM
sommark bundle ./dist/ --only-lexer       # lexer only
sommark bundle ./dist/ --only-parser      # lexer + parser only
```

---

## Programmatic API

**Node.js**
```js
import SomMark from "sommark";

const sm = new SomMark({
  src,
  format: "html",
  placeholders: { title: "My App" }
});

const output = await sm.transpile();
```

**Browser**
```js
import SomMark, { resolveBaseDir, renderCompiledHTML } from "sommark/browser";

const src = await fetch("./main.smark").then(r => r.text());

const sm = new SomMark({
  src,
  format: "html",
  baseDir: resolveBaseDir("./templates/"),
});

renderCompiledHTML(document.getElementById("app"), await sm.transpile());
```

---

## Configuration

Run `sommark init` to generate `smark.config.js`:

```js
export default {
  format: "html",
  removeComments: true,
  placeholders: {},
  importAliases: { "@": "./" },
  fallbackTarget: true,
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

All `${ }$` expressions run inside a **QuickJS sandbox** — isolated from the host process:

| Setting             | Default | Description                               |
| ------------------- | ------- | ----------------------------------------- |
| `allowRaw`          | `true`  | Allow JavaScript in compile-time blocks   |
| `maxDepth`          | `5`     | Maximum import nesting depth              |
| `timeout`           | `5000`  | Max execution time per script (ms)        |
| `allowFetch`        | `true`  | Allow network requests from scripts       |
| `allowHttp`         | `false` | Block plain HTTP — HTTPS only by default  |
| `allowedOrigins`    | `[]`    | Restrict fetch to specific domains        |
| `allowedExtensions` | `[]`    | Restrict which file types can be imported |
| `sanitize`          | `null`  | Custom function to sanitize HTML output   |

---

## Custom mappers

Define your own tags and rendering logic with the Mapper API:

```js
import SomMark, { Mapper } from "sommark";

const mapper = new Mapper();

mapper.register("alert", function({ content, props }) {
  const type = props.type || "info";
  return `<div class="alert alert-${type}">${content}</div>`;
});

const sm = new SomMark({
  src: `[alert = type: "warning"]Check your config.[end:alert]`,
  format: "html",
  mapperFile: mapper,
});
```

Full reference: [`docs/api/Mapper`](docs/api/Mapper)

---

## Documentation

| Topic            | Location                                   |
| ---------------- | ------------------------------------------ |
| Syntax Reference | [`docs/syntax/`](docs/syntax)              |
| Output Formats   | [`docs/languages/`](docs/languages)        |
| Core API         | [`docs/api/Core/`](docs/api/Core)          |
| Browser API      | [`docs/api/Browser/`](docs/api/Browser)    |
| Mapper API       | [`docs/api/Mapper/`](docs/api/Mapper)      |
| Sandbox API      | [`docs/api/Sandbox/`](docs/api/Sandbox)    |
| CLI Guide        | [`docs/cli/`](docs/cli)                    |
| Configuration    | [`docs/cli/config.md`](docs/cli/config.md) |

---

## License

[MIT](LICENSE) — Adam Elmi
