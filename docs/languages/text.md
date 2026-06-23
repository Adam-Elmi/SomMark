# Text Mapper

The Text Mapper pulls the plain readable text out of a SomMark file. It removes all blocks, comments, and scripts. The output is plain text — no markup, no brackets.

The idea is simple: write your content in SomMark once, then use `format: "text"` when you need a plain-text version. No separate file to maintain.

---

## Why Use the Text Mapper

| Use case | How |
| :--- | :--- |
| **SEO meta descriptions** | Pull plain text from your content to fill in `<meta name="description">` |
| **Search indexing** | Index content as clean text — no HTML brackets affecting keyword scores |
| **CLI previews** | Show readable content in the terminal without a browser |
| **Word / character counters** | Count content length on clean text, not markup |

---

## 1. Setup

```javascript
import SomMark from "sommark";

const sm = new SomMark({
  src: "[h1]Hello World[end:h1]",
  format: "text"
});

const output = await sm.transpile();
// Output: "Hello World"
```

---

## 2. What Gets Removed

### Block Wrappers

All block wrappers (`[div]`, `[section]`, etc.) are removed. Only the text inside is kept.

```ini
[div]
  This is important text inside a container.
[end:div]
```

```
This is important text inside a container.
```

### Comments

Comments (`#` and `###...###`) are always removed — they never appear in the output.

```ini
[p]
  This is visible content.
  # This comment is omitted.
[end:p]
```

```
This is visible content.
```

### Runtime Blocks

`runtime ${}$` blocks are removed. JavaScript that runs in the browser does not belong in plain text.

```ini
[p]This paragraph is visible.[end:p]
runtime ${
  console.log("Stripped.");
}$
```

```
This paragraph is visible.
```

### Static Blocks

`${}$` blocks run at build time and their result is included in the output. The code itself is not included. (`static` keyword is optional — `${ expr }$` and `static ${ expr }$` are the same.)

```ini
Current Version: ${ SomMark.version }$
```

```
Current Version: 5.0.0
```

### Raw Text

Text is output exactly as written. Characters like `&` and `<` are not escaped — they stay as you wrote them.

```ini
Developers use & and < in code.
```

```
Developers use & and < in code.
```

---

## 3. Formatting

- **Whitespace is kept** — the original whitespace, indentation, and line breaks from your source stay as-is.
- **Escape sequences** — sequences like `\[` and `\#` become their literal characters (`[`, `#`).
