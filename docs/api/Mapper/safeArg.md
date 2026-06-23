# safeArg

Safely retrieves positional or named arguments from an AST node with type validation and fallback support.

---

**Syntax:**
```js
mapper.safeArg({ props, index, key, type, setType, fallBack })
```

**Usage**
```js
const name = this.safeArg({ props, index: 0, key: "name", fallBack: "Anonymous" });
```

---

**Options:**

*   **`props`**: The props object from the context (e.g., `({ props })`).
*   **`index`**: The positional index of the prop (e.g., `0` for `[id = "value"]`).
*   **`key`**: The named key of the prop (e.g., `"color"` for `[id = color: "red"]`).
*   **`type`**: The expected type of the resolved value.
    - Can be a `typeof` string (e.g., `'string'`, `'number'`, `'boolean'`).
    - Can be a predicate function (e.g., `isArray`, `isObject`).
*   **`setType`**: A transformer function applied **only** during type check validation. **Must be paired with `type`** (using `setType` without `type` has no effect).
*   **`fallBack`**: The default value returned if validation fails or the prop is missing.

> [!IMPORTANT]
> `safeArg` returns the **original raw value** from `props` even when `setType` is used to validate casting. It does not return the casted type.

---

## Examples

### 1. Retrieving a Named Prop
```js
mapper.register("box", function({ props, content }) {
    const color = this.safeArg({ 
        props, 
        key: "color", 
        fallBack: "blue" 
    });
    
    return this.tag("div").attributes({ style: `color:${color};` }).body(content);
});
```

### 2. Retrieving a Positional Prop
Positional props in Smark are stored as numeric indices on the `props` object.

```js
// Input: [person = "Adam", "Dev"][end:person]
mapper.register("person", function({ props }) {
    const name = this.safeArg({ props, index: 0, fallBack: "Anonymous" });
    const role = this.safeArg({ props, index: 1, fallBack: "Guest" });
    
    return `Name: ${name}, Role: ${role}`;
});
```

### 3. Type Validation with Casting (`setType`)
`setType` is used to validate if a raw string prop (like `"10"`) can be successfully cast to the expected type (like a `'number'`). The method still returns the raw string.

> [!NOTE]
> `type` and `setType` work together to compare the transformed type to the expected type. If `type` is omitted, no validation occurs and `setType` is ignored.

```js
mapper.register("counter", function({ props }) {
    // Validates that Number("10") is a "number", but returns raw string "10"
    const count = this.safeArg({
        props,
        key: "count",
        setType: Number, // converts the value to the expected type
        type: "number", // expected type
        fallBack: "0"
    });
    // Behind the scene it does: if (setType(prop) === type) return prop else return fallBack
    return `Count is: ${count}`;
});
```

---

### Priority Resolution

If both `index` and `key` are specified, `safeArg` resolves **`index`** first. If no valid prop is resolved, it checks **`key`**. If both fail, it returns **`fallBack`**.