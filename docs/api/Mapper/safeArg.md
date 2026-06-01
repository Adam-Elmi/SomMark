# safeArg

Safely retrieves positional or named arguments from an AST node with type validation and fallback support.

---

**Syntax:**
```js
mapper.safeArg({ args, index, key, type, setType, fallBack })
```

**Usage**
```js
const name = this.safeArg({ args, index: 0, key: "name", fallBack: "Anonymous" });
```

---

**Options:**

*   **`args`**: The argument object from the context (e.g., `({ args })`).
*   **`index`**: The positional index of the argument (e.g., `0` for `[tag = "value"]`).
*   **`key`**: The named key of the argument (e.g., `"color"` for `[tag = color: "red"]`).
*   **`type`**: The expected type of the resolved value.
    - Can be a `typeof` string (e.g., `'string'`, `'number'`, `'boolean'`).
    - Can be a predicate function (e.g., `isArray`, `isObject`).
*   **`setType`**: A transformer function applied **only** during type check validation. **Must be paired with `type`** (using `setType` without `type` has no effect).
*   **`fallBack`**: The default value returned if validation fails or the argument is missing.

> [!IMPORTANT]
> `safeArg` returns the **original raw value** from `args` even when `setType` is used to validate casting. It does not return the casted type.

---

## Examples

### 1. Retrieving a Named Argument
```js
mapper.register("box", function({ args, content }) {
    const color = this.safeArg({ 
        args, 
        key: "color", 
        fallBack: "blue" 
    });
    
    return this.tag("div").attributes({ style: `color:${color};` }).body(content);
});
```

### 2. Retrieving a Positional Argument
Positional arguments in Smark are stored as numeric indices on the `args` object.

```js
// Input: [person = "Adam", "Dev"][end]
mapper.register("person", function({ args }) {
    const name = this.safeArg({ args, index: 0, fallBack: "Anonymous" });
    const role = this.safeArg({ args, index: 1, fallBack: "Guest" });
    
    return `Name: ${name}, Role: ${role}`;
});
```

### 3. Type Validation with Casting (`setType`)
`setType` is used to validate if a raw string argument (like `"10"`) can be successfully cast to the expected type (like a `'number'`). The method still returns the raw string.

> [!NOTE]
> `type` and `setType` work together to compare the transformed type to the expected type. If `type` is omitted, no validation occurs and `setType` is ignored.

```js
mapper.register("counter", function({ args }) {
    // Validates that Number("10") is a "number", but returns raw string "10"
    const count = this.safeArg({
        args,
        key: "count",
        setType: Number, // converts the value to the expected type
        type: "number", // expected type
        fallBack: "0"
    });
    // Behind the scene it does: if (setType(arg) === type) return arg else return fallBack
    return `Count is: ${count}`;
});
```

---

### Priority Resolution

If both `index` and `key` are specified, `safeArg` resolves **`index`** first. If no valid value is resolved, it checks **`key`**. If both fail, it returns **`fallBack`**.