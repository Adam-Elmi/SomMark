# Self-Closing Blocks

Self-closing blocks are compact representations of elements or components that do not have child elements or inner body text. By adding an exclamation mark (`!`) at the end of a block header, you omit the need for an explicit `[end]` closing tag.

---

## 1. Syntax

Append `!` immediately before the closing bracket `]` of a block tag.

### Minimal Void Element
```ini
[br!]
```

### With Props
```ini
[hr = class: "separator", id: "divider" !]
```

### Component / Module Usage
```ini
[Avatar = src: "user.png", size: "lg" !]
```
**Note**: Components can also be self-closing.
---

## 2. Comparison with Standard Blocks

Standard blocks require a matching `[end]` tag, whereas self-closing blocks close themselves inline.

| Block Type | Smark Input |
| :--- | :--- |
| **Standard Block** | `[p] Hello World [end]` |
| **Self-Closing Block** | `[img = src: "image.png" !]` |

---

## 3. Compilation Target Outputs

### HTML Format
* **Smark Input:**
  ```ini
  [hr = class: "sep" !]
  ```
* **Rendered Output:**
  ```html
  <hr class="sep" />
  ```

### MDX Format
* **Smark Input:**
  ```ini
  [Avatar = src: "user.png" !]
  ```
* **Rendered Output:**
  ```jsx
  <Avatar src="user.png" />
  ```

