# SomMark Mapper System

A **Mapper** represents the translation layer of the SomMark compiler. While SomMark's parsed AST structure is completely format-agnostic, the transpilation engine relies on the registered layout rules and formatting hooks of a `Mapper` instance to translate blocks, inline nodes, at-blocks, and comments into the target markup language (such as HTML, Markdown, or XML).

[Read The Mapper API Documentation](../api/Mapper/)