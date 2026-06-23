# Node Identifiers

Identifiers name every block in SomMark. They tell the mapper which render function to run.

---

## 1. Allowed Characters

Identifiers must follow these character set rules:
* **Alphanumeric:** `a-z`, `A-Z`, `0-9` (can start with digits).
* **Special Symbols:** Hyphens `-`, Underscores `_`, and Dollar signs `$`.

---

## 2. Colons in Identifiers

Block identifiers allow colons (`:`) for namespacing — for example, to group related blocks under a shared prefix:

```ini
[ui:card] ... [end]
[ui:button] ... [end]
```

---

## 3. Whitespace Handling

You can include spaces around an identifier for readability, but a space *inside* the name is not allowed.

| Smark Input | Status | Result |
| :--- | :--- | :--- |
| `[  my-id  ]` | **Valid** | Spaces are stripped, parsed as identifier `my-id`. |
| `[my tag]` | **Error** | Whitespace inside identifier triggers a Parser Error. |

---

## 4. Reserved Keywords

The following identifiers are reserved for core features and cannot be used as custom block names:

* **`end`**: Closes active blocks (`[end]`).
* **`import`**: Defines module imports (`[import = ...][end]`).
* **`$use-module`**: Injects imported modules (`[$use-module = ...][end]`).
* **`slot`**: Acts as component injection placeholders (`[slot][end]` or `[slot!]`).
* **`for-each`**: Triggers compile-time loop evaluation (`[for-each = ...][end]`).

