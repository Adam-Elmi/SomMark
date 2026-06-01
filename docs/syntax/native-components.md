# Native Smark Components

SomMark supports a native, file-based component system. Components are separate `.smark` templates with scoped variables and dynamic slot injection.

---

## 1. Syntax & Setup

### Component Definition (`Card.smark`)
A component file acts as a template. It receives data via variables (`v{}`) and injects caller content using a `[slot]` block.

```smark
[div = class: "card"]
  [h4] v{title} [end]
  [div = class: "card-body"]
    [slot] Default/Fallback Content [end]
  [end]
[end]
```

### Component Usage
Import the component at the top of your document (the `.smark` extension is optional), then call it using its alias.

```smark
[import = Card: "./Card" !]

[Card = title: "Dynamic Component Title"]
  This is the body content injected into the slot.
[end]
```

### Rendered Output (HTML)
```html
<div class="card">
  <h4>Dynamic Component Title</h4>
  <div class="card-body">
    This is the body content injected into the slot.
  </div>
</div>
```

---

## 2. Prop Mapping

Props passed to a component tag are automatically mapped to internal variables:

* **Named Props:** `[Card = title: "Hello" !]` maps to `v{title}`.
* **Positional Props:** `[Card = "Hello" !]` maps to `v{0}`.
* **Complex Data Passing:** Pass array/object variables natively using `js{}`:
  ```smark
  [List = items: js{ ["Item A", "Item B"] } !]
  ```

---

## 3. Scope & Prop Merging (Privacy by Default)

Props passed to a component are automatically merged onto its root element **unless** they are consumed by a `v{}` variable inside the component template.

### Input Scenario
* **Component (`Card.smark`):**
  ```smark
  [div = class: "card"]
    [h4] v{title} [end]
  [end]
  ```
* **Usage:**
  ```smark
  [Card = title: "Welcome", class: "custom-theme" !]
  ```
* **Rendered Output:**
  ```html
  <div class="card custom-theme">
    <h4>Welcome</h4>
  </div>
  ```
  *(Notice: `title` was consumed by `v{title}` so it is NOT rendered as `title="Welcome"` on the outer `div` element, but `class` was not consumed, so it was merged onto the root element).*

---

## 4. Slot Injection Modes

| Slot Syntax | Description |
| :--- | :--- |
| **Standard Slot with Fallback** | `[slot] Fallback [end]` &mdash; Renders "Fallback" only if caller passes no body content. |
| **Self-Closing Slot** | `[slot!]` or `[slot][end]` &mdash; Simply acts as a placeholder without fallback content. |

