# text (Filter Method)

The `text` method is a global filter that processes every plain text node in the AST before it is rendered. This is the primary location for global escaping, validation, or text transformation.

**Syntax:** `mapper.text(text, [options])`

---

## 1. How it Works

The SomMark transpiler automatically calls this method whenever it encounters a `TEXT` node. By default, the `Mapper` base class returns the text exactly as it is.

*   **Global Execution**: All plain text in the document passes through this method.
*   **Target Options**: If the text node is inside a tag (like `[bold] Text [end]`), the options of that tag are passed as the second argument.

---

## 2. Real Example: Global HTML Escaping

In the **HTML Mapper**, the `text` method ensures that characters like `<` and `>` are converted to safe entities.

```js
import { Mapper } from "sommark";

const myMapper = Mapper.define({
    text(text, options) {
        // 1. Skip escaping if the tag options explicitly turn it off
        if (options?.escape === false) return text;
        
        // 2. Otherwise, use the built-in HTML escaper
        return this.escapeHTML(text);
    }
});
```

---

## 3. Real Example: Text Validation (Profanity Filter)

You can use `text` to validate or censor every piece of text in your document.

```js
const censorMapper = Mapper.define({
    text(text) {
        return text.replace(/badword/gi, "****");
    }
});
```

---

> [!NOTE]
> For text specifically inside **Inline** elements or **AtBlocks**, SomMark uses more specialized filters named **`inlineText()`** and **`atBlockBody()`**.
