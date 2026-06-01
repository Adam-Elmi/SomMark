# $use-module

Injects a previously imported module directly into the document without passing any props or body content.

---

## 1. Syntax

```ini
[import = Alias: "./path/to/file.smark"][end]

[$use-module = Alias][end]
```

| Part | Description |
| :--- | :--- |
| `[import = Alias: "path"]` | Declares the module and assigns it an alias name. Must be at the top of the file. |
| `[$use-module = Alias]` | Inserts the full content of that module at this position. |

---

## 2. How It Works

1. You import a `.smark` file at the top of your document using `[import]`.
2. Anywhere below, you write `[$use-module = Alias][end]` to inject the entire content of that file.
3. The module is compiled and its output replaces the `$use-module` block.

This is a **static injection** -- the module is inserted as-is, with no props passed and no slot content provided.

---

## 3. Basic Example

**`components/Footer.smark`**
```ini
[footer = class: "site-footer"]
  [p]Copyright 2026 SomMark[end]
[end]
```

**`page.smark`**
```ini
[import = Footer: "./components/Footer.smark"][end]

[div = class: "page"]
  [h1]Welcome[end]
  [$use-module = Footer][end]
[end]
```

**HTML Output:**
```html
<div class="page">
  <h1>Welcome</h1>
  <footer class="site-footer">
    <p>Copyright 2026 SomMark</p>
  </footer>
</div>
```

---

## 4. When to Use $use-module vs Component Blocks

SomMark gives you two ways to use an imported module. Choose based on whether you need to pass data into it.

### $use-module -- Static Injection

Use when the module is self-contained and does not need any external data or body content.

```ini
[import = Nav: "./components/Nav.smark"][end]

[$use-module = Nav][end]
```

No props. No slots. The module renders exactly as written.

### Component Block -- Dynamic Injection

Use when the module expects props (`v{}`) or slot content.

```ini
[import = Card: "./components/Card.smark"][end]

[Card = title: "Hello"]
  This fills the slot.
[end]
```

Props are passed and resolved inside the module. Slot content is injected where `[slot][end]` appears.

### Summary

| Feature | `$use-module` | Component Block |
| :--- | :--- | :--- |
| Passes props | No | Yes |
| Injects slot content | No (uses fallback) | Yes |
| Syntax | `[$use-module = Alias][end]` | `[Alias = props] body [end]` |
| Best for | Static, reusable partials | Dynamic, data-driven components |

---

## 5. Reusing the Same Module Multiple Times

You can inject the same module at multiple points in the document. Each injection is independent.

```ini
[import = Divider: "./components/Divider.smark"][end]

[section]
  [h2]Part One[end]
  [p]First section content.[end]
[end]

[$use-module = Divider][end]

[section]
  [h2]Part Two[end]
  [p]Second section content.[end]
[end]

[$use-module = Divider][end]
```

---

## 6. Slot Fallback Behavior

If the imported module contains a `[slot]` block with fallback content, `$use-module` will render the fallback since no body content is provided.

**`components/Alert.smark`**
```ini
[div = class: "alert"]
  [slot]No alerts at this time.[end]
[end]
```

**`page.smark`**
```ini
[import = Alert: "./components/Alert.smark"][end]

[$use-module = Alert][end]
```

**HTML Output:**
```html
<div class="alert">
  No alerts at this time.
</div>
```

To override the fallback, use a component block instead:

```ini
[Alert]
  System update available.
[end]
```

---

## 7. Import Placement Rule

All `[import]` declarations must appear at the **very top** of the file, before any content. Placing an import after content (text, blocks, or other elements) causes a placement error.

```ini
# Correct -- imports first
[import = Header: "./Header.smark"][end]
[import = Footer: "./Footer.smark"][end]

[div]
  [$use-module = Header][end]
  [p]Page content.[end]
  [$use-module = Footer][end]
[end]
```

```ini
# Wrong -- import after content
[h1]Title[end]
[import = Footer: "./Footer.smark"][end]   # Error: imports must be before content
```

---

## 8. File Extension

The `.smark` extension is optional in import paths. Both forms work:

```ini
[import = Nav: "./components/Nav.smark"][end]
[import = Nav: "./components/Nav"][end]
```

SomMark automatically appends `.smark` if the file is not found at the given path.

---

## 9. Unused Import Warnings

If you import a module but never use it (neither with `$use-module` nor as a component block), SomMark will report an unused module warning.

```ini
[import = Sidebar: "./components/Sidebar.smark"][end]

# Sidebar is never used -- triggers an "UnusedModule" warning
[div]
  [p]Hello[end]
[end]
```

---

## 10. Rules

- `$use-module` is a reserved keyword. It cannot be used as a custom block identifier.
- The alias must match an imported module name exactly (case-sensitive).
- Using an alias that was never imported causes a module usage error.
- Import depth is limited by the `security.maxDepth` setting (default: 5). Deeply nested imports beyond this limit are blocked.
- Circular imports (file A imports file B which imports file A) are detected and blocked automatically.
