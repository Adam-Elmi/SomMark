# What is SomMark?

**SomMark** is a high-performance, **Extensible Markup Language** designed to be the structural foundation of your content. It is not a replacement for existing languages; rather, it is a universal source language that **transpiles** into other markup languages (like HTML, MDX, or Markdown).

At its core, SomMark allows you to capture the **intent and structure** of your document in a stable, predictable way, leaving the final presentation to a specialized Mapping layer.

---

## How It Works: The 4-Stage Pipeline

Behind the scenes, SomMark processes your text through a high-performance, stage-based lifecycle.

### 1. Lexing
The **Lexer** scans your raw source code character by character. It identifies "structural markers" (like brackets and parentheses) and separates them from your body text. 
*   **Result**: A flat stream of **Tokens** (e.g., `OPEN_BRACKET`, `IDENTIFIER`, `TEXT`).

### 2. Parsing
The **Parser** takes the flat stream of tokens and organizes them into a hierarchical tree called an **AST** (Abstract Syntax Tree). 
*   **Responsibility**: It handles nesting (blocks inside blocks), resolves arguments, and recognizes prefix layers like `p{}`.
*   **Result**: A tree structure representing the logical layout of your document.

### 3. Mapping
The **Mapper** is the translation layer. It is a reference guide that defines how SomMark's identifiers (like `[card]`) should look in the target language. By switching the Mapper, you change the language SomMark transpiles into.

### 4. Transpilation
The **Transpiler** walks the AST and, for every node it finds, it consults the Mapper. It executes the renderer functions and stitches the results together into the final output.
*   **Result**: The final string in your target markup language.

---

## Why Use SomMark?

1.  **Extensibility**: You are not limited by a fixed set of tags or rules. You can define your own identifiers and decide exactly how they should transpile.
2.  **Predictability**: Unlike formats that rely on "formatting tricks," SomMark uses explicit structural boundaries. This ensures your documents never "break" accidentally.
3.  **Data-Driven**: Through the `js{}` layer, you can pass structured data (Arrays/Objects) directly into your blocks, making it the perfect companion for modern UI components.
4.  **Transpilation Power**: Write your content once in SomMark. Map it to an HTML website for your users, a Markdown README for GitHub, and an MDX feed for your React application.
5.  **Dynamic Content**: Through the `p{}` layer, you can pass dynamic content into your blocks, making it the perfect companion for modern UI components.

---
