# The Mapper Concept

A **Mapper** is the brain of the SomMark engine. While the **Parser** is responsible for understanding the *structure* of your document (brackets, newlines, and nesting), the Mapper is responsible for its *meaning*.

Think of a Mapper as a **Translation Dictionary**. It tells SomMark: *"When you see a block named `[card]`, here is the HTML/Markdown/Text I want you to generate."*

---

## 1. The Translation Layer

SomMark is designed to be **Output Agnostic**. This means the core engine doesn't know what "HTML" or "MDX" is. It only knows how to follow instructions provided by a Mapper.

1.  **The Source**: You write `[h1] Hello [end]`.
2.  **The Parser**: Recognizes a **Block** with the ID `h1`.
3.  **The Transpiler**: Walks the document and finds the `h1` block.
4.  **The Mapper**: Provides the function that turns that block into `<h1>Hello</h1>`.

This separation allows the same SomMark file to be rendered as a website (HTML Mapper), a document (PDF/Markdown Mapper), or a mobile UI (Native Mapper).

---

## 2. How Mapping Works

When the Transpiler encounters a node in the AST (Abstract Syntax Tree), it performs a **Registry Lookup**.

### The Lookup Process
- **Search**: The Transpiler looks into the Mapper's "Outputs" list for a matching Identifier.
- **Validation**: It checks if the registered type (Block, Inline, or At-Block) matches how it was used in the source.
- **Execution**: If a match is found, the Mapper's renderer function is called.
- **Fallback**: If no match is found, the engine can use an `UnknownTag` handler or throw an error.

---

## 3. Contextual Rendering

Because Identifiers are just strings, their meaning is entirely dependent on which Mapper is "Active" during transpilation.

*   **In an HTML Mapper**: `[code]` might render `<code>`.
*   **In a Markdown Mapper**: `[code]` might render markdown code block.

This makes SomMark mappers incredibly powerful for **Multi-channel Publishing**—write your content once and map it to any platform.

---

## 4. Mapper Independence

Mappers are designed to be modular. You can:
*   **Inherit**: Build a new mapper that "knows" everything another mapper knows.
*   **Override**: Change how a specific block works without touching the original mapper.
*   **Clone**: Create a copy of a mapper to experiment with changes safely.

---
