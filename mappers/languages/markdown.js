import Mapper from "../mapper.js";
import HTML from "./html.js";
import { todo } from "../../helpers/utils.js";

class MarkdownMapper extends Mapper {
	constructor() {
		super();
	}
	comment(text) {
		return `<!--${text.replace("#", "")}-->\n`;
	}
	formatOutput(output, includeDocument) {
		const todoRegex = /@@TODO_BLOCK:([\s\S]*?):([\s\S]*?)@@/g;
		const statusMarkers = ["done", "x", "X", "-", ""];
		return output.replace(todoRegex, (match, body, arg0) => {
			const bodyTrimmed = body.trim().toLowerCase();
			const arg0Trimmed = arg0.trim().toLowerCase();
			
			const bodyIsStatus = statusMarkers.includes(bodyTrimmed);
			const arg0IsStatus = statusMarkers.includes(arg0Trimmed);
			
			let finalStatus = arg0; // Default: arg is status
			let finalTask = body;   // Default: body is task
			
			if (bodyIsStatus && !arg0IsStatus) {
				finalStatus = body;
				finalTask = arg0;
			}
			
			return this.md.todo(todo(finalStatus), finalTask);
		});
	}
}

const MARKDOWN = new MarkdownMapper();
MARKDOWN.inherit(HTML);
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
// Headings (Block only, like HTML mapper)
["h1", "h2", "h3", "h4", "h5", "h6"].forEach(heading => {
	MARKDOWN.register(heading, ({ content }) => {
		const lvl = heading[1] && typeof Number(heading[1]) === "number" ? heading[1] : 1;
		return md.heading(content, lvl);
	}, { type: "Block" });
});
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
	"link",
	({ args }) => {
		const url = safeArg(args, 0, "src", null, null, "");
		const title = safeArg(args, 1, "title", null, null, "");
		const text = safeArg(args, 2, "alt", null, null, "");
		return md.url("link", text, url, title);
	},
	{
		type: "Block"
	}
);
// Image
MARKDOWN.register(
	"image",
	({ args }) => {
		const url = safeArg(args, 0, "src", null, null, "");
		const title = safeArg(args, 1, "title", null, null, "");
		const alt = safeArg(args, 2, "alt", null, null, "");
		return md.url("image", alt, url, title);
	},
	{
		type: "Block"
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
	const isPlaceholder = content.includes("__SOMMARK_BODY_PLACEHOLDER_");
	if (isPlaceholder) {
		return `@@TODO_BLOCK:${content}:${args[0] || ""}@@`;
	}
	const statusMarkers = ["done", "x", "X", "-", ""];
	const isInline = !isPlaceholder && statusMarkers.includes(content.trim().toLowerCase()) && args.length > 0;
	const status = isInline ? content : (args[0] || "");
	const task = isInline ? (args[0] || "") : content;
	const checked = todo(status);
	return md.todo(checked, task);
}, { type: "any" });
export default MARKDOWN;
