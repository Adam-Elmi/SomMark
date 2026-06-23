# Configuration Guide

The `smark.config.js` file is the central place to store your project settings. SomMark reads it automatically whenever you run a command.

## 1. Quick Setup

Run this to create a fresh config file in your current folder:

```bash
sommark init
```

---

## 2. Available Options

| Option | Type | Default | Purpose |
| :--- | :---: | :--- | :--- |
| `format` | `string` | `"html"` | Target output format (`html`, `markdown`, `mdx`, `json`, `xml`, `jsonc`, `text`) |
| `outputDir` | `string` | `"./"` | Where to save the converted files |
| `outputFile` | `string` | `"output"` | Default name for converted files (without extension) |
| `removeComments` | `boolean` | `true` | Remove `#` comment blocks from the output |
| `placeholders` | `object` | `{}` | Global values for `p{key}` placeholders |
| `importAliases` | `object` | `{ "@": "./" }` | Short path aliases for module imports (e.g. `@/Button` → `./Button`) |
| `customProps` | `array` | `[]` | Extra HTML attributes to allow on blocks |
| `fallbackTarget` | `string\|false` | `"style"` | Where unrecognized block attributes go: `"style"` (inline CSS) or `false` to disable |
| `baseDir` | `string\|null` | `null` | Base folder for resolving relative module imports |
| `mapperFile` | `Mapper\|null` | `null` | Custom Mapper instance to use instead of the built-in one |
| `outputValidator` | `function\|null` | `null` | Callback to validate or post-process the output: `async (output) => { ... }` |
| `showSpinner` | `boolean` | `true` | Show a spinner in the terminal while compiling |
| `security` | `object` | *(see below)* | Sandbox and network safety settings |

### Security Sub-Options (`security`)

| Option | Type | Default | Purpose |
| :--- | :---: | :--- | :--- |
| `timeout` | `number` | `5000` | Kill scripts that run longer than this (in milliseconds) |
| `maxDepth` | `number` | `5` | Maximum allowed import nesting depth |
| `allowRaw` | `boolean` | `true` | Allow `SomMark.raw()` inside static blocks |
| `allowFetch` | `boolean` | `true` | Allow `SomMark.fetch()` inside static blocks |
| `allowHttp` | `boolean` | `false` | Allow plain HTTP requests (keep `false` unless you have a reason) |
| `allowedOrigins` | `array` | `[]` | Only allow fetch requests to these domains |
| `allowedExtensions` | `array` | `[]` | Only allow fetching files with these extensions |
| `sanitize` | `function\|null` | `null` | Clean raw HTML before it is written to output: `(html) => { ... }` |

---

## 3. How Priority Works

When multiple config files exist or CLI flags are passed, SomMark follows this order (highest wins):

1. **CLI flags** — anything typed in the terminal (e.g. `-o`, `--html`) always overrides everything
2. **Source file's folder** — SomMark looks for `smark.config.js` in the same folder as the file you are converting
3. **Current working directory** — if no config is found next to the file, it falls back to `smark.config.js` in whatever folder you are running the command from

**Example:** If you run `sommark --html sub-project/main.smark`, the config in `sub-project/` is used — not the one in the root.

To see which config is being used for a specific file:
```bash
sommark show config path/to/your/file.smark
```

---

## 4. Full Config Example

This is the exact file that `sommark init` creates:

```javascript
/* smark.config.js */
export default {
    format: "html",              // Target output format (html, markdown, mdx, json, xml, jsonc, text)
    removeComments: true,        // Strip SomMark comments from the final output
    customProps: [],             // Whitelisted HTML attributes
    placeholders: {},            // Global p{key} placeholders for content injection
    importAliases: {             // Custom path aliases for modules (e.g. { "@": "./src/components" })
        "@": "./"
    },
    fallbackTarget: "style",     // Where unrecognized attributes go: "style" (inline CSS) or false to disable
    outputValidator: null,       // Custom callback: async (transpiledOutput) => { ... }
    baseDir: null,               // Base directory for resolving relative module imports
    showSpinner: true,           // Display a spinner in the terminal during transpilation
    security: {
        allowRaw: true,          // Permit SomMark.raw() inside static blocks
        maxDepth: 5,             // Maximum allowed import nesting depth
        timeout: 5000,           // Kill scripts after this many milliseconds
        allowFetch: true,        // Allow SomMark.fetch() inside static blocks
        allowHttp: false,        // Block plain HTTP requests (recommended)
        allowedOrigins: [],      // Whitelisted domains for fetch (e.g. ["api.github.com"])
        allowedExtensions: [],   // Whitelisted file extensions for imports
        sanitize: null,          // Custom HTML sanitizer: (html) => { ... }
    },
    outputDir: "./",             // Where to save the transpiled files
    outputFile: "output",        // Default output filename (without extension)
};
```

---

## 5. Tips

- Use `export default { ... }` — SomMark uses modern ESM syntax.
- Run `sommark show config` to see the exact settings being applied in your current folder.
- Run `sommark show --path-config` to see the absolute path of the config file being loaded.
