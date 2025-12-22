import PREDEFINED_IDS from "./ids.js";
import { BLOCK, TEXT, INLINE, ATBLOCK, COMMENT, NEWLINE } from "./names.js";
import { transpilerError } from "./validator.js";

// Extracting target identifier
function matchedValue(outputs, targetId) {
	let result;
	for (const renderOutput of outputs) {
		if (typeof renderOutput.id === "string") {
			if (renderOutput.id === targetId) {
				result = renderOutput;
				break;
			}
		} else if (Array.isArray(renderOutput.id)) {
			for (const id of renderOutput.id) {
				if (id === targetId) {
					result = renderOutput;
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
			format === "html"
				? (node.depth > 1 ? " ".repeat(node.depth) : "") +
					target.renderOutput(node.args, "<%smark>" + (node.depth > 1 ? " ".repeat(node.depth) : "")) +
					"\n"
				: target.renderOutput(node.args, "");
		let context = "";
		for (const body_node of node.body) {
			switch (body_node.type) {
				case TEXT:
					if (body_node.text.startsWith("`") && body_node.text.endsWith("`")) {
						body_node.text = body_node.text.slice(1, body_node.text.length - 1);
					}
					if (format === "html") {
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
									metadata.push(body_node.title);
								}
								break;
							}
						}
						context +=
							(format === "html" ? "\n" : "") + target.renderOutput(metadata.length > 0 ? metadata : "", body_node.value);
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
						context += target.renderOutput(body_node.args, content);
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
		if (format === "html") {
			result = result.replace("<%smark>", context);
		} else {
			result += context;
		}
	} else {
		transpilerError([`{line}<$yellow:Identifier$> <$blue:'${node.id}'$> <$yellow: is not found in mapping table$>{line}`]);
	}
	return result;
}

const accepted_formats = ["html", "md", "mdx"];

function transpiler(ast, format, file) {
	if (!format) {
		transpilerError(["{line}<$red:Invalid Format$>: <$yellow:Format argument is not defined$>{line}"]);
	}
	if (!accepted_formats.includes(format)) {
		transpilerError([
			`{line}<$red:Unknown Format$>: <$yellow:You provided unknown format:$> <$green:'${format}'$>`,
			`{N}<$yellow:Accepted formats are:$> [<$cyan: ${accepted_formats.join(", ")}$>]{line}`
		]);
	}
	let output = "";
	for (let i = 0; i < ast.length; i++) {
		if (ast[i].type === BLOCK) {
			output += generateOutput(ast, i, format, file);
		} else if (ast[i].type === COMMENT) {
			let commentFormat = `<!--${ast[i].text.replace("#", "")}-->`;
			output += commentFormat + "\n";
		}
	}
	if (format === "html") {
		const document = "<!DOCTYPE html>\n" + "<html>\n" + file.header + "<body>\n" + output + "</body>\n" + "</html>\n";
		return document;
	}
	return output;
}

export default transpiler;
