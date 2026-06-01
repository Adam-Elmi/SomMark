# static()

Evaluates an expression string on the server at compile-time.
---

**Syntax:**
```js
SomMark.static(expression);
```

**Usage:**
```javascript
runtime ${
  // Embeds server-side version ("4.1.0") directly as a client-side string literal
  const version = SomMark.static("SomMark.version");
  console.log("Compiler version:", version);
}$
```

---

### How It Works

1. **Finds the calls:** Scans `runtime ${ ... }$` blocks to find `SomMark.static(...)` calls.
2. **Evaluates on server:** Executes the string securely inside the sandboxed server environment.
3. **Replaces inline:** Replaces the call in your script with the evaluated value (strings, numbers, or booleans).

---

### Important Guidelines

* **Compatible in all blocks:** Works in both `static ${ ... }$` and `runtime ${ ... }$` blocks.
* **Bakes values:** Embeds server-side variables directly as standard JavaScript values in client scripts.
* **Must be a string:** The argument must be a string. Non-string inputs will throw an error.
* **API Access:** The expression string can call other sandbox APIs like `SomMark.settings` or `SomMark.fetch`.

---

### Example: Embedding Server Settings

Bakes compile-time format conditions directly into a client script:

**File:** `index.smark`
```js
runtime ${
  const isHtmlTarget = SomMark.static(`SomMark.settings.format === "html"`);
  
  if (isHtmlTarget) {
    console.log("Running in HTML layout environment.");
  }
}$
```

**Via CLI:**
```sh
sommark --html -p index.smark
```

**Output:**
```html
<script>
  const isHtmlTarget = true;
  
  if (isHtmlTarget) {
    console.log("Running in HTML layout environment.");
  }
</script>
```

---

[Read fetch.md for secure HTTP requests](fetch.md)

[Read raw.md for output bypassing and escaping rules](raw.md)

[Read settings.md for global configuration access](settings.md)

[Read compile.md for recursive template generation](compile.md)

[Read version.md for compiler version details](version.md)

[Read import.md for compile-time local file importing](import.md)
