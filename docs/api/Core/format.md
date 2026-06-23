# format

The target compilation output format.
---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format })

// 2. In transpile options
transpile({ src, format })
```

**Supported Formats:**
*   `"html"` - Standard HTML.
*   `"markdown"` - Markdown formatting.
*   `"mdx"` - React/JSX-compatible Markdown.
*   `"json"` - Structured JSON.
*   `"jsonc"` - JSON with comments.
*   `"xml"` - Strict XML 1.0 layouts.
*   `"csv"` - Comma-separated values.
*   `"text"` - Stripped plain-text extraction.

---

**Usage:**
```js
import { transpile } from "sommark";

const output = await transpile({
  src: "[h1]Header[end:h1]",
  format: "markdown"
});
console.log(output);
// Output: # Header
```

---

### Example: Unrecognized Format Validation

Providing an unsupported format or omitting the `format` parameter throws a `Runtime Error`:

```javascript
import { transpile } from "sommark";

// Throws: Missing Target Format
try {
  await transpile({ src: "[h1]Hello[end:h1]" });
} catch (err) {
  console.error(err.message);
  // Output: The 'format' parameter is required for transpilation...
}

// Throws: Unknown Format
try {
  await transpile({ src: "[h1]Hello[end:h1]", format: "yaml" });
} catch (err) {
  console.error(err.message);
  // Output: Unknown Format: Mapper for format 'yaml' not found.
}
```

[Read src.md for raw template configuration](src.md)

[Read transpile.md for pipeline settings](transpile.md)
