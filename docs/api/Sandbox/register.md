# register()

Registers a custom dynamic markup tag programmatically inside the sandboxed environment.
---

**Syntax:**
```js
SomMark.register(id, render, options);
```

**Usage:**
```javascript
static ${
  // Registers [alert] tag programmatically
  SomMark.register("alert", ({args, content }) => {
    return SomMark.tag("div").smartAttributes(args).body(content);
  });
}$
```

---

[Read full documentation inside Mapper API](../Mapper/register.md)

[Read full documentation inside Mapper API (tag method)](../Mapper/tag.md)
