# The Variable Layer `v{}`

`v{}` binds data from props passed to a component. It is strictly local — each component call gets its own scope.

---

## 1. Syntax

```ini
v{key}
v{key | "fallback"}
v{0}
```

| Part | Required | Description |
| :--- | :--- | :--- |
| `key` | Yes | The prop name to look up. Must start with a letter, `_`, or `$`. |
| `\| "fallback"` | No | A quoted string to use if the key is not found. |
| `0`, `1`, `2`, ... | — | Positional access — reads the nth positional (unnamed) prop. |

---

## 2. Where You Can Use It

`v{}` works anywhere inside a component template — in body text, in block props, and inside quoted strings.

**In body text:**
```ini
[h1]v{title}[end:h1]
```

**In block props:**
```ini
[div = class: v{theme}]Content[end:div]
```

**Inside a quoted string:**
```ini
[a = href: "v{baseUrl}/profile"]Profile[end:a]
```

---

## 3. Basic Usage

**`Title.smark`**
```ini
[h1]v{text}[end:h1]
```

**`index.smark`**
```ini
[import = Title: "./Title.smark" !]

[Title = text: "Hello World" !]
```

**Output:**
```html
<h1>Hello World</h1>
```

---

## 4. Fallback Values

If a prop might not always be passed, add a fallback after `|`:

```ini
[button = class: v{theme | "btn-default"}]v{label | "Click"}[end:button]
```

- If `theme` is passed → uses its value.
- If not → uses `btn-default`.

The fallback **must be a quoted string**.

---

## 5. Positional Access

When props are passed without names, use `v{0}`, `v{1}`, etc. to access them by position:

**`Tag.smark`**
```ini
[span = class: v{0}]v{1}[end:span]
```

**Usage:**
```ini
[Tag = "highlight", "New!" !]
```

**Output:**
```html
<span class="highlight">New!</span>
```

---

## 6. Unresolved Variables

If a key is not found and no fallback is given, SomMark renders a high-visibility envelope in the output:

```
SOMMARK_UNRESOLVED_v_key_SOMMARK
```

This makes missing variables immediately visible so you can find and fix them.

---

## 7. Privacy by Default (Automatic Scoping)

This is the most important behavior of `v{}`:

- If a prop is **consumed by `v{}`** → it is used internally and does **not** appear on the root element.
- If a prop is **not consumed by `v{}`** → it is passed through automatically to the root element as an attribute.

**`Button.smark`**
```ini
[button = class: v{theme}]v{label}[end:button]
```

**Usage:**
```ini
[Button = theme: "btn-blue", label: "Submit", id: "main-btn" !]
```

**Output:**
```html
<button class="btn-blue" id="main-btn">Submit</button>
```

What happened:
- `theme` → consumed by `v{theme}` → used as `class`, not added to root
- `label` → consumed by `v{label}` → used as text, not added to root
- `id` → not consumed by `v{}` → automatically merged onto `<button>`

This prevents "double hits" where a prop would appear both as body content and as an attribute on the element.

---

## 8. Explicit Attribute Binding

You can use `v{}` in the header of any inner element, not just the root:

**`Card.smark`**
```ini
[div = class: "card"]
  [h2 = data-id: v{id}]v{title}[end:h2]
[end:div]
```

**Usage:**
```ini
[Card = id: "c1", title: "News" !]
```

**Output:**
```html
<div class="card">
  <h2 data-id="c1">News</h2>
</div>
```

---

## 9. Multiple Variables

**`Profile.smark`**
```ini
[div = class: "user-card"]
  [h2]v{name}[end:h2]
  [p]Status: v{status}[end:p]
[end:div]
```

**Usage:**
```ini
[import = Profile: "./Profile.smark" !]

[Profile = name: "Adam", status: "Active" !]
```

**Output:**
```html
<div class="user-card">
  <h2>Adam</h2>
  <p>Status: Active</p>
</div>
```

---

## 10. `v{}` vs `p{}`

| | `v{}` | `p{}` |
| :--- | :--- | :--- |
| **Source** | Props on the component call | `placeholders` option in JS config |
| **Scope** | Local — one component call | Global — entire compilation graph |
| **Propagation** | Only the component that receives the prop | All sub-components automatically |
| **Fallback syntax** | `v{key \| "default"}` | `p{key \| "default"}` |
| **Positional access** | `v{0}`, `v{1}`, ... | Not supported |
