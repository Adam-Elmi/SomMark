import Json, { getIndent, renderMember } from "./json.js";

const ITEM_SEP = "\x1F";

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

async function renderStructure(props, ast, depth, inArray, childInArray, openBracket, closeBracket, renderChild) {
	let combined = "";
	for (const child of ast.body) {
		const out = await renderChild(child, { depth: depth + 1, inArray: childInArray });
		if (out) combined += out;
	}
	const parts = combined.split(ITEM_SEP).map(v => v.trim()).filter(v => v !== "");
	const value = parts.length === 0
		? `${openBracket}${closeBracket}`
		: `${openBracket}\n${parts.map(p => getIndent(depth + 1) + p).join(",\n")}\n${getIndent(depth)}${closeBracket}`;
	return renderMember(props, value, inArray);
}

Jsonc.register(["Object", "object"], async function ({ props, ast, depth = 0, inArray = false, renderChild }) {
	return renderStructure(props, ast, depth, inArray, false, "{", "}", renderChild);
}, { handleAst: true });

Jsonc.register(["Array", "array"], async function ({ props, ast, depth = 0, inArray = false, renderChild }) {
	return renderStructure(props, ast, depth, inArray, true, "[", "]", renderChild);
}, { handleAst: true });

export default Jsonc;
