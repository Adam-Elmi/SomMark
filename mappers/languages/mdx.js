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
				const { args, content, isSelfClosing } = ctx;
				const element = this.tag(tagName).jsxProps(args);
				return (isSelfClosing || isVoid) ? element.selfClose() : element.body(content);
			},
			options: {
				type: isVoid ? "Block" : (isCodeStyleOrScript ? ["Block", "AtBlock"] : ["Block", "Inline", "AtBlock"]),
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
			out = this.escapeHTML(out);
		}
		return out;
	},

	/**
	 * Formats inline content before rendering, respecting explicit escape flags.
	 */
	inlineText(text, options) {
		let out = text;
		if (options?.escape !== false) {
			out = this.escapeHTML(out);
		}
		return out;
	},

	/**
	 * Formats the literal content inside AtBlocks.
	 */
	atBlockBody(text, options) {
		let out = text;
		if (options?.escape !== false) {
			out = this.escapeHTML(out);
		}
		return out;
	}
});

const { tag } = MDX;

MDX.inherit(MARKDOWN);
MDX.md = MARKDOWN.md;

["h1", "h2", "h3", "h4", "h5", "h6"].forEach(h => {
	MDX.register(h, function ({ args, content }) {
		const format = this.safeArg({ args, key: "format", fallBack: "" });
		if (format === "md" || format === "markdown") {
			return this.md.heading(content, h.slice(1) || 1);
		}
		delete args.format;
		return tag(h).jsxProps(args).body(content);
	});
});

/**
 * mdx AtBlock - Renders raw MDX content (ESM imports, exports, or complex JSX).
 */
MDX.register("mdx", ({ content }) => {
	return content;
}, { escape: false, type: "AtBlock" });

// Inline CSS tag (Moved from shared)
MDX.register("css", ({ args, content }) => {
	// Compile style from named arguments (keys that are not numeric digits)
	const namedStyle = Object.keys(args)
		.filter(k => isNaN(parseInt(k)))
		.map(k => `${k}:${args[k]}`)
		.join(";");

	// Fetch positional style string (index 0) or "style" key if present
	let positionalStyle = MDX.safeArg({ args, index: 0, key: "style", fallBack: "" });

	// Filter out positional styles that are just duplicates of named arguments
	const hasDuplicateNamed = Object.keys(args)
		.filter(k => isNaN(parseInt(k)))
		.some(k => args[k] === positionalStyle);

	if (hasDuplicateNamed) {
		positionalStyle = "";
	}

	// Combine both together
	let style = [positionalStyle, namedStyle].filter(s => s.trim()).join(";");

	return MDX.tag("span").jsxProps({ style }).body(content);
}, { type: "Inline" });

export default MDX;
