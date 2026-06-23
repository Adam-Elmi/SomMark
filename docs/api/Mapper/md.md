# md (MarkdownBuilder)

The `md` property is an instance of the **MarkdownBuilder** utility class. It provides a comprehensive suite of methods for generating standardized Markdown syntax. While primarily used by the built-in Markdown mapper, it is available to any custom mapper that needs to output Markdown-compatible text.

**Syntax:**
```js
mapper.md
```

**Usage:**
```js
import { Mapper } from "sommark";
const mapper = new Mapper();
const markdownText = mapper.md.bold("text"); // **text**
```

---

## 1. Text Formatting

### `bold(text, [is_underscore])`
Wraps text in `**` or `__`.
```js
this.md.bold("Strong"); // **Strong**
this.md.bold("Strong", true); // __Strong__
```

### `italic(text, [is_underscore])`
Wraps text in `*` or `_`.
```js
this.md.italic("Emphasis"); // *Emphasis*
this.md.italic("Emphasis", true); // _Emphasis_
```

### `emphasis(text, [is_underscore])`
Wraps text in `***` or `___` (Bold-Italic).
```js
this.md.emphasis("Deep"); // ***Deep***
```

### `strike(text)`
Wraps text in `~~`.
```js
this.md.strike("Deleted"); // ~~Deleted~~
```

---

## 2. Structural Elements

### `heading(text, [level])`
Generates a Markdown header (`#` to `######`).
```js
this.md.heading("Main Title", 1); // # Main Title
```

### `url(type, text, url, [title])`
Generates a Markdown link or image.
```js
this.md.url("link", "Google", "https://google.com"); // [Google](https://google.com)
this.md.url("image", "Logo", "logo.png"); // ![Logo](logo.png)
```

### `codeBlock(code, [language])`
Generates a fenced code block.
```js
this.md.codeBlock("alert(1)", "js"); // ```js\nalert(1)\n```
```

### `quote(content, [type])`
Generates a blockquote or a GFM alert.
```js
this.md.quote("Be careful!", "WARNING"); // > [!WARNING]\n> Be careful!
```

### `horizontal([format])`
Generates a horizontal rule.
*   `format`: Defaults to `*`.
```js
this.md.horizontal("-"); // \n---
```

---

## 3. Lists & Tables

### `unorderedList(items, [depth], [marker])`
```js
this.md.unorderedList(["Item"], 0, "-"); // - Item
```

### `orderedList(items, [depth])`
Generates a numbered list.
```js
this.md.orderedList(["Step 1", "Step 2"], 0);
/*
1. Step 1
2. Step 2
*/
```

### `todo(status, text)`
```js
this.md.todo("x", "Done"); // - [x] Done
```

### `table(headers, rows)`
```js
this.md.table(["A", "B"], [["1", "2"]]);
/*
| A | B |
| --- | --- |
| 1 | 2 |
*/
```

---

## 4. Escaping Utilities

### `escape(text)`
A low-level method that escapes **all** Markdown special characters using backslashes.
```js
this.md.escape("*text*"); // \*text\*
this.md.escape("[link]"); // \[link\]
```

### `smartEscaper(text)`
A sophisticated method that only escapes characters when they are likely to trigger unintended formatting (start of line, balanced markers, etc.).
```js
this.md.smartEscaper("# Not a heading"); // \# Not a heading
this.md.smartEscaper("<div>");            // &lt;div&gt;
```

---

## 5. How to use it in a custom mapper

You can use the MarkdownBuilder inside custom mappers to support **GitHub Flavored Markdown (GFM)** features like alerts and task lists:

```javascript
import SomMark, { Mapper } from "sommark";

const gfmMapper = new Mapper();

// 1. GFM Alerts (e.g., [alert = "TIP"]Stay hydrated![end:alert])
gfmMapper.register("alert", function({ props, content }) {
  const type = props.type || props["0"] || "NOTE";
  return this.md.quote(content, type);
});

// 2. GFM Task List Items (e.g., [task = "x"]Build compiler[end:task])
gfmMapper.register("task", function({ props, content }) {
  const status = props.status || props["0"] || "";
  return this.md.todo(status, content);
});

// 3. Test the custom mapper
const src = `
[alert = "TIP"]
Pass types via arguments for cleaner GFM alerts!
[end:alert]

[task = "x"]Core engine stability[end:task]
[task = ""]Rich GFM documentation examples[end:task]
`;

console.log(await SomMark.transpile({
  src,
  format: "text",
  mapperFile: gfmMapper
}));
/*
Output:
> [!TIP]
> Pass types via arguments for cleaner GFM alerts!

- [x] Core engine stability
- [ ] Rich GFM documentation examples
*/
```
