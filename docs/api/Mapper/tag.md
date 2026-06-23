# tag()

Creates and returns a new **TagBuilder** instance used to programmatically generate HTML, XML, or JSX elements using a chainable builder pattern.

---

**Syntax:**
```js
mapper.tag(tagName)
```

**Usage:**
```js
import { Mapper } from "sommark";
const mapper = new Mapper();

const paragraph = mapper.tag("text")
    .attributes({ class: "container", id: "main" })
    .body("Hello World");
// Output: <text class="container" id="main">Hello World</text>
```

---

### Example: Self-Closing Tags

Use `.selfClose()` for void or empty elements:

```js
import { Mapper } from "sommark";
const mapper = new Mapper();

const img = mapper.tag("img")
    .attributes({ src: "logo.png", alt: "Logo" })
    .selfClose();
// Output: <img src="logo.png" alt="Logo" />
```

---

### Example: Smart Attributes (`.smartAttributes()`)

The `.smartAttributes()` method intelligently maps block props, automatically converting non-HTML attributes into style properties and normalizing casing:

```js
import { Mapper } from "sommark";
const mapper = new Mapper();

mapper.register("box", function({ props, content }) {
    return this.tag("div")
        .smartAttributes(props)
        .body(content);
});

/*
Input Smark:
[box = id: "b1", color: "blue", margin: "10px"] Hello [end:box]

Output HTML:
<div id="b1" style="color:blue;margin:10px;">Hello</div>
*/
```

---

### Example: JSX / MDX Props (`.jsxProps()`)

Converts arguments into React/JSX-compliant properties. It automatically maps `class` to `className`, transforms `style` properties, and wraps booleans, numbers, or objects in JSX `{}` braces.

#### Manual Mapping
```js
import { Mapper } from "sommark";
const mapper = new Mapper();

mapper.register("badge", function({ props, content }) {
    return this.tag("span")
        .jsxProps({
            class: props.class,
            style: props.style,
            disabled: props.disabled
        })
        .body(content);
});
// Output: <span className="badge" style={{color: "red"}} disabled={true}>New</span>
```

#### Automated Arguments Propagation
```js
import { Mapper } from "sommark";
const mapper = new Mapper();

// Automatically passes all props directly to JSX properties
mapper.register("btn", function({ props, content }) {
    return this.tag("button")
        .jsxProps(props)
        .body(content);
});
/*
Input Smark: [btn = class: "primary", count: "3", disabled: "true"] Submit [end:btn]
Output JSX:  <button className="primary" count={3} disabled={true}>Submit</button>
*/
```
