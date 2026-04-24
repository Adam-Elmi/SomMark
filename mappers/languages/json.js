import Mapper from "../mapper.js";
import { getPositionalArgs, matchedValue, safeArg } from "../../helpers/utils.js";

/**
 * JSON Mapper - Creates JSON output.
 * It manages the structure manually using 'handleAst: true'.
 */

/**
 * Returns a string representing the specified indentation level.
 */
function getIndent(depth) {
	return "  ".repeat(depth);
}

/**
 * Escapes a string for use in a JSON property or value.
 * @param {string} str - The string to escape.
 * @param {boolean} [trim=false] - Whether to trim the string.
 */
function escapeString(str, trim = false) {
	let out = String(str);
	if (trim) out = out.trim();
	return JSON.stringify(out);
}

/**
 * Recursively extracts text content from a node, ignoring structural metadata.
 */
function getNodeText(node) {
	if (!node.body) return "";
	let text = "";
	for (const child of node.body) {
		if (child.type === "Text") text += child.text;
		else if (child.type === "Block") text += getNodeText(child);
	}
	return text;
}

/**
 * Resolves the key-value pairing for a JSON member.
 */
function renderMember(args, value) {
	const posArgs = getPositionalArgs(args);
	const key = args.key || posArgs[0]; // The 'key' rule determines the member name

	if (key) {
		return `${escapeString(key)}: ${value}`;
	}
	return value;
}

/**
 * Formats a given node and tracks its indentation.
 */
async function renderNode(node, mapper, depth = 0) {
	const target = matchedValue(mapper.outputs, node.id) || mapper.getUnknownTag(node);
	if (!target) return "";

	const textContent = getNodeText(node);
	return await target.render.call(mapper, {
		nodeType: node.type,
		args: node.args,
		content: "",
		textContent,
		ast: node,
		depth
	});
}

/**
 * Formats the children of a node into a neat list.
 */
async function renderChildren(node, mapper, depth = 0) {
	let results = [];
	const childIndent = getIndent(depth + 1);

	for (const child of node.body) {
		if (child.type === "Block") {
			const output = await renderNode(child, mapper, depth + 1);
			if (output) {
				results.push(childIndent + output);
			}
		}
	}
	return results.join(",\n");
}

const Json = Mapper.define({});

/**
 * The JSON object node rule.
 */
Json.register(["Object", "object"], async ({ args, ast, depth = 0 }) => {
	if (ast.body.length === 0) return renderMember(args, "{}");
	const content = await renderChildren(ast, Json, depth);
	const val = `{\n${content}\n${getIndent(depth)}}`;
	return renderMember(args, val);
}, { type: "Block", handleAst: true });

/**
 * The JSON array node rule.
 */
Json.register(["Array", "array"], async ({ args, ast, depth = 0 }) => {
	if (ast.body.length === 0) return renderMember(args, "[]");
	const content = await renderChildren(ast, Json, depth);
	const val = `[\n${content}\n${getIndent(depth)}]`;
	return renderMember(args, val);
}, { type: "Block", handleAst: true });

/**
 * JSON Primitives
 */
Json.register("string", ({ args, textContent }) => {
	const trim = safeArg({ 
		args, 
		key: "trim", 
		type: "boolean", 
		setType: v => v === "true" || v === true,
		fallBack: false 
	});
	const val = escapeString(textContent, trim);
	return renderMember(args, val);
}, { type: "Block", handleAst: true });

Json.register("number", ({ args, textContent }) => {
	const raw = textContent.trim();
	const val = (isNaN(Number(raw)) || raw === "") ? "0" : raw;
	return renderMember(args, val);
}, { type: "Block", handleAst: true });

Json.register("bool", ({ args, textContent }) => {
	const raw = textContent.trim().toLowerCase();
	const val = (raw === "true" || raw === "1") ? "true" : "false";
	return renderMember(args, val);
}, { type: "Block", handleAst: true });

Json.register("null", ({ args }) => {
	return renderMember(args, "null");
}, { type: "Block", handleAst: true });

export default Json;
