# Markdown Mapping Guide

The **Markdown Mapper** transforms SomMark structures into clean, professional-grade Markdown. It ensures your documents are fully compatible with platforms like GitHub, GitLab, Obsidian, and others, while providing an accurate safety net and seamless hybrid rendering fallbacks.

---

## 1. Lossless Hybrid Rendering

Unlike standard transpilers that lose attributes or nested layout blocks during Markdown conversion, SomMark uses a **Lossless Inheritance** model from the HTML Mapper.

*   **HTML Fallback**: If a tag is not a natively supported Markdown structure (like `[section]`, `[div]`, or `[details]`), the mapper automatically falls back to rendering clean, semantic HTML.
*   **Automatic Attribute Upgrades**: Standard Markdown markers (like headings or paragraphs) do not natively support attributes like `id` or `class`. If you attach attributes to these tags, SomMark automatically "upgrades" the output to standard HTML tags to preserve your custom metadata.

**SomMark Source:**
```ini
# Standard Heading
[h1]Project Overview[end]

# Upgraded Heading (preserves custom attributes)
[h2 = id: "setup", class: "header-accent"]Installation Guide[end]
```
**Markdown Result:**
```markdown
# Project Overview

<h2 id="setup" class="header-accent">Installation Guide</h2>
```

---

## 2. Core Text Styles & Formatting

SomMark's text styling tags are highly flexible and can be applied as either **Blocks** (for large text segments) or **Inlines** (for inline styling using arrow syntax).

### 1. Bold (`bold` / `b`)
- **Type**: Block, Inline
- **Purpose**: Applies bold formatting to the wrapped content.
- **Example (Block)**: `[bold]Important notice[end]` or `[b]Important notice[end]`
- **Example (Inline)**: `Make this (text)->(b) bold.`
- **Output Markdown**: `**Important notice**` / `Make this **text** bold.`

### 2. Italic (`italic` / `i`)
- **Type**: Block, Inline
- **Purpose**: Applies italic formatting to the wrapped content.
- **Example (Block)**: `[italic]Subtle emphasis[end]` or `[i]Subtle emphasis[end]`
- **Example (Inline)**: `Make this (text)->(i) italic.`
- **Output Markdown**: `*Subtle emphasis*` / `Make this *text* italic.`

### 3. Emphasis (`emphasis` / `em`)
- **Type**: Block, Inline
- **Purpose**: Applies both bold and italic formatting simultaneously.
- **Example (Block)**: `[emphasis]Extremely important[end]`
- **Example (Inline)**: `Make this (text)->(em) stand out.`
- **Output Markdown**: `***Extremely important***` / `Make this ***text*** stand out.`

### 4. Strikethrough (`strike` / `s`)
- **Type**: Block, Inline
- **Purpose**: Draws a horizontal line through the wrapped content.
- **Example (Block)**: `[strike]Outdated information[end]`
- **Example (Inline)**: `This is (wrong)->(s) correct.`
- **Output Markdown**: `~~Outdated information~~` / `This is ~~wrong~~ correct.`

### 5. Code (`code` / `Code`)
- **Type**: Inline, AtBlock (Unescaped)
- **Purpose**: Formats code. Renders inline backticks for inline text, or fenced code blocks for AtBlocks.
- **Example (Inline)**: `Refer to (const val = 1)->(code).`
- **Example (AtBlock)**:
  ```ini
  @_code_@: lang: "js";
    console.log("Hello, World!");
  @_end_@
  ```
- **Output Markdown**:
  `` Refer to `const val = 1`. ``
  
  ```js
  console.log("Hello, World!");
  ```

### 6. Escape / Literal (`escape` / `e`)
- **Type**: Block, Inline
- **Purpose**: Escapes special Markdown formatting characters within the enclosed content to output them as literal characters.
- **Example (Block)**: `[escape]*This will not be italic*[end]`
- **Example (Inline)**: `This is a literal (\*starred\* text)->(e).`
- **Output Markdown**: `\*This will not be italic\*` / `This is a literal \*starred\* text.`

---

## 3. Links & Images

The mapper provides dedicated tags to render clean Markdown links and images with optional title parameters.

### 1. Links (`link`)
- **Type**: Block, Inline
- **Purpose**: Generates standard Markdown hyperlinks.
- **Example (Block)**: `[link = src: "https://example.com", title: "Go Home"]Visit Website[end]`
- **Example (Inline)**: `Visit our (Website)->(link: "https://example.com").`
- **Output Markdown**: `[Visit Website](https://example.com "Go Home")` / `Visit our [Website](https://example.com).`

### 2. Images (`image`)
- **Type**: Block (Self-closing)
- **Purpose**: Renders Markdown image embeddings. This tag is strictly self-closing and forbids an internal body.
- **Example**: `[image = alt: "Logo", src: "images/logo.png", title: "Brand Logo"][end]`
- **Output Markdown**: `![Logo](images/logo.png "Brand Logo")`

---

## 4. Structural Content

Structural elements like tables, nested lists, and thematic breaks are strictly validated and formatted to avoid the standard syntax fragility of raw Markdown.

### 1. Horizontal Rule (`hr`)
- **Type**: Block (Self-closing)
- **Purpose**: Inserts a horizontal thematic break. Supports custom rule markers (like `-`, `*`, or `_`).
- **Example**: `[hr = "*"][end]`
- **Output Markdown**: `***`

### 2. Tables (`Table`, `header`, `body`, `row`, `cell`, `th`, `td`)
- **Type**: Block (Structural)
- **Purpose**: Authoritative compilation of GFM table structures, organizing headers, rows, and cells cleanly.
- **Example**:
  ```ini
  [Table]
    [header]
      [row]
        [cell]Feature[end]
        [cell]Status[end]
      [row][end]
    [end]
    [body]
      [row]
        [cell]Imports[end]
        [cell]Stable[end]
      [end]
    [end]
  [end]
  ```
- **Output Markdown**:
  ```markdown
  | Feature | Status |
  | --- | --- |
  | Imports | Stable |
  ```

### 3. Lists (`List` / `list`, `item` / `Item`)
- **Type**: Block (Structural)
- **Purpose**: Renders clean unordered lists (using symbols like `dot`, `*`, `+`) or ordered lists (`number` or `ol`) with deep nested list capabilities.
- **Example (Unordered with nesting)**:
  ```ini
  [List = "dot"]
    [item] Main Item 1
      [List = "dot"]
        [item] Sub Item A [end]
      [end]
    [end]
    [item] Main Item 2 [end]
  [end]
  ```
- **Output Markdown**:
  ```markdown
  - Main Item 1
    - Sub Item A
  - Main Item 2
  ```

---

## 5. GitHub Flavored Markdown (GFM) Features

The mapper implements specialized GFM layout additions to produce modern docs structures.

### 1. Alerts & Quotes (`quote`)
- **Type**: Block
- **Purpose**: Generates standard blockquotes, supporting modern GitHub alert syntax types (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION`).
- **Example (Alert)**:
  ```ini
  [quote = "TIP"]
    Keep your mappers lightweight and modular.
  [end]
  ```
- **Example (Standard Quote)**:
  ```ini
  [quote]
    Simplicity is the ultimate sophistication.
  [end]
  ```
- **Output Markdown**:
  ```markdown
  > [!TIP]
  > Keep your mappers lightweight and modular.
  ```
  ```markdown
  > Simplicity is the ultimate sophistication.
  ```

### 2. Task Lists (`todo`)
- **Type**: Block
- **Purpose**: Generates interactive checklist markdown blocks. Pass `x`, `done`, or `-` to signify a completed task.
- **Example**:
  ```ini
  [List]
    [item] [todo = "x"] Core Documentation [end] [end]
    [item] [todo = ""] API References [end] [end]
  [end]
  ```
- **Output Markdown**:
  ```markdown
  - [x] Core Documentation
  - [ ] API References
  ```

---

## 6. Utility Outputs

### 1. `raw` AtBlock
- **Type**: AtBlock (Unescaped)
- **Purpose**: Bypasses the Markdown escaping layer and parser entirely to output raw, unescaped text or HTML markup. This is extremely useful for inserting raw platform-specific snippets or advanced formatting that should not be touched by the mapper.
- **Example**:
  ```ini
  @_raw_@;
    <details><summary>Click to Expand</summary>Hidden Details</details>
  @_end_@
  ```
- **Output Markdown**:
  ```html
  <details><summary>Click to Expand</summary>Hidden Details</details>
  ```

---

## 7. The Smart Escaper

SomMark uses an intelligent, context-aware protection engine to guard special characters against causing unexpected formatting bugs in downstream Markdown parsers:

*   **Start-of-Line Escaping**: Special character sequences at the start of a line (such as `#`, `-`, `+`, `*`, or digit sequences like `1.`) are automatically escaped with backslashes so they are printed as literal text instead of triggering unwanted headings or lists.
*   **Math & Special Symbols**: Protects special constructs and mathematical symbols from being parsed as italic boundaries.
*   **HTML Tag Safety**: Raw HTML-like brackets (`<tags>`) inside standard text nodes are automatically encoded to HTML entities (`&lt;tags&gt;`) to ensure editors and platforms render them as literal readable text rather than trying to parse them as DOM elements.