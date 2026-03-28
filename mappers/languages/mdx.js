import Mapper from "../mapper.js";
import MARKDOWN from "./markdown.js";
import { HTML_TAGS } from "../../constants/html_tags.js";
import { HTML_PROPS } from "../../constants/html_props.js";
import { VOID_ELEMENTS } from "../../constants/void_elements.js";
import kebabize from "../../helpers/kebabize.js";

class MdxMapper extends Mapper {
	constructor() {
		super();
	}
	comment(text) {
		return `{/*${text.replace("#", "")} */}\n`;
	}
	getUnknownTag(node) {
		const tagName = node.id;
		return {
			render: ({ args, content }) => {
				const element = this.tag(tagName);
				element.props(this.jsxProps(args, tagName));
				return element.body(content);
			}
		};
	}

	jsxProps(args, tagName = "div") {
		const jsxProps = [];
		const styleObj = {};
		const isHtmlTag = HTML_TAGS.has(tagName.toLowerCase());

		const keys = Object.keys(args).filter(arg => isNaN(arg));
		keys.forEach(key => {
			let val = args[key];
			const isEvent = key.toLowerCase().startsWith("on");

			let k = key;
			if (k === "class") k = "className";

			// Quote stripping
			if (typeof val === "string" && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
				val = val.slice(1, -1);
			}

			if (k === "style") {
				if (typeof val === "string") {
					const pairs = val.includes(";") ? val.split(";") : val.split(",");
					pairs.forEach(pair => {
						let [prop, value] = pair.split(":").map(s => s.trim());
						if (prop && value) {
							const camelProp = prop.replace(/-([a-z])/g, g => g[1].toUpperCase());
							styleObj[camelProp] = value;
						}
					});
				} else if (typeof val === "object") {
					Object.assign(styleObj, val);
				}
			} else {
				// Detection for expressions
				const isBoolean = val === "true" || val === "false" || typeof val === "boolean";
				const isNumeric = val !== "" && !isNaN(val) && typeof val !== "boolean";
				const looksLikeExpression = typeof val === "string" && 
					(/[0-9]/.test(val) && /[+\-*/%()]/.test(val)); // Math expression detection

				const shouldBeJSXExpression = isEvent || isBoolean || isNumeric || looksLikeExpression;

				let finalVal = val;
				if (val === "true") finalVal = true;
				if (val === "false") finalVal = false;
				if (isNumeric && typeof val === "string") finalVal = Number(val);

				jsxProps.push({ 
					__type__: shouldBeJSXExpression ? "other" : "string", 
					[k]: finalVal 
				});
			}
		});

		if (Object.keys(styleObj).length > 0) {
			const styleStr = JSON.stringify(styleObj).replace(/"/g, "'").replace(/'([^']+)':/g, '$1:');
			jsxProps.push({ __type__: "other", style: styleStr });
		}

		return jsxProps;
	}
}

const MDX = new MdxMapper();
const { tag } = MDX;

MDX.inherit(MARKDOWN);

// Block for raw MDX content (ESM, etc.)
MDX.register("mdx", ({ content }) => content, { escape: false, type: ["AtBlock", "Block"] });

// Re-register HTML tags to use jsxProps
HTML_TAGS.forEach(tagName => {
	const capitalized = tagName.charAt(0).toUpperCase() + tagName.slice(1);

	// Register even if it exists in MARKDOWN to override it with JSX version
	const idsToRegister = [tagName, capitalized];

	MDX.register(
		idsToRegister,
		({ args, content }) => {
			const element = tag(tagName);

			// Auto-ID for Headings
			if (/^h[1-6]$/i.test(tagName) && !args.id && content && /^[A-Za-z0-9]/.test(content)) {
				const id = content
					.toString()
					.toLowerCase()
					.replace(/[^\w\s-]/g, "")
					.replace(/\s+/g, "-");
				args.id = id;
			}

			element.props(MDX.jsxProps(args, tagName));

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

export default MDX;
