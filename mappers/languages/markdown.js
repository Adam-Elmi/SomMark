import Mapper from "../mapper.js";
const MARKDOWN = new Mapper();
const { md, safeArg } = MARKDOWN;
// Block
MARKDOWN.register(["Block", "block", "Section", "section"], ({ content }) => {
	return content;
});
// Headings
MARKDOWN.register(
	["Heading", "heading"],
	({ args, content }) => {
		const level = safeArg(args, 0, "level", "number", Number, 1);
		const title = safeArg(args, 1, "title", null, null, "");
		return md.heading(title, level) + content;
	},
	{
		rules: {
			type: "Block"
		}
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
		rules: {
			type: "Inline"
		}
	}
);
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
		const lang = safeArg(args, 0, "lang", null, null, "text");
		return md.codeBlock(content, lang);
	},
	{
		escape: false,
		rules: {
			type: "AtBlock"
		}
	}
);
// Link
MARKDOWN.register(
	["link", "Link"],
	({ args, content }) => {
		const url = safeArg(args, 0, "url", null, null, "");
		const title = safeArg(args, 1, "title", null, null, "");
		return md.url("link", content, url, title);
	},
	{
		rules: {
			type: "Inline"
		}
	}
);
// Image
MARKDOWN.register(
	["image", "Image"],
	({ args, content }) => {
		const url = safeArg(args, 0, "url", null, null, "");
		const title = safeArg(args, 1, "title", null, null, "");
		return md.url("image", content, url, title);
	},
	{
		rules: {
			type: "Inline"
		}
	}
);
// Horizontal Rule
MARKDOWN.register(
	["horizontal", "hr", "h"],
	({ args }) => {
		const fmt = safeArg(args, 0, undefined, null, null, "*");
		return md.horizontal(fmt);
	},
	{
		rules: {
			type: "Block"
		}
	}
);
// Escape Characters
MARKDOWN.register(["escape", "Escape", "s"], ({ content }) => {
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
	{ escape: false, rules: { type: "AtBlock" } }
);
// List
MARKDOWN.register(
	["list", "List"],
	({ content }) => {
		return content;
	},
	{ escape: false, rules: { type: "AtBlock" } }
);
// Todo
MARKDOWN.register("todo", ({ args, content }) => {
	const checked = content === "x" ? true : false;
	const task = safeArg(args, 0, "task", null, null, "");
	return md.todo(checked, task);
});
export default MARKDOWN;
