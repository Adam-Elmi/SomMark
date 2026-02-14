import { BLOCK, TEXT, INLINE, ATBLOCK, COMMENT } from "./labels.js";
import escapeHTML from "../helpers/escapeHTML.js";
import { transpilerError } from "./errors.js";
import { textFormat, htmlFormat, markdownFormat, mdxFormat, jsonFormat } from "./formats.js";

const expose_for_fmts = [jsonFormat];

// ========================================================================== //
//  Extracting target identifier                                              //
// ========================================================================== //
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

function validateRules(target, args, content) {
	if (!target || !target.options || !target.options.rules) {
		return;
	}
	const { rules } = target.options;
	const { id } = target;

	// Validate Args
	if (args && rules.args) {
		const { min, max, required, includes } = rules.args;
		const argKeys = Object.keys(args).filter(key => isNaN(parseInt(key))); // Get named keys
		const argValues = Object.values(args);
		const argCount = args.length;

		// Min Check
		if (min && argCount < min) {
			transpilerError([
				"{line}<$red:Validation Error:$> ",
				`<$yellow:Identifier$> <$blue:'${Array.isArray(id) ? id.join(" | ") : id}'$> <$yellow:requires at least$> <$green:${min}$> <$yellow:argument(s). Found$> <$red:${argCount}$>{line}`
			]);
		}
		// Max Check
		if (max && argCount > max) {
			transpilerError([
				"{line}<$red:Validation Error:$> ",
				`<$yellow:Identifier$> <$blue:'${Array.isArray(id) ? id.join(" | ") : id}'$> <$yellow:accepts at most$> <$green:${max}$> <$yellow:argument(s). Found$> <$red:${argCount}$>{line}`
			]);
		}
		// Required Keys Check
		if (required && Array.isArray(required)) {
			const missingKeys = required.filter(key => !Object.prototype.hasOwnProperty.call(args, key));
			if (missingKeys.length > 0) {
				transpilerError([
					"{line}<$red:Validation Error:$> ",
					`<$yellow:Identifier$> <$blue:'${Array.isArray(id) ? id.join(" | ") : id}'$> <$yellow:is missing required argument(s):$> <$red:${missingKeys.join(", ")}$>{line}`
				]);
			}
		}
		// Includes Keys Check
		if (includes && Array.isArray(includes)) {
			const invalidKeys = argKeys.filter(key => !includes.includes(key));
			if (invalidKeys.length > 0) {
				transpilerError([
					"{line}<$red:Validation Error:$> ",
					`<$yellow:Identifier$> <$blue:'${Array.isArray(id) ? id.join(" | ") : id}'$> <$yellow:contains invalid argument key(s):$> <$red:${invalidKeys.join(", ")}$>`,
					`{N}<$yellow:Allowed keys are:$> <$green:${includes.join(", ")}$>{line}`
				]);
			}
		}
	}

	// Validate Content
	if (content && rules.content) {
		const { maxLength } = rules.content;
		if (maxLength && content.length > maxLength) {
			transpilerError([
				"{line}<$red:Validation Error:$> ",
				`<$yellow:Identifier$> <$blue:'${Array.isArray(id) ? id.join(" | ") : id}'$> <$yellow:content exceeds maximum length of$> <$green:${maxLength}$> <$yellow:characters. Found$> <$red:${content.length}$>{line}`
			]);
		}
	}
	// Validate is_Self_closing
	if (id && rules.is_Self_closing) {
		if (content) {
			transpilerError([
				"{line}<$red:Validation Error:$> ",
				`<$yellow:Identifier$> <$blue:'${Array.isArray(id) ? id.join(" | ") : id}'$> <$yellow:is self-closing tag and is not allowed to have a content | children$>{line}`
			]);
		}
	}
}
// ========================================================================== //
//  +++++++++++++++++++++++++++++                                             //
// ========================================================================== //
async function generateOutput(ast, i, format, mapper_file) {
	const node = Array.isArray(ast) ? ast[i] : ast;
	let result = "";
	let context = "";
	let target = mapper_file ? matchedValue(mapper_file.outputs, node.id) : "";
  if (target) {
		validateRules(target, node.args, "");
		result +=
			format === htmlFormat || format === mdxFormat || format === jsonFormat
				? `${node.depth > 1 ? " ".repeat(node.depth) : ""}${target.render({ args: node.args, content: "<%smark>", ast: expose_for_fmts.includes(format) ? ast[i] : null })}${node.depth > 1 ? " ".repeat(node.depth) : ""}`
				: target.render({ args: node.args, content: ""});
		for (let j = 0; j < node.body.length; j++) {
			const body_node = node.body[j];
			switch (body_node.type) {
				// ========================================================================== //
				//  Text                                                                      //
				// ========================================================================== //
				case TEXT:
					validateRules(target, body_node.args, body_node.text);
					const shouldEscape = target && target.options && target.options.escape === false ? false : true;
					context +=
						(format === htmlFormat || format === mdxFormat) && shouldEscape ? escapeHTML(body_node.text) : body_node.text;
					break;
				// ========================================================================== //
				//  Inline                                                                    //
				// ========================================================================== //
        case INLINE:
					target = matchedValue(mapper_file.outputs, body_node.id);
					if (target) {
						validateRules(target, body_node.args, body_node.value);
						context +=
							(format === htmlFormat || format === mdxFormat ? "\n" : "") +
            target.render({
								args: body_node.args.length > 0 ? body_node.args : "",
								content: format === htmlFormat || format === mdxFormat ? escapeHTML(body_node.value) : body_node.value
							});
					}
					break;
				// ========================================================================== //
				//  Atblock                                                                   //
				// ========================================================================== //
				case ATBLOCK:
					target = matchedValue(mapper_file.outputs, body_node.id);
					if (target) {
						validateRules(target, body_node.args, body_node.content);
						// Escape logic: fallback to options.escape, default true
						const shouldEscape = target.options?.escape ?? true;
						if (shouldEscape) {
							body_node.content = escapeHTML(body_node.content);
						}
						context += target.render({ args: body_node.args, content: body_node.content });
					}
					break;
				// ========================================================================== //
				//  Comment                                                                   //
				// ========================================================================== //
				case COMMENT:
					if (format === htmlFormat || format === markdownFormat) {
						context += " ".repeat(body_node.depth) + `\n<!--${body_node.text.replace("#", "")}-->\n`;
					} else if (format === mdxFormat) {
						context += " ".repeat(body_node.depth) + `\n{/*${body_node.text.replace("#", "")} */}\n`;
					}
					break;
				// ========================================================================== //
				//  Block                                                                     //
				// ========================================================================== //
        case BLOCK:
					target = matchedValue(mapper_file.outputs, body_node.id);
					context += await generateOutput(body_node, i, format, mapper_file);
					break;
			}
		}

		if (format === htmlFormat || format === mdxFormat || format === jsonFormat) {
			result = result.replace("<%smark>", context);
		} else {
			result += context;
    }
  }
	// ========================================================================== //
	// Text                                                                       //
	// ========================================================================== //
	else if (format === textFormat) {
		for (const body_node of node.body) {
			switch (body_node.type) {
				case TEXT:
					context += body_node.text;
					break;
				case INLINE:
					context += body_node.value + " ";
					break;
				case ATBLOCK:
					context += body_node.content;
					break;
				case BLOCK:
					context += await generateOutput(body_node, i, format, mapper_file);
					break;
			}
		}
		result += context;
	} else {
		transpilerError([
			"{line}<$red:Invalid Identifier:$> ",
			`<$yellow:Identifier$> <$blue:'${node.id}'$> <$yellow: is not found in mapping outputs$>{line}`
		]);
	}
	return result;
}

async function transpiler({ ast, format, mapperFile, includeDocument = true }) {
	let output = "";
	for (let i = 0; i < ast.length; i++) {
		if (ast[i].type === BLOCK) {
			output += await generateOutput(ast, i, format, mapperFile);
		} else if (ast[i].type === COMMENT) {
			if (format === htmlFormat || format === markdownFormat) {
				output += `<!--${ast[i].text.replace("#", "")}-->\n`;
			} else if (format === mdxFormat) {
				output += `{/*${ast[i].text.replace("#", "")} */}\n`;
			}
		}
	}
	if (includeDocument && format === htmlFormat) {
		let finalHeader = mapperFile.header;
		let styleContent = "";
		const updateStyleTag = style => {
			if (style) {
				const styleTag = `<style>\n${style}\n</style>`;
				if (!finalHeader.includes(styleTag)) {
					finalHeader += styleTag + "\n";
				}
			}
		};

		// Inject Style Tag if code blocks exist
		if (mapperFile.enable_highlightTheme && (output.includes("<pre") || output.includes("<code"))) {
			mapperFile.addStyle(mapperFile.themes[mapperFile.currentTheme]);
			styleContent = mapperFile.styles.join("\n");
			updateStyleTag(styleContent);
		} else {
			styleContent = mapperFile.styles.join("\n");
			updateStyleTag(styleContent);
		}

		const document = `<!DOCTYPE html>\n<html>\n${finalHeader}\n<body>\n${output}\n</body>\n</html>\n`;
		return document;
	}
	if (format === jsonFormat) {
		output = JSON.parse(JSON.stringify(output));
	}
	return output;
}

export default transpiler;
