import Mapper from "../mapper.js";
import { VOID_ELEMENTS } from "../../constants/void_elements.js";
import { SVG_ELEMENTS } from "../../constants/svg_elements.js";
import { registerSharedOutputs } from "../shared/index.js";

/**
 * Helper to format an HTML tag with attributes and content.
 * 
 * @param {string} id - The name of the HTML tag.
 * @param {Object} props - The attributes for the tag.
 * @param {string} content - The text or tags inside this tag.
 * @returns {string} - The finished HTML string.
 */
const renderHtmlTag = function (id, props, content, isSelfClosing) {
	const element = this.tag(id);
	const idLower = id.toLowerCase();

	if (SVG_ELEMENTS.has(idLower)) {
		element.attributes(props);
	} else {
		element.smartAttributes(props, this.customProps, this.options);
	}

	let finalContent = content;
	if (idLower === "script" && props.scoped === true) {
		finalContent = `(function(){\n${content}\n})();`;
	}

	if (VOID_ELEMENTS.has(idLower) || isSelfClosing) {
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
	 * Natively formats runtime logic for HTML.
	 * Global logic is placed in a raw script tag.
	 * Block-level logic is wrapped in a self-executing function to isolate scope and provide `self` reference.
	 */
	runtimeLogic(code, isGlobal, parentId) {
		if (isGlobal) {
			return this.tag("script").body(`\n${code.split("\n").filter(line => line.trim() !== "").join("\n")}\n`);
		} else {
			const selfDefinition = parentId
				? `const self = document.querySelector('[data-sommark-id="${parentId}"]');`
				: `const self = document.currentScript.parentElement;`;
			return this.tag("script").body(`\n(async function(){${selfDefinition}\nif (self) {\n${code.split("\n").filter(line => line.trim() !== "").join("\n")}\n}\n})();\n`);
		}
	},

	/**
	 * Formats plain text and makes sure it's safe for HTML if needed.
	 */
	text(text, options) {
		if (options?.escape === false) return text;
		return this.escapeHTML(text);
	},

	/**
	 * Provides high-fidelity fallback for unknown ids by rendering them as HTML elements.
	 * @param {Object} node - The unknown AST node.
	 * @returns {Object} - A virtual id registration for fallback rendering.
	 */
	getUnknownTag(node) {
		const idLower = node.id.toLowerCase();
		const isVoid = VOID_ELEMENTS.has(idLower);
		const isCodeStyleOrScript = ["code", "style", "script"].includes(idLower);

		return {
			render: function ({ props, content, isSelfClosing }) { return renderHtmlTag.call(this, node.id, props, content, isSelfClosing); },
			options: {
				escape: !isCodeStyleOrScript,
				rules: { is_empty_body: isVoid }
			}
		};
	},

	options: {
		trimAndWrapBlocks: true
	}
});

// DOCTYPE tag
HTML.register(["DOCTYPE", "doctype"], () => {
	return "<!DOCTYPE html>";
}, { rules: { is_empty_body: true } });

// head tag
HTML.register("head", function ({ content }) {
	let varsStyle = "";
	if (this.cssVariables) {
		varsStyle = `<style>:root { ${this.cssVariables} }</style>\n`;
	}
	return this.tag("head").body(`${varsStyle}${content}`);
}, { escape: false });

// Root tag for Metadata and CSS Variables (Collector)
HTML.register(
	["Root", "root"],
	function ({ props }) {
		this.cssVariables = this.cssVariables || "";
		Object.keys(props).forEach(key => {
			if (key.startsWith("--")) {
				this.cssVariables += `${key}:${props[key]};`;
			}
		});
		return "";
	},
);
registerSharedOutputs(HTML);

export default HTML;
