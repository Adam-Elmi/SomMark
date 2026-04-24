import { BLOCK, TEXT, INLINE, ATBLOCK, COMMENT } from "./labels.js";
import { transpilerError } from "./errors.js";
import { textFormat, htmlFormat, markdownFormat, mdxFormat, xmlFormat } from "./formats.js";
import { matchedValue } from "../helpers/utils.js";

/**
 * SomMark Transpiler
 * This engine converts the AST into its final text format (like HTML or Markdown)
 * using rules provided by a mapper.
 */

const BODY_PLACEHOLDER = `SOMMARKBODYPLACEHOLDER${Math.random().toString(36).slice(2)}SOMMARK`;

/** 
 * Extracts all plain text from a node and its children.
 * 
 * @param {Object} node - The node to read.
 * @returns {string} - The extracted text.
 */
function getNodeText(node) {
	if (!node?.body && !node?.content) return "";
	if (node.type === ATBLOCK) return node.content || "";
	let text = "";
	if (node.body) {
		for (const child of node.body) {
			if (child.type === TEXT) text += child.text || "";
			else if (child.type === INLINE) text += child.value || "";
			else if (child.type === ATBLOCK) text += child.content || "";
			else if (child.type === BLOCK) text += getNodeText(child);
		}
	}
	return text;
}


/** 
 * Converts a code node into its final format (like HTML).
 * 
 * @param {Object|Object[]} ast - The node or list of nodes to convert.
 * @param {number} i - The current position in the list.
 * @param {string} format - The target format (e.g., 'html').
 * @param {Object} mapper_file - The rules for how to convert each node.
 * @returns {Promise<string>} - The final text for this node.
 */
async function generateOutput(ast, i, format, mapper_file) {
	const node = Array.isArray(ast) ? ast[i] : ast;
	if (!node) return "";

	let result = "";
	let context = "";
	let isParentBlock = false;

	if (node.id === mapper_file?.options?.moduleIdentityToken) {
		const oldFilename = mapper_file.options.filename;
		mapper_file.options.filename = node.args?.filename || oldFilename;
		let bodyOutput = "";
		if (node.body) {
			for (let j = 0; j < node.body.length; j++) {
				bodyOutput += await generateOutput(node.body, j, format, mapper_file);
			}
		}
		mapper_file.options.filename = oldFilename;
		return bodyOutput;
	}

	if (node.type === TEXT) {
		const text = String(node.text || "");
		return mapper_file ? mapper_file.text(text) : text;
	}

	if (node.type === COMMENT) {
		if (mapper_file?.options?.removeComments) return "";
		const cleanComment = String(node.text || "").replace(/^#/, "").trim();
		return " ".repeat(node.depth) + `${mapper_file?.comment(cleanComment) || ""}`;
	}

	let target = mapper_file ? matchedValue(mapper_file.outputs, node.id) : null;
	if (!target && mapper_file) {
		target = mapper_file.getUnknownTag(node);
	}

	if (target) {
		const shouldResolveImmediate = target.options?.resolve === true;
		const textContent = getNodeText(node);

		let content = (node.body?.length === 0) ? "" :
			(node.type === ATBLOCK ? (node.content || "") :
				(node.type === INLINE ? (node.value || "") : BODY_PLACEHOLDER));

		// Apply pipelines to format literal values
		if (node.type === INLINE) {
			content = String(content || "");
			content = mapper_file ? mapper_file.inlineText(content, target.options) : content;
		}

		// 1. Determine if this is a parent block that needs newline wrapping (Trim-and-Wrap)
		// Priority: Target options > Mapper global options
		const effectiveTrimAndWrap = (target.options?.trimAndWrapBlocks !== undefined)
			? target.options.trimAndWrapBlocks
			: mapper_file?.options?.trimAndWrapBlocks;

		isParentBlock = !shouldResolveImmediate && effectiveTrimAndWrap &&
			(node.body?.length > 1 || (node.body?.length === 1 && textContent.trim().includes('\n')));

		if (isParentBlock) {
			content = `\n${BODY_PLACEHOLDER}\n`;
		}

		if (shouldResolveImmediate && node.body) {
			let resolvedBody = "";
			for (let j = 0; j < node.body.length; j++) {
				resolvedBody += await generateOutput(node.body, j, format, mapper_file);
			}
			content = resolvedBody;
		}

		result += await target.render.call(mapper_file, { nodeType: node.type, args: node.args, content, textContent, ast: node });
		if (isParentBlock) result = "\n" + result + "\n";

		if (shouldResolveImmediate) {
			return result;
		}

		const isManualMode = target.options?.handleAst === true;

		if (!isManualMode && node.body) {
			let prev_body_node = null;
			for (let j = 0; j < node.body.length; j++) {
				const body_node = node.body[j];
				let bodyOutput = "";

				switch (body_node.type) {
					case TEXT:
						const text = String(body_node.text || "");
						bodyOutput = mapper_file ? mapper_file.text(text, target?.options) : text;
						break;

					case INLINE:
						let inlineTarget = matchedValue(mapper_file.outputs, body_node.id);
						if (!inlineTarget) {
							inlineTarget = mapper_file.getUnknownTag(body_node);
						}

						if (inlineTarget) {
							let inlineValue = String(body_node.value || "").trim();
							if (mapper_file) inlineValue = mapper_file.inlineText(inlineValue, inlineTarget.options);

							const hasArgs = body_node.args && typeof body_node.args === "object" && Object.keys(body_node.args).length > 0;
							bodyOutput = await inlineTarget.render.call(mapper_file, {
								nodeType: body_node.type,
								args: hasArgs ? body_node.args : {},
								content: inlineValue,
								ast: body_node
							});
						} else {
							let fallback = body_node.value || "";
							if (mapper_file) fallback = mapper_file.inlineText(fallback, {});
							bodyOutput = fallback;
						}
						break;

					case ATBLOCK:
						console.log(`[TRANSPILER] Processing ATBLOCK: ${body_node.id}`);
						let atTarget = matchedValue(mapper_file.outputs, body_node.id);
						if (!atTarget) {
							atTarget = mapper_file.getUnknownTag(body_node);
						}

						let atContent = String(body_node.content || "").trim();
						if (mapper_file) {
							console.log(`[TRANSPILER] Calling atBlockBody for ${body_node.id}`);
							atContent = mapper_file.atBlockBody(atContent, atTarget?.options || {});
						}

						// Removed multiline injection since atBlockBody handles formatting
						bodyOutput = atTarget
							? await atTarget.render.call(mapper_file, { nodeType: body_node.type, args: body_node.args, content: atContent, ast: body_node })
							: atContent;
						break;

					case COMMENT:
						if (mapper_file?.options?.removeComments) break;
						const cleanComment = String(body_node.text || "").replace(/^#/, "").trim();
						bodyOutput = " ".repeat(body_node.depth) + `${mapper_file.comment(cleanComment)}`;
						break;

					case BLOCK:
						bodyOutput = await generateOutput(body_node, 0, format, mapper_file);
						break;
				}

				if (bodyOutput) {
					context += bodyOutput;
				}
			}
		}

		// Trim only leading/trailing newlines and their surrounding spaces to preserve indentation
		const finalContext = effectiveTrimAndWrap ? context.replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, "") : context;

		if (result.includes(BODY_PLACEHOLDER)) {
			result = result.replaceAll(BODY_PLACEHOLDER, finalContext);
		} else if (finalContext.trim()) {
			result += finalContext;
		}
	}
	else if (format === textFormat) {
		if (node.type === ATBLOCK) {
			result = node.content || "";
		} else if (node.type === INLINE) {
			result = node.value || "";
		} else if (node.body) {
			for (const body_node of node.body) {
				switch (body_node.type) {
					case TEXT: context += body_node.text || ""; break;
					case INLINE: context += (body_node.value || "") + " "; break;
					case ATBLOCK: context += (body_node.content || "").trimEnd() + "\n"; break;
					case BLOCK:
						const textBlockOutput = await generateOutput(body_node, 0, format, mapper_file);
						context = context.trim() ? context.trimEnd() + "\n" + textBlockOutput : context + textBlockOutput;
						break;
				}
			}
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

/** 
 * The main entry point for the SomMark Transpiler.
 * It takes an AST and turns it into the final formatted output.
 * 
 * @param {Object|Object[]} optionsOrAst - Either the full options object or just the AST.
 * @param {string} [format] - The target format.
 * @param {Object} [mapperFile] - The mapper rules to use.
 * @returns {Promise<string>} - The final formatted document.
 */
export async function transpiler(optionsOrAst, format, mapperFile) {
	let body = null;
	let targetFormat = format;
	let targetMapper = mapperFile;

	if (typeof optionsOrAst === "object" && !Array.isArray(optionsOrAst) && (optionsOrAst.ast || Array.isArray(optionsOrAst))) {
		if (optionsOrAst.ast) {
			const root = optionsOrAst.ast;
			body = Array.isArray(root) ? root : (root.body || [root]);
			targetFormat = optionsOrAst.format;
			targetMapper = optionsOrAst.mapperFile;
		} else if (Array.isArray(optionsOrAst)) {
			body = optionsOrAst;
		}
	} else if (Array.isArray(optionsOrAst)) {
		body = optionsOrAst;
	}

	if (!body || !Array.isArray(body)) return "";

	let output = "";
	let prev_body_node = null;
	for (let i = 0; i < body.length; i++) {
		const node = body[i];
		const blockOutput = await generateOutput(body, i, targetFormat, targetMapper);

		if (blockOutput) {
			output += blockOutput;
			if (node.type !== TEXT || node.text.trim().length > 0) {
				prev_body_node = node;
			}
		} else if (node.type === COMMENT && targetMapper?.options?.removeComments) {
			// If a comment is removed, check the next node.
			// If it's just a blank line, skip it so we don't have extra gaps in the output.
			const nextNode = body[i + 1];
			if (nextNode && nextNode.type === TEXT && (nextNode.text === "\n" || nextNode.text === "\r\n")) {
				i++; // Skip the next newline node
			}
		}
	}

	return output.trim();
}

export default transpiler;
