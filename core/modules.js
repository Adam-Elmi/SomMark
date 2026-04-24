import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runtimeError } from "./errors.js";
import { IMPORT, USE_MODULE, TEXT, COMMENT } from "./labels.js";

/**
 * Changes a filename or file URL into a full, absolute file path.
 * 
 * @param {string} filename - The name of the file or its URL.
 * @returns {string} - The corrected absolute path.
 */
const normalizePath = (filename) => {
	if (!filename || filename === "anonymous") return process.cwd();
	if (filename.startsWith("file://")) {
		try {
			return fileURLToPath(filename);
		} catch (e) {
			return filename;
		}
	}
	return path.resolve(process.cwd(), filename);
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
	const absFilename = normalizePath(filename);
	const baseDir = filename === "anonymous" ? absFilename : path.dirname(absFilename);
	
	let hasContentStarted = false;

	const processNodes = async (nodes, currentBaseDir, isTopLevel = false) => {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];

			// 1. Handle Import Node: [import = alias: "path"]
			if (node.type === IMPORT) {
				if (hasContentStarted || !isTopLevel) {
					runtimeError([`<$red:Module Placement Error:$> Imports must be declared at the top level before any content at line <$yellow:${node.range.start.line + 1}$>`]);
				}

				const alias = Object.keys(node.args).find(k => isNaN(k));
				let filePath = alias ? node.args[alias] : node.args[0];
				
				if (typeof filePath === "string") {
					filePath = filePath.trim().replace(/^["']|["']$/g, "");
				}

				if (!filePath) {
					runtimeError([`<$red:Module Path Error:$> Missing file path for alias <$magenta:${alias}$> at line <$yellow:${node.range.start.line + 1}$>`]);
				}

				const absolutePath = path.resolve(currentBaseDir, filePath);
				
				if (!fs.existsSync(absolutePath)) {
					runtimeError([`<$red:Module Path Error:$> File not found: <$magenta:${filePath}$> at line <$yellow:${node.range.start.line + 1}$>`]);
				}

				const ext = path.extname(absolutePath).slice(1);
				if (ext !== "smark") {
					runtimeError([`<$red:Module Extension Error:$> Unsupported extension .${ext} for module <$magenta:${alias}$>. Only .smark files are supported.`]);
				}

				modules.set(alias, { path: absolutePath, type: ext, used: false, range: node.range });
				
				// Remove import node from AST
				nodes.splice(i, 1);
				i--;
			} 
			// 2. Handle Usage Node: [$use-module = alias]
			else if (node.type === USE_MODULE) {
				hasContentStarted = true;
				const alias = node.args[0] || Object.values(node.args)[0];
				if (!alias || !modules.has(alias)) {
					runtimeError([`<$red:Module Usage Error:$> Undefined module alias <$magenta:${alias}$> at line <$yellow:${node.range.start.line + 1}$>`]);
				}

				const mod = modules.get(alias);
				mod.used = true;
				
				if (mod.type === "smark") {
					const stack = context.importStack || [];
					if (stack.includes(mod.path)) {
						const chain = [...stack, mod.path].map(p => path.basename(p)).join(" -> ");
						runtimeError([
							`{line}<$red:Circular Dependency Detected$>:`,
							`<$yellow:The following import chain was found:$>`,
							`<$magenta:${chain}$>{line}`
						]);
					}

					// Recursive Parse for Smark files
					const content = fs.readFileSync(mod.path, "utf-8");
					const SomMark = context.instance.constructor;
					
					const subSmark = new SomMark({
						src: content,
						format: context.format,
						filename: mod.path,
						mapperFile: context.instance.mapperFile,
						removeComments: context.instance.removeComments,
						placeholders: context.instance.placeholders,
						importStack: [...stack, absFilename]
					});
					
					const subAst = await subSmark.parse();
					
					// Wrap the imported code in a virtual block to keep its identity.
					const wrapperNode = {
						type: "Block",
						id: context.instance.moduleIdentityToken,
						args: { filename: mod.path },
						body: subAst,
						depth: node.depth,
						range: node.range
					};

					// Splice the wrapper into the current body
					nodes.splice(i, 1, wrapperNode);
					i += 0; // The wrapper is a single node now
				} else {
					runtimeError([`<$red:Module Extension Error:$> Unsupported extension .${mod.type} for module <$magenta:${alias}$>. Only .smark files are supported.`]);
				}
			} 
			// 3. Recurse into children
			else {
				if (node.type === TEXT && node.text.trim() === "") {
					// Ignore structural whitespace between imports
				} else if (node.type !== COMMENT) {
					// Any meaningful node that isn't an IMPORT or COMMENT is considered "Content"
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
