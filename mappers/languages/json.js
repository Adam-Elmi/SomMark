import Mapper from "../mapper.js";
import { getPositionalArgs, matchedValue, safeArg } from "../../helpers/utils.js";

/**
 * JSON Mapper - Creates JSON output.
 * It manages the structure manually using 'handleAst: true'.
 */

/**
 * Returns a string representing the specified indentation level.
 */
export function getIndent(depth) {
	return "  ".repeat(depth);
}

/**
 * Escapes a string for use in a JSON property or value.
 * @param {string} str - The string to escape.
 * @param {boolean} [trim=false] - Whether to trim the string.
 */
export function escapeString(str, trim = false) {
	let out = String(str);
	if (trim) out = out.trim();
	return JSON.stringify(out);
}

import evaluator from "../../core/evaluator.js";

/**
 * Recursively extracts text content from a node, ignoring structural metadata.
 * Evaluates StaticLogic nodes using the Evaluator to inject build-time values.
 */
async function getNodeText(node) {
	if (!node.body) return "";
	let text = "";
	for (const child of node.body) {
		if (child.type === "Text") text += child.text || "";
		else if (child.type === "StaticLogic") {
			try {
				const result = await evaluator.execute(child.code);
				if (result !== undefined && typeof result !== "object") {
					text += String(result);
				}
			} catch (err) {
				console.error(`\x1b[31mLogic Error in JSON mapper:\x1b[0m ${err.message}`);
				console.error(`\x1b[33mCode:\x1b[0m \x1b[34m${child.code}\x1b[0m`);
			}
		}
		else if (child.type === "Block") text += await getNodeText(child);
	}
	return text;
}

/**
 * Resolves the key-value pairing for a JSON member.
 */
export function renderMember(args, value, inArray = false) {
	if (inArray) return value;

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
export async function renderNode(node, mapper, depth = 0, inArray = false) {
	const target = matchedValue(mapper.outputs, node.id) || mapper.getUnknownTag(node);
	if (!target) return "";

	evaluator.pushScope();
	const textContent = await getNodeText(node);
	const output = await target.render.call(mapper, {
		nodeType: node.type,
		args: node.args,
		content: "",
		textContent,
		ast: node,
		depth,
		inArray
	});
	await evaluator.popScope();
	return output;
}

/**
 * Formats the children of a node into a neat list.
 */
export async function renderChildren(node, mapper, depth = 0, inArray = false) {
	let results = [];
	const childIndent = getIndent(depth + 1);

	for (const child of node.body) {
		if (child.type === "Block") {
			const output = await renderNode(child, mapper, depth + 1, inArray);
			if (output) {
				results.push({ type: "Block", value: childIndent + output });
			}
		}
	}

	let finalOutput = "";
	for (let i = 0; i < results.length; i++) {
		const current = results[i];
		finalOutput += current.value;

		if (current.type === "Block") {
			// Add comma if there is another Block later
			let hasNextBlock = false;
			for (let j = i + 1; j < results.length; j++) {
				if (results[j].type === "Block") {
					hasNextBlock = true;
					break;
				}
			}
			if (hasNextBlock) finalOutput += ",";
		}

		if (i < results.length - 1) {
			finalOutput += "\n";
		}
	}
	return finalOutput;
}

const Json = Mapper.define({});

/**
 * The JSON object node rule.
 */
Json.register(["Object", "object"], async ({ args, ast, depth = 0, inArray = false }) => {
	if (ast.body.length === 0) return renderMember(args, "{}", inArray);
	const content = await renderChildren(ast, Json, depth, false);
	const val = `{\n${content}\n${getIndent(depth)}}`;
	return renderMember(args, val, inArray);
}, { type: "Block", handleAst: true });

/**
 * The JSON array node rule.
 */
Json.register(["Array", "array"], async ({ args, ast, depth = 0, inArray = false }) => {
	if (ast.body.length === 0) return renderMember(args, "[]", inArray);
	const content = await renderChildren(ast, Json, depth, true);
	const val = `[\n${content}\n${getIndent(depth)}]`;
	return renderMember(args, val, inArray);
}, { type: "Block", handleAst: true });

/**
 * JSON Primitives
 */
Json.register("string", ({ args, textContent, inArray }) => {
	const trim = safeArg({
		args,
		key: "trim",
		type: "boolean",
		setType: v => v === "true" || v === true,
		fallBack: false
	});
	const raw = safeArg({ args, index: inArray ? 0 : undefined, key: "value", fallBack: textContent });
	const val = escapeString(raw, trim);
	return renderMember(args, val, inArray);
}, { type: "Block", handleAst: true });

Json.register("number", ({ args, textContent, inArray }) => {
	const raw = String(safeArg({ args, index: inArray ? 0 : undefined, key: "value", fallBack: textContent })).trim();
	const val = (isNaN(Number(raw)) || raw === "") ? "0" : raw;
	return renderMember(args, val, inArray);
}, { type: "Block", handleAst: true });

Json.register("bool", ({ args, textContent, inArray }) => {
	const raw = String(safeArg({ args, index: inArray ? 0 : undefined, key: "value", fallBack: textContent })).trim().toLowerCase();
	const val = (raw === "true" || raw === "1") ? "true" : "false";
	return renderMember(args, val, inArray);
}, { type: "Block", handleAst: true });

Json.register("null", ({ args, inArray }) => {
	return renderMember(args, "null", inArray);
}, { type: "Block", handleAst: true });

export default Json;
