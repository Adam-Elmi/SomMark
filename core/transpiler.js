import { BLOCK, TEXT, COMMENT, COMMENT_BLOCK, STATIC_LOGIC, RUNTIME_LOGIC, FOR_EACH } from "./labels.js";
import { transpilerError } from "./errors.js";
import evaluator, { withEvaluator } from "./evaluator.js";
import { matchedValue } from "../helpers/utils.js";
import { dedentBy } from "../helpers/dedent.js";
import { preprocessRuntimeLogic } from "./helpers/preprocessor.js";
import { wrapRuntimeLogic } from "./helpers/runtimeOutput.js";
import path from "pathe";

function warnDroppedVariables(variables) {
	for (const [key, value] of Object.entries(variables)) {
		if (value === undefined) {
			console.warn(`[SomMark] variables.${key} is undefined and will be ignored.`);
		} else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
			for (const [nestedKey, nestedVal] of Object.entries(value)) {
				if (typeof nestedVal === "function") {
					console.warn(`[SomMark] variables.${key}.${nestedKey} is a function nested inside an object and will be ignored. Move it to the top level: variables.${nestedKey}`);
				} else if (nestedVal === undefined) {
					console.warn(`[SomMark] variables.${key}.${nestedKey} is undefined and will be ignored.`);
				}
			}
		}
	}
}

const randomBytesHex = (size) => {
	const arr = new Uint8Array(size);
	globalThis.crypto.getRandomValues(arr);
	return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
};

const BODY_PLACEHOLDER = `SOMMARKBODYPLACEHOLDER${randomBytesHex(8)}SOMMARK`;


/** 
 * Extracts all plain text from a node and its children.
 * 
 * @param {Object} node - The node to read.
 * @returns {string} - The extracted text.
 */
function getNodeText(node) {
	if (!node?.body) return "";
	let text = "";
	if (node.body) {
		for (const child of node.body) {
			if (child.type === TEXT) text += child.text || "";
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
async function generateOutput(ast, i, format, mapper_file, security = {}, parentId = null, generateRuntimeOutput = false, hideRuntimeOutput = false, instance = null, idState = null, extraCtx = {}) {
	const node = Array.isArray(ast) ? ast[i] : ast;
	if (!node) return "";

	let result = "";
	let context = "";
	let isParentBlock = false;

	if (node.id === mapper_file?.options?.moduleIdentityToken) {
		const oldFilename = mapper_file.options.filename;
		mapper_file.options.filename = node.props?.filename || oldFilename;
		let bodyOutput = "";
		if (node.body) {
			evaluator.pushScope();
			for (let j = 0; j < node.body.length; j++) {
				bodyOutput += await generateOutput(node.body, j, format, mapper_file, security, parentId, generateRuntimeOutput, hideRuntimeOutput, instance, idState);
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
		const preprocessed = await preprocessRuntimeLogic(node.code, mapper_file?.options?.filename, security, instance);
		if (hideRuntimeOutput) return "";
		if (generateRuntimeOutput) return wrapRuntimeLogic(preprocessed, format, parentId, node.depth === 1);
		return mapper_file ? mapper_file.runtimeLogic(preprocessed, node.depth === 1, parentId) : "";
	}

	if (node.type === STATIC_LOGIC) {
		try {
			const result = await evaluator.execute(node.code, node.baseDir || null);
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
		const transpiledArgs = await transpileArgs(node.props);

		if (!node.props || (node.props[0] === undefined && node.props["items"] === undefined)) {
			const line = node.range?.start?.line + 1 || 1;
			transpilerError([
				`<$red:Missing Prop Error in [for-each]:$>{line}`,
				`[for-each] requires an array as its first prop, e.g. [for-each = \${ array }\$]{line}`,
				`at line <$yellow:${line}$>{line}`
			]);
			return "";
		}

		const items = mapper_file ? mapper_file.safeArg({ props: transpiledArgs, index: 0, key: "items", fallBack: [] }) : [];

		if (!Array.isArray(items)) {
			const line = node.range?.start?.line + 1 || 1;
			transpilerError([
				`<$red:Type Error in [for-each]:$>{line}`,
				`Expected an <$green:Array$> for 'items', but received <$yellow:${typeof items}$>:<$cyan: ${JSON.stringify(items)}$>{line}`,
				`at line <$yellow:${line}$>{line}`
			]);
			return "";
		}

		const asVar = transpiledArgs.as || "value";
		if (asVar === "i" || asVar === "length") {
			const line = node.range?.start?.line + 1 || 1;
			transpilerError([
				`<$red:Reserved Variable Error in [for-each]:$>{line}`,
				`'${asVar}' is a reserved variable name.{N}Use a different name for the 'as' prop, e.g. as: "item"{line}`,
				`at line <$yellow:${line}$>{line}`
			]);
			return "";
		}

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

		const rawJoin = transpiledArgs.join ?? null;
		const join = rawJoin !== null ? rawJoin.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r") : null;
		const parts = [];
		let idx = 0;
		const length = items.length;
		for (const item of items) {
			evaluator.pushScope();
			evaluator.inject({
				[asVar]: item,
				i: idx++,
				length
			});

			let iterOutput = "";
			for (let j = 0; j < cleanedBody.length; j++) {
				iterOutput += await generateOutput(cleanedBody, j, format, mapper_file, security, parentId, generateRuntimeOutput, hideRuntimeOutput, instance, idState, extraCtx);
			}

			await evaluator.popScope();
			parts.push(iterOutput);
		}
		return join !== null ? parts.join(join) : parts.join("");
	}

	let secretId = null;
	if (node.type === BLOCK) {
		if (node.props) {
			for (const key of Object.keys(node.props)) {
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
			if (idState?.mode === 'replay') {
				secretId = idState.ids[idState.idx++] ?? `sommark-${node.id.toLowerCase()}-${randomBytesHex(4)}`;
			} else {
				secretId = `sommark-${node.id.toLowerCase()}-${randomBytesHex(4)}`;
				if (idState?.mode === 'record') idState.ids.push(secretId);
			}
		}
	}

	// smark-raw block — body collected verbatim by lexer, bypasses normal body processing pipeline
	if (node.type === BLOCK && (node.directives?.raw === "true" || node.directives?.raw === true)) {
		if (generateRuntimeOutput) return "";
		const rawContent = node.body?.map(n => String(n.text || "")).join("") || "";
		const transpiledArgs = await transpileArgs(node.props);
		if (evaluator.active?.hasDynamicTag?.(node.id)) {
			return await evaluator.active.executeDynamicTag(node.id, { props: transpiledArgs, directives: node.directives, content: rawContent, textContent: rawContent });
		}
		let rawTarget = mapper_file ? matchedValue(mapper_file.outputs, node.id) : null;
		if (!rawTarget && mapper_file) rawTarget = mapper_file.getUnknownTag(node);
		if (rawTarget) {
			const isManualMode = !!rawTarget.options?.handleAst;
			return await rawTarget.render.call(mapper_file, {
				props: transpiledArgs,
				directives: node.directives,
				content: rawContent,
				textContent: rawContent,
				ast: isManualMode ? node : undefined,
				isSelfClosing: node.isSelfClosing || false
			});
		}
		return rawContent;
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

		let content = (node.body?.length === 0) ? "" : BODY_PLACEHOLDER;

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
				resolvedBody += await generateOutput(node.body, j, format, mapper_file, security, parentId, generateRuntimeOutput, hideRuntimeOutput, instance, idState);
			}
			await evaluator.popScope();
			content = dedentBy(resolvedBody, node.range?.start?.character || 0);
		}

		if (generateRuntimeOutput) {
			let childrenOutput = "";
			if (node.body) {
				for (let j = 0; j < node.body.length; j++) {
					childrenOutput += await generateOutput(node.body, j, format, mapper_file, security, secretId || parentId, generateRuntimeOutput, hideRuntimeOutput, instance, idState);
				}
			}
			return childrenOutput;
		}

		const isManualMode = target.options?.handleAst === true;

		if (isManualMode) {
			const cleanBody = [];
			let richText = "";

			evaluator.pushScope();
			try {
				for (const child of (node.body || [])) {
					if (child.type === BLOCK || child.type === TEXT || child.type === FOR_EACH) {
						cleanBody.push(child);
						if (child.type === TEXT) {
							richText += mapper_file ? mapper_file.text(String(child.text || ""), target.options) : String(child.text || "");
						}
					} else if (child.type === STATIC_LOGIC) {
						try {
							const val = await evaluator.execute(child.code, child.baseDir || null);
							if (val !== undefined && typeof val !== "object") richText += String(val);
						} catch (err) {
							transpilerError([
								`<$red:Logic Error:$> ${err.message}{line}`,
								`<$yellow:Code:$> <$blue:${child.code}$>{line}`
							]);
						}
					} else if (child.type === COMMENT) {
						if (!mapper_file?.options?.removeComments) richText += mapper_file?.comment(child.text) || "";
					} else if (child.type === COMMENT_BLOCK) {
						if (!mapper_file?.options?.removeComments) richText += mapper_file?.commentBlock(child.text) || "";
					} else if (child.type === RUNTIME_LOGIC) {
						if (!hideRuntimeOutput) {
							const preprocessed = await preprocessRuntimeLogic(child.code, mapper_file?.options?.filename, security, instance);
							richText += mapper_file ? mapper_file.runtimeLogic(preprocessed, child.depth === 1, secretId || parentId) : "";
						}
					}
					// FOR_EACH → silently ignored
				}

				const cleanAst = { ...node, body: cleanBody };
				const transpiledArgs = await transpileArgs(node.props);
				if (secretId) transpiledArgs["data-sommark-id"] = secretId;

				const renderChild = async (childNode, extra = {}) => {
					return await generateOutput(childNode, 0, format, mapper_file, security, secretId || parentId, generateRuntimeOutput, hideRuntimeOutput, instance, idState, extra);
				};

				return await target.render.call(mapper_file, {
					props: transpiledArgs,
					directives: node.directives,
					content: "",
					textContent: richText || textContent,
					ast: cleanAst,
					isSelfClosing: node.isSelfClosing || false,
					...extraCtx,
					renderChild
				}) ?? "";
			} finally {
				await evaluator.popScope();
			}
		}

		const transpiledArgs = await transpileArgs(node.props);
		if (secretId) {
			transpiledArgs["data-sommark-id"] = secretId;
		}
		result += await target.render.call(mapper_file, {
			props: transpiledArgs,
			directives: node.directives,
			content,
			textContent,
			ast: new Proxy({}, {
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
			isSelfClosing: node.isSelfClosing || false,
			...extraCtx
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
						// Only dedent multi-line text — inline spaces (no newlines) are separators, not indentation
						const localDedentedText = text.includes("\n") ? dedentBy(text, node.range?.start?.character || 0) : text;
						let bodyTextVal = mapper_file ? mapper_file.text(localDedentedText, { ...target?.options, escape: parentEscape }) : localDedentedText;
						if (parentEscape === false && security?.sanitize && typeof security.sanitize === "function") {
							bodyTextVal = security.sanitize(bodyTextVal);
						}
						bodyOutput = bodyTextVal;
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
						bodyOutput = await generateOutput(body_node, 0, format, mapper_file, security, secretId || parentId, generateRuntimeOutput, hideRuntimeOutput, instance, idState);
						break;

					case RUNTIME_LOGIC:
						const preprocessedBody = await preprocessRuntimeLogic(body_node.code, mapper_file?.options?.filename, security, instance);
						if (hideRuntimeOutput) {
							bodyOutput = "";
						} else {
							bodyOutput = mapper_file ? mapper_file.runtimeLogic(preprocessedBody, body_node.depth === 1, secretId || parentId) : "";
						}
						break;

					case STATIC_LOGIC:
						try {
							const result = await evaluator.execute(body_node.code, body_node.baseDir || null);
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
	const instance = optionsOrAst?.instance;
	if (instance) {
		settings.instance = instance;
		settings.fs = instance.fs;
	}

	const fileBaseDir = (() => {
		const filename = instance?.filename;
		const cwd = instance?.cwd || "/";
		if (!filename || filename === "anonymous") return cwd;
		const abs = /^(\/|[a-zA-Z]:\\|https?:\/\/)/.test(filename) ? filename : path.resolve(cwd, filename);
		return path.dirname(abs);
	})();

	const dualOutput = optionsOrAst?.dualOutput || false;
	const placeholders = optionsOrAst?.placeholders || settings?.placeholders || {};
	const variables = optionsOrAst?.variables || settings?.variables || {};
	warnDroppedVariables(variables);

	return withEvaluator(async () => {
		// Initialize Logic Sandbox inside isolated async context
		await evaluator.init(fileBaseDir, security, settings, targetMapper);
		evaluator.inject(placeholders);
		evaluator.inject(variables);

		let output = "";
		let prev_body_node = null;
		let prev_was_silent = false;

		if (dualOutput) {
			const idState = { mode: 'record', ids: [], idx: 0 };

			// HTML pass — generate HTML, record element IDs for runtime blocks
			let htmlOutput = "";
			try {
				for (let i = 0; i < body.length; i++) {
					const node = body[i];
					const blockOutput = await generateOutput(body, i, targetFormat, targetMapper, security, null, false, true, instance, idState);
					let finalBlockOutput = blockOutput;
					if (prev_was_silent && node.type === TEXT) finalBlockOutput = finalBlockOutput.replace(/^\n/, "");
					if (finalBlockOutput) {
						htmlOutput += finalBlockOutput;
						prev_was_silent = false;
					} else {
						prev_was_silent = true;
						if ((node.type === COMMENT || node.type === COMMENT_BLOCK) && targetMapper?.options?.removeComments) {
							const nextNode = body[i + 1];
							if (nextNode && nextNode.type === TEXT && (nextNode.text === "\n" || nextNode.text === "\r\n")) i++;
						}
					}
				}
			} finally {
				evaluator.destroy();
			}

			// JS pass — replay the same IDs so querySelector targets match HTML
			idState.mode = 'replay';
			idState.idx = 0;
			prev_was_silent = false;

			await evaluator.init(fileBaseDir, security, settings, targetMapper);
			evaluator.inject(placeholders);
			evaluator.inject(variables);

			let jsOutput = "";
			try {
				for (let i = 0; i < body.length; i++) {
					const node = body[i];
					const blockOutput = await generateOutput(body, i, targetFormat, targetMapper, security, null, true, false, instance, idState);
					let finalBlockOutput = blockOutput;
					if (prev_was_silent && node.type === TEXT) finalBlockOutput = finalBlockOutput.replace(/^\n/, "");
					if (finalBlockOutput) {
						jsOutput += finalBlockOutput;
						prev_was_silent = false;
					} else {
						prev_was_silent = true;
					}
				}
			} finally {
				evaluator.destroy();
			}

			return [htmlOutput.trim(), jsOutput.trim()];
		}

		try {
			for (let i = 0; i < body.length; i++) {
				const node = body[i];
				const blockOutput = await generateOutput(body, i, targetFormat, targetMapper, security, null, false, false, instance);

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
						const nextNode = body[i + 1];
						if (nextNode && nextNode.type === TEXT && (nextNode.text === "\n" || nextNode.text === "\r\n")) {
							i++;
						}
					}
				}
			}
		} finally {
			evaluator.destroy();
		}

		return output.trim();
	});
}

/**
 * Transpiles block arguments, resolving logic or variables.
 */
async function transpileArgs(props) {
	const result = {};
	if (!props) return result;

	for (const [key, value] of Object.entries(props)) {
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
					result[key] = await evaluator.execute(value.code, value.baseDir || null);
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
