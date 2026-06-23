# Self-Closing Blocks

A self-closing block has no body content and no `[end]`. Add `!` at the end of the block header to make it self-closing.

---

## 1. Syntax

```ini
[br!]
[hr = class: "separator" !]
[img = src: "logo.png", alt: "Logo" !]
[Avatar = src: "user.png", size: "lg" !]
```

The `!` can go right after the block name or after the last prop — both are valid.

---

## 2. Comparison with Standard Blocks

| Block Type | Smark Input |
| :--- | :--- |
| **Standard Block** | `[p]Hello World[end:p]` |
| **Self-Closing Block** | `[img = src: "photo.png" !]` |

---

## 3. Output by Format

### HTML

In HTML Mapper, two things trigger self-closing output:

1. **The `!` marker** — forces any block to self-close, even if it normally has a body:

   ```ini
   [div !]
   ```
   ```html
   <div />
   ```

2. **Known HTML void elements** — `br`, `hr`, `img`, `input`, `link`, `meta`, `source`, `track`, `wbr`, `area`, `base`, `col`, `embed`, and SVG shapes (`circle`, `ellipse`, `line`, `path`, `polygon`, `polyline`, `rect`) are **always** rendered as self-closing, even without `!`:

   ```ini
   [br!]
   [img = src: "logo.png", alt: "Logo" !]
   ```
   ```html
   <br />
   <img src="logo.png" alt="Logo" />
   ```

### MDX

Same behavior as HTML Mapper. The `!` self-closes any block, including JSX components:

```ini
[Icon = name: "star" !]
[br!]
```
```jsx
<Icon name="star" />
<br />
```

This is the standard JSX self-closing syntax for components with no children.

### XML

XML has an extra behavior: even without `!`, a block with **no content** is automatically self-closed. SomMark only outputs `<tag>...</tag>` if the block body is non-empty.

```ini
[item = id: "42" !]
```
```xml
<item id="42" />
```

Empty body auto-closes:
```ini
[empty][end:empty]
```
```xml
<empty />
```

With content:
```ini
[note]Hello[end:note]
```
```xml
<note>Hello</note>
```

### Markdown

Same as HTML — `!` forces self-closing, and known void elements (`br`, `hr`, `img`, etc.) are always self-closed:

```ini
[hr!]
```
```markdown
---
```

For unknown blocks, `!` generates an HTML self-closing tag inside the Markdown output.

### Text

Self-closing blocks produce **no output** in text format. Since they have no body, there is no text to extract.

```ini
[br!]
[img = src: "photo.png" !]
Plain text here.
```
```
Plain text here.
```

---

## 4. When to Use `!`

| Use case | Example |
| :--- | :--- |
| HTML void elements | `[img = src: "x.png" !]`, `[br!]`, `[hr!]` |
| JSX/MDX components with no children | `[Icon = name: "star" !]` |
| XML leaf nodes | `[item = id: "1" !]` |
| SomMark imports and module injections | `[import = Nav: "./Nav" !]`, `[$use-module = Nav !]` |
| Passing data without a body | `[string = key: "name", value: "Adam" !]` (JSON mapper) |

> [!NOTE]
> In HTML format, using `!` on a block that has a known non-void tag (like `[div !]`) will produce `<div />`. This is valid HTML5 but browsers may interpret it as an open `<div>` — use `!` on non-void elements only when you intentionally want this behavior.
