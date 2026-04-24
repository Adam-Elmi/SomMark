# md (MarkdownBuilder)

The `md` property is an instance of the **MarkdownBuilder** utility class. It provides a comprehensive suite of methods for generating standardized Markdown syntax. While primarily used by the built-in Markdown mapper, it is available to any custom mapper that needs to output Markdown-compatible text.

**Syntax:** `this.md` (within a mapper)

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
