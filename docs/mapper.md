# Mapper API Reference

The **Mapper** class is what makes SomMark extensible. It allows you to create your own tags/blocks and define how they translate into HTML or Markdown.

```javascript
import { Mapper } from "sommark";

const myMapper = new Mapper();
```

---

## 1. Registering Custom Tags

Use `register()` to define a new block or inline element.

**Syntax:** `mapper.register(Identifier, RendererFunction)`

### Example: Creating a YouTube Block

```javascript
myMapper.register("YouTube", ({ args }) => {
  const videoId = args[0];
  return `<iframe src="https://youtube.com/embed/${videoId}"></iframe>`;
});
```

**Usage in SomMark:**
```ini
[YouTube = dQw4w9WgXcQ]...[end]
```

### Example: Creating an Alert Block

```javascript
myMapper.register("Alert", ({ content }) => {
  return `<div class="alert alert-warning">${content}</div>`;
});
```

**Usage in SomMark:**
```ini
[Alert]Warning! Something went wrong.[end]
```

---

## 2. Adding Styles

You can attach CSS styles directly to your mapper. SomMark will automatically bundle these styles into the final output.

**Syntax:** `mapper.addStyle(cssString)`

```javascript
myMapper.addStyle(`
  .alert {
    padding: 10px;
    background: yellow;
    border: 1px solid orange;
  }
`);
```

---

## 3. HTML Helpers

The Mapper class includes utilities to make generating HTML easier and safer.

### `tag(name)`
Creates an HTML tag builder.

```javascript
mapper.register("Card", ({ content }) => {
  return mapper.tag("div")
    .attributes({ class: "card" })
    .body(content)
    .toString(); // <div class="card">...</div>
});
```

---

---

## 4. API Index

Here is a complete list of all methods and properties available on the `Mapper` instance.

### Core & Registry
| Name | Description |
| :--- | :--- |
| [`register`](./api/7.register.md) | Register a custom tag. |
| [`get`](./api/4.get.md) | Get a registered mapping. |
| [`removeOutput`](./api/8.removeOutput.md) | Remove a mapping. |
| [`includesId`](./api/5.includesId.md) | Check if detailed IDs exist. |
| [`outputs`](./api/1.outputs.md) | Array of all registered mappings. |
| [`env`](./api/17.env.md) | Current environment (`node`/`browser`). |

### Styles & Themes
| Name | Description |
| :--- | :--- |
| [`addStyle`](./api/20.addStyle.md) | Register custom CSS. |
| [`loadCss`](./api/27.loadCss.md) | Load CSS from a file. |
| [`loadStyles`](./api/16.loadStyles.md) | Load all compiled styles. |
| [`styles`](./api/19.styles.md) | Array of registered CSS. |
| [`highlightCode`](./api/11.highlightCode.md) | Highlight a string of code. |
| [`highlightTheme`](./api/12.highlightTheme.md) | Current Highlight.js theme. |
| [`HighlightThemes`](./api/28.HighlightThemes.md) | List of available themes. |
| [`getHighlightTheme`](./api/13.getHighlightTheme.md) | Get theme link tag. |

### Formatters (HTML Helpers)
| Name | Description |
| :--- | :--- |
| [`tag`](./api/3.tag.md) | Create HTML tags safely. |
| [`md`](./api/2.md.md) | Markdown builder instance. |
| [`code`](./api/22.code.md) | Format code blocks. |
| [`htmlTable`](./api/23.htmlTable.md) | Generate HTML tables. |
| [`list`](./api/25.list.md) | Generate HTML lists. |
| [`todo`](./api/26.todo.md) | Parse todo state. |
| [`escapeHTML`](./api/6.escapeHtml.md) | Escape special chars. |

### Page & Headers
| Name | Description |
| :--- | :--- |
| [`pageProps`](./api/10.pageProps.md) | Page metadata storage. |
| [`header`](./api/21.header.md) | Full document header string. |
| [`setHeader`](./api/9.setHeader.md) | Add custom header content. |

### Configuration Flags
| Name | Description |
| :--- | :--- |
| [`enable_table_styles`](./api/18.enable_table_styles.md) | Toggle default table styles. |
| [`enable_highlight_style_tag`](./api/14.enable_highlight_style_tag.md) | Inject styles via `<style>`. |
| [`enable_highlight_link_Style`](./api/15.enable_highlight_link_Style.md) | Inject themes via `<link>`. |
