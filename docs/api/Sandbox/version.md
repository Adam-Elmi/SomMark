# SomMark.version

Returns the active version of the Smark engine inside the sandboxed Evaluator environment.
---

**Syntax:**
```js
SomMark.version
```

**Usage:**
```js
static ${ SomMark.version }$
```

---

### Example: Print Smark Version in Template

Exposes the compiler version dynamically at compile-time:

**Input:**
```ini
This page was rendered using SomMark vstatic ${ SomMark.version }$.
```

**Output:**
```html
This page was rendered using SomMark v4.1.0.
```

### Example: Embed Compiler Version in Client Script

Use `SomMark.static(...)` inside a `runtime ${...}$` block to pre-evaluate the version and embed it directly into the generated client script:

**Input:**
```ini
runtime ${
    const compiledVersion = SomMark.static(`${SomMark.version}`);
    console.log("Running Smark compiled template: " + compiledVersion);
}$
```

**Output:**
```html
<script>
    const compiledVersion = "4.1.0";
    console.log("Running Smark compiled template: " + compiledVersion);
</script>
```

---

[Read settings.md for global configuration access](settings.md)

[Read compile.md for recursive template generation](compile.md)

[Read raw.md for output bypassing and escaping rules](raw.md)

[Read fetch.md for secure HTTP requests](fetch.md)

[Read static.md for compile-time macros inside client scripts](static.md)
