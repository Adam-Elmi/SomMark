# Default Mappers

SomMark comes with built-in mappers for generating HTML, Markdown, and MDX. Here is a complete reference of the available blocks and inline elements for each.

## 1. HTML Mapper (`mappers/languages/html.js`)

This mapper generates standard HTML5 markup. It also includes the customized `Dracula` highlight theme by default.

### Block Elements

| Name | Description | Usage |
| :--- | :--- | :--- |
| `[Block]` | Renders content as-is. | `[Block]...[end]` |
| `[Section]` | Wraps content in `<section>`. | `[Section]...[end]` |
| `[h1]` - `[h6]` | Heading tags. | `[h1]Title[end]` |
| `[Code]`, `[code]` | Syntax highlighted code block. | `[Code=js]...[end]` |
| `[List]`, `[list]` | Parses list items. | `[List] - Item 1...[end]` |
| `[Table]`, `[table]` | Parses table rows. | `[Table] \| Col 1 \|...[end]` |
| `[hr]` | Horizontal rule `<hr />`. | `[hr] [end]` (content ignored) |
| `[todo]` | Checkbox input. | `[todo] Label [end]` |

### Inline Elements

| Name | Description | Usage |
| :--- | :--- | :--- |
| `(text)->(bold)`, `(b)` | Strong emphasis `<strong>`. | `(text)->(b)` |
| `(text)->(italic)`, `(i)` | Italic emphasis `<i>`. | `(text)->(i)` |
| `(text)->(emphasis)`, `(e)` | Bold & Italic span. | `(text)->(e)` |
| `(text)->(color: #hex)` | Colored text span. | `(text)->(color: #ff0000)` |
| `(text)->(link: url, title)` | Anchor tag `<a>`. | `(Click)->(link: https://example.com)` |
| `(alt)->(image: src)` | Image tag `<img>`. | `(Alt Text)->(image: /img.png)` |

---

## 2. Markdown & MDX Mapper (`mappers/languages/markdown.js` & `mdx.js`)

The Markdown mapper generates standard Markdown output. The MDX mapper currently inherits strict Markdown generation.

### Block Elements

| Name | Description | Usage |
| :--- | :--- | :--- |
| `[Block]`, `[Section]` | Renders content as-is. | `[Block]...[end]` |
| `[Heading]` | Explicit heading generation. | `[Heading=1]Title[end]` |
| `[h1]` - `[h6]` | Heading shortcuts. | `[h1]Title[end]` |
| `[Code]`, `[code]`, `[codeBlock]`, `[CodeBlock]` | Code fences. | `[Code=js]...[end]` |
| `[List]`, `[list]` | Renders list content. | `[List] - Item...[end]` |
| `[table]` | Markdown table generation. | `[table] \| A \| B \|...[end]` |
| `[horizontal]`, `[h]` | Horizontal rule `---`. | `[h] [end]` |
| `[todo]` | Task list item `- [ ]`. | `[x] [todo]` or `[ ] [todo]` |

### Inline Elements

| Name | Description | Usage |
| :--- | :--- | :--- |
| `(text)->(bold)`, `(b)` | Bold `**text**`. | `(text)->(b)` |
| `(text)->(italic)`, `(i)` | Italic `*text*`. | `(text)->(i)` |
| `(text)->(emphasis)`, `(e)` | Bold & Italic `***text***`. | `(text)->(e)` |
| `(text)->(link: url, title)` | Markdown Link `[text](url)`. | `(Go)->(link: url)` |
| `(alt)->(image: src)` | Markdown Image `![alt](src)`. | `(Alt)->(image: /img.png)` |
| `(char)->(escape)`, `(s)` | Escapes char `\char`. | `(*)->(s)` |

### How to Use

To use a specific mapper, you typically import it and use the transpiler or the CLI with the `--format` flag.

```javascript
import { HTML, MARKDOWN } from "sommark/mappers";

// The CLI uses these internally when you run:
// smark input.smark -o output.html (uses HTML)
// smark input.smark -o output.md (uses MARKDOWN)
```
