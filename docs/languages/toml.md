# TOML

Use SomMark to generate TOML files from templates.

```js
import SomMark from "sommark";

const sm = new SomMark({ src, format: "toml", placeholders: { ... } });
const toml = await sm.transpile();
```

```bash
sommark --toml input.smark
```

---

## Why use SomMark instead of writing TOML directly?

Raw TOML is a static format — every value must be known when you write the
file, and repeated structures must be copy-pasted by hand.

| Problem with raw TOML | How SomMark solves it |
| --------------------- | --------------------- |
| No loops — repeated `[[array]]` blocks must be duplicated | `[for-each]` generates entries from an array |
| No dynamic values — everything is hardcoded | `${ }$` runs JavaScript at build time and inlines the result |
| No variables — changing one shared value means editing multiple places | Declare once in `${ const x = ... }$`, use everywhere |
| No imports — large configs live in one file | The module system splits configs across files with `[import]` |
| No environment switching — separate files for dev/prod/staging | `placeholders` inject different values without touching the template |
| Datetime values must be typed manually and exactly | `${ new Date().toISOString() }$` computes them at build time |

**Example**: generating a Cargo-style dependency list from data — impossible in
raw TOML without copy-pasting:

```ini
${
  const packages = [
    { name: "serde",   version: "1.0", features: ["derive"] },
    { name: "tokio",   version: "2.0", features: ["full"]   },
    { name: "reqwest", version: "0.11", features: ["json"]  },
  ];
}$

[for-each = ${ packages }$, as: "p"]
  [array-table = "dependencies"]
    [name = ${ p.name }$ !]
    [version = ${ p.version }$ !]
    [array = "features"]
      [for-each = ${ p.features }$, as: "f"]
        [str = ${ f }$ !]
      [end]
    [end]
  [end]
[end]
```

```toml
[[dependencies]]
name = "serde"
version = "1.0"
features = ["derive"]

[[dependencies]]
name = "tokio"
version = "2.0"
features = ["full"]

[[dependencies]]
name = "reqwest"
version = "0.11"
features = ["json"]
```

---

## The two ways to write a key-value pair

**Shorthand** — the tag name is the key, the value is the first argument:

```ini
[name = "My App" !]
[port = 5432 !]
[debug = false !]
[ratio = 1.618 !]
```

```toml
name = "My App"
port = 5432
debug = false
ratio = 1.618
```

Type is inferred automatically — numbers stay numbers, `true`/`false` become
booleans, everything else becomes a quoted TOML string.

**Typed blocks** — use `[str]`, `[int]`, `[float]`, `[number]`, `[bool]` when you need a
value without a key, mainly inside `[array]`:

| Block | Accepts | Error if |
| ----- | ------- | -------- |
| `[int]` | Whole numbers only (`5432`, `-1`) | Value contains a decimal point |
| `[float]` | Decimal numbers only (`3.14`, `1.0`) | Value has no decimal point |
| `[number]` | Any number — integer or float | Value is not numeric |

```ini
[array = "ports"]
  [int = 8001 !]
  [int = 8002 !]
[end]
```

```toml
ports = [8001, 8002]
```

Use `[str]` when a value that looks like a number must stay a string:

```ini
[array = "codes"]
  [str = "007" !]
  [str = "42" !]
[end]
```

```toml
codes = ["007", "42"]
```

---

## Tables — `[table]`

A TOML table is a named section. Put fields inside using the shorthand.

```ini
[table = "database"]
  [host = "localhost" !]
  [port = 5432 !]
  [ssl = true !]
[end]
```

```toml
[database]
host = "localhost"
port = 5432
ssl = true
```

Dotted table names work too:

```ini
[table = "server.production"]
  [ip = "10.0.0.1" !]
[end]
```

```toml
[server.production]
ip = "10.0.0.1"
```

---

## Array of tables — `[array-table]`

Repeat the block to build up the array.

```ini
[array-table = "servers"]
  [host = "alpha" !]
  [ip = "10.0.0.1" !]
[end]

[array-table = "servers"]
  [host = "beta" !]
  [ip = "10.0.0.2" !]
[end]
```

```toml
[[servers]]
host = "alpha"
ip = "10.0.0.1"

[[servers]]
host = "beta"
ip = "10.0.0.2"
```

---

## Inline arrays — `[array]`

Use typed scalar blocks as children — one arg each (just the value, no key).

```ini
[array = "ports"]
  [int = 8001 !]
  [int = 8002 !]
  [int = 8003 !]
[end]
```

```toml
ports = [8001, 8002, 8003]
```

Mixed types:

```ini
[array = "mixed"]
  [str = "hello" !]
  [int = 42 !]
  [bool = true !]
[end]
```

```toml
mixed = ["hello", 42, true]
```

---

## Datetime — `[datetime]`

TOML datetimes are unquoted. Pass a valid TOML datetime string.

```ini
[datetime = "created_at", "1979-05-27T07:32:00Z" !]
```

```toml
created_at = 1979-05-27T07:32:00Z
```

---

## Loops with `[for-each]`

### Dynamic array of tables

```ini
${
  const servers = [
    { host: "10.0.0.1", port: 8001 },
    { host: "10.0.0.2", port: 8002 },
  ];
}$

[for-each = ${ servers }$, as: "s"]
  [array-table = "servers"]
    [host = ${ s.host }$ !]
    [port = ${ s.port }$ !]
  [end]
[end]
```

```toml
[[servers]]
host = "10.0.0.1"
port = 8001

[[servers]]
host = "10.0.0.2"
port = 8002
```

### Dynamic inline array

```ini
${
  const tags = ["rust", "cli", "config"];
}$

[array = "tags"]
  [for-each = ${ tags }$, as: "t"]
    [str = ${ t }$ !]
  [end]
[end]
```

```toml
tags = ["rust", "cli", "config"]
```

### Dynamic table fields

The shorthand only works for static tag names. When keys come from a loop,
use `[str]` with two args — key first, value second:

```ini
${
  const packages = [
    { name: "serde",   version: "1.0.0" },
    { name: "tokio",   version: "2.0.0" },
  ];
}$

[table = "dependencies"]
  [for-each = ${ packages }$, as: "p"]
    [str = ${ p.name }$, ${ p.version }$ !]
  [end]
[end]
```

```toml
[dependencies]
serde = "1.0.0"
tokio = "2.0.0"
```

---

## Compile-time values

Use `${ }$` to compute values at build time:

```ini
[built_at = "${ new Date().toISOString() }$" !]
```

```toml
built_at = "2026-06-22T00:00:00.000Z"
```

---

## Placeholders

Inject different values at build time without changing the source file:

```ini
[table = "database"]
  [host = p{DB_HOST} !]
  [password = p{DB_PASSWORD} !]
  [port = p{DB_PORT} !]
[end]
```

---

## File splitting with modules

Split large configs across multiple `.smark` files:

```ini
[import = db: "./db.smark" !]
[import = server: "./server.smark" !]

[$use-module = "db" !]
[$use-module = "server" !]
```

`db.smark`:

```ini
[table = "database"]
  [host = "localhost" !]
  [port = 5432 !]
[end]
```
