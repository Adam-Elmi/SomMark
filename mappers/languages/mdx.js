import Mapper from "../mapper.js";
import MARKDOWN from "./markdown.js";
import { VOID_ELEMENTS } from "../../constants/void_elements.js";

/**
 * The MDX Mapper used for generating Markdown with JSX.
 */
const MDX = Mapper.define({
	/**
	 * Renders a JSX-style comment in MDX output.
	 * @param {string} text - The raw comment text.
	 * @returns {string} - Formatted JSX comment string.
	 */
	comment(text) {
		return `{/* ${text} */}`;
	},

	/**
	 * Provides high-fidelity fallback for unknown tags by rendering them as JSX components.
	 * @param {Object} node - The unknown AST node.
	 * @returns {Object} - A virtual tag registration for JSX rendering.
	 */
	getUnknownTag(node) {
		const tagName = node.id;
		const lowerId = tagName.toLowerCase();
		const isVoid = VOID_ELEMENTS.has(lowerId);
		const isCodeStyleOrScript = ["code", "style", "script"].includes(lowerId);

		return {
			render: (ctx) => {
				const { props, content, isSelfClosing } = ctx;
				const element = this.tag(tagName).jsxProps(props);
				return (isSelfClosing || isVoid) ? element.selfClose() : element.body(content);
			},
			options: {
				escape: !isCodeStyleOrScript,
				rules: { is_empty_body: isVoid }
			}
		};
	},

	options: {
		trimAndWrapBlocks: true
	},

	/**
	 * Formats a plain text node with Markdown escaping.
	 */
	text(text, options) {
		let out = text;
		if (options?.escape !== false) {
			out = this.md.mdxEscaper(out);
		}
		return out;
	},

});

const { tag } = MDX;

MDX.inherit(MARKDOWN);
MDX.md = MARKDOWN.md;

["h1", "h2", "h3", "h4", "h5", "h6"].forEach(h => {
	MDX.register(h, function ({ props, content }) {
		const format = this.safeArg({ props, key: "format", fallBack: "" });
		if (format === "md" || format === "markdown") {
			return this.md.heading(content, h.slice(1) || 1);
		}
		delete props.format;
		return tag(h).jsxProps(props).body(content);
	});
});

export default MDX;
