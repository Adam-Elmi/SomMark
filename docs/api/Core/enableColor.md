# enableColor()

Globally enables or disables ANSI color escape codes for terminal compilation error and warning messages.

---

**Syntax:**
```js
enableColor(enabled?)
```

**Usage:**
```js
import { enableColor, transpile } from "sommark";

enableColor(true);

try {
  // intentional syntax error — unclosed [h1] tag triggers a colored error message
  await transpile({ src: "[h1 Unclosed tag", format: "html" });
} catch (err) {
  console.error(err.message);
}
```

---

### CLI (Recommended)

The easiest way to enable colors is with the CLI command. It saves your preference to `~/.sommark/config.json` and applies it automatically on every run — no environment variables, no shell config, works on Windows, Mac, and Linux:

```sh
sommark color on   # enable colors
sommark color off  # disable colors
```

The setting persists across terminals and sessions. You only need to run it once.

---

### Environment Variable

You can also set the `SOMMARK_COLOR` environment variable. This takes priority over the config file:

```sh
# Unix / Mac
export SOMMARK_COLOR=true

# Windows (cmd)
set SOMMARK_COLOR=true

# Windows (PowerShell)
$env:SOMMARK_COLOR="true"
```

---

### Programmatic

```js
import { enableColor } from "sommark";

enableColor(true);  // on
enableColor(false); // off
```

Colors are off by default in programmatic use.

---

[Read security.md for compile sandboxing](security.md)

[Read transpile.md for pipeline settings](transpile.md)
