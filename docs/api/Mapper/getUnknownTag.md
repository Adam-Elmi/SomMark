# getUnknownTag()

The fallback method called by the transpiler when a block is not found in the mapper's `outputs` registry. 

---

**Syntax:**
```js
mapper.getUnknownTag(node)
```

**Usage:**
```js
import { Mapper } from "sommark";
const mapper = new Mapper();

// Set up custom fallback behavior for any unrecognized block
mapper.getUnknownTag = function(node) {
    return {
        render({ content }) {
            return `<!-- Unknown: ${node.id} -->${content}`;
        }
    };
};
```

---

### Example: Default HTML Fallback

Standard `HTML` and `MARKDOWN` clones automatically fallback to rendering unknown tags as HTML elements:

```js
import SomMark, { HTML } from "sommark";
const mapper = HTML.clone();

const html = await SomMark.transpile({
    src: "[card = class: \"premium\"] Hello [end:card]",
    format: "html",
    mapperFile: mapper
});
// Output: <card class="premium">Hello</card>
```

---

### Example: Strict Validation (Triggering Errors)

By default, base `Mapper` returns `null` for unknown tags, which triggers a transpiler error. You can force this strict behavior on clones by returning `null`:

```js
import SomMark, { HTML } from "sommark";
const strictMapper = HTML.clone();

// Disable HTML tag fallback
strictMapper.getUnknownTag = () => null; 

try {
    await SomMark.transpile({
        src: "[secret]Content[end:secret]",
        format: "html",
        mapperFile: strictMapper
    });
} catch (err) {
    console.error(err.message);
    // Output: Transpiler Error: 'secret' is not found in mapping outputs
}
```

---

### Example: Custom Dynamic Fallback

Override `getUnknownTag()` to wrap any unrecognized block in a styled `<span>` with a `data-tag` attribute:

```js
import { Mapper } from "sommark";
const mapper = new Mapper();

mapper.getUnknownTag = function(node) {
    const tagName = node.id.toLowerCase();
    
    return {
        render: function({ content }) {
            return this.tag("span")
                .attributes({ "data-tag": tagName })
                .body(content);
        },
        options: {
            type: "Block"
        }
    };
};
```