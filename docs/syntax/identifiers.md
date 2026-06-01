# Node Identifiers

Identifiers define every structural element (Block, At-Block, or Inline) in SomMark. They dictate which mapper function executes when rendering a node.

---

## 1. Allowed Characters

Identifiers must follow these character set rules:
* **Alphanumeric:** `a-z`, `A-Z`, `0-9` (can start with digits).
* **Special Symbols:** Hyphens `-`, Underscores `_`, and Dollar signs `$`.

---

## 2. The Colon Constraint (`:`)

Support for colons (`:`) inside identifier names varies strictly by element type:

| Element Type | Colon Support | Syntax Example | Rationale |
| :--- | :--- | :--- | :--- |
| **Blocks** `[ ]` | **Allowed** | `[ui:card] ... [end]` | Used for namespacing and styling groups. |
| **Inlines** `( )->( )` | **Forbidden** | `(text)->(bold)` | Reserved as the arguments separator. |
| **At-Blocks** `@_ _@` | **Forbidden** | `@_code_@ ... @_end_@` | Reserved as the arguments separator in the header. |

> [!CAUTION]
> Using a colon in an **Inline** or **At-Block** identifier name will trigger a **Parser Error**.

---

## 3. Whitespace & Junk Handling

The parser is completely **junk-aware**. You can include spaces around an identifier for readability, but a space *inside* the name is forbidden.

| Smark Input | Status | Result |
| :--- | :--- | :--- |
| `[  my-tag  ]` | **Valid** | Spaces are stripped, parsed as identifier `my-tag`. |
| `[my tag]` | **Error** | Whitespace inside identifier triggers a Parser Error. |

---

## 4. Reserved Keywords

The following identifiers are reserved for core features and cannot be used as custom block or inline names:

* **`end`**: Closes active blocks (`[end]`).
* **`import`**: Defines module imports (`[import = ...][end]`).
* **`$use-module`**: Injects imported modules (`[$use-module = ...][end]`).
* **`slot`**: Acts as component injection placeholders (`[slot][end]` or `[slot!]`).
* **`for-each`**: Triggers compile-time loop evaluation (`[for-each = ...][end]`).

