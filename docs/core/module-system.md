# SomMark Module System

The Module System allows you to divide templates into smaller, reusable files. It uses a clean, block-based syntax that supports dynamic variables, inner layout slots, indentation propagation, and caching.

---

## 1. Core Syntax

Working with a module involves two steps: **declaring the import** and **injecting the module**.

### Step 1: Declare the Import
Imports must be declared at the **very top** of your file, before any renderable content (text, comments, or standard tags).
* **Syntax**: `[import = alias: "path/to/module.smark"][end]`
* **Strict Extension Enforcement**: The module system **only** supports files with the `.smark` extension. Attempting to load files with any other file extension throws a `Module Extension Error`.
* **Smart Auto-Extension Fallback**: If the specified path does not end with `.smark` and the file is not found on disk, the resolver automatically appends `.smark` to the path and attempts to load it. For example, `[import = header: "components/header"][end]` will resolve to `components/header.smark` automatically.
* **Import Path Aliases**: You can configure custom import path mappings (like `@/` to `src/components/`) by passing the `importAliases` object option to the `SomMark` engine constructor. When a declared import path starts with any of these configured prefixes, the resolver replaces the prefix with the mapped path and resolves it relative to the root directory (`process.cwd()`).
* **Operational Fact**: The compiler strips all `[import]` blocks during parsing. They are never rendered in the final output.

### Step 2: Inject the Module
You can inject the imported file using one of two distinct patterns:

#### Pattern A: Direct Static Injection (`$use-module`)
Directly inserts the entire compiled contents of the module in place.
```smark
[$use-module = header][end]
```

#### Pattern B: Component Block Injection (`[Alias]`)
Allows you to treat the module like a custom block tag, passing variables and embedding custom inner layout content.
```smark
[Card title: "Welcome", theme: "dark"]
  This is the card body text.
[end]
```

---

## 2. Advanced Component Features

When using the **Component Block** pattern, modules support dynamic parameters and nested layout templates:

### Dynamic Variables (`v{...}`)
Within your sub-module template, you can declare dynamic variable placeholders using the `v{variableName}` syntax.
* **How it works**: When you call the component block, the arguments you pass (e.g. `[Card title: "Hello"][end]`) are bound to the inner variables, replacing `v{title}` with `"Hello"` during compilation.

### Inner Layout Slots (`[slot]`)
Your sub-module file can define where external embedded content should be injected using the `[slot][end]` block.
* **How it works**: If you call a component block with body content:
  ```smark
  [Card]Click me[end]
  ```
  And the imported `Card.smark` contains:
  ```smark
  [div = class: "card-body"]
    [slot][end]
  [end]
  ```
  The body content (`Click me`) is automatically injected into the slot.

### Indentation Propagation
To ensure the compiled markup looks beautiful, the slot engine automatically detects the leading indentation (tabs or spaces) of the text node preceding the `[slot][end]` block inside the module. It recursively prepends that exact indentation to every line of the injected layout body.

## 3. Under the Hood: Optimizations & Safety

### Base Directory Resolution (`baseDir`)
The `baseDir` is the absolute directory used to resolve relative import paths.

#### Why `baseDir` is Necessary (Example)
Imagine this folder structure:
```text
my-project/
├── index.smark
└── components/
    ├── Card.smark
    └── Button.smark
```

1. Inside `components/Card.smark`, you want to import the button:
   ```ini
   [import = Button: "./Button.smark"][end]
   ```
2. Inside the root `index.smark`, you import the card:
   ```ini
   [import = Card: "components/Card.smark"][end]
   ```

* **The Problem**: When the compiler is processing `index.smark` in the root folder, it opens `components/Card.smark`. Next, it sees `[import = Button: "./Button.smark"]`. Without a base directory reference, the compiler would look for `Button.smark` in the root folder (`my-project/Button.smark`) and fail.
* **The Solution**: The engine automatically assigns a custom `baseDir` to each module. When loading `components/Card.smark`, the sub-compiler's `baseDir` is set to `my-project/components/`. Now, the relative import `./Button.smark` is resolved correctly relative to the card's folder, finding the file at `my-project/components/Button.smark`.

#### Resolution Fallback Rules
* If `baseDir` is not passed to the constructor, the compiler sets it to `path.dirname(filename)` (the directory containing the active file).
* If the source code is parsed as `"anonymous"`, it falls back to the project root directory (`process.cwd()`).

#### When to Explicitly Configure `baseDir`
For standard file transpilation, you **never** need to manually configure `baseDir` because the engine handles it automatically.

However, you **must** explicitly configure and update `baseDir` in these scenarios:

1. **Dynamic Compilation of Memory Strings**: If you are compiling a raw template string directly from memory, the compiler doesn't have a real file path on disk to use as an anchor:
   ```javascript
   const smark = new SomMark({
       src: `[import = Card: "./components/Card.smark"][end]`,
       filename: "anonymous", 
       baseDir: "/home/user/my-project/src/templates/" // Explicitly anchors relative imports
   });
   ```
   * **Why**: Without setting `baseDir`, the compiler would resolve `./components/Card.smark` relative to whatever folder the terminal is currently in (`process.cwd()`), which can easily cause file-not-found errors during automated runs.

2. **Custom Build Pipelines**: If you write custom build scripts, tasks, or scaffolding tools where your script runs inside one directory but needs to compile Smark templates stored elsewhere, explicitly setting `baseDir` makes the compilation fully location-independent of the active terminal execution path.

### Sub-AST Caching
The compiler parses an imported `.smark` file exactly once and caches its Abstract Syntax Tree (AST) in a shared memory cache (`moduleCache`). Subsequent imports of the same file avoid disk reads and parsing operations.

### High-Speed AST Cloning
Because caching requires duplicating the AST for safe local variable replacement, SomMark uses a custom, hand-optimized AST cloner (`cloneAst`) instead of the slow native `structuredClone`. This achieves up to **11x faster cloning performance**.

### Whitespace & Newline Trimming
To keep output files clean, the module system automatically detects and trims newlines and trailing whitespace surrounding structural tags, comments, and file boundaries.

### Recursion & Circular Dependency Guards
* **Recursion Guard**: The module resolution tracks depth. If nesting exceeds the maximum allowed depth (`maxDepth`, defaulting to `5`), it aborts with a security error.
* **Circular Import Block**: The engine tracks the absolute file path stack (`importStack`) of the active compilation chain. If a file imports itself (e.g., `A` imports `B` which imports `A`), compilation stops immediately with a `Circular Dependency Detected` error.
* **Unused Module Warnings**: If an import is declared but never injected, a non-blocking `UnusedModule` warning is pushed to the compiler's warnings array.

---

## 4. Concrete Code Example

Here is a full example showing a parent page importing and calling a `Card` component:

### 1. The Sub-Module file (`components/Card.smark`)
```ini
[div = class: "card"]
  [h2]v{title}[end]
  [div = class: "content"]
    [slot][end]
  [end]
[end]
```

### 2. The Main Template file (`index.smark`)
```ini
[import = Card: "components/Card.smark"][end]

[Card = title: "Product Feature"]
  This is custom slot content.
[end]
```

### 3. Final Rendered HTML Output
```html
<div class="card">
  <h2>Product Feature</h2>
  <div class="content">
    This is custom slot content.
  </div>
</div>
```
