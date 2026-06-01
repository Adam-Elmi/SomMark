# The JavaScript Data Layer `js{}`

`js{}` is SomMark's high-performance native data-binding hook. It lets you pass **real JavaScript data types** (Arrays, Objects, Numbers, Booleans, strings, etc.) directly into tag props.

---

## 1. Why `js{}` instead of `static ${}$`?

While you can execute full sandboxed JS via `static ${}$`, `js{}` is **strongly recommended** for static properties due to three key advantages:

*   **Higher Performance**: `js{}` uses a native structural parser (`safeDataParse`) directly inside the engine. It bypasses the overhead of launching the QuickJS WebAssembly virtual machine, making it extremely lightweight and fast.
*   **Total Safety**: Because `js{}` only parses structural data (JSON, objects, arrays, primitives) and does **not** execute arbitrary code, it is completely immune to infinite loops, memory leaks, and sandbox escapes.
---

## 2. Supported Data Types

The native parser seamlessly evaluates JavaScript-style layouts:

*   **Arrays**: `js{["admin", "editor"]}`
*   **Objects**: `js{{ theme: "dark", border: true, padding: 10 }}` (supports unquoted, single-quoted, and double-quoted keys)
*   **Primitives**: `js{true}`, `js{false}`, `js{null}`, `js{42}`

---

## 3. Best Practice: MDX & React Components (The Ultimate Bridge)

While `js{}` is highly useful for native JS mappers, **the single best and most powerful use-case of `js{}` is in MDX format transpilation.**

In default MDX format, any unknown SomMark tag is **automatically compiled into a React JSX component**, and any props passed via `js{}` are transformed directly into **React JSX properties**!

### Example 1: Passing Arrays to React Components
You have a React component in your codebase called `ProfileCard` which accepts a `roles` array prop.

**Smark Template (`index.smark`)**
```ini
[ProfileCard = name: "Adam", roles: js{["Admin", "Editor", "Viewer"]} !]
```

*Via CLI*:
```bash
sommark --mdx -p index.smark
```

**Transpiled MDX Output**
```jsx
<ProfileCard name="Adam" roles={["Admin","Editor","Viewer"]} />
```

---

### Example 2: Passing Complex State Config Objects
You have a React button component called `Button` which accepts a `config` options object prop.

**Smark Template (`index.smark`)**
```ini
[Button = label: "Submit", config: js{{ theme: "btn-blue", disabled: false }} !]
```

*Via CLI*:
```bash
sommark --mdx -p index.smark
```

**Transpiled MDX Output**
```jsx
<Button label="Submit" config={{theme:"btn-blue",disabled:false}} />
```

---

## 4. Alternative: Custom JavaScript Mappers (HTML Format)

If you are transpiling to plain HTML rather than MDX/React, you can consume `js{}` props inside custom JavaScript tag mappers during the transpilation stage.

**JavaScript Mapper Registration**
```javascript
// Register a custom HTML tag that processes a configuration object prop
// Note: Props are passed to the 'args' key in the current major version
HTML.register("my-btn", ({ args, content }) => {
  // Access prop keys natively in JavaScript via the backward-compatible 'args' object!
  const theme = args.config ? args.config.theme : "btn-default";
  return HTML.tag("button").attributes({ class: theme }).body(content);
}, { type: "Block" });
```

**Smark Template (`index.smark`)**
```ini
[my-btn = config: js{{ theme: "btn-blue", disabled: false }}] Submit [end]
```

**Rendered HTML**
```html
<button class="btn-blue">Submit</button>
```