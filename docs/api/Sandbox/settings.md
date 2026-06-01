# SomMark.settings

Returns a read-only object containing the active compiler settings.
---

**Syntax:**
```js
SomMark.settings
```

**Usage:**
```js
static ${ SomMark.settings.format }$
```

---

### Example: Conditional Rendering Based on Target Format

Use `SomMark.settings.format` to conditionally structure your templates at compile-time:

**Files:**
- `htmlDoc.smark:`
```ini
[h1]Welcome to SomMark HTML template[end]
[p]Here is some content for the HTML template.[end]
```
- `mdxDoc.smark:`
```ini
[h1 = format: "markdown"]Welcome to MDX template[end]
Here is some content for the MDX template.
```
- `template.smark:`
```js
static ${
    import htmlDoc from "./htmlDoc.smark?raw";
    import mdxDoc from "./mdxDoc.smark?raw";
    
    if (SomMark.settings.format === "html") {
        const out = await SomMark.compile(htmlDoc, { format: "html" });
        SomMark.raw(out);
    } else if (SomMark.settings.format === "mdx") {
        const out = await SomMark.compile(mdxDoc, { format: "mdx" });
        SomMark.raw(out);
    } else {
        throw new Error(`This template is not meant to be used for the ${SomMark.settings.format} format.`);
    }
}$
```

> [!IMPORTANT]
> You must define the target `format` parameter in `SomMark.compile()`, for example `SomMark.compile(mdxDoc, { format: "mdx" })`. If you do not define it, SomMark will use the parent format from `SomMark.settings.format`, which may return unexpected output.

**Output (when format is "html"):**
```html
<h1>Welcome to SomMark HTML template</h1>
<p>Here is some content for the HTML template.</p>
```

**Output (when format is "mdx"):**
```markdown
# Welcome to MDX template
Here is some content for the MDX template.
```

### Example: Accessing Sandboxed Context Parameters

Access settings properties like target file parameters or custom formats securely inside compile-time scripts:

**Input:**
```mdx
This document target: static ${ 
    SomMark.settings.format.toUpperCase() 
}$.
```

**Output:**
```html
This document target: HTML.
```

### See all available settings
To see all available settings:

```js
static ${
    SomMark.raw(JSON.stringify(SomMark.settings, null, 2));
}$
```



---

[Read version.md for compiler version details](version.md)

[Read compile.md for recursive template generation](compile.md)

[Read raw.md for output bypassing and escaping rules](raw.md)

[Read fetch.md for secure HTTP requests](fetch.md)

[Read static.md for compile-time macros inside client scripts](static.md)
