# showSpinner

A configuration setting that controls whether Smark displays an interactive build progress spinner in the terminal during compilation.
---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, showSpinner })

// 2. In transpile options
transpile({ src, format, showSpinner })
```

**Usage:**
*   `showSpinner` (`boolean`, default: `true`): If `true`, Smark renders a progress spinner on the bottom line of the terminal. Set to `false` to disable the spinner.

---

### Example: Disabling the Spinner for CI/CD or Logs

In automated environments (like CI/CD pipelines, logging servers, or non-TTY shells), interactive spinners can pollute console logs with ANSI escape codes. Disable `showSpinner` to output clean, raw text:

```javascript
import { transpile } from "sommark";

const output = await transpile({
  src: "[p]Hello World[end]",
  format: "html",
  showSpinner: false // Disables the interactive CLI spinner
});

console.log(output);
// Output: <p>Hello World</p>
```

---

[Read transpile.md for compilation settings](transpile.md)

[Read security.md for execution boundaries](security.md)
