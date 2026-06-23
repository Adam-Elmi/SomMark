# Markdown Mapper

The Markdown Mapper converts SomMark blocks into clean Markdown that works with GitHub, GitLab, Obsidian, and any tool that reads GitHub Flavored Markdown.

---

## Advantages over Raw Markdown

| Feature | SomMark | Raw Markdown |
| :--- | :--- | :--- |
| **Module system** | `[import]` lets you split your content into separate files | No file imports |
| **Component system** | `[slot]` + `[import]` = reusable layouts where you choose what content goes inside | No components |
| **Placeholder blocks** | `p{key}` injects data at build time | No variables |
| **Compile-time logic** | `${}$` runs JS at build time in a safe separate environment (`static` keyword is optional) | No logic |
| **Looping** | `[for-each]` generates repeated content at build time | No looping |
| **Full prop system** | Any block accepts named props (`[h2 = id: "x", class: "y"]`) | Very limited attribute support |
| **Multiple output formats** | Same source compiles to HTML, XML, JSON, MDX, text | Markdown only outputs HTML |

---

## 1. HTML Fallback

Unknown / unregistered blocks (like `[section]` or `[div]`), SomMark outputs it as an HTML element instead. This keeps structure that Markdown cannot express.

If a heading block (like `[h1]`) has props attached, SomMark outputs it as an HTML element to keep the props:

```ini
[h1]Project Overview[end]

[h2 = id: "setup", class: "header-accent"]Installation Guide[end]
```

```markdown
# Project Overview

<h2 id="setup" class="header-accent">Installation Guide</h2>
```

---

## 2. Text Formatting

These blocks wrap their body text in Markdown formatting. All of them support a self-closing form where the text is passed as a prop instead of a body.

### `bold` / `b`

```ini
[bold]Important notice[end:bold]
[bold = "Important notice" !]
[bold = text: "Important notice" !]
```

```markdown
**Important notice**
```

### `italic` / `i`

```ini
[italic]Subtle emphasis[end:italic]
[italic = "Subtle emphasis" !]
```

```markdown
*Subtle emphasis*
```

### `emphasis` / `em`

Bold and italic combined.

```ini
[emphasis]Extremely important[end:emphasis]
[emphasis = "Extremely important" !]
```

```markdown
***Extremely important***
```

### `strike` / `s`

```ini
[strike]Outdated information[end:strike]
[strike = "Outdated information" !]
```

```markdown
~~Outdated information~~
```

### `code` / `Code`

Wraps body text in backticks.

```ini
[code]const val = 1[end:code]
```

```markdown
`const val = 1`
```

### `escape` / `e`

Stops Markdown from treating special characters as formatting.

```ini
[escape]*This will not be italic*[end]
[escape = "*This will not be italic*" !]
```

```markdown
\*This will not be italic\*
```

---

## 3. Links & Images

### `link`

Body form — link text in body, `src` and `title` in props:

```ini
[link = src: "https://example.com", title: "Go Home"]Visit Website[end:link]
```

Self-closing — all in props, text comes first:

```ini
[link = "Visit Website", "https://example.com" !]
[link = text: "Visit Website", src: "https://example.com", title: "Go Home" !]
```

```markdown
[Visit Website](https://example.com)
[Visit Website](https://example.com "Go Home")
```

### `image`

Always self-closing. Supports both positional and named props:

```ini
[image = "Logo", "images/logo.png", "Brand Logo" !]
[image = alt: "Logo", src: "images/logo.png", title: "Brand Logo" !]
```

```markdown
![Logo](images/logo.png "Brand Logo")
```

---

## 4. Structural Content

### `hr`

```ini
[hr = "*" !]
```

```markdown
***
```

### Tables (`Table`, `header`, `body`, `row`, `cell`, `th`, `td`)

```ini
[Table]
  [header]
    [row]
      [cell]Feature[end]
      [cell]Status[end]
    [end:row]
  [end:header]
  [body]
    [row]
      [cell]Imports[end]
      [cell]Stable[end]
    [end:row]
  [end:body]
[end:Table]
```

```markdown
| Feature | Status |
| --- | --- |
| Imports | Stable |
```

### Lists (`List` / `list`, `item` / `Item`)

Unordered lists use a symbol (`dot`, `*`, `+`). Ordered lists use `number` or `ol`.

```ini
[List = "dot"]
  [item]Main Item 1
    [List = "dot"]
      [item]Sub Item A[end]
    [end:List]
  [end]
  [item]Main Item 2[end]
[end:List]
```

```markdown
- Main Item 1
  - Sub Item A
- Main Item 2
```

---

## 5. GitHub Flavored Markdown (GFM)

### Alerts & Quotes (`quote`)

Standard blockquotes and GitHub alert types (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`).

```ini
[quote = "TIP"]
  Keep your mappers lightweight and modular.
[end:quote]

[quote]
  Simplicity is the ultimate sophistication.
[end:quote]
```

```markdown
> [!TIP]
> Keep your mappers lightweight and modular.

> Simplicity is the ultimate sophistication.
```

### Task Lists (`todo`)

Pass `x` or `done` to mark a task done, `""` or `-` to leave it unchecked.

Body form — status in prop, task text in body:

```ini
[todo = "x"]Core Documentation[end]
[todo = ""]API References[end]
```

Self-closing — task and status both in props:

```ini
[todo = "Core Documentation", "x" !]
[todo = task: "Core Documentation", status: "x" !]
```

```markdown
- [x] Core Documentation
- [ ] API References
```

Inside a list:

```ini
[List]
  [item][todo = "Core Documentation", "x" !][end:item]
  [item][todo = "API References", "" !][end:item]
[end:List]
```

---

## 6. Auto-Escaping

SomMark protects text from being accidentally formatted by Markdown using backslash escapes:

- **Emphasis markers** — `*text*`, `**text**`, `_text_`, `~~text~~` are escaped so they print as literal characters instead of triggering bold, italic, or strikethrough.
- **List triggers** — `-`, `+`, `*`, or `1.` at the start of a line are escaped so they don't become list items.
- **Horizontal rule triggers** — `---`, `***`, `___` on their own line are escaped.
- **HTML-like brackets** — `<tag>` in text is encoded to `&lt;tag&gt;` so it prints as literal characters.
- **Ampersands and quotes** — `&`, `"`, `'` are encoded to HTML entities.

Backslash escapes work here because Markdown parsers strip the `\` and show the literal character. The MDX mapper uses a different approach — HTML entities instead of backslashes — because MDX renderers do not re-parse JSX text children as Markdown. See [MDX Auto-Escaping](mdx.md#5-auto-escaping).

---

## 7. The `#` Symbol

`#` is SomMark's comment character — not Markdown's heading syntax. Any `#` in a template starts a SomMark comment and is removed from the output entirely:

```ini
# this is a SomMark comment — it disappears from the output
[p]Hello[end:p]
```

This means you cannot write `# Heading` as plain text in a SomMark template. Use the `[h1]` to `[h6]` blocks instead:

```ini
[h1]My Heading[end:h1]
[h2]Sub Heading[end:h2]
```

```markdown
# My Heading

## Sub Heading
```
