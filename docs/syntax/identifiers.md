# Node Identifiers

In SomMark V4, every structural element (Block, At-Block, or Inline) is defined by an **Identifier**. This ID tells the engine which mapper function to execute when rendering the node.

---

## 1. Syntax & Lexical Rules

SomMark V4 uses element-specific character sets to ensure maximum predictability and performance.

### I. Allowed Characters
All identifiers support this primary character set:
*   **Alphanumeric**: `a-z`, `A-Z`, `0-9` (No restriction on starting with digits).
*   **Symbols**: Hyphens `-`, Underscores `_`, and Dollar signs `$`.

### II. The Colon Constraint (`:`)
The colon is a special character in SomMark V4. Its support varies by element type:

| Element Type | Colon Support | Reason |
| :--- | :--- | :--- |
| **Blocks** | **Allowed** | Used for namespacing and grouping (e.g., `[ui:card]`). |
| **Inlines** | **Forbidden** | Reserved as an identifier and arguments separator (e.g., `(text)->(format: bold, italic, underline)`). |
| **At-Blocks** | **Forbidden** | Reserved as an identifier and arguments separator in the header (e.g., `@_code_@: lang:js, filename: index.js;console.log("Hello World");@_end_@`). |

> [!CAUTION]
> Attempting to use a colon in an **Inline** or **At-Block** identifier will trigger a **Parser Error**. This is a core design choice to keep headers clean and unambiguous.

---


## 2. Whitespace Handling
The parser is **Junk-Aware**. You can include spaces around an identifier inside its brackets for readability, but you **cannot** include a space within the identifier name itself.

*   `[  tag  ]` → **Valid** (Spaces are trimmed).
*   `[my tag]` → **Parser Error** (Space splits the ID).

---

## 3. Reserved Keywords

Certain IDs are reserved for core engine features:
*   **`[end]`**: Used to close all blocks.
*   **`[import]`**: Used for module declarations.
*   **`[$use-module]`**: Used for module injection.
