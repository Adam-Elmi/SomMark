# atBlockBody (Filter Method)

The `atBlockBody` method is a specialized filter for processing the raw, literal content found inside **AtBlocks** (e.g., `@code`, `@style`, or custom data blocks).

**Syntax:** `mapper.atBlockBody(text, [options])`

---

## 1. How it Works

The transpiler identifies nodes with the `ATBLOCK` type. Unlike standard blocks (which contain child nodes), AtBlocks contain a single raw string. This string is passed through `atBlockBody` before being handed to the renderer.

*   **Raw Processing**: Ideal for content that should not be fully transpiled (like raw source code).
*   **Whitespace Management**: Great for adding or removing leading/trailing newlines for block-level elements.

---

## 2. Example 

In many mappers, `atBlockBody` is used to ensure that code inside an AtBlock is wrapped in newlines for better readability in the final output.

```js
import { Mapper } from "sommark";

const myMapper = Mapper.define({
    atBlockBody(text, options) {
        let out = String(text);
        
        // Apply escaping if required
        if (options?.escape !== false) {
            out = this.escapeHTML(out);
        }
        return out;
    }
});
```

```re
@_code_@: lang: html;
    <script>
        console.log("Hello World");
    </script>
@_code_@

```
Atblock body is in between @_code_@ and @_end_@:

```html
<script>
    console.log("Hello World");
</script>
```

So `atBlockBody` method allows to manipulate the body of the atblock like apply escaping or remove leading/trailing newlines for block-level elements or format it in any way you want.

