# JSON Mapping Guide

The **JSON Mapper** provides the translation logic for converting SomMark document nodes into a structured, type-safe JSON string. By organizing your document into typed blocks, SomMark turns JSON from a strict, error-prone configuration layout into a clean, human-friendly, and maintainable authoring format.

---

## 1. Using JSON

To compile your templates to JSON, initialize the transpilation pipeline with the `"json"` format:

```javascript
import SomMark from "sommark";

const sm = new SomMark({
  src: sourceText,
  format: "json"
});

const jsonString = await sm.transpile();
// The result is a standard valid JSON string.
// Use JSON.parse(jsonString) to convert it back into an active JS object.
```

---

## 2. Core Key & Value Resolution Rules

The JSON Mapper (`mappers/languages/json.js`) operates recursively on blocks using a specialized AST processor (`handleAst: true`). How members are named and valued depends on whether they reside inside an **Object`** or an **Array**:

### I. Member Keys (Inside Objects)
In a parent Object block, member keys (names) are resolved in two ways (both work, but **explicit named parameters are highly preferred** for clarity and code safety):
1.  **Explicit `key` Attribute** *(Preferred)*: The named `key: "name"` argument.
2.  **First Positional Argument**: The first unnamed string argument in the block header.
- `[string = key: "username"] Adam [end]` compiles to `"username": "Adam"` *(Preferred)*
- `[string = "username"] Adam [end]` compiles to `"username": "Adam"`

### II. Array Values (Inside Arrays)
Inside a parent Array block, members do **not** have keys. The first positional argument in the child header is automatically treated as the **actual value** (falling back to the block body if omitted).
- `[string = "developer"][end]` inside `[Array]` compiles to `"developer"`
- `[string] developer [end]` inside `[Array]` compiles to `"developer"`

### III. Self-Closing Blocks (`!`) & Explicit `value` Key
For maximum efficiency, you can avoid writing block-body text and structural `[end]` tags entirely. Simply use a **Self-Closing Block** (ending with an exclamation mark `!`) and pass the value using the named `value` parameter:

*   **In Objects**: Set the member name as the explicit `key` parameter (preferred) or the first positional argument, and set the value using the named `value` attribute:
    - `[string = key: "username", value: "Adam" !]` compiles to `"username": "Adam"` *(Preferred)*
    - `[string = "username", value: "Adam" !]` compiles to `"username": "Adam"`
    - `[number = key: "age", value: 25 !]` compiles to `"age": 25` *(Preferred)*
    - `[bool = key: "isActive", value: true !]` compiles to `"isActive": true` *(Preferred)*
*   **In Arrays**: Since arrays ignore keys, simply pass the value as the first positional argument:
    - `[string = "developer" !]` compiles to `"developer"`
    - `[number = 42 !]` compiles to `42`
    - `[bool = true !]` compiles to `true`

> [!NOTE]
> **Container vs. Primitive Scoping**:
> * When a container block (like `[Array]` or `[Object]`) is nested as a direct child of an `[Object]`, it represents a key-value member and **must** have a key (e.g. `[Array = key: "ids"]`).
> * However, all elements nested *inside* that `[Array]` block are array items and **do not** have keys (e.g., using `[number = 101 !]`).
>
> **Example**: To represent `{ "ids": [101, 202, 303] }`:
> ```ini
> [Object]
>   [Array = key: "ids"]
>     [number = 101 !]
>     [number = 202 !]
>     [number = 303 !]
>   [end]
> [end]
> ```

---

## 3. Data Type Blocks

SomMark supports six registered JSON structural and primitive blocks:

### 1. `[Object]` / `[object]`
- **Type**: Block Container
- **Purpose**: Creates a JSON object wrapping other properties.
- **Example**:
  ```ini
  [Object = "profile"]
    [string = "name"] Sarah [end]
  [end]
  ```
  **JSON Output**:
  ```json
  "profile": {
    "name": "Sarah"
  }
  ```

### 2. `[Array]` / `[array]`
- **Type**: Block Container
- **Purpose**: Creates a JSON array listing other values.
- **Example**:
  ```ini
  [Array = "roles"]
    [string] admin [end]
    [string = "editor"][end]
  [end]
  ```
  **JSON Output**:
  ```json
  "roles": [
    "admin",
    "editor"
  ]
  ```

### 3. `[string]`
- **Type**: Primitive Block
- **Purpose**: Represents a double-quoted JSON string.
- **Parameters**: 
  - `trim` *(boolean, defaults to `false`)*: Instructs Smark to automatically strip all leading/trailing whitespaces and newlines from the resolved string before JSON-escaping it. Smark's `safeArg` parser co-evaluates `"true"` (string) and `true` (boolean):
    *   **With `trim: true`**: Trims leading and trailing margins.
        ```ini
        [string = "msg", trim: true]
          Hello World  
        [end]
        ```
        **JSON Output**: `"msg": "Hello World"`
    *   **With `trim: false` (Default)**: Fully preserves all leading and trailing indentation margins and newlines.
        ```ini
        [string = "msg", trim: false]
          Hello World  
        [end]
        ```
        **JSON Output**: `"msg": "\n  Hello World  \n"`
  - `value` / `index 0` (in arrays) - Explicitly sets the string value in the header. If omitted, falls back to the block's text body.
- **Example**:
  ```ini
  [string = key: "bio", trim: true]
    A passionate developer.  
  [end]
  ```
  **JSON Output**:
  ```json
  "bio": "A passionate developer."
  ```

### 4. `[number]`
- **Type**: Primitive Block
- **Purpose**: Represents a numeric value.
- **Sanitization**: Automatically sanitizes input: if the value is empty or not a valid number, Smark safely defaults it to `0` to prevent throwing syntax exceptions.
- **Example**:
  ```ini
  [number = "age"] 25 [end]
  [number = "invalid"] abc [end]
  ```
  **JSON Output**:
  ```json
  "age": 25,
  "invalid": 0
  ```

### 5. `[bool]`
- **Type**: Primitive Block
- **Purpose**: Represents a boolean value (`true` or `false`).
- **Sanitization**: Defaults to `false` unless the trimmed input string equals `"true"` or `"1"`.
- **Example**:
  ```ini
  [bool = "isActive"] true [end]
  [bool = "isVerified"] 1 [end]
  [bool = "isPending"] off [end]
  ```
  **JSON Output**:
  ```json
  "isActive": true,
  "isVerified": true,
  "isPending": false
  ```

### 6. `[null]`
- **Type**: Primitive Block
- **Purpose**: Represents a literal `null` value. It ignores any internal body content.
- **Example**:
  ```ini
  [null = "deletedUser"][end]
  ```
  **JSON Output**:
  ```json
  "deletedUser": null
  ```

---

## 4. Build-Time Static Logic Support

You can evaluate JavaScript dynamically at compile-time using standard `static ${ ... }$` blocks inside string, number, or boolean tags to dynamically inject structured properties.

**SomMark Source:**
```ini
[Object = "system"]
  [string = "compiledAt"] static ${ new Date().toISOString() }$ [end]
  [number = "version"] static ${ 2 + 2 }$ [end]
[end]
```
**JSON Output**:
```json
"system": {
  "compiledAt": "2026-05-31T12:00:00.000Z",
  "version": 4
}
```

---

## 5. Architectural Advantages Over Raw JSON

1.  **Document Comments**: JSON does not support comments. SomMark allows you to write standard `#` comments anywhere in your source; these are cleanly stripped at compile-time to maintain strict JSON compliance.
2.  **Effortless Multi-line Text**: Writing multi-line strings in raw JSON is difficult and requires manual `\n` character escapes. SomMark preserves standard newlines and double-quotes inside `[string]` blocks automatically.
3.  **Automatic Comma Management**: SomMark handles all nested brackets and commas automatically, completely preventing common syntax errors like trailing commas or missing separators.
4.  **Flexible Whitespace Preservation**: Automatically outputs beautifully indented 2-space JSON formatting while ignoring structural junk whitespaces inside the header declarations.
5.  **Compile-Time JS Execution**: Evaluate JavaScript dynamically at compile-time using `static ${ ... }$` blocks (e.g., to automatically calculate values, resolve environments, or inject build timestamps) directly into string, number, or boolean tags while generating a perfectly compliant JSON output.
6.  **Modular Files**: Raw JSON cannot be split across multiple files. SomMark lets you break down massive JSON documents into smaller, reusable files (`[import]`) and combine them cleanly into one final output.
