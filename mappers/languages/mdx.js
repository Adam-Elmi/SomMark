import Mapper from "../mapper.js";
import MARKDOWN from "./markdown.js";
import { HTML_TAGS } from "../../constants/html_tags.js";
import { HTML_PROPS } from "../../constants/html_props.js";
import { VOID_ELEMENTS } from "../../constants/void_elements.js";
import kebabize from "../../helpers/kebabize.js";

const MDX = new Mapper();
const { tag } = MDX;

MDX.inherit(MARKDOWN);

MDX.jsxProps = (args, tagName = "div") => {
	const jsxProps = [];
	const styleObj = {};
	const isHtmlTag = HTML_TAGS.has(tagName.toLowerCase());

	const keys = Object.keys(args).filter(arg => isNaN(arg));
	keys.forEach(key => {
		let val = args[key];
		const isDimensionAttributeSupported = ["img", "video", "svg", "canvas", "iframe", "object", "embed"].includes(tagName.toLowerCase());
		const isWidthOrHeight = key === "width" || key === "height";
		const isEvent = key.toLowerCase().startsWith("on");

		// In MDX (JSX), we generally prefer camelCase for props.
		let k = key;

		// JSX Mapping for standard HTML
		if (k === "class") k = "className";

		// Quote stripping
		if (typeof val === "string" && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
			val = val.slice(1, -1);
		}

		// Boolean conversion
		if (val === "true") val = true;
		if (val === "false") val = false;

		if (k === "style") {
			if (typeof val === "string") {
				val.split(";").forEach(pair => {
					const [prop, value] = pair.split(":").map(s => s.trim());
					if (prop && value) {
						styleObj[prop] = value;
					}
				});
			} else if (typeof val === "object") {
				Object.assign(styleObj, val);
			}
		} else if (
			isEvent ||
			!isHtmlTag ||
			HTML_PROPS.has(key) ||
			k.startsWith("data-") ||
			k.startsWith("aria-") ||
			k === "className"
		) {
			// Events and non-string values should be wrapped in {}
			const isOther = isEvent || typeof val !== "string";
			jsxProps.push({ __type__: isOther ? "other" : "string", [k]: val });
		} else {
			// Fallback to style for unknown props on standard HTML tags
			styleObj[k] = val;
		}
	});

	if (Object.keys(styleObj).length > 0) {
		jsxProps.push({ __type__: "other", style: JSON.stringify(styleObj) });
	}

	return jsxProps;
};

HTML_TAGS.forEach(tagName => {
	const capitalized = tagName.charAt(0).toUpperCase() + tagName.slice(1);

	const idsToRegister = [tagName, capitalized].filter(id => !MDX.get(id));
	if (idsToRegister.length === 0) return;

	MDX.register(
		idsToRegister,
		({ args, content }) => {
			const element = tag(tagName);

			// Auto-ID for Headings (same as HTML)
			if (/^h[1-6]$/i.test(tagName) && !args.id && content) {
				const id = content
					.toString()
					.toLowerCase()
					.replace(/[^\w\s-]/g, "")
					.replace(/\s+/g, "-");
				args.id = id;
			}

			element.props(MDX.jsxProps(args, tagName));

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

export default MDX;
