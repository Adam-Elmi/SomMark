# get()

Retrieves the options and render reference of any registered block.
---

**Syntax:**
```js
SomMark.get(id);
```

**Usage:**
```javascript
static ${
  // Retrieves the details of a registered dynamic block
  const block = SomMark.get("alert");
  return block ? "Registered" : "Not Found";
}$
```

---

[Read full documentation inside Mapper API](../Mapper/get.md)
