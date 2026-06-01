# SomMark.compile()

Securely compiles SomMark source dynamically inside the sandboxed environment.
---

**Syntax:**
```js
await SomMark.compile(src, options);
```

**Usage:**
```js
static ${ 
  const content = await SomMark.compile("[p]Dynamic content[end]", { format: "html" });
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
    const markup = `[list]${items.map(item => `[item]${item}[end]`).join("")}[end]`;
    
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

Import raw `.smark` templates dynamically and compile them while injecting local placeholders:

**Input:**
- `userCard.smark`:
```ini
[div = class: "card"]
  [h3]Hello p{username}![end]
[end]
```
- `template.smark`:
```js
static ${
    import cardSrc from "./userCard.smark?raw";
    
    const output = await SomMark.compile(cardSrc, {
        format: "html",
        placeholders: { username: "Adam" }
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

