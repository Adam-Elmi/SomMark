import Mapper from "../mapper.js";
import MARKDOWN, { renderHeading } from "./markdown.js";
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
				const { args, content } = ctx;
				const element = this.tag(tagName).jsxProps(args);
				return isVoid ? element.selfClose() : element.body(content);
			},
			options: {
				type: isVoid ? "Block" : (isCodeStyleOrScript ? ["Block", "AtBlock"] : ["Block", "Inline", "AtBlock"]),
				escape: !isCodeStyleOrScript,
				rules: { is_self_closing: isVoid }
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
		return MARKDOWN.text.call(this, text, options);
	},

	/**
	 * Formats inline content before rendering, respecting explicit escape flags.
	 */
	inlineText(text, options) {
		return MARKDOWN.inlineText.call(this, text, options);
	},

	/**
	 * Formats the literal content inside AtBlocks.
	 */
	atBlockBody(text, options) {
		let out = text;
		if (options?.escape !== false) {
			out = this.escapeHTML(out);
		}
		if (out.includes('\n')) {
			out = '\n' + out + '\n';
		}
		return out;
	}
});

const { tag } = MDX;

MDX.inherit(MARKDOWN);
MDX.md = MARKDOWN.md; // Provide the Markdown escaping tool

// MDX defaults to HTML tags for headings to ensure high-fidelity JSX output
["h1", "h2", "h3", "h4", "h5", "h6"].forEach(heading => {
	MDX.register(heading, function (ctx) {
		return renderHeading.call(this, ctx, "html");
	}, { type: "Block" });
});

/**
 * mdx AtBlock - Renders raw MDX content (ESM imports, exports, or complex JSX).
 */
MDX.register("mdx", ({ content }) => {
	return content;
}, { escape: false, type: "AtBlock" });

export default MDX;
