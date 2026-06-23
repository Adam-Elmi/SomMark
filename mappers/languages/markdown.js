import Mapper from "../mapper.js";
import HTML from "./html.js";
import { registerSharedOutputs } from "../shared/index.js";
import { BLOCK, TEXT, FOR_EACH } from "../../core/labels.js";
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
	 * Provides a fallback for unknown tags by using the HTML mapper instead.
	 */
	getUnknownTag(node) {
		const id = node.id.toLowerCase();

		return {
			render: async ({ props, ast, isSelfClosing, renderChild }) => {
				const element = this.tag(id).smartAttributes(props, this.customProps, this.options);
				if (isSelfClosing || VOID_ELEMENTS.has(id)) return element.selfClose();

				let rawContent = "";
				for (const child of (ast.body || [])) {
					if (child.type === TEXT) rawContent += this.text(child.text);
					else if (child.type === BLOCK) rawContent += await renderChild(child);
				}
				rawContent = rawContent.trim();

				const meaningful = (ast.body || []).filter(c => c.type !== TEXT || c.text.trim());
				const finalContent = meaningful.length <= 1 ? rawContent : `\n${rawContent}\n`;
				return element.body(finalContent);
			},
			options: { handleAst: true }
		};
	}
});

MARKDOWN.inherit(HTML);
const { md, safeArg } = MARKDOWN;
registerSharedOutputs(MARKDOWN);

/**
 * Quote - Renders blockquote content or GFM alerts.
 */
MARKDOWN.register("quote", ({ props, content }) => {
	const type = safeArg({ props, index: 0, key: "type", fallBack: "" });
	return md.quote(content, type);
}, { resolve: true });

/**
 * Headings - Renders H1-H6 block headings.
 */
["h1", "h2", "h3", "h4", "h5", "h6"].forEach(heading => {
	MARKDOWN.register(heading, function ({ props, content, isSelfClosing }) {
		const format = safeArg({ props, key: "format", type: "string", fallBack: "" });
		const lvl = heading[1] && !isNaN(Number(heading[1])) ? Number(heading[1]) : 1;
		if (format.toLowerCase() === "html") {
			delete props.format;
			const el = this.tag(heading).smartAttributes(props);
			if (isSelfClosing) return el.selfClose();
			return el.body(content);
		}
		return this.md.heading(content, lvl);
	});
});

/**
 * Bold - Renders bold text (**text**).
 * Self-closing: [bold = "text" !] or [bold = text: "text" !]
 */
MARKDOWN.register(["bold", "b"], ({ props, content, isSelfClosing }) => {
	const text = isSelfClosing ? safeArg({ props, index: 0, key: "text", fallBack: "" }) : content;
	return md.bold(text);
});

/**
 * Italic - Renders italic text (*text*).
 * Self-closing: [italic = "text" !] or [italic = text: "text" !]
 */
MARKDOWN.register(["italic", "i"], ({ props, content, isSelfClosing }) => {
	const text = isSelfClosing ? safeArg({ props, index: 0, key: "text", fallBack: "" }) : content;
	return md.italic(text);
});

/**
 * Emphasis - Renders bold-italic text (***text***).
 * Self-closing: [emphasis = "text" !] or [emphasis = text: "text" !]
 */
MARKDOWN.register(["emphasis", "em"], ({ props, content, isSelfClosing }) => {
	const text = isSelfClosing ? safeArg({ props, index: 0, key: "text", fallBack: "" }) : content;
	return md.emphasis(text);
});

/**
 * Strike - Renders strikethrough text (~~text~~).
 * Self-closing: [strike = "text" !] or [strike = text: "text" !]
 */
MARKDOWN.register(["strike", "s"], ({ props, content, isSelfClosing }) => {
	const text = isSelfClosing ? safeArg({ props, index: 0, key: "text", fallBack: "" }) : content;
	return md.strike(text);
});

/**
 * Code - Renders inline or fenced code blocks.
 */
MARKDOWN.register(
	["Code", "code"],
	({ props, content, isSelfClosing }) => {
		if (isSelfClosing) {
			const text = safeArg({ props, index: 0, key: "text", fallBack: "" });
			return `\`${text}\``;
		}
		const lang = safeArg({ props, index: 0, key: "lang", fallBack: "" });
		return md.codeBlock(content, lang);
	},
	{ escape: false }
);

/**
 * Link - Renders Markdown links [text](url).
 * Body form:       [link = src: "url", title: "..."]text[end]
 * Self-closing:    [link = "text", "url" !] or [link = text: "...", src: "...", title: "..." !]
 */
MARKDOWN.register(
	"link",
	({ props, content, isSelfClosing }) => {
		if (isSelfClosing) {
			const text  = safeArg({ props, index: 0, key: "text",  fallBack: "" });
			const src   = safeArg({ props, index: 1, key: "src",   fallBack: "" });
			const title = safeArg({ props, index: 2, key: "title", fallBack: "" });
			return md.url("link", text, src, title);
		}
		const src   = safeArg({ props, index: 0, key: "src",   fallBack: "" });
		const title = safeArg({ props, index: 1, key: "title", fallBack: "" });
		return md.url("link", content, src, title);
	},
	{ rules: { is_empty_body: false } }
);

/**
 * Image - Renders Markdown images ![alt](url).
 * [image = "alt", "src", "title" !] or [image = alt: "...", src: "...", title: "..." !]
 */
MARKDOWN.register(
	"image",
	({ props }) => {
		const alt = safeArg({ props, index: 0, key: "alt", fallBack: "" });
		const src = safeArg({ props, index: 1, key: "src", fallBack: "" });
		const title = safeArg({ props, index: 2, key: "title", fallBack: "" });
		return md.url("image", alt, src, title);
	},
	{ rules: { is_empty_body: true } }
);

/**
 * HR (Horizontal Rule) - Renders a thematic break (---).
 */
MARKDOWN.register(
	"hr",
	({ props }) => {
		const fmt = safeArg({ props, index: 0, fallBack: "-" });
		return md.horizontal(fmt);
	},
	{ rules: { is_empty_body: true } }
);

/**
 * Escape - Escapes special Markdown characters.
 * Self-closing: [escape = "text" !] or [escape = text: "text" !]
 */
MARKDOWN.register(["escape", "e"], function ({ props, content, isSelfClosing }) {
	const text = isSelfClosing ? safeArg({ props, index: 0, key: "text", fallBack: "" }) : content;
	return this.md.escape(text);
}, { resolve: true });

const ROW_SEP = "\x1E";
const CELL_SEP = "\x1F";

/**
 * Table - Authoritative Native AST Table resolution.
 * Processes Header/Body sections with Row/Cell nesting.
 * Supports [for-each] inside [body] for dynamic rows.
 */
MARKDOWN.register(
	"Table",
	async function ({ ast, renderChild }) {
		const headers = [];
		const rows = [];

		const extractRows = async (sectionNode) => {
			const sectionRows = [];
			for (const child of (sectionNode.body || [])) {
				if (child.type === BLOCK && child.id?.toLowerCase() === "row") {
					const rendered = await renderChild(child, { inTable: true });
					const cells = rendered.split(ROW_SEP)[0]?.split(CELL_SEP).filter(c => c !== "") ?? [];
					if (cells.length > 0) sectionRows.push(cells);
				} else if (child.type === FOR_EACH) {
					const rendered = await renderChild(child, { inTable: true });
					for (const row of rendered.split(ROW_SEP)) {
						const cells = row.split(CELL_SEP).filter(c => c !== "");
						if (cells.length > 0) sectionRows.push(cells);
					}
				}
			}
			return sectionRows;
		};

		for (const node of ast.body) {
			if (node.type !== BLOCK) continue;
			const id = node.id.toLowerCase();
			if (id === "header") {
				const headerRows = await extractRows(node);
				if (headerRows.length > 0) headers.push(...headerRows[0]);
			} else if (id === "body") {
				rows.push(...(await extractRows(node)));
			}
		}

		return md.table(headers, rows);
	},
	{ escape: true, handleAst: true, trimAndWrapBlocks: false }
);

/**
 * Table Helpers - Internal tags for table structural organization.
 */
MARKDOWN.register(["header", "body"], ({ content }) => content);

MARKDOWN.register("row", async function ({ ast, renderChild, inTable }) {
	if (!inTable) {
		let result = "";
		for (const child of ast.body) {
			if (child.type === TEXT) result += this.text(child.text);
			else if (child.type === BLOCK) result += await renderChild(child);
		}
		return result;
	}
	let cells = "";
	for (const child of ast.body) {
		if (child.type !== BLOCK) continue;
		const id = child.id?.toLowerCase();
		if (id === "cell" || id === "th" || id === "td") {
			cells += await renderChild(child, { inTable: true });
		}
	}
	return cells + ROW_SEP;
}, { handleAst: true });

MARKDOWN.register(["cell", "th", "td"], ({ content, inTable }) => {
	return inTable ? content.trim() + CELL_SEP : content;
});

/**
 * Lists - Authoritative Native AST List resolution.
 * Supports Ordered (Number) and Unordered (Dotlex) lists with deep nesting.
 */
MARKDOWN.register(["list", "List"], async function ({ ast, props, renderChild }) {
	const indicator = safeArg({ props, index: 0, fallBack: "dot" });
	const isOrdered = indicator === "number" || indicator === "ol";
	const marker = isOrdered ? "" : (indicator === "dot" ? "-" : indicator);
	const items = [];

	for (const node of ast.body) {
		if (node.type !== BLOCK) continue;
		const id = node.id?.toLowerCase();
		if (id === "item") {
			items.push((await renderChild(node)).trim());
		}
	}

	return isOrdered ? md.orderedList(items, 0) : md.unorderedList(items, 0, marker);
}, { handleAst: true, trimAndWrapBlocks: false });

/**
 * List Helpers - Internal tags for list structural organization.
 */
MARKDOWN.register(["item", "Item"], async function ({ ast, renderChild }) {
	let result = "";
	for (const child of ast.body) {
		if (child.type === TEXT) result += this.text(child.text);
		else if (child.type === BLOCK) result += await renderChild(child);
	}
	return result.trim();
}, { handleAst: true, trimAndWrapBlocks: false });

/**
 * Todo - Renders task list items with status markers.
 *
 * Supported forms:
 *   [todo = task: "Add feature", status: "x" !]   named self-closing
 *   [todo = "Add feature", "x" !]                 positional self-closing (task, status)
 *   [todo = "x"]Add feature[end]                  status in prop, task in body
 */
MARKDOWN.register("todo", ({ props, content, isSelfClosing }) => {
	let status, task;

	if (isSelfClosing) {
		task   = safeArg({ props, index: 0, key: "task",   fallBack: "" });
		status = safeArg({ props, index: 1, key: "status", fallBack: "" });
	} else {
		status = safeArg({ props, index: 0, fallBack: "" });
		task   = content;
	}

	return md.todo(status, task);
}, { trimAndWrapBlocks: false });
export default MARKDOWN;
