import { BLOCK, TEXT, INLINE, ATBLOCK, COMMENT } from "./labels.js";
import escapeHTML from "../helpers/escapeHTML.js";
import { transpilerError } from "./validator.js";

const formats = { htmlFormat: "html", markdownFormat: "md", mdxFormat: "mdx" };
const { htmlFormat, markdownFormat, mdxFormat } = formats;

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
	let context = "";
	let target = matchedValue(file.outputs, node.id);
	if (target) {
		result +=
			format === htmlFormat || format === mdxFormat
				? (node.depth > 1 ? " ".repeat(node.depth) : "") +
				target.render({ args: node.args, content: "\n<%smark>" + (node.depth > 1 ? " ".repeat(node.depth) : "") }) +
				"\n"
				: target.render({ args: node.args, content: "" });
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
					context += (format === htmlFormat || format === mdxFormat) ? escapeHTML(body_node.text) : body_node.text;
					break;
				case INLINE:
					target = matchedValue(file.outputs, body_node.id);
					if (target) {
						context +=
							(format === htmlFormat || format === mdxFormat ? "\n" : "") +
							target.render({ args:  body_node.args.length > 0 ?  body_node.args : "", content: (format === htmlFormat || format === mdxFormat) ? escapeHTML(body_node.value) : body_node.value });
					}
					break;
				case ATBLOCK:
					target = matchedValue(file.outputs, body_node.id);
					if (target) {
						const shouldEscape = target.options?.escape ?? true;
						let content = "";
						for (let v = 0; v < body_node.content.length; v++) {
							let value = body_node.content[v];
							if (shouldEscape) {
								value = escapeHTML(value);
							}
							content += v === 0 ? value : "\n" + value;
						}
						context += target.render({ args: body_node.args, content });
					}
					break;
				case COMMENT:
					if (format === htmlFormat || format === markdownFormat) {
						context += " ".repeat(body_node.depth) + `<!--${body_node.text.replace("#", "")}-->`;
					} else if (format === mdxFormat) {
						context += " ".repeat(body_node.depth) + `{/*${body_node.text.replace("#", "")} */}`;
					}
					break;
				case BLOCK:
					target = matchedValue(file.outputs, body_node.id);
					context += generateOutput(body_node, i, format, file);
					break;
			}
		}
		if (format === htmlFormat || format === mdxFormat) {
			result = result.replace("<%smark>", context);
		} else {
			result += context;
		}
	} else {
		transpilerError([
			"{line}<$red:Invalid Identifier:$> ",
			`<$yellow:Identifier$> <$blue:'${node.id}'$> <$yellow: is not found in mapping outputs$>{line}`
		]);
	}
	return result;
}

function transpiler({ ast, format, mapperFile, includeDocument = true }) {
	let output = "";
	for (let i = 0; i < ast.length; i++) {
		if (ast[i].type === BLOCK) {
			output += generateOutput(ast, i, format, mapperFile);
		} else if (ast[i].type === COMMENT) {
			if (format === htmlFormat || format === markdownFormat) {
				output += `<!--${ast[i].text.replace("#", "")}-->\n`;
			} else if (format === mdxFormat) {
				output += `{/*${ast[i].text.replace("#", "")} */}\n`;
			}
		}
	}
	if (format === htmlFormat && (output.includes("<code>") || output.includes("<pre>"))) {
		if (mapperFile.enableLoadStyle) {
			mapperFile.setHeader([mapperFile.loadStyle(mapperFile.env, mapperFile.selectedTheme)]);
		}
		if (mapperFile.enableLinkStyle) {
			mapperFile.setHeader([mapperFile.cssTheme(mapperFile.selectedTheme)]);
		}
	}
	if (includeDocument && format === htmlFormat) {
		const document = "<!DOCTYPE html>\n" + "<html>\n" + mapperFile.header + "<body>\n" + output + "</body>\n" + "</html>\n";
		return document;
	}
	return output;
}

export default transpiler;
