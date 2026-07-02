# SomMark.env()

Reads an environment variable at compile time.

---

**Syntax:**
```js
SomMark.env(key)
```

**Usage:**
```js
static ${
    const apiUrl = SomMark.env("API_URL");
    return `Endpoint: ${apiUrl}`;
}$
```

---

### How It Works

`SomMark.env()` lets your template read values from the server's environment (like `process.env`) while it is being compiled. The result is baked into the output — the environment variable is never exposed to the browser.

Before a variable can be read, you must **allowlist it** in `security.env`. Any key not on the list returns `undefined`, even if it exists in the environment. This keeps templates from reading secrets they were never meant to access.

```js
import { transpile } from "sommark";

const output = await transpile({
    src: 'Endpoint: static ${ SomMark.env("API_URL") }$',
    format: "html",
    security: {
        env: ["API_URL"]   // only this key is readable
    }
});
// Output: Endpoint: https://api.example.com
```

---

### Security

- **Allowlist required** — `security.env` must be an array of the exact key names you want templates to be able to read. Anything not on the list returns `undefined`.
- **Server-side only** — `SomMark.env()` is not available when compiling in a browser. Calling it there throws a clear error explaining why.
- **Values never reach the browser** — the env value is resolved and inlined at compile time. The browser only sees the result.

---

### Example: Reading a Build-Time Config

```js
// .env
// SITE_TITLE=My Awesome Site
// SITE_URL=https://example.com

static ${
    const title = SomMark.env("SITE_TITLE");
    const url   = SomMark.env("SITE_URL");
    return `<meta name="og:title" content="${title}">
<link rel="canonical" href="${url}">`;
}$
```

Compiler call:
```js
await transpile({
    src,
    format: "html",
    security: {
        env: ["SITE_TITLE", "SITE_URL"]
    }
});
```

Output:
```html
<meta name="og:title" content="My Awesome Site">
<link rel="canonical" href="https://example.com">
```

---

### Example: Unlisted Key Returns `undefined`

```js
static ${
    const secret = SomMark.env("DB_PASSWORD"); // not in the allowlist
    return secret ?? "not available";
}$
```

```js
await transpile({
    src,
    format: "html",
    security: {
        env: ["SITE_TITLE"] // DB_PASSWORD is not listed
    }
});
// Output: not available
```

---

### Browser Mode

`SomMark.env()` is not available when running in a browser. If you call it in that context, SomMark throws:

```
SomMark.env() is not available in browser mode.
Environment variables are a server-side concept.
Read env values at build time and pass them as placeholders instead.
```

---

[Read security.md for the full security options reference](../../api/Core/security.md)

[Read settings.md for compile-time settings access](settings.md)

[Read fetch.md for secure HTTP requests](fetch.md)

[Read static.md for compile-time macros inside client scripts](static.md)
