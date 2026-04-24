# rules

The `rules` option is a custom object used to pass mapper-specific structural flags to your renderers or the validator.

---

## 1. Usage

The `rules` object is a standard container where you can store metadata about a tag. While SomMark doesn't have many built-in rules, they are commonly used in **HTML** and **MDX** mappers to handle structural constraints or "Void" elements.

---

## 2. Example: Self-Closing Tags

A common use case is identifying tags that do not have a body (like images or horizontal rules).

```js
mapper.register("img", function({ args }) {
    // Check our own custom rule
    const isVoid = this.get("img").options.rules.is_self_closing;
    
    const tag = this.tag("img").smartAttributes(args);
    
    // If it's void, we return a self-closing HTML tag
    return isVoid ? tag.selfClose() : tag.body("");
}, { 
    rules: { is_self_closing: true } 
});
```

**Smark Input:**
```ini
[img = src: "logo.png"][end]
```

**Output:**
```html
<img src="logo.png" />
```

---

## 3. Extending Rules

Because `rules` is an open object, you can use it for your own custom validation or routing logic:

*   **`permissions`**: Define required user roles to render a specific block.
*   **`deprecated`**: Flag tags that should show a console warning during transpilation.
*   **`layout`**: Store CSS hints (like "full-width" or "centered") that your renderer can use.

---

> [!TIP]
> Use **`rules`** to keep your renderer functions "pure" by moving static configuration data into the tag registration options instead of hard-coding it inside the function.
