import Mapper from "../mapper.js";

class MarkdownMapper extends Mapper {
	constructor() {
		super();
	}
	comment(text) {
		return `<!--${text.replace("#", "")}-->\n`;
	}
}

const MARKDOWN = new MarkdownMapper();
const { md, safeArg } = MARKDOWN;
// Block
MARKDOWN.register("Block", ({ content }) => {
	return content;
}, { type: "Block" });
// Quote
MARKDOWN.register(["quote", "blockquote"], ({ content }) => {
	return "\n" + content.trimEnd()
		.split("\n")
		.map(line => `> ${line}`)
		.join("\n");
}, { type: "Block" });
// Headings
MARKDOWN.register(
	"Heading",
	({ args, content }) => {
		const level = safeArg(args, 0, "level", "number", Number, 1);
		const title = safeArg(args, 1, "title", null, null, "");
		return md.heading(title, level) + content;
	},
	{
		type: "Block"
	}
);
// Inline Headings
["h1", "h2", "h3", "h4", "h5", "h6"].forEach(
	heading => {
		MARKDOWN.register(heading, ({ content }) => {
			const lvl = heading[1] && typeof Number(heading[1]) === "number" ? heading[1] : 1;
			return md.heading(content, lvl);
		});
	},
	{
		type: "Inline"
	}
);
// Bold
MARKDOWN.register("bold", ({ content }) => {
	return md.bold(content);
}, { type: "any" });
// Italic
MARKDOWN.register("italic", ({ content }) => {
	return md.italic(content);
}, { type: "any" });
// Bold and Italic (emphasis)
MARKDOWN.register("emphasis", ({ content }) => {
	return md.emphasis(content);
}, { type: "any" });
// Code Blocks
MARKDOWN.register(
	"Code",
	({ args, content }) => {
		const lang = safeArg(args, 0, "lang", null, null, "text");
		return md.codeBlock(content, lang);
	},
	{
		escape: false,
		type: "AtBlock"
	}
);
// Link
MARKDOWN.register(
	"url",
	({ args, content }) => {
		const url = safeArg(args, 0, "url", null, null, "");
		const title = safeArg(args, 1, "title", null, null, "");
		return md.url("link", content, url, title);
	},
	{
		type: "Inline"
	}
);
// Image
MARKDOWN.register(
	"image",
	({ args, content }) => {
		const url = safeArg(args, 0, "url", null, null, "");
		const title = safeArg(args, 1, "title", null, null, "");
		return md.url("image", content, url, title);
	},
	{
		type: "Inline"
	}
);
// Horizontal Rule
MARKDOWN.register(
	"hr",
	({ args }) => {
		const fmt = safeArg(args, 0, undefined, null, null, "*");
		return md.horizontal(fmt);
	},
	{
		type: "Block"
	}
);
// Escape Characters
MARKDOWN.register("escape", ({ content }) => {
	return md.escape(content);
}, { type: "any" });
// Table
MARKDOWN.register(
	"Table",
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
	{ escape: false, type: "AtBlock" }
);
// List
MARKDOWN.register(
	"list",
	({ content }) => {
		return content;
	},
	{ escape: false, type: "AtBlock" }
);
// Todo
MARKDOWN.register("todo", ({ args, content }) => {
	const isInline = ["done", "x", "X", "-", ""].includes(content.trim().toLowerCase()) && args.length > 0;
	const status = isInline ? content : (args[0] || "");
	const task = isInline ? (args[0] || "") : content;
	const checked = MARKDOWN.todo(status);
	return md.todo(checked, task);
}, { type: "any" });
export default MARKDOWN;
