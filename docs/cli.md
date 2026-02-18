# SomMark CLI Guide

The **SomMark CLI** lets you convert `.smark` files into **HTML**, **Markdown**, or **MDX** right from your terminal.

## How to Install

You can run SomMark commands using `npx` without installing anything, or you can install it globally on your computer.

```bash
# Option 1: Run instantly with npx
npx sommark [command]

# Option 2: Install globally
npm install -g sommark
```

---

## 1. Basic Commands

The basic command structure is `sommark [flags] [file]`. You must tell SomMark **what output format** you want.

```bash
# Convert to HTML
sommark --html index.smark

# Convert to Markdown
sommark --markdown index.smark

# Convert to MDX
sommark --mdx index.smark

# Convert to json
sommark --json index.smark

# Convert to Plain Text
sommark --text index.smark
```

---

## 2. Changing the Output

By default, SomMark saves the new file in the same folder as the original file. You can change this by specifying folder path after `-o` (output) flag.

```bash
# Save the HTML file inside the 'dist' folder
sommark --html src/page.smark -o page.html ./dist
```

### Printing to Console
If you want to see the output in your terminal instead of saving strictly to a file, use the `-p` (print) flag.

```bash
# Show HTML code in the terminal
sommark --html -p src/page.smark
```

---

## 3. Configuration File

You can create a `smark.config.js` file to save your settings. This is useful if you have custom helpers or need to load specific styles.

**Example `smark.config.js`:**
```javascript
import { Mapper } from "sommark";

// Register a custom block
const Helper = new Mapper();
Helper.register("YouTube", ({ args }) => {
  return `<iframe src="https://youtube.com/embed/${args[0]}"></iframe>`;
});

export default {
    mapper: Helper,        // Use your custom mapper
    style: "night-owl"     // Set default highlighting theme
};
```

To use this config file, simply run your command in the same directory:
```bash
sommark --html page.smark
```

---

## Full Command List

| Command | Short | Description |
| :--- | :--- | :--- |
| `--help` | `-h` | Show the help menu. |
| `--version` | `-v` | Show the current version. |
| `--html` | | Output an HTML file. |
| `--markdown`| | Output a Markdown file. |
| `--mdx` | | Output an MDX file. |
| `--text` | | Output a plain text file. |
| `-o` | | Specify output file path. |
| `-p` | | Print output to console (stdout). |
