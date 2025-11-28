import parser from "./parser.js";
import peek from "../helpers/peek.js";
import html_mapping from "../mapping/default_mode/smark.html.js";
import markdown_mapping from "../mapping/default_mode/smark.md.js";
import fs from "node:fs/promises";
import path from "path";

const file_path = path.join(process.cwd(), "smark.config.js");
const isFileExist = await fs
	.access(file_path)
	.then(() => true)
	.catch(() => false);
const config_file = isFileExist ? await import(file_path) : null;
// console.log(config_file.default);
 
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

function transpileToHtml(ast, i) {
	const node = Array.isArray(ast) ? ast[i] : ast;
	let result = "";
	if (node.type === "Block") {
		let target = matchedValue(html_mapping.outputs, node.id);
		if (target) {
			result = target.renderOutput(node.args, "<%smark>" + ( node.depth > 1 ? " ".repeat(node.depth) : ""));
			let context = "";
			for (const n of node.body) {
				switch (n.type) {
					case "Text":
						context += " ".repeat(n.depth) + n.text;
						break;
					case "Inline":
						target = matchedValue(html_mapping.outputs, n.id);
						if (target) {
							context += target.renderOutput(n.args, n.value);
						}
						break;
					case "Newline":
						context += n.value;
						break;
					case "AtBlock":
						target = matchedValue(html_mapping.outputs, n.id);
						if (target) {
							let content = "";
							for (const value of n.content) {
								content += value;
							}
							context += target.renderOutput(n.args, content);
						}
						break;
					case "Block":
						target = matchedValue(html_mapping.outputs, n.id);
						context += " ".repeat(n.depth) + transpileToHtml(n, i);
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

function transpiler(ast) {
	let renderOutput = "";
	for (let i = 0; i < ast.length; i++) {
		if (ast[i].type === "Block") {
			renderOutput += transpileToHtml(ast, i);
		}
	}
	return renderOutput;
}

export default transpiler;
