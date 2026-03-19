import { BLOCK, TEXT, INLINE, ATBLOCK, COMMENT } from "./labels.js";
import escapeHTML from "../helpers/escapeHTML.js";
import { transpilerError } from "./errors.js";
import { textFormat, htmlFormat, markdownFormat, mdxFormat, jsonFormat } from "./formats.js";

/**
 * SomMark Transpiler
 */

const BODY_PLACEHOLDER = `__SOMMARK_BODY_PLACEHOLDER_${Math.random().toString(36).slice(2)}__`;

// ========================================================================== //
//  Helpers                                                                  //
// ========================================================================== //

// Finds the matching output definition for a tag identifier
function matchedValue(outputs, targetId) {
	if (!outputs || !targetId) return undefined;
	return outputs.find(output => {
		if (Array.isArray(output.id)) {
			return output.id.some(id => id === targetId);
		}
		return typeof output.id === "string" && output.id === targetId;
	});
}

// Recursively collects all plain text from a node and its children
function getNodeText(node) {
	if (!node.body) return "";
	let text = "";
	for (const child of node.body) {
		if (child.type === TEXT) text += child.text;
		else if (child.type === INLINE) text += child.value;
		else if (child.type === ATBLOCK) text += child.content;
		else if (child.type === BLOCK) text += getNodeText(child);
	}
	return text;
}

// ========================================================================== //
//  Core Rendering Logic                                                     //
// ========================================================================== //

// Processes an individual node and its body to produce formatted output
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
		const textContent = getNodeText(node);

		result += target.render.call(mapper_file, { args: node.args, content: placeholder, textContent, ast: node });
		if (format === mdxFormat) result = "\n" + result + "\n";

		// ========================================================================== //
		//  Process body nodes recursively                                           //
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

// ========================================================================== //
//  Main Transpiler Entry Point                                              //
// ========================================================================== //

async function transpiler({ ast, format, mapperFile, includeDocument = true }) {
	let output = "";
	for (let i = 0; i < ast.length; i++) {
		const node = ast[i];
		switch (node.type) {
			case BLOCK:
				output += await generateOutput(ast, i, format, mapperFile);
				break;
			case COMMENT:
				output += mapperFile.comment(node.text);
				break;
			case TEXT:
				const shouldEscapeText = (format === htmlFormat || format === mdxFormat);
				output += shouldEscapeText ? escapeHTML(node.text) : node.text;
				break;
			case INLINE:
				let inlineTarget = matchedValue(mapperFile.outputs, node.id);
				if (!inlineTarget) inlineTarget = mapperFile.getUnknownTag(node);
				if (inlineTarget) {
					const shouldEscapeInline = inlineTarget.options?.escape !== false;
					output += inlineTarget.render.call(mapperFile, {
						args: node.args.length > 0 ? node.args : [],
						content: (format === htmlFormat || format === mdxFormat) && shouldEscapeInline ? escapeHTML(node.value) : node.value,
						ast: node
					}) + (format === mdxFormat ? "\n" : "");
				}
				break;
			case ATBLOCK:
				let atTarget = matchedValue(mapperFile.outputs, node.id);
				if (!atTarget) atTarget = mapperFile.getUnknownTag(node);
				if (atTarget) {
					const shouldEscapeAt = atTarget.options?.escape !== false;
					let content = node.content;
					if (shouldEscapeAt && (format === htmlFormat || format === mdxFormat)) {
						content = escapeHTML(content);
					}
					const rendered = atTarget.render.call(mapperFile, { args: node.args, content, ast: node }).trimEnd() + "\n";
					output = output.trim() ? output.trimEnd() + "\n" + rendered : output + rendered;
				}
				break;
		}
	}
	// ========================================================================== //
	//  Final Post-Processing (Dynamic Formats)                                   //
	// ========================================================================== //
	return mapperFile.formatOutput(output, includeDocument);
}

export default transpiler;
