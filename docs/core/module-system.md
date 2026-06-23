# SomMark Module System

The module system lets you split your templates into separate `.smark` files and reuse them across pages. Modules support variables, inner layout slots, automatic indentation, and caching.

---

## 1. Basic Usage

Using a module is two steps: **import** it, then **use** it.

### Step 1: Declare the Import

Add an import at the very top of your file — before any content, comments, or other blocks:

```ini
[import = Card: "components/Card.smark" !]
```

* The alias (`Card`) is the name you use to call the module later in the file.
* Only `.smark` files are supported. If you leave off the extension, SomMark adds `.smark` automatically.
* Import blocks are stripped during compilation — they never appear in the output.
* You can set up short path aliases (like `@/` → `src/components/`) using the `importAliases` option.

### Step 2: Use the Module

You have two ways to use an imported module:

#### Option A: Paste In Place (`$use-module`)
Inserts the compiled content of the module directly at that position:
```smark
[$use-module = Card !]
```

#### Option B: Call as a Component Block
Treats the module like a custom block. You can pass variables to it and give it inner content:
```smark
[Card = title: "Welcome", theme: "dark"]
  This is the card body text.
[end:Card]
```

---

## 2. Component Features

When you call a module as a component block, you get two extra features:

### Variables (`v{...}`)

Inside a module file, write `v{name}` wherever you want a value inserted. When you call the component, the values you pass replace those placeholders at compile time.

For example, calling:
```smark
[Card = title: "Hello"][end:Card]
```
...replaces every `v{title}` inside `Card.smark` with `"Hello"`.

### Slots (`[slot !]`)

A module can define a spot where the caller's body content goes, using `[slot !]`:

Inside `Card.smark`:
```smark
[div = class: "card-body"]
  [slot !]
[end:div]
```

Calling the component with body content:
```smark
[Card]Click me[end:Card]
```

The text `Click me` is injected where `[slot !]` was.

The slot engine also detects the indentation in front of `[slot !]` and applies the same indentation to every line of the injected content, so the output stays properly formatted.

---

## 3. How It Works Under the Hood

### Path Resolution (`baseDir`)

When a module imports another module using a relative path, SomMark needs to know which folder the path is relative to. This is `baseDir`.

**Example:**
```
my-project/
├── index.smark
└── components/
    ├── Card.smark
    └── Button.smark
```

- `index.smark` imports `Card.smark`:
  ```ini
  [import = Card: "components/Card.smark" !]
  ```
- `Card.smark` imports `Button.smark`:
  ```ini
  [import = Button: "./Button.smark" !]
  ```

When the compiler processes `Card.smark`, it needs to know that `./Button.smark` means `components/Button.smark` — not `Button.smark` in the root folder. SomMark handles this automatically by giving each sub-module its own `baseDir` set to its own folder.

**You only need to set `baseDir` manually in two cases:**

1. **Compiling a string directly** (there is no file path to use as an anchor):
   ```javascript
   const smark = new SomMark({
       src: `[import = Card: "./components/Card.smark" !]`,
       filename: "anonymous",
       baseDir: "/home/user/my-project/src/templates/"
   });
   ```
   Without `baseDir`, relative imports would resolve from your terminal's current directory, which causes file-not-found errors in automated environments.

2. **Custom build scripts** that run in a different directory from your templates.

### Caching

Each `.smark` file is parsed only once. After the first import, SomMark stores the AST and reuses it for all later imports of the same file — no extra disk reads or parsing.

Because each component call needs its own copy of the AST (to substitute different variable values), SomMark clones it using a hand-optimized cloner that is up to 11× faster than `structuredClone`.

### Output Cleanup

The module system automatically removes extra blank lines and trailing whitespace around imported blocks so the output stays tidy.

### Safety Guards

* **Recursion limit**: If imports nest more than 5 levels deep (configurable with `maxDepth`), compilation stops with an error.
* **Circular imports**: If file A imports file B which imports file A, compilation stops immediately.
* **Unused imports**: If you import a module but never use it, SomMark logs a warning (not an error).

---

## 4. Full Example

### `components/Card.smark`
```ini
[div = class: "card"]
  [h2]v{title}[end:h2]
  [div = class: "content"]
    [slot !]
  [end:div]
[end:div]
```

### `index.smark`
```ini
[import = Card: "components/Card.smark" !]

[Card = title: "Product Feature"]
  This is custom slot content.
[end:Card]
```

### Output
```html
<div class="card">
  <h2>Product Feature</h2>
  <div class="content">
    This is custom slot content.
  </div>
</div>
```
