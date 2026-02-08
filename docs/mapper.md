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

## 2. Using Rules (Validation)

You can force strict rules on your content. If a rule is broken, SomMark will stop and show an error.

### Argument Validation (`args`)

Validates the arguments passed to the tag.

```javascript
myMapper.register("User", ({ args }) => {
    return tag("div").body(`User: ${args[0]}`);
}, {
    rules: {
        args: {
            min: 1,           // Must have at least 1 argument
            max: 3,           // Cannot have more than 3 arguments
            required: ["id"], // The "id" named key is required
            includes: ["id", "role", "age"] // Only these keys are allowed
        }
    }
});
```

- **`min`**: Minimum number of arguments required.
- **`max`**: Maximum number of arguments allowed.
- **`required`**: Array of keys that MUST be present in the arguments.
- **`includes`**: Whitelist of allowed argument keys. Any key not in this list will trigger an error.

### Content Validation (`content`)

Validates the inner content (body) of the block.

```javascript
myMapper.register("Summary", ({ content }) => {
    return tag("p").body(content);
}, {
    rules: {
        content: {
            maxLength: 100 // Content must be 100 characters or less
        }
    }
});
```

- **`maxLength`**: Maximum length of the content string.

### Self-Closing Tags

Ensures a tag is used without content or children.

```javascript
myMapper.register("Separator", () => {
    return tag("hr").selfClose();
}, {
    rules: {
        is_Self_closing: true
    }
});
```

- **`is_Self_closing`**: If `true`, SomMark will throw an error if the tag contains any content.

*Example input that passes:* `[Image = src: image.png, alt: Image][end]`

## 3. Using Options

Options change how SomMark processes the content inside the block.

```javascript
import { Mapper } from "sommark";
const myMapper = new Mapper();
const { tag } = myMapper;

myMapper.register("Code", ({ content }) => {
    return tag("pre").body(content);
}, {
    escape: false,
    rules: {
        args: {
            min: 1,           
            required: ["id"]
        }
    }
    }); // options
```

---

## 4. Adding Styles

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

## 5. HTML Helpers

The Mapper class includes utilities to make generating HTML easier and safer.

### `tag(name)`
Creates an HTML tag builder.

```javascript
mapper.register("Card", ({ content }) => {
  return mapper.tag("div")
    .attributes({ class: "card" })
    .body(content) // <div class="card">...</div>
});
```

---

---

## 6. API Index

Here is a complete list of all methods and properties available on the `Mapper` instance.

### Core & Registry
| Name | Description |
| :--- | :--- |
| [`register`](./api/07.register.md) | Register a custom tag. |
| [`get`](./api/04.get.md) | Get a registered mapping. |
| [`removeOutput`](./api/08.removeOutput.md) | Remove a mapping. |
| [`includesId`](./api/05.includesId.md) | Check if detailed IDs exist. |
| [`outputs`](./api/01.outputs.md) | Array of all registered mappings. |
| [`env`](./api/15.env.md) | Current environment (`node`/`browser`). |

### Styles & Themes
| Name | Description |
| :--- | :--- |
| [`addStyle`](./api/18.addStyle.md) | Register custom CSS. |
| [`styles`](./api/17.styles.md) | Array of registered CSS. |
| [`highlightCode`](./api/11.highlightCode.md) | Highlight a string of code. |
| [`registerHighlightTheme`](./api/13.registerHighlightTheme.md) | Register a custom theme. |
| [`selectHighlightTheme`](./api/14.selectHighlightTheme.md) | Select the active theme. |
| [`enable_highlightTheme`](./api/12.enable_highlightTheme.md) | Toggle auto-injection of theme. |

### Formatters (HTML Helpers)
| Name | Description |
| :--- | :--- |
| [`tag`](./api/03.tag.md) | Create HTML tags safely. |
| [`md`](./api/02.md.md) | Markdown builder instance. |
| [`code`](./api/20.code.md) | Format code blocks. |
| [`htmlTable`](./api/21.htmlTable.md) | Generate HTML tables. |
| [`list`](./api/23.list.md) | Generate HTML lists. |
| [`todo`](./api/24.todo.md) | Parse todo state. |
| [`escapeHTML`](./api/06.escapeHtml.md) | Escape special chars. |

### Page & Headers
| Name | Description |
| :--- | :--- |
| [`pageProps`](./api/10.pageProps.md) | Page metadata storage. |
| [`header`](./api/19.header.md) | Full document header string. |
| [`setHeader`](./api/09.setHeader.md) | Add custom header content. |

### Configuration Flags
| Name | Description |
| :--- | :--- |
| [`enable_table_styles`](./api/16.enable_table_styles.md) | Toggle default table styles. |
