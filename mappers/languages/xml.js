import Mapper from "../mapper.js";
import { registerSharedOutputs } from "../shared/index.js";

/**
 * Renders a standard XML tag based on the provided identifier and arguments.
 * Ensures strict attribute quoting and handles self-closing tags for empty bodies.
 * 
 * @param {string} id - The XML tag identifier (case-sensitive).
 * @param {Object} args - Key-value pairs to be rendered as XML attributes.
 * @param {string} content - The rendered inner content of the tag.
 * @returns {string} The fully rendered XML tag string.
 */
const renderXmlTag = function (id, args, content) {
    // XML is case-sensitive, so we use the exact id provided
    const element = this.tag(id);

    // Filter out positional indices (numeric keys) for XML attributes
    const namedArgs = {};
    Object.keys(args).forEach(key => {
        if (isNaN(parseInt(key))) {
            namedArgs[key] = args[key];
        }
    });

    // In XML, attributes must always have values (strict = true)
    element.attributes(namedArgs, true);

    const hasBody = typeof content === "string" && content.trim().length > 0;

    if (!hasBody) {
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
            render: ({ args, content }) => renderXmlTag.call(this, id, args, content),
            options: {
                type: "any"
            }
        };
    }
});

/**
 * Registers the XML declaration as a self-closing block.
 * Usage: [xml = version: "1.0", encoding: "UTF-8"]
 */
XML.register("xml", ({ args }) => {
    const version = args.version || "1.0";
    const encoding = args.encoding || "UTF-8";
    return `<?xml version="${version}" encoding="${encoding}"?>`;
}, { type: "Block", rules: { is_self_closing: true } });

/**
 * Registers the DOCTYPE declaration.
 * Usage: [doctype = root: "note", system: "note.dtd"]
 */
XML.register("doctype", ({ args }) => {
    const root = args.root || "root";
    const system = args.system;
    const pub = args.public || args.fpi;

    if (pub && system) {
        return `<!DOCTYPE ${root} PUBLIC "${pub}" "${system}">`;
    } else if (system) {
        return `<!DOCTYPE ${root} SYSTEM "${system}">`;
    }
    return `<!DOCTYPE ${root}>`;
}, { type: "Block", rules: { is_self_closing: true } });

/**
 * Registers the XML stylesheet processing instruction.
 * Usage: [xml-stylesheet = href: "style.xsl"]
 */
XML.register("xml-stylesheet", ({ args }) => {
    const type = args.type || "text/xsl";
    const href = args.href;
    if (!href) return "";
    return `<?xml-stylesheet type="${type}" href="${href}"?>`;
}, { type: "Block", rules: { is_self_closing: true } });

/**
 * Registers CDATA sections.
 * Usage: @_cdata_@: ; raw content @_end_@
 */
XML.register("cdata", ({ content }) => {
    return `<![CDATA[${content}]]>`;
}, { type: "AtBlock" });

registerSharedOutputs(XML);

export default XML;
