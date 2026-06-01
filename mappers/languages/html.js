import Mapper from "../mapper.js";
import { VOID_ELEMENTS } from "../../constants/void_elements.js";
import { registerSharedOutputs } from "../shared/index.js";
import kebabize from "../../helpers/kebabize.js";

/**
 * Helper to format an HTML tag with attributes and content.
 * 
 * @param {string} id - The name of the HTML tag.
 * @param {Object} args - The attributes for the tag.
 * @param {string} content - The text or tags inside this tag.
 * @returns {string} - The finished HTML string.
 */
const renderHtmlTag = function (id, args, content, isSelfClosing) {
	const element = this.tag(id);

	element.smartAttributes(args, this.customProps, this.options);

	let finalContent = content;
	if (id.toLowerCase() === "script" && args.scoped === true) {
		finalContent = `(function(){\n${content}\n})();`;
	}

	if (VOID_ELEMENTS.has(id.toLowerCase()) || isSelfClosing) {
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
			render: function ({ args, content, isSelfClosing }) { return renderHtmlTag.call(this, id, args, content, isSelfClosing); },
			options: {
				type: isCodeStyleOrScript ? ["Block", "AtBlock"] : ["Block", "Inline"],
				escape: !isCodeStyleOrScript,
				rules: { is_self_closing: isVoid }
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
// Inline CSS tag (Moved from shared)
HTML.register("css", ({ args, content }) => {
	// Compile style from named arguments (keys that are not numeric digits)
	const namedStyle = Object.keys(args)
		.filter(k => isNaN(parseInt(k)))
		.map(k => `${kebabize(k)}:${args[k]}`)
		.join(";");

	// Fetch positional style string (index 0) or "style" key if present
	let positionalStyle = HTML.safeArg({ args, index: 0, key: "style", fallBack: "" });

	// Filter out positional styles that are just duplicates of named arguments
	const hasDuplicateNamed = Object.keys(args)
		.filter(k => isNaN(parseInt(k)))
		.some(k => args[k] === positionalStyle);

	if (hasDuplicateNamed) {
		positionalStyle = "";
	}

	// Combine both together
	let style = [positionalStyle, namedStyle].filter(s => s.trim()).join(";");

	style = style.split(";").filter(s => s.trim()).map(s => s.trim().split(":").map(s => s.trim()).join(":")).join(";");
	return HTML.tag("span").attributes({ style }).body(content);
}, {
	type: "Inline"
});
registerSharedOutputs(HTML);

export default HTML;
