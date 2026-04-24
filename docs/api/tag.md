# tag (TagBuilder)

The `tag` method returns a new **TagBuilder** instance. This utility uses a builder pattern to programmatically generate HTML or XML strings. It handles attribute normalization, smart styling fallbacks, and safe character escaping automatically.

**Syntax:** `this.tag(tagName)`

---

## 1. Basic Usage

The TagBuilder uses a chainable API. You can add attributes and then finalize the tag using either `.body()` or `.selfClose()`.

### Creating a Simple Tag
```js
const html = this.tag("div")
    .attributes({ class: "container", id: "main" })
    .body("Hello World");

// Output: <div class="container" id="main">Hello World</div>
```

### Self-Closing Tags
```js
const img = this.tag("img")
    .attributes({ src: "banner.jpg", alt: "Site Banner" })
    .selfClose();

// Output: <img src="banner.jpg" alt="Site Banner" />
```

---

## 2. Smart Attributes (V4 Logic)

The `.smartAttributes()` method implements SomMark's core styling engine. It automatically decides if a property should be a native HTML attribute or a CSS style property.

```js
MARKDOWN.register("box", ({ args, content }) => {
    return this.tag("div")
        .smartAttributes(args)
        .body(content);
}, { type: "Block" });
```

**Result Interaction:**
*   **SomMark**: `[box = id: "b1", color: "red"] Content [end]`
*   **Output**: `<div id="b1" style="color:red;">Content</div>`

---

## 3. Builder Methods

### `.attributes(object, [strict])`
Adds key-value pairs as HTML attributes.
*   **Boolean Values**: `{ disabled: true }` becomes `disabled`.
*   **Strict Mode**: If `strict` is true, boolean values become `disabled="true"`.

### `.smartAttributes(args, [customProps])`
The intelligent version of attributes.
*   **Normalization**: Automatically converts `camelCase` to `kebab-case`.
*   **Styling Fallback**: Moves non-HTML properties into the `style` attribute.
*   **Custom Props**: Pass a `Set` of properties that should be exempt from the styling fallback.

### `.jsxProps(args)`
Specialized for MDX mapping. It generates React-style props, including `className` and JSX expression wrapping `{}`.

---

## 4. Finalizers (State Ending)

The following methods **finalize** the builder and return a **string**. You cannot chain anything after calling these.

### `.body(content)`
Sets the inner content and returns the full tag string.
*   `content` (`string | array`): The body of the tag.

### `.selfClose()`
Finalizes the tag as a self-closing element (`<tag />`) and returns the string.

---

