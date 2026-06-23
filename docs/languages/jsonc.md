# JSONC

JSONC is JSON with comments. VS Code uses it for `settings.json`, `tsconfig.json`,
and similar config files that developers read and edit by hand.

The JSONC mapper works exactly like the JSON mapper — same blocks, same shorthand
syntax — but comments are kept in the output instead of being stripped.

```js
import SomMark from "sommark";

const sm = new SomMark({
  src,
  format: "jsonc",
  removeComments: false  // must be false to keep comments in output
});

const jsonc = await sm.transpile();
```

```bash
sommark --jsonc input.smark
```

> Set `removeComments: true` to strip comments and get standard JSON output.

---

## Comment output

### Single-line comments

SomMark `#` comments become `//` JSONC comments:

```ini
[Object]
  # controls whether strict mode is on
  [strict = true !]
  # target JS version
  [target = "ESNext" !]
[end]
```

```json
{
  // controls whether strict mode is on
  "strict": true,
  // target JS version
  "target": "ESNext"
}
```

### Multi-line comments

SomMark `###` block comments become `/* */` JSONC comments:

```ini
[Object]
  ###
    Directories excluded from compilation.
    Add more paths here as needed.
  ###
  [Array = key: "exclude"]
    [string = "node_modules" !]
    [string = "dist" !]
  [end]
[end]
```

```json
{
  /*
    Directories excluded from compilation.
    Add more paths here as needed.
  */
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

---

## Everything from JSON works here

All JSON mapper features work in JSONC — shorthand syntax, typed blocks, loops,
compile-time values, placeholders, and file imports:

```ini
${
  const strict = true;
  const targets = ["ESNext", "ES2022"];
}$

[Object]
  # compiler settings
  [Object = key: "compilerOptions"]
    [strict = ${ strict }$ !]
    [module = "ESNext" !]
    [moduleResolution = "bundler" !]
  [end]

  ###
    Output and exclusion rules.
    Keep dist and node_modules out of compilation.
  ###
  [outDir = "./dist" !]
  [Array = key: "exclude"]
    [for-each = ${ ["node_modules", "dist"] }$, as: "d"]
      [string = ${ d }$ !]
    [end]
  [end]
[end]
```

```json
{
  // compiler settings
  "compilerOptions": {
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  /*
    Output and exclusion rules.
    Keep dist and node_modules out of compilation.
  */
  "outDir": "./dist",
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

See the [JSON guide](./json.md) for the full block reference.
