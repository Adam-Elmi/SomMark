import PREDEFINED_IDS from "./ids.js";
import { BLOCK, TEXT, INLINE, ATBLOCK, COMMENT, NEWLINE } from "./names.js";
import { transpilerError } from "./validator.js";

const formats = { html: "html", md: "md", mdx: "mdx" };
const { html, md, mdx } = formats;

// Extracting target identifier
function matchedValue(outputs, targetId) {
	let result;
	for (const outputValue of outputs) {
		if (typeof outputValue.id === "string") {
			if (outputValue.id === targetId) {
				result = outputValue;
				break;
			}
		} else if (Array.isArray(outputValue.id)) {
			for (const id of outputValue.id) {
				if (id === targetId) {
					result = outputValue;
					break;
				}
			}
		}
	}
	return result;
}

function generateOutput(ast, i, format, file) {
	const node = Array.isArray(ast) ? ast[i] : ast;
	let result = "";
	let target = matchedValue(file.outputs, node.id);
	if (target) {
		result +=
			format === html || format === mdx
				? (node.depth > 1 ? " ".repeat(node.depth) : "") +
					target.render({ args: node.args, content: "\n<%smark>" + (node.depth > 1 ? " ".repeat(node.depth) : "") }) +
					"\n"
				: target.render({ args: node.args, content: "" });
		let context = "";
		for (const body_node of node.body) {
			switch (body_node.type) {
				case TEXT:
					if (body_node.text.length === 2 && body_node.text[0] === "`" && body_node.text[1] === "`") {
						body_node.text = body_node.text.replace("`", "");
					} else {
						if (body_node.text.startsWith("`") && body_node.text.endsWith("`")) {
							body_node.text = body_node.text.slice(1, body_node.text.length - 1);
						}
					}
					if (format === html) {
						context += " ".repeat(body_node.depth) + `<p>${body_node.text}</p>`;
					} else {
						context += body_node.text;
					}
					break;
				case INLINE:
					target = matchedValue(file.outputs, body_node.id);
					if (target) {
						let metadata = [];
						for (const id of PREDEFINED_IDS) {
							if (typeof target.id === "string" && target.id === id) {
								if (body_node.hasOwnProperty("data")) {
									metadata.push(body_node.data);
								}
								if (body_node.hasOwnProperty("title")) {
									if (format === html) body_node.title = body_node.title.replaceAll('"', "");
									metadata.push(body_node.title);
								}
								break;
							}
						}
						context +=
							(format === html || format === mdx ? "\n" : "") +
							target.render({ args: metadata.length > 0 ? metadata : "", content: body_node.value });
					}
					break;
				case NEWLINE:
					context += body_node.value;
					break;
				case ATBLOCK:
					target = matchedValue(file.outputs, body_node.id);
					if (target) {
						let content = "";
						for (let v = 0; v < body_node.content.length; v++) {
							let value = body_node.content[v];
							content += v === 0 ? value : "\n" + value;
						}
						context += target.render({ args: body_node.args, content });
					}
					break;
				case COMMENT:
					let commentFormat = `<!--${body_node.text.replace("#", "")}-->`;
					context += " ".repeat(body_node.depth) + commentFormat;
					break;
				case BLOCK:
					target = matchedValue(file.outputs, body_node.id);
					context += generateOutput(body_node, i, format, file);
					break;
			}
		}
		if (format === html || format === mdx) {
			result = result.replace("<%smark>", context);
		} else {
			result += context;
		}
	} else {
		transpilerError([
			"{line}<$red:Invalid Identifier:$> ",
			`<$yellow:Identifier$> <$blue:'${node.id}'$> <$yellow: is not found in mapping table$>{line}`
		]);
	}
	return result;
}

function transpiler({ast, format, mapperFile, includeDocument = true }) {
	let output = "";
	for (let i = 0; i < ast.length; i++) {
		if (ast[i].type === BLOCK) {
			output += generateOutput(ast, i, format, mapperFile);
		} else if (ast[i].type === COMMENT) {
			let commentFormat = `<!--${ast[i].text.replace("#", "")}-->`;
			output += commentFormat + "\n";
		}
	}
	if (includeDocument && format === html) {
		const document = "<!DOCTYPE html>\n" + "<html>\n" + mapperFile.header + "<body>\n" + output + "</body>\n" + "</html>\n";
		return document;
	}
	return output;
}

export default transpiler;
