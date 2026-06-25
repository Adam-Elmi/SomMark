import path from "pathe";
import { fileURLToPath } from "./helpers/url.js";
import { runtimeError } from "./errors.js";
import { IMPORT, USE_MODULE, TEXT, BLOCK, COMMENT, SLOT, STATIC_LOGIC, RUNTIME_LOGIC } from "./labels.js";

/**
 * Resolves a module path relative to a base directory.
 */
const resolveModulePath = (filePath, currentBaseDir) => {
	if (/^https?:\/\//.test(currentBaseDir)) {
		return new URL(filePath, currentBaseDir.endsWith("/") ? currentBaseDir : currentBaseDir + "/").href;
	}
	return path.resolve(currentBaseDir, filePath);
};

/**
 * Changes a filename or file URL into a full, absolute file path.
 * 
 * @param {string} filename - The name of the file or its URL.
 * @param {Object} [aliases={}] - Custom path aliases for modules.
 * @returns {string} - The corrected absolute path.
 */
const normalizePath = (filename, aliases = {}, cwd = "/") => {
	if (!filename || filename === "anonymous") return cwd;

	// Handle Aliases (like @/components)
	for (const [prefix, replacement] of Object.entries(aliases)) {
		if (filename.startsWith(prefix)) {
			const resolvedPath = path.resolve(cwd, filename.replace(prefix, replacement));
			return resolvedPath;
		}
	}

	if (filename.startsWith("file://")) {
		try {
			return fileURLToPath(filename);
		} catch (e) {
			return filename;
		}
	}

	return path.resolve(cwd, filename);
};

const VAR_PATTERN = /SOMMARK_UNRESOLVED_v_(.+?)_SOMMARK/g;
const VAR_PREFIX = "SOMMARK_UNRESOLVED_v_";
const VAR_SUFFIX = "_SOMMARK";

const resolveAstVariables = (nodes, variables) => {
	if (!nodes) return;

	for (const node of nodes) {
		if (node.type === TEXT) {
			if (node.text.includes(VAR_PREFIX)) {
				node.text = node.text.replace(VAR_PATTERN, (match, keyAndFallback) => {
					const pipeIdx = keyAndFallback.indexOf('|');
					const key = pipeIdx >= 0 ? keyAndFallback.slice(0, pipeIdx) : keyAndFallback;
					const fallback = pipeIdx >= 0 ? keyAndFallback.slice(pipeIdx + 1) : undefined;
					if (variables[key] !== undefined) {
						if (!variables.__consumed__) {
							Object.defineProperty(variables, "__consumed__", {
								value: new Set(),
								writable: true,
								enumerable: false,
								configurable: true
							});
						}
						variables.__consumed__.add(key);
						return String(variables[key]);
					}
					if (fallback !== undefined) return fallback;
					return match;
				});
			}
		} else if (node.type === BLOCK) {
			// Resolve any unresolved variables in block arguments
			for (const [argKey, argVal] of Object.entries(node.props)) {
				if (typeof argVal !== "string" || !argVal.includes(VAR_PREFIX)) continue;

				if (argVal.startsWith(VAR_PREFIX) && argVal.endsWith(VAR_SUFFIX)) {
					// Entire value is an envelope — resolve to scalar or fallback
					const keyAndFallback = argVal.slice(VAR_PREFIX.length, -VAR_SUFFIX.length);
					const pipeIdx = keyAndFallback.indexOf('|');
					const varKey = pipeIdx >= 0 ? keyAndFallback.slice(0, pipeIdx) : keyAndFallback;
					const fallback = pipeIdx >= 0 ? keyAndFallback.slice(pipeIdx + 1) : undefined;
					if (variables[varKey] !== undefined) {
						node.props[argKey] = variables[varKey];
						if (!variables.__consumed__) {
							Object.defineProperty(variables, "__consumed__", {
								value: new Set(),
								writable: true,
								enumerable: false,
								configurable: true
							});
						}
						variables.__consumed__.add(varKey);
					} else if (fallback !== undefined) {
						node.props[argKey] = fallback;
					}
				} else {
					// Envelope embedded inside a larger string — replace in-place.
					// Unresolved envelopes become "" so they don't pollute class names etc.
					node.props[argKey] = argVal.replace(VAR_PATTERN, (match, keyAndFallback) => {
						const pipeIdx = keyAndFallback.indexOf('|');
						const key = pipeIdx >= 0 ? keyAndFallback.slice(0, pipeIdx) : keyAndFallback;
						const fallback = pipeIdx >= 0 ? keyAndFallback.slice(pipeIdx + 1) : undefined;
						if (variables[key] !== undefined) {
							if (!variables.__consumed__) {
								Object.defineProperty(variables, "__consumed__", {
									value: new Set(),
									writable: true,
									enumerable: false,
									configurable: true
								});
							}
							variables.__consumed__.add(key);
							return String(variables[key]);
						}
						if (fallback !== undefined) return fallback;
						return "";
					});
				}
			}
			if (node.body) {
				resolveAstVariables(node.body, variables);
			}
		}
	}
};

/**
 * Hand-optimized AST cloner.
 * Native structuredClone is extremely slow for basic JSON-like tree data.
 * This helper achieves up to 11x faster performance by cloning only required AST fields.
 */
const cloneAst = (nodes) => {
	if (!nodes) return [];
	const len = nodes.length;
	const copy = new Array(len);
	for (let i = 0; i < len; i++) {
		const node = nodes[i];
		const nodeCopy = {
			type: node.type,
			range: node.range
		};
		if (node.structure !== undefined) nodeCopy.structure = node.structure;
		if (node.text !== undefined) nodeCopy.text = node.text;
		if (node.id !== undefined) nodeCopy.id = node.id;
		if (node.code !== undefined) nodeCopy.code = node.code;
		if (node.isSelfClosing !== undefined) nodeCopy.isSelfClosing = node.isSelfClosing;
		if (node.baseDir !== undefined) nodeCopy.baseDir = node.baseDir;
		if (node.props !== undefined) {
			nodeCopy.props = { ...node.props };
		}
		if (node.body !== undefined) {
			nodeCopy.body = cloneAst(node.body);
		}
		copy[i] = nodeCopy;
	}
	return copy;
};

/**
 * Tags all STATIC_LOGIC and RUNTIME_LOGIC nodes in a subtree with their
 * source module's baseDir so the evaluator can resolve imports correctly.
 */
const tagLogicNodes = (nodes, baseDir) => {
	if (!nodes) return;
	for (const node of nodes) {
		if ((node.type === STATIC_LOGIC || node.type === RUNTIME_LOGIC) && !node.baseDir) {
			node.baseDir = baseDir;
		}
		if (node.body) tagLogicNodes(node.body, baseDir);
	}
};

/**
 * Handles all [import] and [$use-module] blocks in your code.
 * It loads the requested files, checks for errors, and puts the content into the main document.
 * 
 * @param {Object[]} ast - The list of code parts to check.
 * @param {Object} context - Settings like the filename and current format.
 * @returns {Promise<Object[]>} - The final list of code parts with modules loaded.
 */
export async function resolveModules(ast, context) {
	const modules = new Map();
	const filename = context.filename || "anonymous";
	const importAliases = context.instance.importAliases || {};
	const absFilename = normalizePath(filename, importAliases, context.instance.cwd || "/");

	// baseDir can be a local path
	const baseDir = context.instance.baseDir || ((filename === "anonymous") ? absFilename : path.dirname(absFilename));

	// 1. Helper: Trim AST to remove file-boundary whitespace and "ghost" newlines
	const trimAst = (nodes) => {
		if (!nodes) return [];

		// 1. Filter out internal whitespace-only nodes that are adjacent to non-rendering nodes
		// (Comments, Imports, etc. shouldn't leave "ghost" newlines)
		const nonRenderingTypes = [COMMENT, IMPORT, USE_MODULE];
		let res = nodes.filter((node, idx) => {
			if (node.type !== TEXT || node.text.trim() !== "") return true;

			const prev = nodes[idx - 1];
			const next = nodes[idx + 1];
			const isAdjacentToNonRendering =
				(prev && nonRenderingTypes.includes(prev.type)) ||
				(next && nonRenderingTypes.includes(next.type));

			return !isAdjacentToNonRendering;
		});

		// 2. Final pass: trim leading/trailing newlines from the remaining boundary text nodes
		if (res.length > 0 && res[0].type === TEXT) {
			res[0].text = res[0].text.replace(/^[\r\n]+/, "");
		}
		if (res.length > 0 && res[res.length - 1].type === TEXT) {
			res[res.length - 1].text = res[res.length - 1].text.replace(/[\r\n]+\s*$/, "");
		}

		// 3. Remove any nodes that became purely empty after trimming
		return res.filter(node => node.type !== TEXT || node.text !== "");
	};

	// 2. Helper: Inject Slots with Indentation Propagation
	const injectSlots = (nodes, callerBody) => {
		const result = [];
		for (let i = 0; i < nodes.length; i++) {
			const child = nodes[i];
			if (child.type === SLOT) {
				if (callerBody && callerBody.length > 0) {
					// Detect leading indentation from the preceding text node
					let indentation = "";
					const prev = result[result.length - 1];
					if (prev && prev.type === TEXT) {
						const lines = prev.text.split("\n");
						const lastLine = lines[lines.length - 1];
						if (lastLine.trim() === "" && lastLine.length > 0) {
							indentation = lastLine;
						}
					}

					// Clone and Indent caller body if needed
					const indentedBody = callerBody.map(node => {
						if (node.type === TEXT && indentation) {
							return { ...node, text: node.text.split("\n").map((line, idx) => idx === 0 ? line : indentation + line).join("\n") };
						}
						return { ...node };
					});

					result.push(...indentedBody);
				} else {
					result.push(...child.body);
				}
			} else {
				if (child.body && Array.isArray(child.body)) {
					child.body = injectSlots(child.body, callerBody);
				}
				result.push(child);
			}
		}
		return result;
	};

	let hasContentStarted = false;

	const processNodes = async (nodes, currentBaseDir, isTopLevel = false) => {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];

			// 1. Handle Import Node: [import = alias: "path"]
			if (node.type === IMPORT) {
				if (hasContentStarted || !isTopLevel) {
					runtimeError([`<$red:Module Placement Error:$> Imports must be declared at the top level before any content at line <$yellow:${node.range.start.line + 1}$>`]);
				}

				const alias = Object.keys(node.props).find(k => isNaN(k));
				let filePath = alias ? node.props[alias] : node.props[0];
				if (typeof filePath === "string") filePath = filePath.trim().replace(/^["']|["']$/g, "");

				// 1a. Handle Aliases
				let resolvedPath = filePath;
				for (const [prefix, replacement] of Object.entries(importAliases)) {
					if (filePath.startsWith(prefix)) {
						resolvedPath = path.resolve(context.instance.cwd || "/", filePath.replace(prefix, replacement));
						break;
					}
				}

				// 1b. Resolve relative to current base (FS)
				const absolutePath = resolveModulePath(resolvedPath, currentBaseDir);

				// Local Path Resolution with Auto-Extension
				let localPath = absolutePath;
				if (!await context.instance.fs.exists(localPath) && !localPath.endsWith(".smark")) {
					const withSmark = localPath + ".smark";
					if (await context.instance.fs.exists(withSmark)) localPath = withSmark;
				}
				if (!await context.instance.fs.exists(localPath)) {
					runtimeError([`<$red:Module Path Error:$> File not found: <$magenta:${filePath}$> at line <$yellow:${node.range.start.line + 1}$>`]);
				}
				let mod = { path: absolutePath, localPath: localPath, type: "smark" };

				const ext = path.extname(mod.localPath).slice(1);
				if (ext !== "smark") {
					runtimeError([`<$red:Module Extension Error:$> Unsupported extension .${ext} for module <$magenta:${alias}$>. Only .smark files are supported.`]);
				}

				modules.set(alias, { ...mod, used: false, range: node.range });
				nodes.splice(i, 1);
				const next = nodes[i];
				if (next && next.type === TEXT && next.text.startsWith("\n")) {
					next.text = next.text.slice(1);
					if (next.text === "") nodes.splice(i, 1);
				}
				i--;
			}
			// 2. Handle Usage Node: [$use-module = alias]
			else if (node.type === USE_MODULE) {
				hasContentStarted = true;
				const alias = node.props[0] || Object.values(node.props)[0];
				if (!alias || !modules.has(alias)) {
					runtimeError([`<$red:Module Usage Error:$> Undefined module alias <$magenta:${alias}$> at line <$yellow:${node.range.start.line + 1}$>`]);
				}

				const mod = modules.get(alias);
				mod.used = true;

				const stack = context.importStack || [];
				const maxDepth = context.instance.security?.maxDepth ?? 5;
				if (stack.length >= maxDepth) {
					runtimeError([`<$red:Security Error:$> Recursion Guard: Maximum Smark compilation depth exceeded (limit is ${maxDepth}).`]);
				}
				if (stack.includes(mod.path)) {
					runtimeError([`<$red:Circular Dependency Detected$>: ${mod.path}`]);
				}

				const cached = context.instance.moduleCache.get(mod.localPath);
				let expandedNodes;
				if (cached) {
					expandedNodes = trimAst(cloneAst(cached));
				} else {
					const content = await context.instance.fs.readFile(mod.localPath, "utf-8");
					const SomMark = context.instance.constructor;
					const subSmark = new SomMark({
						src: content,
						format: context.format,
						filename: mod.path,
						baseDir: path.dirname(mod.localPath),
						fs: context.instance.fs,
						mapperFile: context.instance.mapperFile,
						placeholders: context.instance.placeholders,
						variables: {},
						importAliases: context.instance.importAliases,
						customProps: context.instance.customProps,
						fallbackTarget: context.instance.fallbackTarget,
						removeComments: context.instance.removeComments,
						security: context.instance.security,
						showSpinner: context.instance.showSpinner,
						importStack: [...stack, absFilename],
						moduleIdentityToken: context.instance.moduleIdentityToken,
						moduleCache: context.instance.moduleCache
					});

					const subAst = await subSmark.parse();
					tagLogicNodes(subAst, path.dirname(mod.localPath));
					context.instance.moduleCache.set(mod.localPath, subAst);
					expandedNodes = trimAst(subAst);
				}

				const boundaryNode = {
					type: BLOCK,
					id: context.instance.moduleIdentityToken,
					props: { filename: mod.path },
					body: expandedNodes
				};
				nodes.splice(i, 1, boundaryNode);
				const next = nodes[i + 1];
				if (next && next.type === TEXT && next.text.startsWith("\n")) {
					next.text = next.text.slice(1);
					if (next.text === "") nodes.splice(i + 1, 1);
				}
			}
			// 3. Handle Component Usage: [Alias] ... [end]
			else if (node.type === BLOCK && modules.has(node.id)) {
				hasContentStarted = true;
				const mod = modules.get(node.id);
				mod.used = true;
				const stack = context.importStack || [];
				const maxDepth = context.instance.security?.maxDepth ?? 5;
				if (stack.length >= maxDepth) {
					runtimeError([`<$red:Security Error:$> Recursion Guard: Maximum Smark compilation depth exceeded (limit is ${maxDepth}).`]);
				}
				if (stack.includes(mod.path)) {
					runtimeError([`<$red:Circular Dependency Detected$>: ${mod.path}`]);
				}

				const cached = context.instance.moduleCache.get(mod.localPath);
				let subAst;
				if (cached) {
					subAst = cloneAst(cached);
				} else {
					const content = await context.instance.fs.readFile(mod.localPath, "utf-8");
					const SomMark = context.instance.constructor;
					const subSmark = new SomMark({
						src: content,
						format: context.format,
						filename: mod.path,
						baseDir: path.dirname(mod.localPath),
						fs: context.instance.fs,
						mapperFile: context.instance.mapperFile,
						placeholders: context.instance.placeholders,
						variables: {}, // Parse without variables to keep the cached AST pure
						importAliases: context.instance.importAliases,
						customProps: context.instance.customProps,
						fallbackTarget: context.instance.fallbackTarget,
						removeComments: context.instance.removeComments,
						security: context.instance.security,
						showSpinner: context.instance.showSpinner,
						importStack: [...stack, absFilename],
						moduleIdentityToken: context.instance.moduleIdentityToken,
						moduleCache: context.instance.moduleCache
					});

					subAst = await subSmark.parse();
					tagLogicNodes(subAst, path.dirname(mod.localPath));
					context.instance.moduleCache.set(mod.localPath, subAst);
					subAst = cloneAst(subAst);
				}

				// Dynamically resolve variable placeholders inside the cloned AST
				resolveAstVariables(subAst, node.props);

				await processNodes(node.body, currentBaseDir, false);
				const expandedNodes = injectSlots(trimAst(subAst), trimAst(node.body));
				const rootTag = expandedNodes.find(n => n.type === BLOCK);
				if (rootTag) {
					const consumed = node.props.__consumed__ || new Set();

					const publicArgs = Object.fromEntries(
						Object.entries(node.props).filter(([key]) => {
							if (key === "__consumed__") return false;
							if (consumed.has(key)) return false; // THE FIX: Filter if hit by v{}
							return true;
						})
					);
					rootTag.props = { ...rootTag.props, ...publicArgs };
				}

				const boundaryNode = {
					type: BLOCK,
					id: context.instance.moduleIdentityToken,
					props: { filename: mod.path },
					body: expandedNodes
				};
				nodes.splice(i, 1, boundaryNode);
			}
			// 4. Handle Regular Blocks: Process body recursively for nested components and trim whitespace
			else if (node.type === BLOCK) {
				hasContentStarted = true;
				if (node.body && Array.isArray(node.body)) {
					node.body = trimAst(node.body);
					await processNodes(node.body, currentBaseDir, false);
				}
			}

			// 4. Recurse into children (Standard Blocks)
			else {
				if (node.type === TEXT && node.text.trim() === "") {
					// Structural whitespace
				} else if (node.type !== COMMENT) {
					hasContentStarted = true;
				}

				if (node.body && Array.isArray(node.body)) {
					await processNodes(node.body, currentBaseDir, false);
				}
			}
		}
	};

	await processNodes(ast, baseDir, true);

	// 4. Report Unused Imports
	for (const [alias, mod] of modules) {
		if (!mod.used) {
			context.instance.warnings.push({
				type: "UnusedModule",
				message: `Module alias <$magenta:${alias}$> is imported but never used.`,
				range: mod.range
			});
		}
	}

	return ast;
}

/**
 * After full transpilation of the top-level file, apply any v{} fallbacks that
 * remain unresolved. Envelopes with no fallback are kept as-is (debugging signal).
 * Must NOT be called on sub-module ASTs — only on the final top-level AST.
 */
export const applyVariableFallbacks = (ast) => resolveAstVariables(ast, {});
