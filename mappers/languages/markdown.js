import Mapper from "../mapper.js";
import HTML from "./html.js";
import { registerSharedOutputs } from "../shared/index.js";
import { BLOCK, TEXT} from "../../core/labels.js";
import transpiler from "../../core/transpiler.js";
import { VOID_ELEMENTS } from "../../constants/void_elements.js";

/**
 * The Markdown Mapper used for generating Markdown text.
 */
const MARKDOWN = Mapper.define({
	options: {
		trimAndWrapBlocks: false
	},
	/**
	 * Renders an HTML-style comment in Markdown output.
	 */
	comment(text) {
		return `<!-- ${text} -->`;
	},
	/**
	 * Formats a plain text node with Markdown escaping only.
	 */
	text(text, options) {
		if (options?.escape === false) return text;
		// Use smartEscaper to protect special characters like math
		let out = text;
		if (this.md && this.md.smartEscaper) out = this.md.smartEscaper(out);
		return out;
	},

	/**
	 * Formats inline content before rendering.
	 */
	inlineText(text, options) {
		if (options?.escape !== false) {
			// Use smartEscaper to protect special characters
			let out = text;
			if (this.md && this.md.smartEscaper) out = this.md.smartEscaper(out);
			return out;
		}
		return text;
	},

	/**
	 * Formats the literal content inside AtBlocks.
	 */
	atBlockBody(text, options) {
		if (options?.escape === false) return text;
		// Escaping with smartEscaper
		let out = text;
		if (this.md && this.md.smartEscaper) out = this.md.smartEscaper(out);
		return out;
	},

	/**
	 * Provides a fallback for unknown tags by using the HTML mapper instead.
	 */
	getUnknownTag(node) {
		const isBlock = node.type === BLOCK;
		const id = node.id.toLowerCase();

		return {
			render: async (ctx) => {
				const { args, ast } = ctx;
				const body = ast && ast.body ? ast.body : [];
				const meaningful = body.filter(c => c.type !== TEXT || c.text.trim());
				const childCount = meaningful.length;
				const element = this.tag(id).smartAttributes(args, this.customProps);

				// Use the transpiler to format the children if any, otherwise use direct content
				let rawContent;
				if (node.type === "AtBlock") {
					rawContent = node.content || "";
					rawContent = this.atBlockBody(rawContent, ctx);
				} else if (node.type === "Inline") {
					rawContent = node.value || "";
					rawContent = this.inlineText(rawContent, ctx);
				} else {
					rawContent = (await transpiler({ ast: body, mapperFile: this })).trim();
				}

				if (VOID_ELEMENTS.has(id)) {
					return element.selfClose();
				}

				let finalContent;
				if (childCount <= 1) {
					// COMPACT PASS: Single child or empty
					finalContent = rawContent;
				} else {
					// MULTILINE PASS: Enforce \n prefix/suffix for multiple children
					finalContent = `\n${rawContent}\n`;
				}

				return element.body(finalContent);
			},
			options: {
				type: isBlock ? "Block" : (node.type === "AtBlock" ? "AtBlock" : "Inline"),
				handleAst: true
			}
		};
	}
});

MARKDOWN.inherit(HTML);
const { md, safeArg } = MARKDOWN;
registerSharedOutputs(MARKDOWN);

/**
 * Quote - Renders blockquote content or GFM alerts.
 */
MARKDOWN.register("quote", ({ args, content }) => {
	const type = safeArg({ args, index: 0, key: "type", fallBack: "" });
	return md.quote(content, type);
}, { type: "Block", resolve: true });

/**
 * Unified heading renderer for Markdown and MDX mappers.
 * @param {Object} options - Mapper context and args.
 * @param {string} defaultFormat - Default format ("markdown" or "html").
 * @returns {string} - Rendered heading.
 */
export function renderHeading({ args, content, ast }, defaultFormat = "markdown") {
	const heading = ast.id;
	const format = safeArg({ args, index: 0, key: "format", type: "string", fallBack: defaultFormat });
	const lvl = heading[1] && !isNaN(Number(heading[1])) ? Number(heading[1]) : 1;

	// Remove formatting arguments before checking for attributes
	const cleanArgs = { ...args };
	delete cleanArgs.format;
	delete cleanArgs["0"]; // Clean positional 'format'

	const hasAttributes = Object.keys(cleanArgs).length > 0;

	// Hybrid Dispatch: Switch to HTML if format is requested OR if attributes are present
	if (format === "html" || hasAttributes) {
		let htmlTarget = HTML.get(heading);
		if (!htmlTarget) {
			htmlTarget = HTML.getUnknownTag(ast);
		}

		if (htmlTarget) {
			return htmlTarget.render.call(this, { args: cleanArgs, content, ast, nodeType: ast.type });
		}
	}

	return md.heading(content, lvl);
}

/**
 * Headings - Renders H1-H6 block headings.
 */
["h1", "h2", "h3", "h4", "h5", "h6"].forEach(heading => {
	MARKDOWN.register(heading, function (ctx) {
		return renderHeading.call(this, ctx, "markdown");
	}, { type: "Block" });
});

/**
 * Bold - Renders bold text (**text**).
 */
MARKDOWN.register(["bold", "b"], ({ content }) => {
	return md.bold(content);
}, { type: ["Block", "Inline"] });

/**
 * Italic - Renders italic text (*text*).
 */
MARKDOWN.register(["italic", "i"], ({ content }) => {
	return md.italic(content);
}, { type: ["Block", "Inline"] });

/**
 * Emphasis - Renders bold-italic text (***text***).
 */
MARKDOWN.register(["emphasis", "em"], ({ content }) => {
	return md.emphasis(content);
}, { type: ["Block", "Inline"] });

/**
 * Strike - Renders strikethrough text (~~text~~).
 */
MARKDOWN.register(["strike", "s"], ({ content }) => {
	return md.strike(content);
}, { type: ["Block", "Inline"] });

/**
 * Code - Renders inline or fenced code blocks.
 */
MARKDOWN.register(
	["Code", "code"],
	({ args, content, nodeType }) => {
		if (nodeType === "Inline") {
			return `\`${content}\``;
		}
		const lang = safeArg({ args, index: 0, key: "lang", fallBack: "text" });
		return md.codeBlock(content, lang);
	},
	{
		escape: false,
		type: ["AtBlock", "Inline"]
	}
);

/**
 * Link - Renders Markdown links [text](url).
 */
MARKDOWN.register(
	"link",
	({ args, content }) => {
		const src = safeArg({ args, index: 0, key: "src", fallBack: "" });
		const title = safeArg({ args, index: 1, key: "title", fallBack: "" });
		return md.url("link", content, src, title);
	},
	{
		type: ["Block", "Inline"],
		rules: { is_self_closing: false }
	}
);

/**
 * Image - Renders Markdown images ![alt](url).
 */
MARKDOWN.register(
	"image",
	({ args }) => {
		const alt = safeArg({ args, index: 0, key: "alt", fallBack: "" });
		const src = safeArg({ args, index: 1, key: "src", fallBack: "" });
		const title = safeArg({ args, index: 2, key: "title", fallBack: "" });
		return md.url("image", alt, src, title);
	},
	{
		type: "Block",
		rules: { is_self_closing: true }
	}
);

/**
 * HR (Horizontal Rule) - Renders a thematic break (---).
 */
MARKDOWN.register(
	"hr",
	({ args }) => {
		const fmt = safeArg({ args, index: 0, fallBack: "-" });
		return md.horizontal(fmt);
	},
	{
		type: "Block",
		rules: { is_self_closing: true }
	}
);

/**
 * Escape - Escapes special Markdown characters.
 */
MARKDOWN.register(["escape", "e"], function ({ content }) {
	return this.md.escape(content);
}, { type: ["Block", "Inline"], resolve: true });

/**
 * Table - Authoritative Native AST Table resolution.
 * Processes Header/Body sections with Row/Cell nesting.
 */
MARKDOWN.register(
	"Table",
	async function ({ ast }) {
		const headers = [];
		const rows = [];

		const extractCells = async (node) => {
			const cells = [];
			if (!node || !node.body) return cells;
			// Trim empty spaces while keeping line breaks
			const cellAst = node.body.map(n => n.type === TEXT ? { ...n, text: n.text.replace(/^[ ]+|[ ]+$/gm, "") } : n)
				.filter(n => n.type !== TEXT || n.text);

			for (const child of cellAst) {
				if (child.type === BLOCK && (child.id.toLowerCase() === "cell" || child.id.toLowerCase() === "th" || child.id.toLowerCase() === "td")) {
					const cellContent = await transpiler({ ast: child.body, mapperFile: this });
					cells.push(cellContent.trim());
				}
			}
			return cells;
		};

		const extractRows = async (sectionNode) => {
			if (!sectionNode || !sectionNode.body) return [];
			const sectionRows = [];
			// Trim empty spaces while keeping line breaks
			const rowAst = sectionNode.body.map(n => n.type === TEXT ? { ...n, text: n.text.replace(/^[ ]+|[ ]+$/gm, "") } : n)
				.filter(n => n.type !== TEXT || n.text);
			for (const rowNode of rowAst) {
				if (rowNode.type === BLOCK && rowNode.id.toLowerCase() === "row") {
					const rowData = await extractCells(rowNode);
					if (rowData.length > 0) sectionRows.push(rowData);
				}
			}
			return sectionRows;
		};

		const processTable = async () => {
			// Remove empty text blocks
			const tableNodes = ast.body.filter(n => n.type !== TEXT || n.text.trim());
			for (const node of tableNodes) {
				if (node.type !== BLOCK) continue;

				const id = node.id.toLowerCase();
				if (id === "header") {
					const headerRows = await extractRows(node);
					if (headerRows.length > 0) {
						headers.push(...headerRows[0]);
					}
				} else if (id === "body") {
					const bodyRows = await extractRows(node);
					rows.push(...bodyRows);
				}
			}
			return md.table(headers, rows);
		};

		return processTable();
	},
	{
		escape: true,
		type: "Block",
		handleAst: true,
		trimAndWrapBlocks: false
	}
);

/**
 * Table Helpers - Internal tags for table structural organization.
 */
MARKDOWN.register(["header", "body", "row", "cell"], ({ content }) => content);

/**
 * Lists - Authoritative Native AST List resolution.
 * Supports Ordered (Number) and Unordered (Dotlex) lists with deep nesting.
 */
MARKDOWN.register(["list", "List"], async function ({ ast, args }) {
	const items = [];

	// Determine list type (dot/unordered vs number/ordered)
	const indicator = safeArg({ args, index: 0, fallBack: "dot" });
	const isOrdered = indicator === "number" || indicator === "ol";
	let marker = "-";

	if (!isOrdered) {
		if (indicator === "dot") marker = "-";
		else marker = indicator; // Custom symbol like "*" or "+"
	}

	// Remove empty spaces from the start and end of strings
	const itemNodes = ast.body.map(n => n.type === TEXT ? { ...n, text: n.text.replace(/^[ ]+|[ ]+$/gm, "") } : n)
		.filter(n => n.type !== TEXT || n.text);

	for (const node of itemNodes) {
		const id = node.id?.toLowerCase();
		if (node.type === BLOCK && (id === "item")) {
			// Trim spaces inside the list item
			const itemBody = node.body.map(n => n.type === TEXT ? { ...n, text: n.text.replace(/^[ ]+|[ ]+$/gm, "") } : n)
				.filter(n => n.type !== TEXT || n.text);
			const itemContent = await transpiler({ ast: itemBody, mapperFile: this });
			items.push(itemContent.trim());
		} else if (node.type === BLOCK && (id === "list")) {
			// Add nested lists to the latest item
			if (items.length > 0) {
				const listContent = await transpiler({ ast: [node], mapperFile: this });
				items[items.length - 1] += "\n" + listContent;
			}
		}
	}

	const result = isOrdered
		? md.orderedList(items, 0)
		: md.unorderedList(items, 0, marker);

	return result;
}, { type: "Block", handleAst: true, trimAndWrapBlocks: false });

/**
 * List Helpers - Internal tags for list structural organization.
 */
MARKDOWN.register(["item", "Item"], async function ({ ast }) {
	// Trim whitespace but keep line breaks
	const bodyAst = ast.body.map(n => n.type === TEXT ? { ...n, text: n.text.replace(/^[ ]+|[ ]+$/gm, "") } : n)
		.filter(n => n.type !== TEXT || n.text);
	return await transpiler({ ast: bodyAst, mapperFile: this });
}, { type: "Block", handleAst: true, trimAndWrapBlocks: false });

/**
 * Todo - Renders task list items with status markers.
 */
MARKDOWN.register("todo", ({ args, content }) => {
	const statusMarkers = ["done", "x", "-", ""].map(s => s.toLowerCase());

	const isInlineStatus = statusMarkers.includes(content.toLowerCase());
	const status = isInlineStatus ? content : (args[0] || "");
	const task = isInlineStatus ? (args[0] || "") : content;

	return md.todo(status, task);
}, { type: "Block", trimAndWrapBlocks: false });
export default MARKDOWN;
