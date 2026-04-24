# safeArg

The `safeArg` method is a utility for safely retrieving argument values from an AST node. It handles both named and positional access, provides type validation, and supports fallback values to ensure your renderer doesn't crash on missing or invalid data.

**Syntax:** `this.safeArg({ args, index, key, type, setType, fallBack })`

---

## 1. Options

*   **`args`** (Object): The argument object from the context (e.g., `{ args }`).
*   **`index`** (Number): The positional index (for arguments like `[tag = "First", "Second"]`).
*   **`key`** (String): The named key (for arguments like `[tag = color: "red"]`).
*   **`type`** (String | Function): The expected type.
    *   **String**: Performs a `typeof` check (e.g., `'string'`, `'number'`, `'boolean'`).
    *   **Function**: A custom predicate function (e.g., `isArray`, `isObject`).
*   **`setType`** (Function): A transformer function to cast the value before validation.
*   **`fallBack`** (Any): The value returned if resolution or validation fails.

---

## 2. Real Examples

### Retrieving a Named Color
```js
mapper.register("box", function({ args, content }) {
    const color = this.safeArg({ 
        args, 
        key: "color", 
        type: "string", 
        fallBack: "blue" 
    });
    
    return this.tag("div").attributes({ style: `color:${color}` }).body(content);
});
```

### Retrieving a Positional Argument
In Smark V4, all arguments share the same object. `safeArg` uses numeric keys to find positional ones.

```js
// Smark: [person = "Adam", "Dev"]
mapper.register("person", function({ args }) {
    const name = this.safeArg({ args, index: 0, fallBack: "Anonymous" });
    const role = this.safeArg({ args, index: 1, fallBack: "Guest" });
    
    return `Name: ${name}, Role: ${role}`;
});
```

### Advanced: Numeric Casting
```js
mapper.register("counter", function({ args }) {
    const count = this.safeArg({
        args,
        key: "count",
        setType: Number, // Cast string "10" to number 10
        type: "number",
        fallBack: 0
    });
    
    return `Count is: ${count}`;
});
```

---

## 3. Resolution Priority

If you provide both an `index` and a `key`, `safeArg` checks the **index** first. If a valid value is found there, it is returned immediately. If not, it falls back to checking the **key**.

---

> [!TIP]
> Use **`safeArg`** instead of direct object access (`args.key`) to prevent "undefined" errors and to keep your mapper logic resilient against user input errors.
