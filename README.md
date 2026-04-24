# SomMark <img src="assets/smark.logo.png" width="80" align="right">

SomMark is a high-performance markup language designed for structured content. It acts as an extensible source language that can be transformed into multiple formats like HTML, JSON, MDX, XML, and Markdown.

SomMark uses explicit structural boundaries to ensure your document remains stable and predictable. It enables infinite nesting and provides total control over your contents.

---

## Simple Showcase

SomMark uses blocks for structure. A block starts with `[identifier]` and must end with `[end]`.

### HTML
```ini
[h1]Welcome to SomMark[end]

[div = class: "main"]
  This is content inside a container block.
  [p]
    Blocks are the most important part of SomMark.
    (This is a span-like inline statement)->(css: "color: green")
  [end]
[end]
```

### JSON
SomMark can represent complex data structures through its specialized mappers.
```ini
[object]
  [string = key: "name"]Adam Elmi[end]
  [number = key: "age"]25[end]
  [array = key: "skills"]
    [string]JavaScript[end]
    [string]SomMark[end]
  [end]
[end]
```

### XML
SomMark produces clean, structured XML ideal for configuration and data manifests.
```ini
[xml = version: "1.0"][end]
[project = name: "SomMark-App"]
  [metadata]
    [author]Adam Elmi[end]
    [version]4.0.0[end]
  [end]
  [settings]
    [database = type: "postgres"]
      [host]localhost[end]
      [port]5432[end]
    [end]
  [end]
[end]
```

### MDX
Use the JavaScript data layer to pass native data to your components.
```ini
[h1]MDX Portfolio[end]

[Gallery = 
  images: js{["nature.jpg", "tech.jpg"]}, 
  active: js{true}
]
  This block uses native JS arrays and booleans.
[end]
```

### Markdown
Use placeholders to inject dynamic text into your templates.
```ini
[h1]Hello p{username}[end]

[quote]
  You are reading documentation on p{siteName}.
  SomMark is an extensible language.
[end]

[hr][end]
```

---

## How It Works

SomMark is an extensible language that processes content through a four-stage pipeline:

1.  **Lexing**: The engine scans the source and converts it into a stream of tokens.
2.  **Parsing**: Tokens are organized into a hierarchical tree called an **AST** (Abstract Syntax Tree).
3.  **Mapping**: This is the translation layer. You define how identifiers (like `[h1]`) look in the target language.
4.  **Transpilation**: The engine walks the AST and uses the Mapper to generate the final string output.

The **Module System** enables a "Declare-then-Inject" pattern, allowing you to import mappers and create scalable projects with full recursive support.

---

## Installation

Install the SomMark CLI globally:

```bash
npm install -g sommark
```

---

## Usage in Node.js

```javascript
import SomMark from "sommark";

const sm = new SomMark({
  src: "[h1]Hello World[end]",
  format: "html"
});

const output = await sm.transpile();
// <h1>Hello World</h1>
```

---

## Documentation

Read the full guides in the `docs/` folder:

*   **[Syntax Guide](docs/syntax/syntax.md)**: Rules for writing Blocks, At-Blocks, and Inlines.
*   **[Core Logic](docs/core/core.md)**: Deep dive into the engine architecture.
*   **[Mapper API](docs/core/mapper.md)**: How to create your own translation layers.
*   **[Module System](docs/core/module-system.md)**: Managing multi-file projects.
