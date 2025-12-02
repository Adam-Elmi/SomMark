import peek from "../helpers/peek.js";
import html from "../mapping/default_mode/smark.html.js";
import markdown from "../mapping/default_mode/smark.md.js";
import PREDEFINED_IDS from "./ids.js";
import fs from "node:fs/promises";
import path from "path";
import { BLOCK, TEXT, INLINE, ATBLOCK, COMMENT, NEWLINE } from "./names.js";

const file_path = path.join(process.cwd(), "smark.config.js");
const isFileExist = await fs
	.access(file_path)
	.then(() => true)
	.catch(() => false);
const config_file = isFileExist ? await import(file_path) : null;
// console.log(config_file.default);

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
// Transpiling to Html
function structuredOutput(ast, i) {
	const node = Array.isArray(ast) ? ast[i] : ast;
	let result = "";
	if (node.type === BLOCK) {
		let target = matchedValue(html.outputs, node.id);
		if (target) {
			result =
				(node.depth > 1 ? " ".repeat(node.depth) : "") +
				target.renderOutput(node.args, "<%smark>" + (node.depth > 1 ? " ".repeat(node.depth) : "")) +
				"\n";
			let context = "";
			for (const n of node.body) {
				switch (n.type) {
					case TEXT:
						context += "\n" + " ".repeat(n.depth) + n.text;
						break;
					case INLINE:
						target = matchedValue(html.outputs, n.id);
						if (target) {
							context += "\n" + target.renderOutput(n.args, n.value);
						}
						break;
					case NEWLINE:
						context += n.value;
						break;
					case ATBLOCK:
						target = matchedValue(html.outputs, n.id);
						if (target) {
							let content = "";
							for (const value of n.content) {
								content += "\n" + value;
							}
							context += target.renderOutput(n.args, content);
						}
						break;
					case COMMENT:
						let commentFormat = `<!--${n.text.replace("#", "")}-->`;
						context += "\n" + " ".repeat(n.depth) + commentFormat;
						break;
					case BLOCK:
						target = matchedValue(html.outputs, n.id);
						context += structuredOutput(n, i);
						break;
				}
			}
			result = result.replace("<%smark>", context);
		} else {
			console.log("Unknown blocks:", node.id);
		}
	}
	return result;
}

//  Transpiling to markdown
function flatOutput(ast, i) {
	const node = Array.isArray(ast) ? ast[i] : ast;
	let result = "";
	let target = matchedValue(markdown.outputs, node.id);
	if (target) {
		result += target.renderOutput(node.args, "");
		for (const body_node of node.body) {
			switch (body_node.type) {
				case TEXT:
					result += body_node.text;
					break;
				case INLINE:
					target = matchedValue(markdown.outputs, body_node.id);
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
						result += target.renderOutput(metadata.length > 0 ? metadata : "", body_node.value);
					}
					break;
				case ATBLOCK:
					target = matchedValue(markdown.outputs, body_node.id);
					if (target) {
						result += target.renderOutput(body_node.args, body_node.content);
					}
					break;
				case NEWLINE:
					result += body_node.value;
					break;
				case BLOCK:
					target = matchedValue(markdown.outputs, body_node.id);
					result += flatOutput(body_node, i);
					break;
			}
		}
	}
	return result;
}

function transpiler(ast, format) {
	if (!format) {
		throw new Error("Please define the format to transpile");
	}
	let output = "";
	for (let i = 0; i < ast.length; i++) {
		if (ast[i].type === BLOCK) {
			output += structuredOutput(ast, i);
		} else if (ast[i].type === COMMENT) {
			let commentFormat = `<!--${ast[i].text.replace("#", "")}-->`;
			output += " ".repeat(ast[i].depth) + commentFormat + "\n";
		}
	}
	if (format === "html") {
		const document = "<!DOCTYPE html>\n" + "<html>\n" + html.header + "<body>\n" + output + "</body>";
		return document;
	}
	return output;
}

export default transpiler;
