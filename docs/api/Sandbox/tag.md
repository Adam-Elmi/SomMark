# tag()

Creates and returns a new **TagBuilder** instance used to programmatically generate HTML, XML, or JSX elements using a chainable builder pattern.
---

**Syntax:**
```js
SomMark.tag(tagName);
```

**Usage:**
```javascript
static ${
  // Generates <div class="card">Hello</div> safely
  return SomMark.tag("div").attributes({ class: "card" }).body("Hello");
}$
```

---

[Read full documentation inside Mapper API](../Mapper/tag.md)
