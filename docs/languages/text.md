# Text (Plain-Text Extraction) Guide

The **Text Mapper** is a specialized output engine designed to extract pure, raw content from your SomMark source files. Instead of transforming SomMark syntax into another markup language (like HTML or MDX), it strips away all tag structures, headers, and comments to produce pristine, human-readable plain text.

> [!TIP]
> Plain-text extraction is perfect for **search engine indexing**, generating **SEO meta descriptions**, and building **CLI previews** where formatting tags are not required.

---

## 1. Using plain-text extraction

To request plain-text extraction, initialize the engine and specify `"text"` as the format:

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

## 2. Core Extraction Rules

The Text Mapper (`mappers/languages/text.js`) follows a strict set of extraction rules to ensure the resulting output is clean, readable, and free of syntax leftovers:

### 1. Tag & Block Stripping (`getUnknownTag`)
- **Type**: Block, Inline, and AtBlock Fallback
- **Behavior**: All block headers (like `[div]`, `[section]`), inline tags (like `(text)->(bold)`), and AtBlocks are completely stripped from the final output. The mapper recursively extracts and returns only their inner content.
- **Example**:
  ```ini
  [div]
    This is (important)->(bold) text inside a structural container.
  [end]
  ```
  **Plain-Text Output**:
  ```text
  This is important text inside a structural container.
  ```

### 2. Comments Omission (`comment` / `commentBlock`)
- **Type**: Block and Inline Comments
- **Behavior**: Unlike standard mappers that transform comments into markup tags (such as `<!-- comment -->`), the Text Mapper **always strips** comments and comment blocks entirely from the output, ensuring no internal developer notes leak into user-facing content.
- **Example**:
  ```ini
  [p]
    This is visible content.
    # This is a comment that will be omitted.
  [end]
  ```
  **Plain-Text Output**:
  ```text
  This is visible content.
  ```

### 3. Runtime Logic Omission (`runtimeLogic`)
- **Type**: Native Runtime Blocks (`runtime ${ ... }$`)
- **Behavior**: Standard client-side runtime logic (such as interactive script blocks) is **always stripped and omitted** from plain-text output to prevent client-side JavaScript from polluting your plain-text files.
- **Example**:
  ```ini
  [p]This paragraph is visible.[end]
  runtime ${
    console.log("This script will be completely stripped!");
  }$
  ```
  **Plain-Text Output**:
  ```text
  This paragraph is visible.
  ```

### 4. Build-Time Static Logic Evaluation (`STATIC_LOGIC`)
- **Type**: Native Static Blocks (`static ${ ... }$`)
- **Behavior**: Static logic blocks are executed at build-time. The evaluated return result is output literally, while the source logic code itself is cleanly stripped.
- **Example**:
  ```ini
  Current Version: static ${ SomMark.version }$
  ```
  **Plain-Text Output**:
  ```text
  Current Version: 4.1.0
  ```

### 5. Literal Raw Text (`text` / `inlineText` / `atBlockBody`)
- **Type**: Raw Content Nodes
- **Behavior**: Extracted text content is returned literally with **zero escaping**. Standard characters like `&` and `<` are preserved exactly as written in the source file, rather than being converted into HTML/XML entities.
- **Example**:
  ```ini
  Developers use & and < characters in code.
  ```
  **Plain-Text Output**:
  ```text
  Developers use & and < characters in code.
  ```

---

## 3. Formatting & Whitespace Controls

- **No Layout Alterations (`trimAndWrapBlocks: false`)**: The Text Mapper disables all block wrapping and trim controls. It strictly preserves your original whitespaces, indentation depths, and custom newlines from the source file, matching your authoring layouts.
- **Unescaped Outputs**: All special character markers (like escaped characters `\[` or `\#`) are resolved to their raw literal representations in the final string.

---

## 4. Key Use Cases

### 1. Search Engine Optimization (SEO)
Easily generate standard SEO `<meta name="description" content="..." />` tags by extracting the plain-text representation of your SomMark article template files in a single pass.

### 2. Search Engine Indexing
Index your documentation or blog databases using plain-text inputs. This prevents tags, brackets, and markup identifiers from polluting search results or throwing off keyword density scores.

### 3. CLI Terminals & Previews
Build terminal previews for your documentation libraries by showing the pure plain-text readable content of your files directly in standard terminal feeds.
