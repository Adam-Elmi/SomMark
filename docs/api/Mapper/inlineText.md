# inlineText()

Filters and processes the literal content of Inline Statements.
---

**Syntax:**
```js
mapper.inlineText(text, [options]);
```

**Usage:**
```js
import { Mapper } from "sommark";

const mapper = Mapper.define({
  inlineText(text, options) {
    return options?.uppercase ? text.toUpperCase() : text;
  }
});
```

---

### Example: Transforming Inline Text

Filters inline text `(text)->(tag)` using custom registration options:

```javascript
import { transpile, HTML } from "sommark";

const mapper = HTML.clone();

// 1. Define custom filter logic
mapper.inlineText = function (text, options) {
  let out = String(text);
  if (options?.uppercase) out = out.toUpperCase();
  if (options?.escape !== false) out = this.escapeHTML(out);
  return out;
};

// 2. Register inline tag with custom "uppercase" option
mapper.register("loud", function ({ content }) {
  return this.tag("span").attributes({ class: "loud" }).body(content);
}, { type: "Inline", uppercase: true });

const output = await transpile({
  src: "This is (urgent)->(loud) news.",
  format: "html",
  mapperFile: mapper,
});

console.log(output);
// Output: This is <span class="loud">URGENT</span> news.
```

---

### Understanding the `options` Argument

The `options` argument is **completely custom**. You can define any static properties (booleans, strings, functions, objects) during tag registration, and access them dynamically during filtering.

#### Rich Examples of Custom Options

##### 1. Custom CSS Classes (Static strings controlling markup)
```javascript
// Register tag with custom class
mapper.register("badge", function({ content }) {
  return this.tag("span").attributes({ class: this.options.className }).body(content);
}, { type: "Inline", className: "alert-badge" });
```

##### 2. Custom Text Prefixes (Prepending static strings)
```javascript
mapper.inlineText = function(text, options) {
  return (options?.prefix || "") + text;
};

// Register tag with custom prefix string
mapper.register("arrow", function({ content }) {
  return this.tag("span").body(content);
}, { type: "Inline", prefix: "-> " });
```
*Input:* `(Go)->(arrow)`  
*Output:* `<span>-> Go</span>`

##### 3. Dynamic Transform Callbacks (Passing functional execution)
```javascript
mapper.inlineText = function(text, options) {
  return typeof options?.transform === "function" ? options.transform(text) : text;
};

// Register tag with custom transformer function
mapper.register("reverse", function({ content }) {
  return this.tag("span").body(content);
}, {
  type: "Inline",
  transform: (text) => text.split("").reverse().join("")
});
```
*Input:* `(olleH)->(reverse)`  
*Output:* `<span>Hello</span>`

---

### Default Engine Behaviors
* **Whitespace Collapsing:** The parser collapses multiple spaces and newlines inside the inline statement content into a single space before passing the text to `inlineText()`.
* **Base Mapper Fallback:** The base `Mapper` class returns the text exactly as-is: `inlineText(text) { return text; }`.

[Read Inline Statements Syntax for more info](../../syntax/inline.md)
[Read escapeHtml() for more info](escapeHtml.md)
