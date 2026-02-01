import Mapper from "../mapper.js";
const MARKDOWN = new Mapper();
const { md } = MARKDOWN;
// Block
MARKDOWN.register("Block", ({ content }) => {
	return content;
});
// Section
MARKDOWN.register("Section", ({ content }) => {
	return content;
});
// Headings
MARKDOWN.register("Heading", ({ args, content }) => {
	return md.heading(args[1], args[0]) + content;
});
// Inline Headings
["h1", "h2", "h3", "h4", "h5", "h6"].forEach(heading => {
	MARKDOWN.register(heading, ({ content }) => {
		return md.heading(content, heading.replace("h", ""));
	});
});
// Bold
MARKDOWN.register(["bold", "b"], ({ content }) => {
	return md.bold(content);
});
// Italic
MARKDOWN.register(["italic", "i"], ({ content }) => {
	return md.italic(content);
});
// Bold and Italic (emphasis)
MARKDOWN.register(["emphasis", "e"], ({ content }) => {
	return md.emphasis(content);
});
// Code Blocks
MARKDOWN.register(
	["code", "Code", "codeBlock", "CodeBlock"],
	({ args, content }) => {
		return md.codeBlock(content, args[0]);
	},
	{ escape: false }
);
// Link
MARKDOWN.register("link", ({ args, content }) => {
	const title = args[1] ? `"${args[1].trim()}"` : "";
	return md.url("link", content, args[0].trim(), title);
});
// Image
MARKDOWN.register("image", ({ args, content }) => {
	const title = args[1] ? `"${args[1].trim()}"` : "";
	return md.url("image", content, args[0].trim(), title);
});
// Horizontal Rule
MARKDOWN.register(["horizontal", "h"], ({ content }) => {
	return md.horizontal(content);
});
// Escape Characters
MARKDOWN.register(["escape", "s"], ({ content }) => {
	return md.escape(content);
});
// Table
MARKDOWN.register(
	"table",
	({ args, content }) => {
		return md.table(
			args,
			content
				.trim()
				.split("\n")
				.filter(line => line !== "")
				.map(line => line.trim())
		);
	},
	{ escape: false }
);
// List
MARKDOWN.register(
	["list", "List"],
	({ content }) => {
		return content;
	},
	{ escape: false }
);
// Todo
MARKDOWN.register("todo", ({ args, content }) => {
	const checked = content === "x" ? true : false;
	return md.todo(checked, args && args[0] ? args[0].trim() : "");
});
export default MARKDOWN;
