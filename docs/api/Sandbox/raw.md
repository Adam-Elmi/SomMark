# raw()

Bypasses the default output escaping of static blocks.
---

**Syntax:**
```js
SomMark.raw(text);
```

**Usage:**
```javascript
static ${
  // Returns raw HTML "<p>Hello</p>" instead of escaped "&lt;p&gt;Hello&lt;/p&gt;"
  return SomMark.raw("<p>Hello</p>");
}$
```

---

### Example: Escaped vs Raw Output

Static blocks escape HTML entities automatically to prevent XSS. Use `SomMark.raw(...)` to output unescaped markup:


1. Without `SomMark.raw(...)`
Input:
```js
static ${
  // By default, SomMark escapes HTML entities or Markdown syntax
  return "<h1>Welcome</h1>"; 
}$
```

Output:
```html
&lt;h1&gt;Welcome&lt;/h1&gt;
```

2. With `SomMark.raw(...)`
Input:
```js
static ${
  return SomMark.raw("<h1>Welcome</h1>");
}$
```

Output:
```html
<h1>Welcome</h1>
```

---

### Example: Rendering Recursive Compiler Output

The primary use case is injecting raw compiled output from recursive sub-templates:

Example in template: `index.smark`

```js
static ${
  const card = "[div = class: 'card']Adam[end]";
  // Compiles Smark markup to HTML
  const output = await SomMark.compile(card, { format: "html" }); // output: "<div class=\"card\">Adam</div>"
  
  // Wrap in SomMark.raw to return raw HTML 
  return SomMark.raw(output);
}$
```

**Usage via CLI:**
```sh
sommark --html -p index.smark
```

**Output:**
```html
<div class="card">Adam</div>
```

---

[Read version.md for compiler version details](version.md)

[Read settings.md for global configuration access](settings.md)

[Read compile.md for recursive template generation](compile.md)

[Read fetch.md for secure HTTP requests](fetch.md)

[Read static.md for compile-time macros inside client scripts](static.md)
