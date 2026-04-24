# clear

The `clear` method removes all registered output definitions from the mapper's registry. After calling this method, the mapper will have an empty `outputs` list and will treat all formerly registered tags as unknown.

**Syntax:** `mapper.clear()`

---

## 1. Effect

*   **Registry Wipe**: Every single tag and renderer previously added via `register()` or `inherit()` is deleted.
*   **Fallback Trigger**: Because the registry is empty, the transpiler will fall back to using the mapper's `getUnknownTag()` logic for every tag it encounters.
*   **Isolation**: This only affects the specific mapper instance it is called on. Other mappers and the original foundations (like `HTML` or `MARKDOWN`) remain unchanged.

---

## 2. Real Example: Registry Reset

Use `clear` when you want to repurpose an existing mapper instance for a completely different set of rules without creating a new object.

```js
import { MARKDOWN, HTML } from "sommark";

const myMapper = MARKDOWN.clone();

// Decide we want a fresh start
myMapper.clear();

// Now myMapper is empty and can be rebuilt
myMapper.inherit(HTML);
```

---

> [!CAUTION]
> Using **`clear()`** on global mappers like `HTML` or `MARKDOWN` is highly discouraged as it will break any other parts of your application that rely on those standard mappers. Always use it on a **`clone()`** or a fresh **`new Mapper()`** instance.
