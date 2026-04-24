# Text (Plain-Text Extraction) Guide

The **Text Format** is a special output mode in SomMark designed for extracting pure content from your source files. Unlike other mappers that transform SomMark into another language (HTML, MDX, etc.), the Text format focuses on stripping away all structural identifiers and returning human-readable text.

> [!TIP]
> The Text format is ideal for **search indexing**, generating **CLI previews**, or creating **SEO meta descriptions** where structural tags are not required.

## 1. Using the Text Format

To request plain-text extraction, set the `format` option to `"text"` during transpilation:

```javascript
import SomMark from "sommark";

const sm = new SomMark({
  src: "[h1]Hello World[end]",
  format: "text"
});

const output = await sm.transpile();
// Output: "Hello World"
```

---

## 2. Core Behavior

The Text format follows a specific extraction logic to ensure the resulting text is clean and readable:

### Whitespace Preservation
Following SomMark v4 standards, the Text format **preserves all original whitespaces and newlines** from the source. It does not inject artificial spacing, ensuring the layout matches your authoring intent.

### Identifier Stripping
All SomMark-specific syntax is stripped:
- **Blocks**: `[id] ... [end]` tags are removed.
- **Inlines**: `(content)->(id)` markers are removed, keeping only the `content`.
- **At-Blocks**: `@_id_@; ... @_end_@` tags are removed, keeping the raw inner body.

### Recursive Extraction
The engine recursively extracts text from nested structures. If you have a block inside a block, the Text format will drill down until it reaching the raw text nodes.

---

## 3. Examples

### Nested Blocks
```re
[div]
  [p]This is a nested paragraph.[end]
[end]
```
**Output:**
```text
This is a nested paragraph.
```

### Inline Content
```re
This is a (flexible)->(bold) and (powerful)->(italic) engine.
```
**Output:**
```text
This is a flexible and powerful engine.
```

### At-Blocks (Raw Extraction)
At-Blocks are returned as-is without any escaping, which is perfect for extracting code comments or raw documentation snippets.
```re
@_quote_@;
  "Simplicity is the ultimate sophistication."
@_end_@
```
**Output:**
```text
"Simplicity is the ultimate sophistication."
```

---

## 4. Why use the Text Format?

### 1. Search Engine Optimization (SEO)
When generating meta descriptions for your web pages, you need a clean string without HTML tags or Markdown symbols. The Text format provides a "one-click" way to get this string from your templates.

### 2. Search Indexing
If you are building a search feature for your documentation, you should index the plain-text version of your files. This prevents structural tags from polluting your search results.

### 3. CLI and Terminal Tools
If you are building a CLI tool that previews SomMark files in the terminal, the Text format allows you to display the content without the distraction of raw syntax.

---

## 5. Pro Tips

1.  **Comment Stripping**: If you enable `removeComments: true` in your SomMark settings, comments will also be excluded from the text output.
2.  **Unescaped Content**: Unlike HTML mapping, the Text format does **not** escape characters like `&` or `<`. You get the exact characters written in your source.
