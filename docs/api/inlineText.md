# inlineText (Filter Method)

The `inlineText` method is a specialized filter for processing content found inside **Inline** nodes (e.g., bold, italic, ...). It allows you to apply different formatting rules to inline text compared to standard block text.

**Syntax:** `mapper.inlineText(text, [options])`

---

## 1. How it Works

The transpiler identifies nodes with the `INLINE` type and passes their literal content through this method before the tag's `render()` function is called.

*   **Precision Casting**: It targets only the value inside an inline tag.
*   **Contextual Control**: It receives the options of the specific inline tag being rendered.

---

## 2. Real Example: Markdown Smart Escaping

In the **MARKDOWN Mapper**, `inlineText` is used to protect special characters from being accidentally interpreted as Markdown markers.

```js
import { Mapper } from "sommark";

const MARKDOWN = Mapper.define({
    inlineText(text, options) {
        // 1. Respect the 'escape' option from the tag definition
        if (options?.escape === false) return text;
        
        // 2. Apply smart escaping for inline contexts
        return this.md.smartEscaper(text);
    }
});
```
Inline statement syntax:
```re
(inline text)->(id: arg1, arg2, ...)
```
So `inlineText` method targets inline text. `Bold Text` in the following example is inline text:

```re
(Bold Text)->(bold)
```

So `inlineText` method allows to manipulate inline text like apply escaping or remove leading/trailing newlines or format it in any way you want.

---


