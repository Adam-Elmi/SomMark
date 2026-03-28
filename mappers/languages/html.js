import Mapper from "../mapper.js";
import { HTML_TAGS } from "../../constants/html_tags.js";
import { HTML_PROPS } from "../../constants/html_props.js";
import { VOID_ELEMENTS } from "../../constants/void_elements.js";
import kebabize from "../../helpers/kebabize.js";
import { todo, list, htmlTable } from "../../helpers/utils.js";

class HtmlMapper extends Mapper {
	constructor() {
		super();
	}
	comment(text) {
		return `<!-- ${text.replace(/^#/, "").trim()} -->`;
	}

	formatOutput(output, includeDocument) {
		const todoRegex = /@@TODO_BLOCK:([\s\S]*?):([\s\S]*?)@@/g;
		const statusMarkers = ["done", "x", "X", "-", ""];
		output = output.replace(todoRegex, (match, body, arg0) => {
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

			const checked = todo(finalStatus);
			return this.tag("div").body(this.tag("input").attributes({ type: "checkbox", disabled: true, checked }).selfClose() + " " + (finalTask || ""));
		});
		if (includeDocument) {
			let finalHeader = this.header;
			let styleContent = "";
			const updateStyleTag = style => {
				if (style) {
					const styleTag = `<style>\n${style}\n</style>`;
					if (!finalHeader.includes(styleTag)) {
						finalHeader += styleTag + "\n";
					}
				}
			};


			styleContent = this.styles.join("\n");
			updateStyleTag(styleContent);

			return `<!DOCTYPE html>\n<html>\n${finalHeader}\n<body>\n${output}\n</body>\n</html>\n`;
		}
		return output;
	}
}

const HTML = new HtmlMapper();

HTML.register(
	"Html",
	function ({ args }) {
		this.pageProps.pageTitle = this.safeArg(args, undefined, "title", null, null, this.pageProps.pageTitle);
		this.pageProps.charset = this.safeArg(args, undefined, "charset", null, null, this.pageProps.charset);
		this.pageProps.tabIcon.src = this.safeArg(args, undefined, "iconSrc", null, null, this.pageProps.tabIcon.src);
		this.pageProps.tabIcon.type = this.safeArg(args, undefined, "iconType", null, null, this.pageProps.tabIcon.type);
		this.pageProps.httpEquiv["X-UA-Compatible"] = this.safeArg(
			args,
			undefined,
			"httpEquiv",
			null,
			null,
			this.pageProps.httpEquiv["X-UA-Compatible"]
		);
		this.pageProps.viewport = this.safeArg(args, undefined, "viewport", null, null, this.pageProps.viewport);

		// Global CSS Variables
		let cssVars = "";
		Object.keys(args).forEach(key => {
			if (key.startsWith("--")) {
				cssVars += `${key}:${args[key]};`;
			}
		});

		if (cssVars) {
			this.addStyle(`:root { ${cssVars} }`);
		}

		return "";
	},
	{
		type: "Block"
	}
);

// Block
HTML.register(
	"Block",
	function ({ content }) {
		return content;
	},
	{
		type: "Block"
	}
);
// Quote
HTML.register(["quote", "blockquote"], function ({ content }) {
	return this.tag("blockquote").body(content);
}, { type: "Block" });
// Raw Content Blocks
HTML.register(["raw", "mdx"], function ({ content }) {
	return content;
}, { type: "Block" });
// Bold
HTML.register("bold", function ({ content }) {
	return this.tag("strong").body(content);
}, { type: "any" });
// Strike
HTML.register("strike", function ({ content }) {
	return this.tag("s").body(content);
}, { type: "any" });
// Italic
HTML.register("italic", function ({ content }) {
	return this.tag("i").body(content);
}, { type: "any" });
// Emphasis
HTML.register("emphasis", function ({ content }) {
	return this.tag("span").attributes({ style: "font-weight:bold; font-style: italic;" }).body(content);
}, { type: "any" });
// Colored Text
HTML.register("color", function ({ args, content }) {
	const color = this.safeArg(args, 0, undefined, null, null, "none");
	return this.tag("span")
		.attributes({ style: `color:${color}` })
		.body(content);
}, { type: "any" });
// Code
HTML.register(
	"Code",
	function ({ args, content }) {
		const lang = this.safeArg(args, 0, "lang", null, null, "text");
		const code = content || "";
		const code_element = this.tag("code");

		code_element.attributes({ class: `language-${lang}` });

		return this.tag("pre").body(code_element.body(code));
	},
	{ escape: false, type: ["AtBlock", "Block"] }
);
// List
HTML.register(
	"list",
	function ({ content }) {
		return list(content, "ul", this.escapeHTML);
	},
	{ escape: false, type: "any" }
);
HTML.register(
	"Table",
	function ({ content, args }) {
		return htmlTable(content.split(/\n/), args, this.escapeHTML);
	},
	{
		escape: false,
		type: "AtBlock"
	}
);

// Todo
HTML.register("todo", function ({ args, content }) {
	const isPlaceholder = content.includes("__SOMMARK_BODY_PLACEHOLDER_");
	if (isPlaceholder) {
		return `@@TODO_BLOCK:${content}:${args[0] || ""}@@`;
	}
	const statusMarkers = ["done", "x", "X", "-", ""];
	const isInline = !isPlaceholder && statusMarkers.includes(content.trim().toLowerCase()) && args.length > 0;
	const status = isInline ? content : (args[0] || "");
	const label = isInline ? (args[0] || "") : content;
	const checked = todo(status);
	return this.tag("div").body(this.tag("input").attributes({ type: "checkbox", disabled: true, checked }).selfClose() + " " + (label || ""));
}, { type: "any" });

HTML_TAGS.forEach(tagName => {
	const idsToRegister = [tagName].filter(id => {
		const existing = HTML.get(id);
		if (!existing || !existing.id) return true;
		return Array.isArray(existing.id) ? !existing.id.includes(id) : existing.id !== id;
	});

	idsToRegister.forEach(id => {
		const isAtBlock = ["style", "script"].includes(id.toLowerCase());

		HTML.register(
			id,
			function ({ args, content, textContent }) {
				const element = this.tag(id);
				let inline_style = args.style ? (args.style.endsWith(";") ? args.style : args.style + ";") : "";


				const keys = Object.keys(args).filter(arg => isNaN(arg));
				keys.forEach(key => {
					if (key === "style") return; // Already handled

					const isDimensionAttributeSupported = ["img", "video", "svg", "canvas", "iframe", "object", "embed"].includes(id.toLowerCase());
					const isWidthOrHeight = key === "width" || key === "height";
					const isEvent = key.toLowerCase().startsWith("on");

					const k = isEvent ? key.toLowerCase() : (HTML_PROPS.has(key) || this.extraProps.has(key)) ? key : kebabize(key);

					if (isEvent || ((HTML_PROPS.has(key) || this.extraProps.has(key)) && (!isWidthOrHeight || isDimensionAttributeSupported)) || k.startsWith("data-") || k.startsWith("aria-")) {
						element.attributes({ [k]: args[key] });
					} else {
						inline_style += `${k}:${args[key]};`;
					}
				});

				if (inline_style) {
					element.attributes({ style: inline_style });
				}
				// Self-Closing Element
				if (VOID_ELEMENTS.has(id.toLowerCase())) {
					return element.selfClose();
				}

				return element.body(content);
			},
			{
				type: isAtBlock ? "AtBlock" : "Block",
				escape: !isAtBlock,
				rules: {
					is_self_closing: VOID_ELEMENTS.has(id.toLowerCase())
				}
			}
		);
	});
});


export default HTML;
