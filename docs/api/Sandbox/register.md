# register()

Registers a custom dynamic block programmatically inside the sandboxed environment.
---

**Syntax:**
```js
SomMark.register(id, render, options);
```

**Usage:**
```javascript
static ${
  // Registers [alert] block programmatically
  SomMark.register("alert", ({ props, content }) => {
    return SomMark.tag("div").smartAttributes(props).body(content);
  });
}$
```

---

[Read full documentation inside Mapper API](../Mapper/register.md)

[Read full documentation inside Mapper API (tag method)](../Mapper/tag.md)
