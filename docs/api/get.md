# get

The `get` method retrieves a registered output definition by its ID. It is the primary way to inspect the mapper's registry to see if a tag exists and how it is rendered.

**Syntax:** `mapper.get(id)`

---

## 1. Basic Usage

The method returns the full output object if found, or `null` if the ID is not registered.

```js
import { MARKDOWN } from "sommark";

const boldDef = MARKDOWN.get("bold");

if (boldDef) {
    console.log(boldDef.id);      // "bold" (or ["bold", "b"])
    console.log(boldDef.render);  // [Function: render]
    console.log(boldDef.options); // { type: ["Block", "Inline"] }
}
```

---

## 2. Search Logic

### Last Match Wins
The `get` method searches the `outputs` array **backwards**. This ensures that if multiple mappers are combined via `inherit()`, the most recent registration for a specific ID is the one returned.

### Case Insensitivity
Identification is case-insensitive. Searching for `"BOLD"`, `"Bold"`, or `"bold"` will all return the same definition.

### Alias Resolution
If an output was registered with an array of IDs (e.g., `["i", "italic"]`), calling `.get("i")` or `.get("italic")` will return the same object.

---

## 3. Real Examples

### Cross-Mapper Composition (Custom Mappers)
One of the most powerful uses of `get` is surgically "borrowing" specific tags from a standard mapper (like **MARKDOWN**) to use in your own custom mapper without inheriting the entire registry.

```js
import { Mapper, MARKDOWN } from "sommark";

const myMapper = new Mapper();

// 1. Retrieve the high-fidelity 'bold' renderer from the MARKDOWN mapper
const mdBold = MARKDOWN.get("bold");

if (mdBold) {
    // 2. Register it into your custom mapper manually
    myMapper.register("bold", mdBold.render, mdBold.options);
}
```

### Safe Registration (Feature Guard)
Check if a component exists in the registry before attempting to register it. This example uses **`this.tag()`** to build a high-fidelity component if it is missing.

```js
import { MDX } from "sommark";

// Only register the 'PrimaryButton' if it hasn't been defined yet
if (!MDX.get("PrimaryButton")) {
    MDX.register("PrimaryButton", function({ args, content }) {
        return this.tag("button")
            .jsxProps(args) // Specialized for MDX/React
            .body(content);
    });
}
```

---

## 4. Return Value

*   **Success**: Returns an object `{ id, render, options }`.
*   **Failure**: Returns **`null`**.

---

> [!IMPORTANT]
> Some mappers (like the **HTML Mapper**) use a `getUnknownTag` fallback system for standard tags. In these cases, `get("div")` will return `null` because the tag is not explicitly registered. Always use `get()` for identifiers you know are registered as unique outputs.
