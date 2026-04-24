# outputs

The `outputs` property is a list where every tag and rule is stored for a mapper. You usually use methods like `register()` to add tags, but you can look at this list to see what is already there.

**Syntax:** `mapper.outputs` (Array)

---

## 1. What is inside?

Every item in the `outputs` list is a simple object that contains:

*   **`id`**: The name of the tag (e.g., `"bold"`) or a list of names (e.g., `["b", "bold"]`).
*   **`render`**: The function that turns the tag into text.
*   **`options`**: Settings for the tag, like if it should be safe from HTML characters.

```js
import { HTML } from "sommark";

// Look at the first tag in the HTML mapper
const first = HTML.outputs[0];

console.log(first.id);      // ["DOCTYPE", "doctype"]
console.log(first.render);  // [Function: render]
console.log(first.options); // { rules: { is_self_closing: true } }
```

---

## 2. Important Rules

### The Last One Wins
If you have multiple tags with the same name, or you copy tags from another mapper, only the **last** one added will stay in the list and be used.

### Searching for Names
When you look for a tag name, SomMark checks every item in the `outputs` list. It can find a match even if a tag has many different names (aliases).

---

## 3. Advanced Use: Filtering the List

Since `outputs` is just a standard JavaScript list, you can use normal coding to check it.

```js
import { MARKDOWN } from "sommark";

// Find all tags that have escaping turned off
const safeTags = MARKDOWN.outputs.filter(item => item.options?.escape === false);

// Get a list of every single tag name that this mapper knows
const allNames = MARKDOWN.outputs.flatMap(item => Array.isArray(item.id) ? item.id : [item.id]);
```

> [!CAUTION]
> Do not try to add items to this list manually. Use **`register()`**, **`inherit()`**, or **`removeOutput()`** instead.
