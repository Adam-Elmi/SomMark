# Compile-Time Blocks

Runs JavaScript on the server at build time and puts the result inline in the output.

The `static` keyword is optional in `sommark version 5` — `${ expr }$` and `static ${ expr }$` are exactly the same.

---

**Syntax:**
```js
${ /* js code here */ }$
```

---

### How It Works

1. **Safe Execution:** The code runs inside a sandboxed environment (QuickJS) on the server. It cannot access the filesystem or network directly.
2. **Inline Output:** The result replaces the block in the final document.
3. **Implicit vs. Explicit Returns:**
   - **Implicit:** If the last line is a plain expression (e.g. `2 + 3` or `myVar`), SomMark uses its value automatically.
   - **Explicit:** You can also use the `return` keyword (e.g. `return "hello";`).

---

### Examples

#### 1. Math & Expressions

**File**: `math.smark`

```javascript
static ${ 5 + 5 }$
```

**Via CLI**

```bash
sommark --html -p math.smark
```

*Output:*
```html
10
```

#### 2. Variables & String Formatting

**File**: `variable.smark`

```javascript
static ${
  let name = "Adam";
  return `Welcome, ${name}!`;
}$
```

**Via CLI**

```bash
sommark --html -p variable.smark
```
*Output:*
```html
Welcome, Adam!
```

#### 3. Sharing Variables Across Blocks
Variables declared in one static block are automatically shared with subsequent blocks in the same template:

**File**: `share-variables.smark`

```javascript
static ${
  let company = "SomMark";
}$

static ${
  // Accesses the shared 'company' variable
  return `Built by ${company}`;
}$
```

**Via CLI**

```sh
sommark --html -p share-variables.smark
```

*Output:*
```html
Built by SomMark
```

#### 4. Asynchronous Secure Fetching
Use `SomMark.fetch` inside static blocks to pull data dynamically from remote APIs:

**File**: `fetch.smark`

```javascript
static ${
  const res = await SomMark.fetch("https://api.github.com/users/Adam-Elmi");
  const user = await res.json();
  return `Developer: ${user.name}`;
}$
```

**Via CLI**

```bash
sommark --html -p fetch.smark
```

*Output:*
```html
Developer: Adam Elmi
```

---

### Behavior and Rules

#### 1. What Gets Returned (Implicit vs. Explicit)
You can choose whether to use the `return` keyword or leave it out:
* **Implicit (No `return`):** Smark automatically returns the value of the very last statement if it is a valid JavaScript expression (like a variable, math, or a function call).
  ```javascript
  static ${
    let x = 10;
    x + 5; // Replaced with 15
  }$
  ```
* **Explicit (With `return`):** You can use a `return` statement at the very end of the block.
  ```javascript
  static ${
    let x = 10;
    return x + 5; // Replaced with 15
  }$
  ```

#### 2. Scoping and Variable Sharing
Smark manages variables using two clean scope rules:
* **Global Sharing:** Any variable defined with `let`, `const`, `var`, or `function` at the top level of a block is shared. It persists and is accessible in all subsequent blocks inside the template.
  ```javascript
  static ${ let user = "Adam"; }$
  static ${ return `Hello, ${user}`; }$ // Accesses the shared 'user' variable
  ```
* **Local Block Isolation:** Variables declared inside any block (like `[div]` or `[for-each]`) are isolated. SomMark automatically removes them when the block closes (`[end:name]`), so they cannot leak outside.

  **Inside the block (Works):**
  ```javascript
  [div]
    ${ const x = 24; }$
    ${ return x; }$ // OK: accessible inside the block and its children
  [end:div]
  ```

  **Outside the block (Fails):**
  ```javascript
  [div]
    ${ const x = 24; }$
  [end:div]

  ${ return x; }$ // Error: 'x' is not defined (cleaned up when the block ended)
  ```



### What is Supported

**Modern JavaScript**
The sandbox supports standard ECMAScript — the JavaScript language itself. This means loops, conditions, async/await, destructuring, template literals, classes, `Map`, `Set`, `Promise`, `JSON`, and so on.

The sandbox is **not Node.js** and **not a browser**. Two categories of code will not work here:

- **Node.js APIs** — `require()`, `__dirname`, `__filename`, `Buffer`, `process.env`, built-in modules like `fs`, `path`, `crypto`, etc.
- **Browser APIs** — `window`, `document`, `localStorage`, `alert`, `fetch` (native), `XMLHttpRequest`, `navigator`, DOM methods, etc.

Both will throw a reference error. Use the `SomMark` API for anything that needs to reach outside pure JS logic.

**`globalThis`**
`globalThis` is available — QuickJS supports it and SomMark uses it as the shared global scope across blocks.

Variables passed via the `variables` option are injected directly into `globalThis`, so they are accessible by name in any static block without importing anything:
```js
// compile options
new SomMark({ src, variables: { siteName: "SomMark v5" } });
```

**file.smark**
```js
${ siteName }$
```
Output: `SomMark v5`

You can also write to `globalThis` directly from a block — the value is then available in every block that follows:
```js
${ globalThis.count = 0; }$
${ globalThis.count += 1; count }$
```

`SomMark` itself is set on `globalThis` but is read-only. Trying to overwrite it throws an error:
```js
${
  globalThis.SomMark = null; // TypeError: 'SomMark' is read-only
}$
```

You will also see internal `__host*` keys on `globalThis` — these are SomMark's bridge functions to the host environment. Do not use or overwrite them.

**Module imports**
You can import local `.js`, `.json`, and `.smark` files relative to the template:
```javascript
static ${
  import data from "./data.json";
  return data.title;
}$
```

Add `?raw` to any file import to get its content as a plain string, regardless of file type:
```javascript
static ${
  import css from "./styles.css?raw";
  import svg from "./icon.svg?raw";
  import txt from "./readme.txt?raw";
  return txt;
}$
```

**SomMark API**
A `SomMark` object is available inside every static block:

| Method / Property | What it does |
|---|---|
| `SomMark.fetch(url, init?)` | Secure HTTPS-only fetch (see limits below) |
| `SomMark.compile(src, options?)` | Compile a SomMark template at build time |
| `SomMark.raw(str)` | Output a string without escaping |
| `SomMark.tag(tagName)` | Build a tag with a fluent API |
| `SomMark.settings` | Read the current compile settings |
| `SomMark.register(id, fn)` | Register a dynamic block render function |
| `SomMark.get(id)` | Get a registered block's render function |
| `SomMark.removeOutput(id)` | Remove a registered block |
| `SomMark.includesId(ids)` | Check if any of the given IDs are registered |
| `SomMark.static(expr)` | Evaluate a JS string as an expression |

---

### What is Not Supported

**Host environment APIs**
The sandbox has no access to Node.js or browser globals:

| Blocked | Note |
|---|---|
| `fetch` (native) | Removed — use `SomMark.fetch()` instead |
| `process` | Removed at sandbox init |
| `fs`, `child_process`, `os` | Node.js only, not available |
| `window`, `document`, `navigator` | Browser only, not available |

**`SomMark.fetch()` limits**
`SomMark.fetch()` only allows outbound HTTPS requests to public URLs. Three things are blocked and throw errors:

| Attempt | Error |
|---|---|
| `file:///path/to/file` | Unsupported protocol — only HTTP/HTTPS is allowed |
| `http://` (plain HTTP) | HTTP is disabled by default — enable with `security.allowHttp: true` |
| `https://localhost`, `http://127.0.0.1`, private IP ranges | SSRF protection — local and private addresses are always blocked |

To read local files in a static block, use module imports or `?raw` imports instead.

**Execution time limit**
Each block has a maximum run time of **5 seconds** by default. Code that exceeds this throws a timeout error. You can raise or lower the limit with the `security.timeout` option (in milliseconds).

**Nested `return` at the top level**
`return` inside an `if`, loop, or any nested block at the script's top level is a JavaScript syntax error.

Fails:
```javascript
static ${
  if (true) {
    return "Hello"; // SyntaxError: return cannot be inside an if at top level
  }
}$
```

Works — wrap logic in a function:
```javascript
static ${
  function getMessage() {
    if (true) { return "Hello"; }
  }
  return getMessage();
}$
```

