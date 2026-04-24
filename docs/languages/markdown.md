# Markdown Mapping Guide

The **Markdown Mapper** transforms SomMark into clean, professional-grade Markdown. It ensures your documents are fully compatible with platforms like GitHub, GitLab, Obsidian, and others, while providing an accurate safety net.

---

## 1. Lossless Hybrid Rendering

Unlike standard transpilers that lose data when converting to Markdown, SomMark uses a **Lossless Inheritance** model from the HTML Mapper.

*   **HTML Fallback**: If a tag is not a native Markdown identifier (like `[section]`, `[div]`, or `[details]`), it is rendered as clean, semantic HTML.
*   **Automatic Upgrades**: Standard Markdown markers have no native support for IDs or Classes. If you add attributes to a heading, SomMark automatically "upgrades" it to a real HTML element to preserve your metadata.

**SomMark Source:**
```re
# Standard Heading
[h1]Project Overview[end]

# Upgraded Heading (preserves ID)
[h2 = id: "setup"]Installation Guide[end]
```
**Markdown Result:**
```markdown
# Project Overview

<h2 id="setup">Installation Guide</h2>
```

---

## 2. Text Styles (Block & Inline)

SomMark's core styles are flexible and can be used as either **Blocks** (for large segments) or **Inlines** (for quick formatting within text).

### Bold (`bold`, `b`)
*   **Block**: `[bold]Significant emphasis[end] or [b]Significant emphasis[end]`
*   **Inline**: `(Text)->(b) or (Text)->(bold)`
*   **Output**: `**Significant emphasis**` / `**Text**`

### Italic (`italic`, `i`)
*   **Block**: `[italic]Subtle emphasis[end] or [i]Subtle emphasis[end]`
*   **Inline**: `(Text)->(i) or (Text)->(italic)`
*   **Output**: `*Subtle emphasis*` / `*Text*`

### Emphasis (`emphasis`, `em`)
*   **Block**: `[emphasis]Bold and Italic[end] or [em]Bold and Italic[end]`
*   **Inline**: `(Text)->(em) or (Text)->(emphasis)`
*   **Output**: `***Bold and Italic***` / `***Text***`

### Strikethrough (`strike`, `s`)
*   **Block**: `[strike]Deleted content[end] or [s]Deleted content[end]`
*   **Inline**: `(Text)->(s) or (Text)->(strike)`
*   **Output**: `~~Deleted content~~` / `~~Text~~`

### Code (`code`, `Code`)
*   **Inline**: `(const x = 1)->(code)` or `(const x = 1)->(Code)`
    *   **Output**: `` `const x = 1` ``
*   **At-Block**: Use for multi-line fenced code blocks with optional language support.
    *   `@_code_@: lang: "js"; console.log(1) @_end_@` 
    *   **Output**: ` ```js ... ``` `

---

## 3. Structural Content (Tables & Lists)

Raw Markdown is notorious for "indentation hell" in complex tables and nested lists. SomMark resolves this by treating them as **Structural Blocks**.

### Tables
SomMark tables are authored using clear boundaries for headers, rows, and cells.
```re
[Table]
  [header] 
    [row] 
      [cell]Feature[end]
      [cell]State[end]
    [end]
  [end]
  [body]
    [row] 
      [cell]Modules[end]
      [cell]Stable[end]
    [end]
  [end]
[end]
```

### Deeply Nested Lists
Supports both `dot` (unordered) and `number` (ordered) formats with reliable nesting.
```re
[List = "number"]
  [item] Level 1
    [List = "dot"]
      [item] Indented Item [end]
    [end]
  [end]
[end]
```

---

## 4. GitHub Flavored Markdown (GFM) Features

The mapper natively supports modern Markdown extensions used by GitHub and GitLab.

### Alerts & Quotes
The `quote` block recognizes standard GFM alert types: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION`.
```re
[quote = "TIP"]
  Pass types via positional arguments for cleaner code.
[end]
```

### Task Lists (Todo) 
Use the `todo` block inside lists to manage statuses.
```re
[List]
  [item] [todo = "x"] Core Documentation [end] [end]
  [item] [todo = ""] API Reference [end] [end]
[end]
```

---

## 5. The Smart Escaper

SomMark uses an intelligent protection layer that guards against accidental Markdown formatting:
*   **Start-of-Line Protection**: If you start a line with characters like `#`, `-`, or `1.`, the escaper automatically protects them so they don't trigger unwanted headings or lists.
*   **HTML Safety**: Raw `<tags>` inside your text are automatically turned into entities (`&lt;tag&gt;`) so they are readable as text rather than being swallowed by the browser or editor.

---