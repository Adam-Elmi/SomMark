# outputs

The `outputs` property is a list where every block and rule is stored for a mapper. You usually use methods like `register()` to add blocks, but you can look at this list to see what is already there.

**Syntax:** 
```js
mapper.outputs
```

**Usage:**
```js
import { HTML } from "sommark";
const mapper = HTML.clone();
const outputs = mapper.outputs;
console.log(outputs);
```

---

## 1. What is inside?

Every item in the `outputs` list is a simple object that contains:

*   **`id`**: The name of the block (e.g., `"bold"`) or a list of names (e.g., `["b", "bold"]`).
*   **`render`**: The function that renders the block into text.
*   **`options`**: Settings for the block, like if it should be safe from HTML characters.

```js
import { HTML } from "sommark";

// Look at the first block in the HTML mapper
const first = HTML.outputs[0];

console.log(first.id);      // ["DOCTYPE", "doctype"]
console.log(first.render);  // [Function: render]
console.log(first.options); // { rules: { is_self_closing: true } }
```

---

## 2. Important to know

### Overwriting (The Last One Wins)
When you register a block that already exists, SomMark automatically **removes** the old block from the `outputs` list before adding the new one. This keeps the list clean and free of duplicates.

```js
import { HTML } from "sommark";

const customMapper = HTML.clone();
console.log(customMapper.outputs.length); // Output: 5

// Overwrite the existing "css" block
customMapper.register("css", ({ content }) => `<style>${content}</style>`);

// The old block was deleted, so the list size remains 5
console.log(customMapper.outputs.length); // Output: 5
```


---

## 3. When you might want to work with it directly

Since `outputs` is just a standard JavaScript list, you can use normal coding to check it.

```js
import { MARKDOWN } from "sommark";

// Find all blocks that have escaping turned off
const safeBlocks = MARKDOWN.outputs.filter(item => item.options?.escape === false);

// Get a list of every block name that this mapper knows
const allNames = MARKDOWN.outputs.flatMap(item => Array.isArray(item.id) ? item.id : [item.id]);
```

> [!CAUTION]
> Do not try to modify the outputs list manually. Use **`register()`**, **`inherit()`**, **`removeOutput()`**, **`clear()`** instead.
