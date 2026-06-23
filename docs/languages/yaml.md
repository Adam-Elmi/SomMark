# YAML

Use SomMark to generate YAML files from templates. This is useful when your
YAML needs dynamic values, loops over data, or is split across multiple files.

```js
import SomMark from "sommark";

const sm = new SomMark({ src, format: "yaml", placeholders: { ... } });
const yaml = await sm.transpile();
```

```bash
sommark --yaml input.smark
```

---

## Why use SomMark instead of writing YAML directly?

Raw YAML is a static format — every value must be known when you write the
file. SomMark removes that constraint.

| Problem with raw YAML | How SomMark solves it |
| --------------------- | --------------------- |
| No loops — repeated blocks must be copy-pasted | `[for-each]` generates entries from an array |
| No dynamic values — everything is hardcoded | `${ }$` runs JavaScript at build time and inlines the result |
| No variables — changing one value means editing multiple places | Declare once in `${ const x = ... }$`, use everywhere |
| No imports — large configs live in one file | The module system splits configs across files with `[import]` |
| No environment switching — separate files for dev/prod | `placeholders` inject different values without changing the template |
| YAML type coercion surprises (`yes` → `true`, `1.0` → `1`) | Typed blocks (`[str]`, `[int]`, `[float]`, `[number]`, etc.) make the type explicit — `[int]` rejects decimals, `[float]` rejects whole numbers |

**Example**: generating a Kubernetes deployment from a data array — something
that would require a separate templating tool (Helm, Kustomize) in raw YAML:

```ini
${
  const services = [
    { name: "api",      replicas: 3, port: 8080 },
    { name: "worker",   replicas: 2, port: 8081 },
    { name: "frontend", replicas: 1, port: 3000 },
  ];
}$

[seq = "services"]
  [for-each = ${ services }$, as: "s"]
    [map-item]
      [name = ${ s.name }$ !]
      [replicas = ${ s.replicas }$ !]
      [port = ${ s.port }$ !]
    [end]
  [end]
[end]
```

```yaml
services:
  - name: "api"
    replicas: 3
    port: 8080
  - name: "worker"
    replicas: 2
    port: 8081
  - name: "frontend"
    replicas: 1
    port: 3000
```

---

## Writing key-value pairs

There are two ways to write a key-value pair.

### Shorthand — tag name as key

Write the key directly as the tag name. The value goes in the first argument.
The type is detected automatically from the value:

```ini
[name = "Adam" !]
[age = 25 !]
[score = 9.5 !]
[active = true !]
```

```yaml
name: "Adam"
age: 25
score: 9.5
active: true
```

| Value you write | What YAML gets |
| --------------- | -------------- |
| `"hello"`       | `"hello"` (string, always quoted) |
| `42`            | `42` (integer) |
| `3.14`          | `3.14` (float) |
| `true`          | `true` (boolean) |
| `false`         | `false` (boolean) |

> The tag name must be a fixed word — you cannot use a dynamic expression like
> `${ variable }$` as the tag name. For dynamic keys, see
> [Dynamic object fields](#dynamic-object-fields).

### Typed blocks — explicit type, no key

Use `[str]`, `[int]`, `[float]`, `[number]`, `[bool]`, `[null]` when the value has no key
— mainly inside lists, where there is nothing to use as a key. The first
argument is the value:

| Block | Accepts | Error if |
| ----- | ------- | -------- |
| `[int]` | Whole numbers only (`5432`, `-1`) | Value contains a decimal point |
| `[float]` | Decimal numbers only (`3.14`, `1.0`) | Value has no decimal point |
| `[number]` | Any number — integer or float | Value is not numeric |

```ini
[seq = "ports"]
  [int = 8001 !]
  [int = 8002 !]
[end]
```

```yaml
ports:
  - 8001
  - 8002
```

Use `[str]` when a value that looks like a number or boolean must stay a
string (e.g. a product code, a version string):

```ini
[seq = "codes"]
  [str = "007" !]
  [str = "true" !]
[end]
```

```yaml
codes:
  - "007"
  - "true"
```

---

## Nested objects — `[mapping]`

`[mapping]` groups key-value pairs under a shared parent key — what YAML calls
a mapping. Give the block a key name, then put fields inside it.

```ini
[mapping = "database"]
  [host = "localhost" !]
  [port = 5432 !]
  [ssl = true !]
[end]
```

```yaml
database:
  host: "localhost"
  port: 5432
  ssl: true
```

You can nest `[mapping]` blocks inside each other at any depth. Indentation is
handled automatically — you never count spaces manually.

```ini
[mapping = "app"]
  [mapping = "server"]
    [host = "0.0.0.0" !]
    [port = 3000 !]
  [end]
  [mapping = "database"]
    [url = "postgres://localhost/mydb" !]
    [pool = 10 !]
  [end]
[end]
```

```yaml
app:
  server:
    host: "0.0.0.0"
    port: 3000
  database:
    url: "postgres://localhost/mydb"
    pool: 10
```

Omit the key when you want to write fields directly at the top level with no
parent wrapper:

```ini
[mapping]
  [name = "myapp" !]
  [version = "1.0.0" !]
[end]
```

```yaml
name: "myapp"
version: "1.0.0"
```

---

## Lists — `[seq]`

`[seq]` creates a YAML sequence (a list). Each child block becomes one item in
the list, prefixed with `- ` automatically. Use typed blocks (`[str]`, `[int]`,
etc.) as the items since they have no key of their own.

```ini
[seq = "tags"]
  [str = "rust" !]
  [str = "cli" !]
  [str = "sommark" !]
[end]
```

```yaml
tags:
  - "rust"
  - "cli"
  - "sommark"
```

A list can hold mixed types:

```ini
[seq = "values"]
  [str = "hello" !]
  [int = 42 !]
  [bool = true !]
  [null !]
[end]
```

```yaml
values:
  - "hello"
  - 42
  - true
  - null
```

---

## List of objects — `[map-item]`

When each item in a list is itself an object (not a single value), use
`[map-item]` to wrap the fields for that item. Each `[map-item]` block becomes
one entry in the list. Use the shorthand syntax inside for its fields.

```ini
[seq = "servers"]
  [map-item]
    [host = "10.0.0.1" !]
    [port = 8001 !]
  [end]
  [map-item]
    [host = "10.0.0.2" !]
    [port = 8002 !]
  [end]
[end]
```

```yaml
servers:
  - host: "10.0.0.1"
    port: 8001
  - host: "10.0.0.2"
    port: 8002
```

---

## Multi-line strings

### `[literal]` — keep every line break (`|`)

The content is written into the YAML output exactly as you write it, with all
line breaks preserved. Good for shell scripts, SQL queries, or any block of
text where newlines matter.

```ini
[literal = "script"]
  set -euo pipefail
  echo "Building..."
  cargo build --release
[end]
```

```yaml
script: |
  set -euo pipefail
  echo "Building..."
  cargo build --release
```

### `[folded]` — collapse line breaks into spaces (`>`)

Line breaks in the source become spaces in the final output, so the text reads
as one continuous paragraph. Good for long descriptions or messages.

```ini
[folded = "description"]
  This is a long description
  that reads as one paragraph.
[end]
```

```yaml
description: >
  This is a long description
  that reads as one paragraph.
```

---

## Document markers

YAML allows multiple documents in a single file, each separated by `---`.
Use `[doc-start !]` to emit `---` and `[doc-end !]` to emit `...`.
For a single-document file these are optional, but some tools require them.

```ini
[doc-start !]
[name = "myapp" !]
[version = "1.0.0" !]
[doc-end !]
```

```yaml
---
name: "myapp"
version: "1.0.0"
...
```

---

## Loops with `[for-each]`

### Dynamic list of strings

```ini
${
  const tags = ["rust", "cli", "config"];
}$

[seq = "tags"]
  [for-each = ${ tags }$, as: "t"]
    [str = ${ t }$ !]
  [end]
[end]
```

```yaml
tags:
  - "rust"
  - "cli"
  - "config"
```

### Dynamic list of objects {#dynamic-list-of-objects}

Combine `[for-each]` with `[map-item]`. The key names inside `[map-item]` are
static (they are tag names), but their values come from the loop variable.

```ini
${
  const packages = [
    { name: "serde",   version: "1.0.0", optional: false },
    { name: "tokio",   version: "2.0.0", optional: true  },
  ];
}$

[seq = "packages"]
  [for-each = ${ packages }$, as: "p"]
    [map-item]
      [name = ${ p.name }$ !]
      [version = ${ p.version }$ !]
      [optional = ${ p.optional }$ !]
    [end]
  [end]
[end]
```

```yaml
packages:
  - name: "serde"
    version: "1.0.0"
    optional: false
  - name: "tokio"
    version: "2.0.0"
    optional: true
```

### Dynamic object fields {#dynamic-object-fields}

When the keys themselves come from the data (not fixed in the template), you
cannot use the shorthand — the tag name must be a literal word. Instead, use
`[str]` with two arguments: the key first, the value second.

```ini
${
  const packages = [
    { name: "serde",   version: "1.0.0" },
    { name: "tokio",   version: "2.0.0" },
    { name: "reqwest", version: "0.11.0" },
  ];
}$

[mapping = "dependencies"]
  [for-each = ${ packages }$, as: "p"]
    [str = ${ p.name }$, ${ p.version }$ !]
  [end]
[end]
```

```yaml
dependencies:
  serde: "1.0.0"
  tokio: "2.0.0"
  reqwest: "0.11.0"
```

---

## Injecting values

### Placeholders — values passed in from outside

Pass data into the template from your JavaScript config using `placeholders`.
Reference them in the template with `${ name }$`.

```ini
[env = ${ NODE_ENV }$ !]
[workers = ${ config.workers }$ !]
```

```js
new SomMark({
  src,
  format: "yaml",
  placeholders: { NODE_ENV: "production", config: { workers: 4 } }
});
```

```yaml
env: "production"
workers: 4
```

### Compile-time expressions — JavaScript evaluated at build time

Write a `${ }$` block anywhere in the template to run JavaScript and inline
the result. This is evaluated once when you call `transpile()`, not at runtime.

```ini
[built-at = ${ new Date().toISOString() }$ !]
[workers = ${ os.cpus().length }$ !]
```

```yaml
built-at: "2026-06-22T05:30:00.000Z"
workers: 8
```

Declare variables in one block and use them in others:

```ini
${
  const env = "production";
  const replicas = env === "production" ? 3 : 1;
}$

[environment = ${ env }$ !]
[replicas = ${ replicas }$ !]
```

```yaml
environment: "production"
replicas: 3
```

---

## Comments

SomMark comments are removed during compilation and never appear in the output.

```ini
# This is a single-line comment — removed from output

###
  This is a multi-line comment.
  Everything here is removed too.
###

[mapping = "database"]
  # comment inside a block — also removed
  [host = "localhost" !]
[end]
```
