# files

An in-memory map of file paths to their string content, used instead of reading from disk or making fetch requests.

---

**Syntax:**
```js
// In engine options
new SomMark({
    src,
    format,
    files: {
        "/path/to/file.smark": "file content here"
    }
})
```

**Usage:**
```js
import SomMark from "sommark";

const engine = new SomMark({
    src: `
        [import = card: "/components/Card.smark" !]
        [$use-module = card !]
    `,
    format: "html",
    files: {
        "/components/Card.smark": "[div = class: \"card\"]Hello[end]"
    }
});

const html = await engine.transpile();
// Output: <div class="card">Hello</div>
```

---

### How It Works

When `files` is provided, SomMark creates a `VirtualFS` — a lightweight in-memory filesystem backed by the object you pass in. All `[import = ...]` path lookups are resolved against this map with no disk reads or network requests.

Paths are normalized on construction, so `"/a/b/../c.smark"` and `"/a/c.smark"` resolve to the same entry.

---

### When to Use `files` vs `baseDir`

| | `files` | `baseDir` |
|:---|:---|:---|
| **Where content lives** | Pre-loaded in memory | Disk (Node.js) or network (browser) |
| **Read strategy** | Instant property lookup, no I/O | File system read or `fetch` |
| **Ideal for** | Testing, SSR bundles, sandboxed environments | Production templates on disk or server |
| **Requires network/disk** | No | Yes |

---

### Example: Testing Without the Filesystem

`files` is the simplest way to unit-test templates that use modules — no disk or network involved:

```js
import SomMark from "sommark";

const engine = new SomMark({
    src: `
        [import = layout: "/Layout.smark" !]
        [$use-module = layout !]Page content[end]
    `,
    format: "html",
    files: {
        "/Layout.smark": "[main][slot][end][end]"
    }
});

const html = await engine.transpile();
console.log(html);
// Output: <main>Page content</main>
```

### Example: Nested Module Imports

All files referenced by `[import = ...]` anywhere in the template tree must be present in the `files` map, including modules imported by other modules:

```js
import SomMark from "sommark";

const engine = new SomMark({
    src: `
        [import = page: "/Page.smark" !]
        [$use-module = page !]
    `,
    format: "html",
    files: {
        "/Page.smark": `
            [import = card: "/Card.smark" !]
            [$use-module = card !]
        `,
        "/Card.smark": "[div = class: \"card\"]Content[end]"
    }
});

const html = await engine.transpile();
// Output: <div class="card">Content</div>
```

---

> [!NOTE]
> `files` and `baseDir` are mutually exclusive. When `files` is provided, a `VirtualFS` is created and `baseDir` is ignored for module resolution. The working directory (`cwd`) is set to `"/"` when using `files`.

---

[Read baseDir.md for disk and network-based resolution](baseDir.md)

[Read importAliases.md for custom path aliases](importAliases.md)

[Read security.md for sandboxing imported modules](security.md)
