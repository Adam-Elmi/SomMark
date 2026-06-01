import Json, { renderNode, getIndent, renderMember } from "./json.js";

/**
 * JSONC Mapper - Creates JSON output with comments.
 * It inherits from the standard JSON mapper and adds comment support.
 */

async function renderChildren(node, mapper, depth = 0, inArray = false) {
	let results = [];
	const childIndent = getIndent(depth + 1);

	for (const child of node.body) {
		if (child.type === "Block") {
			const output = await renderNode(child, mapper, depth + 1, inArray);
			if (output) {
				results.push({ type: "Block", value: childIndent + output });
			}
		} else if (child.type === "Comment") {
			if (!mapper.options?.removeComments) {
				results.push({ type: "Comment", value: childIndent + mapper.comment(child.text) });
			}
		} else if (child.type === "CommentBlock") {
			if (!mapper.options?.removeComments) {
				results.push({ type: "CommentBlock", value: childIndent + mapper.commentBlock(child.text, childIndent) });
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

const Jsonc = Json.clone();

Jsonc.comment = function (text) {
	return `// ${text}`;
};

Jsonc.commentBlock = function (text, indent = "  ") {
	if (text.includes("\n")) {
		const lines = text.split("\n");
		return `/*\n${lines.map(line => indent + line).join("\n")}\n${indent}*/`;
	}
	return `/* ${text} */`;
};

// Re-register Object and Array to use the new renderChildren logic
Jsonc.register(["Object", "object"], async function ({ args, ast, depth = 0, inArray = false }) {
	if (ast.body.length === 0) return renderMember(args, "{}", inArray);
	const content = await renderChildren(ast, this, depth, false);
	const val = `{\n${content}\n${getIndent(depth)}}`;
	return renderMember(args, val, inArray);
}, { type: "Block", handleAst: true });

Jsonc.register(["Array", "array"], async function ({ args, ast, depth = 0, inArray = false }) {
	if (ast.body.length === 0) return renderMember(args, "[]", inArray);
	const content = await renderChildren(ast, this, depth, true);
	const val = `[\n${content}\n${getIndent(depth)}]`;
	return renderMember(args, val, inArray);
}, { type: "Block", handleAst: true });

export default Jsonc;
