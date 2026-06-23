# `importAliases` Option

The `importAliases` option allows you to define custom path mappings (like `@/` or `components/`) to resolve Smark imports cleanly across your codebase. This prevents developers from having to write long relative paths (such as `../../components/Card.smark`) inside deeply nested components.

---

## How It Works

During module resolution, the engine checks every declared import path (e.g., `[import = Card: "@/Card" !]`).

1. If the path starts with a key defined in your `importAliases` object (e.g., `@/`), the engine replaces that key with your configured path replacement.
2. The newly constructed path is resolved as an absolute path relative to the active working directory (`process.cwd()`).
3. If no matching alias is found, the path resolves relative to the active template directory (`baseDir`).

---

## Code Example

### 1. Project Directory Structure
```text
my-project/
├── package.json
├── index.smark
└── src/
    └── components/
        └── Card.smark
```

### 2. Smark Template Input (`index.smark`)
```ini
# Clean, location-independent import using a path alias
[import = Card: "@/components/Card.smark" !]

[Card = title: "Product Card"]
  Card body content...
[end:Card]
```

### 3. JavaScript API Configuration
```javascript
import SomMark from "sommark";
import fs from "node:fs/promises";

const src = await fs.readFile("./index.smark", "utf-8");

const smark = new SomMark({
  src,
  format: "html",
  // Map '@/' to 'src/' relative to process.cwd()
  importAliases: {
    "@/": "src/"
  }
});

const html = await smark.transpile();
console.log(html);
```

---

## Key Behaviors & Rules

* **Prefix-Based Replacement**: Path resolution only replaces the alias if it appears at the **very start** of the path string (`filename.startsWith(prefix)`).
* **Relative to Root**: All replaced paths are resolved directly against the current working directory (`process.cwd()`) rather than the active file's folder.
* **Compatibility**: Path aliases apply to blocks, custom blocks, nested module loaders, and command-line (CLI) build resolutions.
* **Auto-Extension Fallback**: Even when using import aliases, Smark's smart loader will automatically append `.smark` if the file extension is omitted and the target cannot be found on disk.
