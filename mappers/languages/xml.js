import Mapper from "../mapper.js";
import { registerSharedOutputs } from "../shared/index.js";

/**
 * Renders a standard XML tag based on the provided identifier and arguments.
 * Ensures strict attribute quoting and handles self-closing tags for empty bodies.
 *
 * @param {string} id - The XML tag identifier (case-sensitive).
 * @param {Object} props - Key-value pairs to be rendered as XML attributes.
 * @param {string} content - The rendered inner content of the tag.
 * @returns {string} The fully rendered XML tag string.
 */
const renderXmlTag = function (id, props, content, isSelfClosing) {
	// XML is case-sensitive, so we use the exact id provided
	const element = this.tag(id);

	// Filter out positional indices (numeric keys) for XML attributes
	const namedArgs = {};
	Object.keys(props).forEach(key => {
		if (isNaN(parseInt(key))) {
			namedArgs[key] = props[key];
		}
	});

	// In XML, attributes must always have values (strict = true)
	element.attributes(namedArgs, true);

	const hasBody = typeof content === "string" && content.trim().length > 0;

	if (isSelfClosing || !hasBody) {
		return element.selfClose();
	}

	return element.body(content);
};

/**
 * The XML Mapper used for creating XML pages.
 */
const XML = Mapper.define({
	/**
	 * Renders a comment in XML format.
	 * @param {string} text - The comment content.
	 * @returns {string}
	 */
	comment(text) {
		return `<!-- ${text} -->`;
	},

	/**
	 * Resolves unknown tags by preserving their original case and applying XML rules.
	 * @param {Object} node - The AST node representing the unknown tag.
	 * @returns {Object} Renderer definition for the tag.
	 */
	getUnknownTag(node) {
		const id = node.id;
		return {
			render: ({ props, content, isSelfClosing }) => renderXmlTag.call(this, id, props, content, isSelfClosing),
			options: {}
		};
	},
	options: {
		trimAndWrapBlocks: true
	}
});

/**
 * Registers the XML declaration as a self-closing block.
 * Usage: [xml = version: "1.0", encoding: "UTF-8"]
 */
XML.register(
	"xml",
	({ props }) => {
		const version = props.version || "1.0";
		const encoding = props.encoding || "UTF-8";
		return `<?xml version="${version}" encoding="${encoding}"?>`;
	},
	{ rules: { is_empty_body: true } }
);

/**
 * Registers the DOCTYPE declaration.
 * Usage: [doctype = root: "note", system: "note.dtd"]
 */
XML.register(
	["DOCTYPE", "doctype"],
	({ props }) => {
		const root = props.root || "root";
		const system = props.system;
		const pub = props.public || props.fpi;

		if (pub && system) {
			return `<!DOCTYPE ${root} PUBLIC "${pub}" "${system}">`;
		} else if (system) {
			return `<!DOCTYPE ${root} SYSTEM "${system}">`;
		}
		return `<!DOCTYPE ${root}>`;
	},
	{ rules: { is_empty_body: true } }
);

/**
 * Registers the XML stylesheet processing instruction.
 * Usage: [xml-stylesheet = href: "style.xsl"]
 */
XML.register(
	"xml-stylesheet",
	({ props }) => {
		const type = props.type || "text/xsl";
		const href = props.href;
		if (!href) return "";
		return `<?xml-stylesheet type="${type}" href="${href}"?>`;
	},
	{ rules: { is_empty_body: true } }
);

/**
 * Registers CDATA sections.
 * Body form:    [cdata]raw content[end]
 * Self-closing: [cdata = "raw content" !] or [cdata = text: "raw content" !]
 */
XML.register("cdata", ({ props, content, isSelfClosing }) => {
	const text = isSelfClosing ? (props[0] ?? props.text ?? "") : content;
	return `<![CDATA[${text}]]>`;
});

registerSharedOutputs(XML);

export default XML;
