# Arguments and Metadata

Arguments allow you to pass specific data and settings to your SomMark elements. In V4, all arguments are **Object-based**, meaning they are stored as key-value pairs where the key can be either a name or a numerical index.

## 1. Global Indexing Strategy

Every argument passed into a tag is automatically assigned a numerical index (as a string) based on its order of appearance. This ensures that you can always access data reliably, even if you don't know the exact names.

```ini
[tag = "first", "second", key: "third"]
```
*   `args["0"]` → `"first"`
*   `args["1"]` → `"second"`
*   `args["2"]` → `"third"`
*   `args["key"]` → `"third"`

---

## 2. Argument Keys

Keys define the name of an argument. They are used in **Named Arguments** (`key: value`).

### Unquoted Keys
Simple identifiers that contain only letters, numbers, hyphens, underscores, or dollar signs. They are the most common way to name metadata.
```ini
[tag = color: "blue", size: 10]
```

### Quoted Keys
If your key needs to contain spaces or structural characters (like `:` or `-`), you must wrap it in quotes. 

> [!WARNING]
> **Escaping keys is not supported.** Attempting to escape a character within an unquoted key name (e.g., `c\:lass: "val"`) will trigger a **Parser Error**. Always use quotes for complex key names.

```ini
[tag = "custom-id": 123, "border:color": "red"]
```

---

## 3. Argument Values

Values are the data assigned to an argument or passed as a positional item.

### Unquoted Values
Simple text strings that do not contain structural markers (`,`, `:`, `=`, `]`, `)`). Whitespace at the start and end is automatically trimmed.
```ini
[tag = auto, speed: fast]
```
> [!NOTE]
> To use a structural marker inside an unquoted value, you must **escape** it: `[tag = ratio: 16\:9]`.

### Quoted Values
Text wrapped in quotes. Using quotes **protects** the content from being split by commas or other structural symbols. It also preserves all internal whitespace exactly as written.
```ini
[link = title: "Visit SomMark, the best engine"]
```

---

## 4. Quote Syntax (Delimiters)

SomMark V4 features **Dual Quote Support**, allowing you to use both double (`"`) and single (`'`) quotes as delimiters.

*   **Flexibility**: Use different quote types to nest values without excessive escaping.
*   **Context**: Quotes are only structural within **Headers** (Blocks, Inlines, and At-Blocks). In the body text, they are treated as normal characters.

```ini
# Using double quotes
[div = class: "main-container"]

# Using single quotes for nested content
[div = style: 'background: url("hero.jpg")']
```

---

## 5. Support by Element Type

*   **Blocks**: Support the full spectrum (Positional, Named, Quoted Keys/Values).
*   **At-Blocks**: Support all types within the header (before the `;`).
*   **Inline Statements**: **Positional Only.** While multiple values are supported, they are always indexed numerically.

---

## 6. Advanced Features

### Prefix Layers
Arguments can resolve dynamic values using Prefix Layers:
*   `p{keyword}`: Resolves to a placeholder value from your configuration.
*   `js{data}`: Passes native JavaScript data (Numbers, Arrays, Objects) into the AST.

---

> [!TIP]
> Use **Quotes** whenever your value contains a comma or colon to ensure the parser treats it as a single piece of data.
