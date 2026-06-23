# SomMark Mapper System

A **Mapper** is the translation layer between SomMark's parsed output and your target format. It holds a set of rules — one per block type — that say what each block should look like in the output.

For example, a Mapper might say: "when you see `[h1]`, output `<h1>`". Swap the Mapper and the same `.smark` source produces a different format entirely — HTML, Markdown, XML, or whatever you define.

Built-in Mappers are provided for HTML, Markdown, MDX, JSON, XML, and plain text. You can also write your own by creating a `Mapper` instance and registering custom block renderers.

[Read The Mapper API Documentation](../api/Mapper/)
