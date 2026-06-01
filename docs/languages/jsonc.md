# JSONC (JSON with Comments) Mapping Guide

The **JSONC Mapper** extends the standard JSON Mapper to add native support for comments in your output. JSONC (JSON with Comments) is widely supported in modern editors and configuration ecosystems (such as VS Code's `settings.json` or `tsconfig.json`).

> [!TIP]
> Use the JSONC format when you want to compile your templates into structured JSON configurations while preserving helpful developer annotations, inline documentation, and structure guides.

---

## 1. Using JSONC

To compile your templates into JSON with comments, initialize the transpilation engine with the `"jsonc"` format:

```javascript
import SomMark from "sommark";

const sm = new SomMark({
  src: sourceText,
  format: "jsonc"
});

const jsoncString = await sm.transpile();
```

---

## 2. Core Inheritance & Shorthand Features

The JSONC Mapper (`mappers/languages/jsonc.js`) inherits all core layout and primitive parsing rules from the standard **[JSON Mapping Guide](./json.md)**:



---

## 3. Comment Formatting Rules

Unlike the standard JSON Mapper (which strips comments to maintain raw JSON specifications), the JSONC Mapper maps SomMark comments into standard JavaScript comment syntaxes:

### 1. Single-Line Comments (`#`)
- **SomMark Syntax**: `# This is a comment`
- **JSONC Output**: `// This is a comment`
- **Example**:
  ```ini
  [Object]
    # Set the user's primary nickname
    [string = key: "username"] Adam [end]
  [end]
  ```
  **JSONC Output**:
  ```json
  {
    // Set the user's primary nickname
    "username": "Adam"
  }
  ```

### 2. Multiline Comment Blocks (`###...###`)
- **SomMark Syntax**: Wrapped inside `###...###`.
- **JSONC Output**: Standard block comments `/* ... */`. 
  - **Single-Line Block Comments**: Formatted inline `/* comment text */`.
  - **Multi-Line Block Comments**: Automatically indented with child margin spaces inside `/*\n  line 1\n  line 2\n  */` blocks.
- **Example (SomMark)**:
  ```ini
  [Object]
    ###
      Exclude directories from transpilation
      to ensure build performance.
    ###
    [Array = key: "exclude"]
      [string = "node_modules" !]
    [end]
  [end]
  ```
- **Example (JSONC Output)**:
  ```json
  {
    /*
      Exclude directories from transpilation
      to ensure build performance.
    */
    "exclude": [
      "node_modules"
    ]
  }
  ```

---

## 4. Preserving & Stripping Comments (`removeComments`)

> [!IMPORTANT]
> **Default Engine Behavior**: By default, the SomMark transpilation engine has comment removal enabled (`removeComments: true`). In order to retain comments in your compiled JSONC output, **you must explicitly configure `removeComments: false`** in your engine initialization options.

**Developer Configuration (To Retain Comments):**
```javascript
const sm = new SomMark({
  src: sourceText,
  format: "jsonc",
  removeComments: false // Required: retains single-line and multiline comments in JSONC output
});
```

**Developer Configuration (To Strip Comments to Standard JSON):**
```javascript
const sm = new SomMark({
  src: sourceText,
  format: "jsonc",
  removeComments: true // Strips all comments, producing strictly compliant standard JSON
});
```

---

## 5. Complete Example

Using the JSONC Mapper allows you to maintain well-documented, clean template files while producing standard JSONC files for modern tooling.

**SomMark Source:**
```ini
[Object = key: "tsconfig"]
  # Compile options for the TypeScript compiler
  [Object = key: "compilerOptions"]
    [bool = key: "strict", value: true !]
    [string = key: "target", value: "ESNext" !]
  [end]

  ###
    Exclude directories from transpilation
    to ensure build performance.
  ###
  [Array = key: "exclude"]
    [string = "node_modules" !]
    [string = "dist" !]
  [end]
[end]
```

**JSONC Output:**
```json
{
  // Compile options for the TypeScript compiler
  "compilerOptions": {
    "strict": true,
    "target": "ESNext"
  },
  /*
    Exclude directories from transpilation
    to ensure build performance.
  */
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```
