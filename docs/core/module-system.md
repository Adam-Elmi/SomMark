# Module System

The SomMark Module System allows you to split large documents into smaller, reusable components. It uses a **Declare-then-Inject** pattern to ensure total control over where and when external content enters your document.

---

## 1. The Core Syntax

There are two steps to using a module:

### Step 1: Import (The Declaration)
Imports must be placed at the **very top** of your file. An import defines an `alias` (a nickname) for an external file.

```ini
[import = utils: "lib/formatting.smark"][end]
```

### Step 2: Use (The Injection)
To actually insert the content of that file, you use the `$use-module` block. You can use it multiple times or nested inside other blocks.

```ini
[div = class: "sidebar"]
  [$use-module = utils][end]
[end]
```

---

## 2. Native Block Integration

A key feature of the SomMark Module System is its **strict consistency**. Modules do not use "magical" one-off syntax; they are built using the standard **SomMark Block** rules:

*   **Mandatory Closing**: Like every other block, they must end with `[end]`.
*   **Positional & Named Args**: They follow the standard argument rules (e.g., `[import = myAlias: "path.smark"][end]`).
*   **Engine Integration**: The parser treats them as normal blocks initially, and the `resolveModules` utility then replaces them with the actual content during the structural transformation phase.

---

## 3. Under the Hood: Recursive Transpilation

When you call `[$use-module]`, SomMark doesn't just "paste" the text. It performs a **Recursive Parse**:

1.  **New Instance**: The engine creates a new, isolated `SomMark` instance for the sub-file.
2.  **Context Inheritance**: The sub-file inherits the parent's **Mapper**, **Placeholders**, and **Settings**, ensuring consistent styling across all files.
3.  **Virtual Identity**: The entire imported AST is wrapped in a "Virtual Block." This allows the engine to track exactly which file each node belongs to, ensuring absolute path resolution remains accurate even inside nested modules.

---

## 3. Safety & Performance

### Circular Dependency Protection
The system tracks an `importStack`. If `A.smark` imports `B.smark` which imports `A.smark`, the engine will detect the loop and throw a clear **Circular Dependency Error** instead of crashing.

### Top-Level Enforcement
To maintain clean document structures, the engine enforces a strict rule: `[import]` blocks **cannot** appear after any text or content. They must be the first things the parser sees.

### Unused Module Warnings
If you declare an `[import]` but never use it with `[$use-module]`, the engine will generate a warning to help you keep your codebase clean.

---

## 4. Why use Modules?

*   **Reusability**: Define a complex header or footer once and include it in every page.
*   **Organization**: Keep your main index file clean by moving large data structures or sections into sub-files.
