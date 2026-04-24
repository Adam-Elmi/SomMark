The **JSON Mapper** provides the translation logic for converting SomMark document nodes into a structured JSON data format.

> [!IMPORTANT]
> **Block-Only Mapping**: This mapper is designed exclusively for structural data. It only contains rules for **Blocks**. Any Inline or At-Block identifiers will cause an error because they are not registered in the JSON mapper.

> [!TIP]
> SomMark turns JSON from a "strict configuration format" into a "human-friendly authoring format."

## 1. Using JSON

Request the JSON format in your engine settings:

```javascript
const data = await transpile({ src, format: "json" });
```

---

## 2. Core Structure

The JSON Mapper works by creating **Members** (Key-Value pairs). 

### How keys are defined
You set the "key" (the member name) using the first positional argument of a block.
- `[string = "username"] Adam [end]` -> `"username": "Adam"`

---

## 3. Data Type Blocks

SomMark supports five core JSON data types.

### Objects & Arrays
Containers for other data.
- `[Object = "id"] ... [end]` -> `{ ... }`
- `[Array = "id"] ... [end]` -> `[ ... ]`

### Primitives
Simple values for your members.
- `[string = "key"] value [end]` -> `"key": "value"`
- `[number = "key"] 42 [end]` -> `"key": 42`
- `[bool = "key"] true [end]` -> `"key": true`
- `[null = "key"][end]` -> `"key": null`

---

## 4. Complete Example

Using SomMark to author a complex user profile results in much cleaner code than raw JSON.

**SomMark Input:**
```ini
[Object = "user"]
  [string = "name"] Adam Elmi [end]
  [number = "age"] 25 [end]
  [bool = "isVerified"] true [end]
  [Array = "tags"]
    [string] developer [end]
    [string] ai [end]
  [end]
[end]
```

**JSON Output:**
```json
"user": {
  "name": "Adam Elmi",
  "age": 25,
  "isVerified": true,
  "tags": [
    "developer",
    "ai"
  ]
}
```

---

## 5. Why use SomMark for JSON?

Writing raw JSON is prone to errors and lacks the flexibility needed for content-heavy data. SomMark solves these issues at the source level.

### 1. Effortless Long Text
In raw JSON, multi-line strings are difficult to manage and require manual `\n` escaping. In SomMark, you simply write your text naturally within a `[string]` block.

**SomMark Source:**
```re
[string = "bio"]
This is a long biography.
I can use multiple lines and 
special "characters" without 
any manual escaping!
[end]
```

### 2. Built-in Comments
JSON famously doesn't support comments. SomMark allows you to document your data directly in the source using `#` or identifiers, which are then stripped out for valid production output.

### 3. Syntax Safety (No Broken Commas)
The most common JSON error is a missing or trailing comma. SomMark manages all commas and brackets automatically during transpilation, guaranteeing that your output is always syntactically perfect.

### 4. Smart Type Normalization
SomMark provides a safety net for your data types. If a value meant to be a number contains text, the engine automatically defaults it to `0` instead of breaking your application.

---

## 6. Notes

1.  **Strict Typing**: The `number` and `bool` blocks automatically clean your input. `[number] abc [end]` will safely result in `0`.
2.  **No Trailing Commas**: SomMark handles the comma logic automatically. You never have to worry about broken JSON due to an extra comma.
3.  **Indentation**: The output is automatically indented with 2 spaces, making it human-readable immediately.
4.  **Final Output**: The result of the transpiler is a **string**. You must use `JSON.parse()` if you intend to use it as a JavaScript object.
