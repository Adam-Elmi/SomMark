# getUnknownTag

The `getUnknownTag` method is a fallback mechanism used by the transpiler when a tag identifier is not found in the mapper's `outputs` registry. It allows a mapper to dynamically handle any tag name at runtime.

**Syntax:** `mapper.getUnknownTag(node)`

---

## 1. How it Works

When the engine sees a tag identifier it doesn't know, it calls this method and gives it the `node` (the information about the tag, like its name and arguments).

*   **If you return an object**: SomMark will use that object to render the tag.
*   **If you return `null`**: The engine will stop and show an error.

---

## 2. What to Return

If you want to handle the unknown tag identifier, you must return an object with two things:

1.  **`render`**: A function that turns the tag into text.
2.  **`options`**: Settings for how the tag should behave (like its `type`).

---

## 3. Real Example: Universal Support

The **HTML Mapper** uses this to handle any tag name. It treats every unknown name as if it were a standard HTML element.

```js
import { Mapper } from "sommark";

const myMapper = Mapper.define({
    getUnknownTag(node) {
        const id = node.id.toLowerCase();
        
        // Treat every unknown name as an HTML tag
        return {
            render: function({ args, content }) {
                return this.tag(id)
                    .smartAttributes(args)
                    .body(content);
            },
            options: {
                type: ["Block", "Inline"]
            }
        };
    }
});
```
