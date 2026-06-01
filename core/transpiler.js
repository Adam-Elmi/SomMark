import crypto from "node:crypto";
import { BLOCK, TEXT, INLINE, ATBLOCK, COMMENT, COMMENT_BLOCK, STATIC_LOGIC, RUNTIME_LOGIC, FOR_EACH } from "./labels.js";
import { transpilerError } from "./errors.js";
import evaluator from "./evaluator.js";
import { matchedValue } from "../helpers/utils.js";
import { dedentBy } from "../helpers/dedent.js";
import { preprocessRuntimeLogic } from "./helpers/preprocessor.js";
import { wrapRuntimeLogic } from "./helpers/runtimeOutput.js";

/**
 * SomMark Transpiler
 * This engine converts the AST into its final text format (like HTML or Markdown)
 * using rules provided by a mapper.
 */

const BODY_PLACEHOLDER = `SOMMARKBODYPLACEHOLDER${crypto.randomBytes(8).toString("hex")}SOMMARK`;

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
			else if (child.type === BLOCK || child.type === FOR_EACH) text += getNodeText(child);
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
async function generateOutput(ast, i, format, mapper_file, security = {}, parentId = null, generateRuntimeOutput = false, hideRuntimeOutput = false) {
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
			evaluator.pushScope();
			for (let j = 0; j < node.body.length; j++) {
				bodyOutput += await generateOutput(node.body, j, format, mapper_file, security, parentId, generateRuntimeOutput, hideRuntimeOutput);
			}
			await evaluator.popScope();
		}
		mapper_file.options.filename = oldFilename;
		return bodyOutput;
	}

	if (node.type === TEXT) {
		if (generateRuntimeOutput) return "";
		const text = String(node.text || "");
		return mapper_file ? mapper_file.text(text) : text;
	}

	if (node.type === COMMENT) {
		if (generateRuntimeOutput || mapper_file?.options?.removeComments) return "";
		return " ".repeat(node.depth) + `${mapper_file?.comment(node.text) || ""}`;
	}

	if (node.type === COMMENT_BLOCK) {
		if (generateRuntimeOutput || mapper_file?.options?.removeComments) return "";
		return " ".repeat(node.depth) + `${mapper_file?.commentBlock(node.text) || ""}`;
	}

	if (node.type === RUNTIME_LOGIC) {
		const preprocessed = await preprocessRuntimeLogic(node.code, mapper_file?.options?.filename, security);
		if (hideRuntimeOutput) {
			return "";
		}
		if (generateRuntimeOutput) {
			return wrapRuntimeLogic(preprocessed, format, parentId, node.depth === 1);
		}
		return mapper_file ? mapper_file.runtimeLogic(preprocessed, node.depth === 1, parentId) : "";
	}

	if (node.type === STATIC_LOGIC) {
		try {
			const result = await evaluator.execute(node.code);
			if (generateRuntimeOutput) return "";
			if (result && typeof result === "object" && result.__raw !== undefined) {
				if (security?.allowRaw === false) {
					return mapper_file ? mapper_file.text(String(result.__raw)) : String(result.__raw);
				}
				const rawVal = String(result.__raw);
				return (security?.sanitize && typeof security.sanitize === "function") ? security.sanitize(rawVal) : rawVal;
			}
			// Hide objects (like module exports) from the final output
			const out = (result !== undefined && typeof result !== "object") ? String(result) : "";
			return mapper_file ? mapper_file.text(out) : out;
		} catch (err) {
			transpilerError([
				`<$red:Logic Error:$> ${err.message}{line}`,
				`<$yellow:Code:$> <$blue:${node.code}$>{line}`
			]);
		}
	}

	if (node.type === FOR_EACH) {
		const transpiledArgs = await transpileArgs(node.args);
		const items = mapper_file ? mapper_file.safeArg({ args: transpiledArgs, index: 0, key: "items", fallBack: [] }) : [];

		if (!Array.isArray(items)) {
			const line = node.range?.start?.line + 1 || 1;
			transpilerError([
				`<$red:Type Error in [for-each]:$>{line}`,
				`Expected an <$green:Array$> for 'items', but received <$yellow:${typeof items}$>:<$cyan: ${JSON.stringify(items)}$>{line}`,
				`at line <$yellow:${line}$>{line}`
			]);
			return "";
		}

		const asVar = transpiledArgs.as || "item";
		const indexVar = `${asVar}_index`;

		// Trim structural whitespace/newlines at start and end of loop body for formatting clean output
		let cleanedBody = [];
		if (node.body) {
			cleanedBody = [...node.body];

			// Trim ALL leading pure-whitespace Text nodes
			while (cleanedBody.length > 0 && cleanedBody[0].type === TEXT && /^\s*$/.test(cleanedBody[0].text)) {
				cleanedBody.shift();
			}
			// If the now-first node is a Text node, trim its leading whitespace/newlines
			if (cleanedBody.length > 0 && cleanedBody[0].type === TEXT) {
				cleanedBody[0] = { ...cleanedBody[0], text: cleanedBody[0].text.replace(/^\s+/, "") };
			}

			// Trim ALL trailing pure-whitespace Text nodes
			while (cleanedBody.length > 0 && cleanedBody[cleanedBody.length - 1].type === TEXT && /^\s*$/.test(cleanedBody[cleanedBody.length - 1].text)) {
				cleanedBody.pop();
			}
			// If the now-last node is a Text node, trim its trailing whitespace/newlines
			if (cleanedBody.length > 0 && cleanedBody[cleanedBody.length - 1].type === TEXT) {
				cleanedBody[cleanedBody.length - 1] = { ...cleanedBody[cleanedBody.length - 1], text: cleanedBody[cleanedBody.length - 1].text.replace(/\s+$/, "") };
			}
		}

		let output = "";
		let idx = 0;
		for (const item of items) {
			evaluator.pushScope();
			evaluator.inject({
				[asVar]: item,
				[indexVar]: idx++
			});

			for (let j = 0; j < cleanedBody.length; j++) {
				output += await generateOutput(cleanedBody, j, format, mapper_file, security, parentId, generateRuntimeOutput, hideRuntimeOutput);
			}

			await evaluator.popScope();
		}
		return output;
	}

	let secretId = null;
	if (node.type === BLOCK) {
		if (node.args) {
			for (const key of Object.keys(node.args)) {
				if (key.toLowerCase().startsWith("data-sommark")) {
					transpilerError([
						`<$red:Reserved Attribute Error:$> The attribute name '<$yellow:${key}$>' is reserved for SomMark's internal runtime compiler logic.{line}`,
						`Please use a different attribute name.`
					]);
				}
			}
		}

		const hasRuntime = node.body?.some(child => child.type === RUNTIME_LOGIC);
		if (hasRuntime) {
			secretId = `sommark-${node.id.toLowerCase()}-${crypto.randomBytes(4).toString("hex")}`;
		}
	}

	let target = null;
	if (evaluator.active && evaluator.active.hasDynamicTag(node.id)) {
		target = {
			id: node.id,
			options: evaluator.active.getDynamicTagOptions(node.id) || {},
			render: async function (payload) {
				return await evaluator.active.executeDynamicTag(node.id, payload);
			}
		};
	} else {
		target = mapper_file ? matchedValue(mapper_file.outputs, node.id) : null;
		if (!target && mapper_file) {
			target = mapper_file.getUnknownTag(node);
		}
	}

	if (target) {
		const shouldResolveImmediate = target.options?.resolve === true;
		const textContent = getNodeText(node);

		let content = (node.body?.length === 0) ? "" :
			(node.type === ATBLOCK ? dedentBy(node.content || "", node.range?.start?.character || 0).trim() :
				(node.type === INLINE ? (node.value || "") : BODY_PLACEHOLDER));

		// Apply pipelines to format literal values
		if (node.type === INLINE) {
			content = String(content || "");
			content = mapper_file ? mapper_file.inlineText(content, target.options) : content;
		}

		if (node.type === ATBLOCK) {
			content = String(content || "");
			content = mapper_file ? mapper_file.atBlockBody(content, target.options) : content;
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
			evaluator.pushScope();
			for (let j = 0; j < node.body.length; j++) {
				resolvedBody += await generateOutput(node.body, j, format, mapper_file, security, parentId, generateRuntimeOutput, hideRuntimeOutput);
			}
			await evaluator.popScope();
			content = dedentBy(resolvedBody, node.range?.start?.character || 0);
		}

		if (generateRuntimeOutput) {
			let childrenOutput = "";
			if (node.body) {
				for (let j = 0; j < node.body.length; j++) {
					childrenOutput += await generateOutput(node.body, j, format, mapper_file, security, secretId || parentId, generateRuntimeOutput, hideRuntimeOutput);
				}
			}
			return childrenOutput;
		}

		const isManualMode = target.options?.handleAst === true;

		const transpiledArgs = await transpileArgs(node.args);
		if (secretId) {
			transpiledArgs["data-sommark-id"] = secretId;
		}
		result += await target.render.call(mapper_file, {
			nodeType: node.type,
			args: transpiledArgs,
			content,
			textContent,
			ast: isManualMode ? node : new Proxy({}, {
				get(target, prop) {
					if (prop === "then" || prop === "toJSON" || typeof prop === "symbol" || prop === "constructor" || prop === "inspect" || prop === "valueOf" || prop === "toString") {
						return undefined;
					}
					transpilerError([
						`<$red:Access Error:$> Attempted to access '<$yellow:ast.${String(prop)}$>', but '<$yellow:ast$>' is undefined because '<$cyan:handleAst$>' is false or not specified in this tag's registration options.{N}{N}`,
						`Please set '<$green:handleAst: true$>' in the options object of your tag registration to get the actual AST node.`
					]);
				}
			}),
			isSelfClosing: node.type === BLOCK ? (node.isSelfClosing || false) : undefined
		});
		// if (isParentBlock) result = "\n" + result;

		if (shouldResolveImmediate) {
			return result;
		}

		if (!isManualMode && node.body) {
			let prev_body_node = null;
			let prev_was_silent = false;
			const parentEscape = (security?.allowRaw === false) ? true : (target.options?.escape !== false);
			evaluator.pushScope();
			for (let j = 0; j < node.body.length; j++) {
				const body_node = node.body[j];
				let bodyOutput = "";

				switch (body_node.type) {
					case TEXT:
						const text = String(body_node.text || "");
						// Dedent text relative to the parent block's indentation
						const localDedentedText = dedentBy(text, node.range?.start?.character || 0);
						let bodyTextVal = mapper_file ? mapper_file.text(localDedentedText, { ...target?.options, escape: parentEscape }) : localDedentedText;
						if (parentEscape === false && security?.sanitize && typeof security.sanitize === "function") {
							bodyTextVal = security.sanitize(bodyTextVal);
						}
						bodyOutput = bodyTextVal;
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
						let atTarget = matchedValue(mapper_file.outputs, body_node.id);
						if (!atTarget) {
							atTarget = mapper_file.getUnknownTag(body_node);
						}

						// AtBlocks handle their own absolute dedenting
						let atContent = dedentBy(body_node.content || "", body_node.range?.start?.character || 0).trim();
						if (mapper_file) {
							atContent = mapper_file.atBlockBody(atContent, atTarget?.options || {});
						}

						// Removed multiline injection since atBlockBody handles formatting
						const transpiledAtArgs = await transpileArgs(body_node.args);
						bodyOutput = atTarget
							? await atTarget.render.call(mapper_file, { nodeType: body_node.type, args: transpiledAtArgs, content: atContent, ast: body_node })
							: atContent;
						break;

					case COMMENT:
						if (mapper_file?.options?.removeComments) break;
						bodyOutput = " ".repeat(body_node.depth) + `${mapper_file.comment(body_node.text)}`;
						break;

					case COMMENT_BLOCK:
						if (mapper_file?.options?.removeComments) break;
						bodyOutput = " ".repeat(body_node.depth) + `${mapper_file.commentBlock(body_node.text)}`;
						break;

					case FOR_EACH:
					case BLOCK:
						bodyOutput = await generateOutput(body_node, 0, format, mapper_file, security, secretId || parentId, generateRuntimeOutput, hideRuntimeOutput);
						break;

					case RUNTIME_LOGIC:
						const preprocessedBody = await preprocessRuntimeLogic(body_node.code, mapper_file?.options?.filename, security);
						if (hideRuntimeOutput) {
							bodyOutput = "";
						} else {
							bodyOutput = mapper_file ? mapper_file.runtimeLogic(preprocessedBody, body_node.depth === 1, secretId || parentId) : "";
						}
						break;

					case STATIC_LOGIC:
						try {
							const result = await evaluator.execute(body_node.code);
							if (result && typeof result === "object" && result.__raw !== undefined) {
								if (security?.allowRaw === false) {
									bodyOutput = mapper_file ? mapper_file.text(String(result.__raw)) : String(result.__raw);
								} else {
									const rawVal = String(result.__raw);
									bodyOutput = (security?.sanitize && typeof security.sanitize === "function") ? security.sanitize(rawVal) : rawVal;
								}
							} else {
								const out = (result !== undefined && typeof result !== "object") ? String(result) : "";
								bodyOutput = mapper_file ? mapper_file.text(out, { ...target?.options, escape: parentEscape }) : out;
							}
						} catch (err) {
							transpilerError([
								`<$red:Logic Error:$> ${err.message}{line}`,
								`<$yellow:Code:$> <$blue:${body_node.code}$>{line}`
							]);
						}
						break;
				}

				if (prev_was_silent && body_node.type === TEXT) {
					bodyOutput = bodyOutput.replace(/^\n/, "");
				}

				if (bodyOutput) {
					context += bodyOutput;
					prev_was_silent = false;
				} else {
					prev_was_silent = true;
				}
			}
			await evaluator.popScope();
		}

		const finalContext = effectiveTrimAndWrap ? context.replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, "") : context;

		if (result.includes(BODY_PLACEHOLDER)) {
			if (finalContext === "") {
				result = result
					.replaceAll(`\n${BODY_PLACEHOLDER}\n`, "")
					.replaceAll(`\r\n${BODY_PLACEHOLDER}\r\n`, "")
					.replaceAll(BODY_PLACEHOLDER, "");
			} else {
				result = result.replaceAll(BODY_PLACEHOLDER, finalContext);
			}
		} else {
			if (result.toLowerCase().includes(BODY_PLACEHOLDER.toLowerCase())) {
				transpilerError([
					`{line}<$red:Placeholder Corruption Error:$> Attempted to modify the '<$yellow:content$>' placeholder under '<$cyan:resolve: false$>' mode in tag '<$blue:${node.id}$>'.{line}`,
					`This corrupts SomMark's internal compilation tokens and is not allowed.{line}`,
					`If you need to read or alter the literal inner text, please use '<$green:textContent$>' instead.{line}`
				]);
			}
			if (finalContext.trim()) {
				result += finalContext;
			}
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
	const security = (optionsOrAst && optionsOrAst.security) ? optionsOrAst.security : {};

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

	const settings = optionsOrAst?.settings || { format: targetFormat || "html" };

	// Initialize Logic Sandbox
	await evaluator.init(null, security, settings, targetMapper);
	// Inject global data
	const placeholders = optionsOrAst?.placeholders || settings?.placeholders || {};
	const variables = optionsOrAst?.variables || settings?.variables || {};
	evaluator.inject(placeholders);
	evaluator.inject(variables);

	let output = "";
	let prev_body_node = null;
	let prev_was_silent = false;
	const generateRuntimeOutput = optionsOrAst?.generateRuntimeOutput || false;
	const hideRuntimeOutput = optionsOrAst?.hideRuntimeOutput || false;
	try {
		for (let i = 0; i < body.length; i++) {
			const node = body[i];
			const blockOutput = await generateOutput(body, i, targetFormat, targetMapper, security, null, generateRuntimeOutput, hideRuntimeOutput);

			let finalBlockOutput = blockOutput;
			if (prev_was_silent && node.type === TEXT) {
				finalBlockOutput = finalBlockOutput.replace(/^\n/, "");
			}

			if (finalBlockOutput) {
				output += finalBlockOutput;
				prev_was_silent = false;
				if (node.type !== TEXT || node.text.trim().length > 0) {
					prev_body_node = node;
				}
			} else {
				prev_was_silent = true;
				if ((node.type === COMMENT || node.type === COMMENT_BLOCK) && targetMapper?.options?.removeComments) {
					// If a comment is removed, check the next node.
					// If it's just a blank line, skip it so we don't have extra gaps in the output.
					const nextNode = body[i + 1];
					if (nextNode && nextNode.type === TEXT && (nextNode.text === "\n" || nextNode.text === "\r\n")) {
						i++; // Skip the next newline node
					}
				}
			}
		}
	} finally {
		evaluator.destroy();
	}

	return output.trim();
}

/**
 * Transpiles block arguments, resolving logic or variables.
 */
async function transpileArgs(args) {
	const result = {};
	if (!args) return result;

	for (const [key, value] of Object.entries(args)) {
		if (key.toLowerCase().startsWith("data-sommark") && key.toLowerCase() !== "data-sommark-id") {
			transpilerError([
				`<$red:Reserved Attribute Error:$> The attribute name '<$yellow:${key}$>' is reserved for SomMark's internal runtime compiler logic.{line}`,
				`Please use a different attribute name.`
			]);
		}
		if (value && typeof value === "object") {
			if (value.type === RUNTIME_LOGIC) {
				// Discard runtime logic for security
				result[key] = "";
			} else if (value.type === STATIC_LOGIC) {
				try {
					result[key] = await evaluator.execute(value.code);
				} catch (err) {
					transpilerError([
						`<$red:Logic Error (Argument):$> ${err.message}{line}`,
						`<$yellow:Code:$> <$blue:${value.code}$>{line}`
					]);
				}
			} else {
				result[key] = value;
			}
		} else {
			result[key] = value;
		}
	}
	return result;
}

export default transpiler;
