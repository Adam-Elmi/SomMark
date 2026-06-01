# get()

Retrieves the options and render reference of any registered markup tag.
---

**Syntax:**
```js
SomMark.get(id);
```

**Usage:**
```javascript
static ${
  // Retrieves the details of a registered dynamic tag
  const tag = SomMark.get("alert");
  return tag ? "Registered" : "Not Found";
}$
```

---

[Read full documentation inside Mapper API](../Mapper/get.md)
