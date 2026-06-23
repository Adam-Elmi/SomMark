# resolve

The `resolve` option controls how block content is processed. By default (`resolve: false`), the engine uses fast lazy placeholder substitution.

> [!WARNING]
> **DEPRECATION NOTICE**: The `resolve: true` option is deprecated and **will be removed in a future major version of SomMark**.
> 
> **Why?** Using `resolve: true` forces a bottom-up compilation sequence that can lead to unexpected behaviors (such as breaking parent-child scope variable sharing).
> 
> **How to migrate**: If you need to modify, clean, or read literal text inside a block (like `[h1]...[end:h1]`), leave `resolve` as `false` (default) and use **`textContent`** instead.

---

## 1. Rule of Thumb

* **Wrapping nested blocks or HTML?** -> Leave `resolve: false` (default). It is extremely fast and uses very little memory.
* **Modifying a simple literal text block?** (like headers, titles, or paragraphs) -> Leave `resolve: false` and use **`textContent`** to safely read and change the text.
* **Legacy text manipulation?** (avoid this) -> Set `resolve: true` to get the compiled child text in the `content` argument. Be aware that this will be removed in future versions.

---

## 2. Default Mode vs textContent

### Wrapping HTML (`resolve: false` + `content`)
Use this when you are only wrapping nested children without altering the string. SomMark injects a placeholder and finishes compilation later.

```js
mapper.register("Wrapper", function({ content }) {
    // We only wrap the content; we do NOT touch the string.
    return this.tag("div").body(content);
});
```

### Modifying Literal Text (`resolve: false` + `textContent`)
Use this when you need to safely alter a block containing plain/literal text (like a title or header). Since `textContent` is extracted as a standard clean string, you can safely modify it without placeholder corruption.

```js
mapper.register("h1", function({ textContent }) {
    // textContent is a standard string, so this is safe!
    return this.tag("h1").body(textContent.trim().toLowerCase());
});
```

---

## 3. The Danger of Modifying Placeholders

If you try to modify or run string operations on the `content` argument under the default `resolve: false` mode, you will corrupt SomMark's internal placeholder token.

To prevent broken layouts and leaked internal tokens, **SomMark will throw a compilation error** if it detects that a placeholder was modified.

### What happens when you corrupt placeholders (`resolve: false`)

```js
mapper.register("Header", function({ content }) {
    // ❌ DANGER: .toLowerCase() corrupts the placeholder string!
    return this.tag("h1").body(content.toLowerCase());
}, { 
    resolve: false 
});
```

**Output (Throws Compiler Error):**
```text
[Transpiler Error]:
Placeholder Corruption Error: Attempted to modify the 'content' placeholder under 'resolve: false' mode in block 'Header'.
This corrupts SomMark's internal compilation tokens and is not allowed.
If you need to read or alter the literal inner text, please use 'textContent' instead.
```

---

### What happens when you do it safely using `textContent` (`resolve: false`)

Since `resolve: true` is deprecated, the correct, safe way to modify plain/literal text inside a block is to use `textContent` instead:

```js
mapper.register("Header", function({ textContent }) {
    //  SAFE: textContent is the raw text string!
    return this.tag("h1").body(textContent.trim().toLowerCase());
});
```

**Output:**
```html
<h1>intro to sommark</h1>
```

---

## 4. How Blocks Compile (Execution Order)

Choosing `resolve: true` changes the order in which SomMark compiles your blocks:

### Default Mode (`resolve: false`) — *Parent compiles first*
* **How it works**: The parent block compiles immediately, and the engine compiles the nested child blocks later.
* **Why it matters**: Since the parent runs first, it can set variables and share data that its children can read when they compile.

### Immediate Mode (`resolve: true` - Legacy) — *Children compile first*
* **How it works**: The engine compiles all child blocks first, turns them into a finished text string, and only then compiles the parent block.
* **Why it matters**: The parent cannot share dynamic variables with its children, because the children have already finished compiling before the parent even runs.

### Example (Variable Scoping)

Imagine you want a parent block `[Section]` to inject a `theme` variable that nested child templates can dynamically read via `${ theme }`.

**Smark Template:**
```re
[Section]
  This is a ${ theme } section.
[end:Section]
```

#### 1. Default Mode (`resolve: false`) — *Variable sharing works*
Since the parent runs first, it successfully injects the variable into the template context before SomMark processes the nested children.

```js
import { Evaluator } from "sommark";

// resolve: false is the default setting
mapper.register("Section", function({ content }) {
    // Inject the theme variable into the compilation scope
    Evaluator.inject({ theme: "dark" });
    return this.tag("section").body(content);
});

// Input: 
// [Section]
//   This is a ${ theme } section.
// [end:Section]
//
// Output: <section>This is a dark section.</section>
```

#### 2. Immediate Mode (`resolve: true`) — *Variable sharing fails*
Because SomMark compiles the child first, Smark tries to evaluate `${ theme }` before the parent's code has ever executed, causing a compilation error.

```js
import { Evaluator } from "sommark";

mapper.register("Section", function({ content }) {
    Evaluator.inject({ theme: "dark" });
    return this.tag("section").body(content);
}, {
    resolve: true 
});

// Input: 
// [Section]
//   This is a ${ theme } section.
// [end:Section]
//
// Output: Error (theme is not defined)
```

---

[Read tag() for more info](tag.md)

[Read trimAndWrapBlocks() for more info](trimAndWrapBlocks.md)
