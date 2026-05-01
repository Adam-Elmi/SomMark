# Configuration Guide

The `smark.config.js` file is the central place to store your project settings. It ensures that SomMark behaves exactly how you want across your entire workspace.

## 1. Quick Setup

To create a fresh configuration file, simply run:

```bash
sommark init
```

This creates a `smark.config.js` file in your current folder. SomMark will automatically find and use this file whenever you run a command in this directory.

---

## 2. Available Options

Inside the file, you export a simple JavaScript object. Here are the most common settings:

| Option | Type | Example | Purpose |
| :--- | :---: | :--- | :--- |
| `outputDir` | `string` | `"./dist"` | Where to save the finished files. |
| `outputFile` | `string` | `"index"` | The default name for your converted files. |
| `removeComments` | `boolean` | `true` | Whether to delete `#` notes from the output. |
| `placeholders` | `object` | `{ user: "Adam" }` | Data for your `p{user}` tags. |
| `customProps` | `array` | `["data-test"]` | Allows extra HTML attributes. |

---

## 3. How Priorities Work

SomMark uses a "Smart Discovery" system to find your settings. If you have configuration files in multiple locations, it follows this strict priority order to determine which settings "win":

1.  **CLI Flags**: Settings typed directly into the terminal (like `-o` or `--json`) **always** have the highest priority.
2.  **Target File Directory**: SomMark first looks for `smark.config.js` in the **same folder** as the file you are converting. This allows you to have project-specific settings that follow your source files.
3.  **Current Working Directory (CWD)**: If no config is found next to the source file, it falls back to the `smark.config.js` in the folder where you are currently running the command.

### Example: Which one wins?
Imagine you are inside a root folder, but you are converting a file in a sub-project:
- `./smark.config.js` (Root)
- `./sub-project/smark.config.js` (Local)

If you run `sommark --html sub-project/main.smark`, the settings from **`./sub-project/`** will be used. This ensures your sub-projects always use their intended mappers and options without interference from global settings.

### Verifying your config
If you are unsure which configuration is being applied to a specific file, use the diagnostic command:
```bash
sommark show config path/to/your/file.smark
```

---

## 4. Real-World Configuration Example

Here is a typical `smark.config.js` for a modern web project:

```javascript
/* smark.config.js */

export default {
    // 1. Where to save output
    outputDir: "./build",
    outputFile: "index",

    // 2. Global Variables for your content
    placeholders: {
        siteTitle: "SomMark Documentation",
        author: "Adam Elmi",
        v: "4.0.0"
    },

    // 3. Keep comments in the output for debugging
    removeComments: false,

    // 4. Allow specific data attributes
    customProps: ["data-site-id", "data-tracking-enabled"]
};
```

---

## 5. Helpful Tips

1.  **Use ESM Syntax**: Always use `export default { ... }`. SomMark V4 is built on modern JavaScript.
2.  **Verify Your Path**: Not sure if your config is loading? Run `sommark show config` to see the exact resulting settings.
3.  **Directory Check**: Run `sommark show --path-config` to see the absolute path of the config file currently being used.
