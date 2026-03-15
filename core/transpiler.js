import { BLOCK, TEXT, INLINE, ATBLOCK, COMMENT } from "./labels.js";
import escapeHTML from "../helpers/escapeHTML.js";
import { transpilerError } from "./errors.js";
import { textFormat, htmlFormat, markdownFormat, mdxFormat, jsonFormat } from "./formats.js";

const BODY_PLACEHOLDER = `__SOMMARK_BODY_PLACEHOLDER_${Math.random().toString(36).slice(2)}__`;

// ========================================================================== //
//  Extracting target identifier                                              //
// ========================================================================== //
function matchedValue(outputs, targetId) {
	if (!outputs || !targetId) return undefined;
	return outputs.find(output => {
		if (Array.isArray(output.id)) {
			return output.id.some(id => id === targetId);
		}
		return typeof output.id === "string" && output.id === targetId;
	});
}

async function generateOutput(ast, i, format, mapper_file) {
	const node = Array.isArray(ast) ? ast[i] : ast;
	let result = "";
	let context = "";
	let target = mapper_file ? matchedValue(mapper_file.outputs, node.id) : null;
	
	if (!target) {
		target = mapper_file.getUnknownTag(node);
	}

	if (target) {
		// ========================================================================== //
		//  Always use placeholders for blocks to support wrapping                      //
		// ========================================================================== //
		const placeholder = format === mdxFormat && node.body.length > 0 ? `\n${BODY_PLACEHOLDER}\n` : BODY_PLACEHOLDER;
		
		result += target.render.call(mapper_file, { args: node.args, content: placeholder, ast: node });
		if (format === mdxFormat) result = "\n" + result + "\n";

		// ========================================================================== //
		//  Body nodes                                                                //
		// ========================================================================== //
		for (let j = 0; j < node.body.length; j++) {
			const body_node = node.body[j];
			switch (body_node.type) {
				case TEXT:
					const shouldEscapeText = target.options?.escape !== false;
					context += (format === htmlFormat || format === mdxFormat) && shouldEscapeText ? escapeHTML(body_node.text) : body_node.text;
					break;

				case INLINE:
					let inlineTarget = matchedValue(mapper_file.outputs, body_node.id);
					if (!inlineTarget) {
						inlineTarget = mapper_file.getUnknownTag(body_node);
					}

					if (inlineTarget) {
						const shouldEscapeInline = inlineTarget.options?.escape !== false;
						context +=
							inlineTarget.render.call(mapper_file, {
								args: body_node.args.length > 0 ? body_node.args : [],
								content: (format === htmlFormat || format === mdxFormat) && shouldEscapeInline ? escapeHTML(body_node.value) : body_node.value,
								ast: body_node
							}) + (format === mdxFormat ? "\n" : "");
					}
					break;

				case ATBLOCK:
					let atTarget = matchedValue(mapper_file.outputs, body_node.id);
					if (!atTarget) {
						atTarget = mapper_file.getUnknownTag(body_node);
					}
					if (atTarget) {
						const shouldEscapeAt = atTarget.options?.escape !== false;
						let content = body_node.content;
						if (shouldEscapeAt && (format === htmlFormat || format === mdxFormat)) {
							content = escapeHTML(content);
						}
						const rendered = atTarget.render.call(mapper_file, { args: body_node.args, content, ast: body_node }).trimEnd() + "\n";
						context = context.trim() ? context.trimEnd() + "\n" + rendered : context + rendered;
					}
					break;

				case COMMENT:
					context += " ".repeat(body_node.depth) + `\n${mapper_file.comment(body_node.text)}\n`;
					break;

				case BLOCK:
					const blockOutput = await generateOutput(body_node, i, format, mapper_file);
					context = context.trim() ? context.trimEnd() + "\n" + blockOutput : context + blockOutput;
					break;
			}
		}

		result = result.replaceAll(BODY_PLACEHOLDER, context);
	}
	else if (format === textFormat) {
		for (const body_node of node.body) {
			switch (body_node.type) {
				case TEXT: context += body_node.text; break;
				case INLINE: context += body_node.value + " "; break;
				case ATBLOCK: context += body_node.content.trimEnd() + "\n"; break;
				case BLOCK:
					const textBlockOutput = await generateOutput(body_node, i, format, mapper_file);
					context = context.trim() ? context.trimEnd() + "\n" + textBlockOutput : context + textBlockOutput;
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
	return result.trimEnd() + "\n";
}

async function transpiler({ ast, format, mapperFile, includeDocument = true }) {
	let output = "";
	for (let i = 0; i < ast.length; i++) {
		if (ast[i].type === BLOCK) {
			output += await generateOutput(ast, i, format, mapperFile);
		} else if (ast[i].type === COMMENT) {
			output += mapperFile.comment(ast[i].text);
		}
	}
	// ========================================================================== //
	//  Final Post-Processing (Dynamic Formats)                                   //
	// ========================================================================== //
	return mapperFile.formatOutput(output, includeDocument);
}

export default transpiler;
