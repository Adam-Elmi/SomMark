# FORMATS

An object containing the set of officially supported output formats for the SomMark compiler.

---

**Syntax:**
```js
import { FORMATS } from "sommark";
```

**Property Reference Table:**

| Key | String Value | Output Type |
|:---|:---|:---|
| `htmlFormat` | `"html"` | Standard HTML layouts |
| `markdownFormat` | `"markdown"` | Standard Markdown documents |
| `mdxFormat` | `"mdx"` | JSX-compatible Markdown |
| `jsonFormat` | `"json"` | Structured clean JSON |
| `jsoncFormat` | `"jsonc"` | JSON with preserved comments |
| `xmlFormat` | `"xml"` | Valid XML 1.0 structural tags |
| `textFormat` | `"text"` | Pure plain-text layout extraction |

---

**Usage:**
```js
import { transpile, FORMATS } from "sommark";

const output = await transpile({
  src: "[h1]Hello World[end:h1]",
  format: FORMATS.htmlFormat
});
console.log(output);
// Output: <h1>Hello World</h1>
```

---

## Eliminating Guesswork (Case & Format Safety)

When specifying an output format, developers often guess whether the compiler expects `"md"` vs `"markdown"`, or `"text"` vs `"plain-text"` vs `"plain"`. 

Using the `FORMATS` constant object completely eliminates string guessing and runtime typos:

```js
import { transpile, FORMATS } from "sommark";

// Prevents guessing "md" vs "markdown"
await transpile({
  src: "[h1]Hello World[end:h1]",
  format: FORMATS.markdownFormat // Safely resolves to "markdown"
});

// Prevents guessing "plain-text" vs "text"
await transpile({
  src: "[h1]Hello World[end:h1]",
  format: FORMATS.textFormat // Safely resolves to "text"
});
```

[Read format.md for format configurations](format.md)

[Read transpile.md for pipelines settings](transpile.md)
