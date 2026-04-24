# comment

The `comment` method specifies how Smark comments (lines starting with `#`) should be rendered in the final output.

**Syntax:** `mapper.comment(text)`

---

## 1. How it Works

When the transpiler encounters a comment node, it first checks the mapper's `options.removeComments`. 

*   **If `removeComments` is `true`**: The comment is ignored completely.
*   **If `removeComments` is `false`**: The transpiler removes the leading `#`, trims the whitespace, and passes the clean text to this method.

By default, the `Mapper` base class returns an empty string, effectively hiding comments from the output.

---

## 2. Real Example: HTML Comments

The **HTML Mapper** overrides this method to wrap the text in standard HTML comment tags.

```js
import { Mapper } from "sommark";

const myHtmlMapper = Mapper.define({
    comment(text) {
        return `<!-- ${text} -->`;
    },
    options: {
        removeComments: false // Ensure they are processed
    }
});
```
---

> [!TIP]
> Use the **`removeComments: true`** option in your mapper if you want to ensure that no internal notes accidentally leak into your production HTML or Markdown files.
