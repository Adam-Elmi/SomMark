import Mapper from "../mapper.js";
import { VOID_ELEMENTS } from "../../constants/void_elements.js";
import { registerSharedOutputs } from "../shared/index.js";

/**
 * Helper to format an HTML tag with attributes and content.
 * 
 * @param {string} id - The name of the HTML tag.
 * @param {Object} args - The attributes for the tag.
 * @param {string} content - The text or tags inside this tag.
 * @returns {string} - The finished HTML string.
 */
const renderHtmlTag = function (id, args, content) {
	const element = this.tag(id);

	element.smartAttributes(args, this.customProps);

	let finalContent = content;
	if (id.toLowerCase() === "script" && args.scoped === true) {
		finalContent = `(function(){\n${content}\n})();`;
	}

	if (VOID_ELEMENTS.has(id.toLowerCase())) {
		return element.selfClose();
	}

	return element.body(finalContent);
};

/**
 * The HTML Mapper used for generating web pages.
 */
const HTML = Mapper.define({
	/**
	 * Formats an HTML comment.
	 * @param {string} text - The text inside the comment.
	 * @returns {string} - The finished comment.
	 */
	comment(text) {
		return `<!-- ${text} -->`;
	},

	/**
	 * Formats plain text and makes sure it's safe for HTML if needed.
	 */
	text(text, options) {
		if (options?.escape === false) return text;
		return this.escapeHTML(text);
	},

	/**
	 * Formats text inside inline tags (like bold or links).
	 */
	inlineText(text, options) {
		if (options?.escape !== false) {
			return this.escapeHTML(text);
		}
		return text;
	},

	/**
	 * Formats the content inside AtBlocks.
	 */
	atBlockBody(text, options) {
		let out = String(text);
		if (options?.escape !== false) {
			out = this.escapeHTML(out);
		}
		if (out.includes('\n')) {
			out = '\n' + out + '\n';
		}
		return out;
	},

	/**
	 * Provides high-fidelity fallback for unknown ids by rendering them as HTML elements.
	 * @param {Object} node - The unknown AST node.
	 * @returns {Object} - A virtual id registration for fallback rendering.
	 */
	getUnknownTag(node) {
		const id = node.id.toLowerCase();
		const isVoid = VOID_ELEMENTS.has(id);
		const isCodeStyleOrScript = ["code", "style", "script"].includes(id);

		return {
			render: function ({ args, content }) { return renderHtmlTag.call(this, id, args, content); },
			options: {
				type: isCodeStyleOrScript ? ["Block", "AtBlock"] : ["Block", "Inline"],
				escape: !isCodeStyleOrScript,
				rules: { is_self_closing: isVoid }
			}
		};
	},
	
	options: {
		// trimAndWrapBlocks: false // Default to false for high-fidelity
	}
});

// DOCTYPE tag
HTML.register(["DOCTYPE", "doctype"], () => {
	return "<!DOCTYPE html>";
}, { type: "Block", rules: { is_self_closing: true } });

// head tag
HTML.register("head", function ({ content }) {
	let varsStyle = "";
	if (this.cssVariables) {
		varsStyle = `<style>:root { ${this.cssVariables} }</style>\n`;
	}
	return this.tag("head").body(`${varsStyle}${content}`);
}, { type: "Block", escape: false });

// Root tag for Metadata and CSS Variables (Collector)
HTML.register(
	["Root", "root"],
	function ({ args }) {
		this.cssVariables = this.cssVariables || "";
		Object.keys(args).forEach(key => {
			if (key.startsWith("--")) {
				this.cssVariables += `${key}:${args[key]};`;
			}
		});
		return "";
	},
	{
		type: "Block"
	}
);

registerSharedOutputs(HTML);

export default HTML;
