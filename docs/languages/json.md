# JSON

Use SomMark to generate JSON from templates.

```js
import SomMark from "sommark";

const sm = new SomMark({ src, format: "json", placeholders: { ... } });
const json = await sm.transpile();
// JSON.parse(json) to get a JS object
```

```bash
sommark --json input.smark
```

---

## Why use SomMark instead of writing JSON directly?

| Problem with raw JSON | How SomMark solves it |
| --------------------- | --------------------- |
| No comments allowed | `#` and `###` comments are stripped at build time |
| No loops — repeated entries must be copy-pasted | `[for-each]` generates repeated entries from an array |
| No dynamic values — everything is hardcoded | `${ }$` runs JavaScript at build time and inlines the result |
| No file splitting — everything in one file | `[import]` merges multiple `.smark` files into one output |
| Trailing commas break the file | Commas handled automatically — you never manage them |
| Nested quotes must be escaped manually | Block body handles quotes naturally |

---

## Writing object fields

### Shorthand — tag name as key

Write the key directly as the tag name. The value goes in the first argument or
the block body. Type is detected automatically:

```ini
[Object]
  [username = "Adam" !]
  [age = 25 !]
  [score = 9.8 !]
  [isAdmin = false !]
  [deletedAt = null !]
[end]
```

```json
{
  "username": "Adam",
  "age": 25,
  "score": 9.8,
  "isAdmin": false,
  "deletedAt": null
}
```

| Value you write | JSON output |
| --------------- | ----------- |
| `"hello"` | `"hello"` (string) |
| `42` | `42` (number) |
| `true` / `false` | `true` / `false` (boolean) |
| `null` | `null` |

Body form works too — useful for longer string values:

```ini
[Object]
  [bio]Software developer based in Hargeisa.[end]
[end]
```

```json
{
  "bio": "Software developer based in Hargeisa."
}
```

### Typed blocks — explicit type, with key prop

Use typed blocks when you need the `trim` option or want to be explicit. Pass
the key via the `key:` named prop:

```ini
[Object]
  [string = key: "bio", trim: true]
    A passionate developer.
  [end]
  [number = key: "port", value: 5432 !]
  [bool = key: "ssl", value: true !]
  [null = key: "deletedAt" !]
[end]
```

`[str]` is an alias for `[string]` — both work.

> The tag name must be a fixed word — `${ variable }$` cannot be used as the
> tag name. For dynamic keys, use `[string]` with two args inside a `[for-each]`:
> `[string = ${ key }$, ${ value }$ !]`

---

## Arrays

Use typed scalar blocks as items — each takes a value with no key:

```ini
[Array]
  [string = "admin" !]
  [string = "editor" !]
  [number = 42 !]
  [bool = true !]
  [null !]
[end]
```

```json
[
  "admin",
  "editor",
  42,
  true,
  null
]
```

`[str]` works inside arrays too: `[str = "hello" !]`

> Using an unknown tag (shorthand) inside `[Array]` is an error — there is no
> key to use. Use the typed blocks above instead.

---

## Nested objects and arrays

Give `[Object]` or `[Array]` a key via the `key:` named prop when nested:

```ini
[Object]
  [username = "Adam" !]
  [Object = key: "address"]
    [city = "Hargeisa" !]
    [country = "Somalia" !]
  [end]
  [Array = key: "roles"]
    [string = "admin" !]
    [string = "editor" !]
  [end]
[end]
```

```json
{
  "username": "Adam",
  "address": {
    "city": "Hargeisa",
    "country": "Somalia"
  },
  "roles": [
    "admin",
    "editor"
  ]
}
```

---

## Loops with `[for-each]`

### Dynamic array from data

```ini
${
  const tags = ["rust", "cli", "json"];
}$

[Array]
  [for-each = ${ tags }$, as: "t"]
    [string = ${ t }$ !]
  [end]
[end]
```

```json
[
  "rust",
  "cli",
  "json"
]
```

### Dynamic array of objects

```ini
${
  const users = [
    { name: "Adam",  age: 25 },
    { name: "Elmi",  age: 40 },
  ];
}$

[Array]
  [for-each = ${ users }$, as: "u"]
    [Object]
      [name = ${ u.name }$ !]
      [age = ${ u.age }$ !]
    [end]
  [end]
[end]
```

```json
[
  { "name": "Adam", "age": 25 },
  { "name": "Elmi", "age": 40 }
]
```

### Dynamic object fields

When keys come from the data, use `[string]` with two args — key first, value
second:

```ini
${
  const deps = [
    { name: "react",   version: "18.0.0" },
    { name: "vite",    version: "5.0.0"  },
  ];
}$

[Object = key: "dependencies"]
  [for-each = ${ deps }$, as: "d"]
    [string = ${ d.name }$, ${ d.version }$ !]
  [end]
[end]
```

```json
{
  "dependencies": {
    "react": "18.0.0",
    "vite": "5.0.0"
  }
}
```

---

## Compile-time values

`${ }$` runs JavaScript at build time and inlines the result:

```ini
[Object]
  [builtAt = ${ new Date().toISOString() }$ !]
  [version = ${ (await import("./package.json", { assert: { type: "json" } })).default.version }$ !]
[end]
```

Declare shared variables once, use everywhere:

```ini
${
  const env = "production";
  const replicas = env === "production" ? 3 : 1;
}$

[Object]
  [env = ${ env }$ !]
  [replicas = ${ replicas }$ !]
[end]
```

```json
{
  "env": "production",
  "replicas": 3
}
```

---

## Placeholders

Inject values at build time without changing the template:

```ini
[Object]
  [host = ${ DB_HOST }$ !]
  [port = ${ DB_PORT }$ !]
[end]
```

```js
new SomMark({
  src,
  format: "json",
  placeholders: { DB_HOST: "db.example.com", DB_PORT: 5432 }
});
```

---

## File splitting with modules

Split a large config across multiple `.smark` files:

```ini
[import = db: "./db.smark" !]
[import = server: "./server.smark" !]

[Object]
  [Object = key: "database"]
    [$use-module = "db" !]
  [end]
  [Object = key: "server"]
    [$use-module = "server" !]
  [end]
[end]
```

`db.smark`:

```ini
[host = "localhost" !]
[port = 5432 !]
[ssl = false !]
```

---

## Comments

SomMark comments are stripped and never appear in the JSON output.

```ini
# this comment disappears
[Object]
  # another comment — gone
  [name = "myapp" !]
[end]
```

For JSON output that keeps comments, use the [JSONC format](./jsonc.md).
