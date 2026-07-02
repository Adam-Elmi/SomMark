# text()

Filters and processes the raw content of every plain text node.

---

**Syntax:**
```js
mapper.text(text, [options]);
```

**Usage:**
```js
import { Mapper } from "sommark";

const mapper = Mapper.define({
  text(text, options) {
    return options?.escape === false ? text : this.escapeHTML(text);
  }
});
```

---

### Example: Global HTML Escaping with Option Overrides

Every standard text block passes through the `text` filter before rendering. You can use block registration options (like `escape: false`) to selectively bypass global filters:

```javascript
import { transpile, HTML } from "sommark";

const mapper = HTML.clone();

// 1. Override the global text filter
mapper.text = function (text, options) {
  if (options?.escape === false) {
    return text;
  }
  return this.escapeHTML(text);
};

// 2. Register custom raw block utilizing the fluent tag builder
mapper.register("rawHtml", function ({ content }) {
  return this.tag("div").attributes({ class: "raw" }).body(content);
}, { type: "Block", escape: false });

const smarkSource = `
Standard text containing <escaped> markers.
[rawHtml]
  Raw <b>unescaped</b> HTML content.
[end:rawHtml]
`;

const output = await transpile({
  src: smarkSource,
  format: "html",
  mapperFile: mapper,
});

console.log(output);
```

**Output:**
```html
Standard text containing &lt;escaped&gt; markers.
<div class="raw">Raw <b>unescaped</b> HTML content.</div>
```

---

### Understanding the `options` Argument

The `options` argument is **completely custom**. You can define any static properties during block registration and read them inside the filter dynamically based on active block scopes.

#### Rich Examples of Custom Options

##### 1. Configurable Censorship Filter
You can use a custom block option to trigger text censoring inside specific blocks:
```javascript
mapper.text = function (text, options) {
  if (options?.censor) {
    return text.replace(/badword/gi, "****");
  }
  return text;
};

// Register block with static censor option
mapper.register("clean", function ({ content }) {
  return this.tag("div").body(content);
}, { type: "Block", censor: true });
```
*Input:*
```r
This has badword.
[clean]
  Inside here badword is filtered.
[end:clean]
```
*Output:*
```html
This has badword.
<div>Inside here **** is filtered.</div>
```

---

### Default Engine Behaviors
* **Scope Restriction:** The global `text()` filter processes all standard text nodes inside blocks.
* **Base Mapper Fallback:** The base `Mapper` class returns the text exactly as-is: `text(text) { return text; }`.
