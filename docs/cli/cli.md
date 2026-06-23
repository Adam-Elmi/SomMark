# CLI Manual

The SomMark CLI converts `.smark` files, prints debug output, and manages your project settings.

## 1. General Pattern

```bash
sommark [command/format] [sourceFile] [outputFlag] [outputName] [outputDir]
```

The order of arguments matters. Flags must appear in the correct position.

---

## 2. Convert a File

Use a format flag to convert a `.smark` file:

```bash
sommark --html input.smark
```

Supported formats:

| Flag | Output | Extension |
| :--- | :--- | :---: |
| `--html` | Web page | `.html` |
| `--markdown` | CommonMark | `.md` |
| `--mdx` | JSX/React Markdown | `.mdx` |
| `--xml` | XML | `.xml` |
| `--json` | AST/Data | `.json` |
| `--jsonc` | Compact JSON | `.jsonc` |
| `--text` | Plain text | `.txt` |

---

## 3. Preview in Terminal (`-p`)

To print the result to the terminal without saving a file, add `-p` as the **second argument** (before the file path):

```bash
sommark --html -p input.smark
```

> `-p` must come before the file path. `sommark --html input.smark -p` will not work.

---

## 4. Custom Output Name and Folder (`-o`)

To save with a specific filename or into a specific folder, use `-o` as the **third argument**:

```bash
sommark --html input.smark -o my-page ./dist/
```

- `my-page` — the output filename (without extension)
- `./dist/` — the folder to save into

> [!CAUTION]
> Do not combine the name and path into one string. `sommark --html input.smark -o ./dist/my-page` will not work. Always pass the filename and the folder as two separate arguments.

---

## 5. Browser Bundle (`bundle`)

Copies the SomMark browser build files into a folder in your project:

```bash
sommark bundle ./public/sommark
```

**Partial bundles:**

| Flag | File | Use when |
| :--- | :--- | :--- |
| *(none)* | Full bundle + WASM | You use `static ${}$` or `runtime ${}$` blocks |
| `--lite` | `sommark.browser.lite.js` | Pure markup only, no JS evaluation |
| `--only-parser` | `sommark.parser.js` | You need to parse SomMark into an AST |
| `--only-lexer` | `sommark.lexer.js` | You need tokens only (syntax highlighting, linting) |

```bash
sommark bundle ./public/sommark --lite
sommark bundle ./public/sommark --only-lexer
sommark bundle ./public/sommark --only-parser
```

---

## 6. Debug Tools

Print what the compiler sees internally:

```bash
sommark --lex input.smark     # Print the token stream
sommark --parse input.smark   # Print the AST
```

---

## 7. Project Commands

### `init`
Creates a `smark.config.js` in your current folder:
```bash
sommark init
```

### `show`
Inspect your active configuration:
```bash
sommark show config                        # Print active config settings
sommark show config path/to/file.smark     # Print config for a specific file
sommark show --path-config                 # Print the path to the config file being used
sommark show --path-config path/to/file.smark
```

### `color`
Enable or disable terminal colors:
```bash
sommark color on    # Show instructions for enabling colors
sommark color off   # Show instructions for disabling colors
```

---

## 8. Global Flags

| Flag | What it does |
| :--- | :--- |
| `-v`, `--version` | Print the SomMark version |
| `-h`, `--help` | Print the help manual |

---

## 9. Quick Reference

| Goal | Command |
| :--- | :--- |
| Convert to HTML | `sommark --html input.smark` |
| Convert to MDX | `sommark --mdx input.smark` |
| Print result to terminal | `sommark --json -p input.smark` |
| Save to custom folder | `sommark --html input.smark -o index ./build/` |
| Copy browser bundle | `sommark bundle ./public/sommark` |
| Copy lite browser bundle | `sommark bundle ./public/sommark --lite` |
| Inspect tokens | `sommark --lex input.smark` |
| Inspect AST | `sommark --parse input.smark` |
| Check active config | `sommark show config` |
| Check config file path | `sommark show --path-config` |
