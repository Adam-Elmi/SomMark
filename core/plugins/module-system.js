import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runtimeError } from "../errors.js";

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
 * Module System Plugin
 * Allows you to import and use content from other SomMark, CSS, or JS files.
 */
const ModuleSystem = {
	name: "module-system",
	type: ["preprocessor", "on-ast"],
	author: "Adam-Elmi",
	description: "Allows you to import and use content from other SomMark, CSS, or JS files.",
	scope: "top-level",
	// ========================================================================== //
	//  1. Preprocessing phase (before lexing)                                   //
	// ========================================================================== //
	beforeLex(src) {
		const importRegex = /\[import\s*=\s*([^:]+)\s*:\s*(?:"([^"]+)"|'([^']+)')\s*\]\[end\]/g;
		const usageRegex = /\[\$use-module\s*=\s*([^\]]+)\]\[end\]/g;
		const filename = this.context?.filename || "anonymous";
		const absFilename = normalizePath(filename);
		const baseDir = filename === "anonymous" ? absFilename : path.dirname(absFilename);

		const localModules = new Map();

		// ========================================================================== //
		//  1. Collect all module imports                                           //
		// ========================================================================== //
		let match;
		while ((match = importRegex.exec(src)) !== null) {
			const alias = match[1].trim();
			const pathValue = (match[2] || match[3]).trim();
			const ext = path.extname(pathValue).slice(1);
			localModules.set(alias, { path: pathValue, ext });
		}

		// ========================================================================== //
		//  2. Substitute usages for non-smark files                                //
		// ========================================================================== //
		let processed = src.replace(usageRegex, (match, alias) => {
			alias = alias.trim();
			if (localModules.has(alias)) {
				const mod = localModules.get(alias);
				if (mod.ext !== "smark") {
					const absPath = path.resolve(baseDir, mod.path);
					if (fs.existsSync(absPath)) {
						return fs.readFileSync(absPath, "utf-8");
					}
				}
			}
			return match;
		});

		// ========================================================================== //
		//  3. Remove non-smark import declarations                                 //
		// ========================================================================== //
		processed = processed.replace(importRegex, (match, alias, p1, p2) => {
			const pathValue = p1 || p2;
			const ext = path.extname(pathValue).slice(1);
			if (ext !== "smark") return ""; 
			return match; 
		});

		return processed;
	},
	// ========================================================================== //
	//  2. AST Transformation phase                                              //
	// ========================================================================== //
	async onAst(ast, context) {
		const modules = new Map();
		const options = this.options || {};
		const supportedExtensions = options.supportedExtensions || ["smark", "css", "js"];
		const filename = context.filename || "anonymous";
		const absFilename = normalizePath(filename);
		const baseDir = filename === "anonymous" ? absFilename : path.dirname(absFilename);

		// ========================================================================== //
		//  Helper to recursively process nodes                                       //
		// ========================================================================== //
		const processNodes = async (nodes, baseDir) => {
			for (let i = 0; i < nodes.length; i++) {
				const node = nodes[i];

				if (node.type === "Import") {
					// ========================================================================== //
					//  Handle Import Node: [import = alias: "path"]                         //
					// ========================================================================== //
					const alias = Object.keys(node.args).find(k => isNaN(k));
					let filePath = alias ? node.args[alias] : node.args[0];
					if (typeof filePath === "string") {
						filePath = filePath.trim().replace(/^["']|["']$/g, "");
					}

					const absolutePath = path.resolve(baseDir, filePath);
					
					if (!fs.existsSync(absolutePath)) {
						runtimeError([`<$red:Module Path Error:$> File not found: <$magenta:${filePath}$> at line <$yellow:${node.range.start.line + 1}$>`]);
					}

					// ========================================================================== //
					//  Validate Extension                                                        //
					// ========================================================================== //
					const ext = path.extname(absolutePath).slice(1);
					if (!supportedExtensions.includes(ext)) {
						runtimeError([`<$red:Module Extension Error:$> Unsupported extension .${ext} for file ${filePath}`]);
					}

					modules.set(alias, { path: absolutePath, type: ext });
					
					// ========================================================================== //
					//  Remove import node from AST                                       //
					// ========================================================================== //
					nodes.splice(i, 1);
					i--;
				} else if (node.type === "$use-module") {
					// 2. Handle Usage Node: [$use-module = alias]
					const alias = node.args[0];
					if (!alias || !modules.has(alias)) {
						runtimeError([`<$red:Module Usage Error:$> Undefined module alias <$magenta:${alias}$> at line <$yellow:${node.range.start.line + 1}$>`]);
					}

					const mod = modules.get(alias);
					if (mod.type === "smark") {
						// ========================================================================== //
						//  Recursive Parse the sub-file AST                                  //
						// ========================================================================== //
						const content = fs.readFileSync(mod.path, "utf-8");
						const SomMark = context.instance.constructor;
						const subSmark = new SomMark({
							src: content,
							format: context.format,
							filename: mod.path,
							plugins: context.instance.plugins,
							priority: context.instance.priority,
							includeDocument: false 
						});
						
						// ========================================================================== //
						//  Parse the sub-file AST                                                  //
						// ========================================================================== //
						const subAst = await subSmark.parse();
						
						// ========================================================================== //
						//  Splice results into current body                                  //
						// ========================================================================== //
						nodes.splice(i, 1, ...subAst);
						i += subAst.length - 1;
					}
				} else if (node.body && Array.isArray(node.body)) {
					await processNodes(node.body, baseDir);
				}
			}
		};

		await processNodes(ast, baseDir);
		return ast;
	}
};


export default ModuleSystem;
