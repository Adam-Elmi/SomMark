# Core API Reference

The Core API lets you use SomMark inside your Node.js or JavaScript applications programmatically.

## Installation

```bash
npm install sommark
```

---

## 1. The `transpile` function

This is the main function you will use. It converts SomMark source code into HTML, Markdown, or MDX.

**Usage:**

```javascript
import { transpile } from "sommark";

const output = await transpile({
  src: "[Block]Hello[end]",
  format: "html" // 'html' | 'markdown' | 'mdx' | 'text'
});

console.log(output);
```

### Options

| Option | Type | Description |
| :--- | :--- | :--- |
| `src` | string | The source code to compile. **Required**. |
| `format` | string | The target format. Defaults to `'html'`. |
| `includeDocument` | boolean | If `true`, wraps HTML output in `<html><body>...`. Default: `true`. |
| `mapperFile` | Mapper | A custom Mapper instance (see [Mapper API](./mapper.md)). |

---

## 2. Advanced: Lexer & Parser

If you want to access the internal steps of the compiler.

### `lex(source)`
Converts source code into a list of **Tokens**.

```javascript
import { lex } from "sommark";
const tokens = lex("[Block](Hello)->(bold)[end]");
```

### `parse(source)`
Converts source code (or tokens) into an **Abstract Syntax Tree (AST)**.

```javascript
import { parse } from "sommark";
const ast = parse("[Block]Content[end]");
```

---

## 3. The `SomMark` Class

If you prefer an object-oriented approach, you can use the `SomMark` class.

```javascript
import SomMark from "sommark";

const compiler = new SomMark({
  src: "Source Code",
  format: "html"
});

const html = await compiler.transpile();
```

---

> [!TIP]
> **Detailed API Docs:**
> For a deep dive into every method and property, check the [API Directory](./api/).
