import Mapper from "../mapper.js";
import { HTML_TAGS } from "../../constants/html_tags.js";
import { HTML_PROPS } from "../../constants/html_props.js";
import { VOID_ELEMENTS } from "../../constants/void_elements.js";
import kebabize from "../../helpers/kebabize.js";

const HTML = new Mapper();
const { tag, code, list, safeArg } = HTML;

HTML.register(
	"Html",
	({ args }) => {
		HTML.pageProps.pageTitle = safeArg(args, undefined, "title", null, null, HTML.pageProps.pageTitle);
		HTML.pageProps.charset = safeArg(args, undefined, "charset", null, null, HTML.pageProps.charset);
		HTML.pageProps.tabIcon.src = safeArg(args, undefined, "iconSrc", null, null, HTML.pageProps.tabIcon.src);
		HTML.pageProps.tabIcon.type = safeArg(args, undefined, "iconType", null, null, HTML.pageProps.tabIcon.type);
		HTML.pageProps.httpEquiv["X-UA-Compatible"] = safeArg(
			args,
			undefined,
			"httpEquiv",
			null,
			null,
			HTML.pageProps.httpEquiv["X-UA-Compatible"]
		);
		HTML.pageProps.viewport = safeArg(args, undefined, "viewport", null, null, HTML.pageProps.viewport);

		// Global CSS Variables
		let cssVars = "";
		Object.keys(args).forEach(key => {
			if (key.startsWith("--")) {
				cssVars += `${key}:${args[key]};`;
			}
		});

		if (cssVars) {
			HTML.addStyle(`:root { ${cssVars} }`);
		}

		return "";
	},
	{
		rules: {
			type: "Block"
		}
	}
);

// Block
HTML.register(
	"Block",
	({ content }) => {
		return content;
	},
	{
		rules: {
			type: "Block"
		}
	}
);
// Quote
HTML.register(["quote", "blockquote"], ({ content }) => {
	return tag("blockquote").body(content);
});
// Bold
HTML.register("bold", ({ content }) => {
	return tag("strong").body(content);
});
// Strike
HTML.register("strike", ({ content }) => {
	return tag("s").body(content);
});
// Italic
HTML.register("italic", ({ content }) => {
	return tag("i").body(content);
});
// Emphasis
HTML.register("emphasis", ({ content }) => {
	return tag("span").attributes({ style: "font-weight:bold; font-style: italic;" }).body(content);
});
// Colored Text
HTML.register("color", ({ args, content }) => {
	const color = safeArg(args, 0, undefined, null, null, "none");
	return tag("span")
		.attributes({ style: `color:${color}` })
		.body(content);
});
// Link
HTML.register("url", ({ args, content }) => {
	const url = safeArg(args, 0, "url", null, null, "");
	const title = safeArg(args, 1, "title", null, null, "");
	return tag("a").attributes({ href: url.trim(), title: title.trim(), target: "_blank" }).body(content);
});
// Code
HTML.register(
	"Code",
	({ args, content }) => {
		return code(args, content);
	},
	{ escape: false, rules: { type: "AtBlock" } }
);
// List
HTML.register(
	"list",
	({ content }) => {
		return list(content);
	},
	{ escape: false }
);
// Table
HTML.register(
	"Table",
	({ content, args }) => {
		return HTML.htmlTable(content.split(/\n/), args, true, false);
	},
	{
		escape: false,
		rules: {
			type: "AtBlock"
		}
	}
);
// Style
HTML.register(
	"Style",
	({ content }) => {
		return tag("style").body(content);
	},
	{ escape: false, rules: { type: "AtBlock" } }
);

// Todo
HTML.register("todo", ({ args, content }) => {
	const isInline = ["done", "x", "X", "-", ""].includes(content.trim().toLowerCase()) && args.length > 0;
	const status = isInline ? content : (args[0] || "");
	const label = isInline ? (args[0] || "") : content;
	const checked = HTML.todo(status);
	return tag("div").body(tag("input").attributes({ type: "checkbox", disabled: true, checked }).selfClose() + " " + (label || ""));
});

HTML_TAGS.forEach(tagName => {
	const capitalized = tagName.charAt(0).toUpperCase() + tagName.slice(1);

	const idsToRegister = [tagName, capitalized].filter(id => !HTML.get(id));
	if (idsToRegister.length === 0) return;

	HTML.register(
		idsToRegister,
		({ args, content }) => {
			const element = tag(tagName);
			let inline_style = "";

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
				const isDimensionAttributeSupported = ["img", "video", "svg", "canvas", "iframe", "object", "embed"].includes(tagName);
				const isWidthOrHeight = key === "width" || key === "height";
				const isEvent = key.toLowerCase().startsWith("on");

				const k = isEvent ? key.toLowerCase() : HTML_PROPS.has(key) ? key : kebabize(key);

				if (isEvent || (HTML_PROPS.has(key) && (!isWidthOrHeight || isDimensionAttributeSupported)) || k.startsWith("data-") || k.startsWith("aria-")) {
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
			rules: {
				is_Self_closing: VOID_ELEMENTS.has(tagName)
			}
		}
	);
});

export default HTML;
