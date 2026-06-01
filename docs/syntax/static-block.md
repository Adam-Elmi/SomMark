# Static Blocks

Evaluates JavaScript code on the server at compile-time to output dynamic markup.
---

**Syntax:**
```js
static ${ /* js code here */ }$
```

---

### How It Works

1. **Secure Execution:** The code executes inside a sandboxed environment on the server during compilation.
2. **Inline Output:** The returned or evaluated result replaces the `static` block inline in the final document.
3. **Implicit vs. Explicit Returns:** 
   - **Implicit:** If the last statement is a plain expression (e.g. `2 + 3` or `myVar`), Smark automatically returns its value.
   - **Explicit:** You can also use the `return` keyword at the end of the block (e.g. `return "hello";`).

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
* **Local Block Isolation:** Variables declared inside any block-level tag (like `[div]` or `[for-each]`) are isolated. Smark automatically deletes them when the block closes (`[end]`), so they cannot leak outside.

  **Inside the block (Works):**
  ```javascript
  [div]
    static ${ const x = 24; }$
    static ${ return x; }$ // OK: accessible inside the block and its children
  [end]
  ```

  **Outside the block (Fails):**
  ```javascript
  [div]
    static ${ const x = 24; }$
  [end]
  
  static ${ return x; }$ // Error: 'x' is not defined (cleaned up when the block ended)
  ```



### Supported vs. Blocked Code

#### What is Supported:
* **Modern JavaScript:** Loops (`for`, `while`), conditions (`if`, `switch`), helper functions, arrays, and objects.
* **Sandbox APIs:** Access to `SomMark.settings`, `SomMark.fetch()`, `SomMark.compile()`, `SomMark.raw()`, and `SomMark.tag()`.
* **State Sharing:** Variables defined with `let`, `const`, `var`, or `function` persist across blocks.

#### What is Blocked (Not Supported):
* **At-Blocks & Inline Statements:** `static` blocks are designed to work strictly inside block-level tags (like `[id][end]`) and text nodes. They do **not** work inside At-Blocks (`@_id_@; ... @_end_@`) or inline statements.
* **Host APIs:** Native Node.js or browser APIs (like `fs`, `process`, `child_process`, standard `fetch`, `window`, `document`) are blocked for security.
* **Nested `return` at the top level:** You cannot put the `return` keyword inside an `if` block or loop at the top level of the script (this throws a JavaScript syntax error). 

  **What Fails:**
  ```javascript
  static ${
    if (true) {
      return "Hello"; // Error: return cannot be nested in an 'if' block here
    }
  }$
  ```

  **What Works (Use a function):**
  If you need complex conditions, wrap the logic in a function and call it:
  ```javascript
  static ${
    function getMessage() {
      if (true) {
        return "Hello"; // OK: return is inside a standard function
      }
    }
    return getMessage(); // OK: return is at the top level of the script
  }$
  ```

