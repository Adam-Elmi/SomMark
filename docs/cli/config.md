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

If you have settings in multiple places, SomMark follows this simple "Winner" order:

1.  **CLI Flags**: If you type `-o customName` in the terminal, it **always** wins.
2.  **Explicit Config**: If you use the `-c my-config.js` flag, that file wins.
3.  **Local Folder Config**: The `smark.config.js` in your current folder.

**Example: Which one wins?**
- `smark.config.js` says `outputFile: "main"`.
- You run `sommark --html input.smark -o final`.
- **Result**: The file will be named `final.html` because the CLI flag wins.

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
