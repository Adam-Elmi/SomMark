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

function transpileToHtml(ast, i) {
	const node = Array.isArray(ast) ? ast[i] : ast;
	let result = "";
	if (node.type === "Block") {
		let target = html_mapping.outputs.find(value => value.id === node.id);
		if (target) {
			result = target.output(node.args, "<%smark>" + " ".repeat(node.depth));
			let context = "";
			for (const n of node.body) {
				switch (n.type) {
					case "Text":
						context += " ".repeat(n.depth) + n.text;
						break;
					case "Inline":
						target = html_mapping.outputs.find(value => value.id === n.id);
						if (target) {
							context += target.output(n.args, n.value);
						}
						break;
					case "Newline":
						context += n.value;
						break;
					case "AtBlock":
						target = html_mapping.outputs.find(value => value.id === n.id);
						if (target) {
							let content = "";
							for (const value of n.content) {
								content += value;
							}
							context += target.output(n.args, content);
						}
						break;
					case "Block":
						target = html_mapping.outputs.find(value => value.id === n.id);
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
	let output = "";
	for (let i = 0; i < ast.length; i++) {
		if (ast[i].type === "Block") {
			output += transpileToHtml(ast, i);
		}
	}
	return output;
}

export default transpiler;
