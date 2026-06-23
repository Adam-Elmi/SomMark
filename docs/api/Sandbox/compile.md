# SomMark.compile()

Securely compiles SomMark source dynamically inside the sandboxed environment.
---

**Syntax:**
```js
await SomMark.compile(src, options);
```

`SomMark.compile()` accepts all the same options as the `SomMark` class constructor — `format`, `variables`, `placeholders`, `mapperFile`, `filename`, `baseDir`, `files`, `importAliases`, `removeComments`, `customProps`, `fallbackTarget`, and more.

The one exception is `security`: it is always **inherited** from the parent compilation and cannot be overridden from inside the sandbox.

> [!NOTE]
> `SomMark.compile()` runs inside the QuickJS sandbox. It inherits the `security` settings (e.g. `timeout`, `maxDepth`) from the parent compilation automatically — you cannot override them from inside the sandbox.

**Usage:**
```js
static ${ 
  const content = await SomMark.compile("[p]Dynamic content[end:p]", { format: "html" });
  return SomMark.raw(content);
}$ 
```

---

### Example: Compiling Dynamic Strings

Generates structural markup dynamically based on compile-time math or logic:

**Input:**
```js
static ${
    const items = ["Apple", "Banana", "Cherry"];
    const markup = `[list]${items.map(item => `[item]${item}[end:item]`).join("")}[end:list]`;
    
    const output = await SomMark.compile(markup, { format: "html" });
    return SomMark.raw(output);
}$
```

**Output:**
```html
<ul>
  <li>Apple</li>
  <li>Banana</li>
  <li>Cherry</li>
</ul>
```

### Example: Recursive File Import and Compilation

Import raw `.smark` templates dynamically and compile them while injecting variables into the sub-template's static blocks:

**Input:**
- `userCard.smark`:
```ini
[div = class: "card"]
  [h3]Hello static ${ username }$![end:h3]
[end:div]
```
- `template.smark`:
```js
static ${
    import cardSrc from "./userCard.smark?raw";
    
    const output = await SomMark.compile(cardSrc, {
        format: "html",
        variables: { username: "Adam" }
    });
    return SomMark.raw(output);
}$
```

**Output:**
```html
<div class="card">
  <h3>Hello Adam!</h3>
</div>
```

> [!NOTE]
> Use `variables` (not `placeholders`) when passing data into sub-templates via `SomMark.compile()`. `variables` are injected as global JavaScript variables accessible inside `static ${ }$` blocks. `placeholders` (`p{key}` syntax) are a parser-level feature and are not forwarded to `SomMark.compile()`.

---

> [!TIP]
> **Implicit Returns**: Inside `static ${...}$` blocks, the `return` keyword is entirely optional. Smark automatically captures and returns the value of the very last evaluated expression in the script.

> [!IMPORTANT]
> `SomMark.compile()` is fully asynchronous. You must always use the `await` keyword when calling it, even when nested inside synchronous functions or conditional statements.

---

[Read raw.md for output bypassing and escaping rules](raw.md)

[Read settings.md for global configuration access](settings.md)

[Read version.md for compiler version details](version.md)

[Read fetch.md for secure HTTP requests](fetch.md)

[Read static.md for compile-time macros inside client scripts](static.md)

