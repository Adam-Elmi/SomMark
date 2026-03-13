import Mapper from "../mapper.js";
import { HTML_TAGS } from "../../constants/html_tags.js";
import { HTML_PROPS } from "../../constants/html_props.js";
import { VOID_ELEMENTS } from "../../constants/void_elements.js";
import kebabize from "../../helpers/kebabize.js";

class HtmlMapper extends Mapper {
	constructor() {
		super();
	}
	comment(text) {
		return `<!--${text.replace("#", "")}-->\n`;
	}

	formatOutput(output, includeDocument) {
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

			// Inject Style Tag if code blocks exist
			if (this.enable_highlightTheme && (output.includes("<pre") || output.includes("<code"))) {
				this.addStyle(this.themes[this.currentTheme]);
			}
			
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
// Link
HTML.register("url", function ({ args, content }) {
	const url = this.safeArg(args, 0, "url", null, null, "");
	const title = this.safeArg(args, 1, "title", null, null, "");
	return this.tag("a").attributes({ href: url.trim(), title: title.trim(), target: "_blank" }).body(content);
}, { type: "any" });
// Code
HTML.register(
	"Code",
	function ({ args, content }) {
		return this.code(args, content);
	},
	{ escape: false, type: "AtBlock" }
);
// List
HTML.register(
	"list",
	function ({ content }) {
		return this.list(content);
	},
	{ escape: false, type: "any" }
);
HTML.register(
	"Table",
	function ({ content, args }) {
		return this.htmlTable(content.split(/\n/), args, true, false);
	},
	{
		escape: false,
		type: "AtBlock"
	}
);
// Style
HTML.register(
	"Style",
	function ({ content }) {
		return this.tag("style").body(content);
	},
	{ escape: false, type: "AtBlock" }
);

// Todo
HTML.register("todo", function ({ args, content }) {
	const isInline = ["done", "x", "X", "-", ""].includes(content.trim().toLowerCase()) && args.length > 0;
	const status = isInline ? content : (args[0] || "");
	const label = isInline ? (args[0] || "") : content;
	const checked = this.todo(status);
	return this.tag("div").body(this.tag("input").attributes({ type: "checkbox", disabled: true, checked }).selfClose() + " " + (label || ""));
}, { type: "any" });

HTML_TAGS.forEach(tagName => {
	const capitalized = tagName.charAt(0).toUpperCase() + tagName.slice(1);

	const idsToRegister = [tagName, capitalized].filter(id => !HTML.get(id));
	if (idsToRegister.length === 0) return;

	HTML.register(
		idsToRegister,
		function ({ args, content }) {
			const element = this.tag(tagName);
			let inline_style = args.style ? (args.style.endsWith(";") ? args.style : args.style + ";") : "";

			// Auto-ID for Headings
			if (/^h[1-6]$/i.test(tagName) && !args.id && content) {
				const id = content
					.toString()
					.toLowerCase()
					.replace(/[^\w\s-]/g, "")
					.replace(/\s+/g, "-");
				element.attributes({ id });
			}

			const keys = Object.keys(args).filter(arg => isNaN(arg));
			keys.forEach(key => {
				if (key === "style") return; // Already handled

				const isDimensionAttributeSupported = ["img", "video", "svg", "canvas", "iframe", "object", "embed"].includes(tagName);
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
			if (VOID_ELEMENTS.has(tagName)) {
				return element.selfClose();
			}
			return element.body(content);
		},
		{
			type: VOID_ELEMENTS.has(tagName) ? "Block" : ["Block", "Inline"],
			rules: {
				is_self_closing: VOID_ELEMENTS.has(tagName)
			}
		}
	);
});


export default HTML;
