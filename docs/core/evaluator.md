# Evaluator, Preprocessor & Transpiler

Three internal components work together to produce the final output from a SomMark template.

---

## How They Connect

```mermaid
graph TD
    Source([Raw Template]) --> Parser[Parser] --> AST[AST Nodes]
    AST --> Transpiler[Transpiler]
    Transpiler -->|Evaluates Static JS| Evaluator[Evaluator]
    Transpiler -->|Preprocesses Runtime JS| Preprocessor[Preprocessor]
    Preprocessor -->|Eval Static Calls| Evaluator
    Evaluator -->|Isolates Context| QuickJS[QuickJS WASM VM]
    Transpiler -->|Converts AST| Mapper[Mapper File] --> Output([Final Output])
```

---

## Evaluator

Runs `${ ... }$` blocks at compile time. It uses **QuickJS** — a lightweight JavaScript engine compiled to WebAssembly. Each compilation gets its own isolated VM instance with no access to Node.js, the filesystem, or any system API.

- Top-level variables declared in one block are shared with all blocks that follow in the same template
- A `SomMark` object is available in every block with APIs for fetching, compiling, registering blocks, and more
- Execution is time-limited (default 5 seconds, configurable via `security.timeout`)

See [Compile-Time Blocks](../syntax/static-block.md) for full usage and limits.

---

## Preprocessor

Runs before the Evaluator on `runtime ${ ... }$` blocks. It scans for two compile-time calls and resolves them before the block reaches the browser:

- **`SomMark.static(expr)`** — evaluates a JS expression at build time and replaces the call with the result
- **`SomMark.import(filePath)`** — loads a local file and pastes its content into the runtime script

See [Runtime Blocks](../syntax/runtime-block.md) for full usage.

---

## Transpiler

Walks the AST and builds the final output. For each node it looks up the matching rule in the active mapper, calls the render function, and appends the result to the output string. `[for-each]` loops are handled directly here — each iteration runs in its own isolated scope so variables do not leak between iterations.

See [Mapper](../glossary.md#mapper) for how output rules are registered and resolved.
