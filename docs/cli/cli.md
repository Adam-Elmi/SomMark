# Command Line Interface (CLI) Manual

The SomMark CLI is a powerful tool for converting files, debugging syntax, and managing project settings.

## 1. Core Usage & Structure

SomMark V4 uses a **Strict Positional Logic**. This means the order of your words in the terminal matters.

**General Pattern:**
```bash
sommark [command/format] [sourceFile] [outputFlag] [outputName] [outputDir]
```

---

## 2. Transpilation Commands

These commands convert your `.smark` files into different formats.

| Format Flag | Output Type | Default Extension |
| :--- | :--- | :---: |
| `--html` | Web Page | `.html` |
| `--markdown` | CommonMark | `.md` |
| `--mdx` | JSX/React Markdown | `.mdx` |
| `--xml` | Generic XML | `.xml` |
| `--json` | AST/Data | `.json` |
| `--text` | Plain Text | `.txt` |

**Example:**
```bash
sommark --html blog.smark
```

---

## 3. Output Management

### Terminal Preview (`-p`)
If you want to see the result without saving a file, use `-p`. It **must** be the second word.
- **Correct**: `sommark --html -p input.smark`
- **Incorrect**: `sommark --html input.smark -p`

### Custom Filename & Folder (`-o`)
To save with a specific name or in a specific folder, use `-o`. It **must** be the third argument.
```bash
sommark --html input.smark -o my-page ./dist/
```
- Argument 3: `-o` (the flag)
- Argument 4: `my-page` (the name)
- Argument 5: `./dist/` (the folder)

> [!CAUTION]
> **Do not combine paths**
> You cannot combine the folder and name like this: `sommark --html input.smark -o ./dist/my-page`.
> The CLI expects these to be **two separate arguments**. If you want to save to a specific directory, you **must** provide the filename first, then the folder.

---

## 4. Debugging Tools

These tools help you see how SomMark "thinks" about your code.

- **`--lex [file]`**: Prints the internal token stream (what the Lexer sees).
- **`--parse [file]`**: Prints the Abstract Syntax Tree (what the Parser builds).

**Example:**
```bash
sommark --parse input.smark
```

---

## 5. Project Commands

These commands help you manage your workspace.

### Initialize Project
Creates a `smark.config.js` in your current folder:
```bash
sommark init
```

### Show Configuration
Check your active settings or finding where your config file is located:
- **`sommark show config`**: Displays the active configuration data.
- **`sommark show --path-config`**: Displays the absolute path of the loaded config file.

### Color Settings
SomMark tells you how to enable or disable terminal colors:
- **`sommark color on`**: Shows instructions for enabling colors.
- **`sommark color off`**: Shows instructions for disabling colors.

---

## 6. Global Flags

- **`-v, --version`**: Shows the current SomMark version.
- **`-h, --help`**: Shows the help manual.

---

## 7. Quick Reference Examples

| Goal | Exact Command Pattern |
| :--- | :--- |
| **Convert to MDX** | `sommark --mdx input.smark` |
| **Print JSON to Console** | `sommark --json -p input.smark` |
| **Custom Path Build** | `sommark --html input.smark -o index ./build/` |
| **Debug Tokens** | `sommark --lex input.smark` |
| **Check Config Path** | `sommark show --path-config` |
