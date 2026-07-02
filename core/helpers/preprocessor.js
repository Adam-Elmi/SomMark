import path from "pathe";
import * as acorn from "acorn";
import evaluator from "../evaluator.js";
import { transpilerError } from "../errors.js";

let _nodeFsCache;
async function getNodeFs() {
	if (_nodeFsCache !== undefined) return _nodeFsCache;
	try {
		const m = await import("node:fs");
		const raw = m.default || m;
		_nodeFsCache = {
			exists: (p) => raw.promises.access(p).then(() => true).catch(() => false),
			readFile: (p, enc) => raw.promises.readFile(p, enc),
		};
	} catch {
		_nodeFsCache = null;
	}
	return _nodeFsCache;
}

/**
 * Preprocesses a runtime JS block, parsing it with Acorn to locate
 * SomMark.static("...") and SomMark.import("...") calls, evaluating/loading them,
 * and replacing them inline with LSP/runtime safety.
 * 
 * @param {string} code - The raw javascript runtime code.
 * @param {string|null} filename - Active template filename for relative imports.
 * @param {Object} security - Security restrictions from the engine configuration.
 * @returns {Promise<string>} - The preprocessed code.
 */
export async function preprocessRuntimeLogic(code, filename = null, security = {}, instance = null) {
	let ast;
	try {
		ast = acorn.parse(code, { ecmaVersion: "latest", sourceType: "module" });
	} catch (err) {
		// Fallback: If code is not a fully valid JS block (e.g. an expression fragment),
		// let it pass through to the standard renderer untouched.
		return code;
	}

	const matches = [];

	// Recursive AST Traversal to find SomMark.static and SomMark.import calls
	function traverse(node) {
		if (!node || typeof node !== "object") return;

		if (
			node.type === "CallExpression" &&
			node.callee.type === "MemberExpression" &&
			node.callee.object.name === "SomMark" &&
			node.arguments.length > 0
		) {
			const propName = node.callee.property.name;
			if (propName === "static" || propName === "import") {
				matches.push(node);
			}
		}

		for (const key of Object.keys(node)) {
			const child = node[key];
			if (Array.isArray(child)) {
				for (const item of child) traverse(item);
			} else {
				traverse(child);
			}
		}
	}

	traverse(ast);

	let preprocessedCode = code;

	if (matches.length > 0) {
		// Sort matches right-to-left to prevent character offset drifting
		matches.sort((a, b) => b.start - a.start);

		// Execute/Import and replace inline
		for (const match of matches) {
			const propName = match.callee.property.name;
			const argNode = match.arguments[0];
			let argValue = "";

			if (argNode.type === "Literal") {
				argValue = String(argNode.value);
			} else if (argNode.type === "TemplateLiteral") {
				argValue = argNode.quasis.map((q) => q.value.cooked).join("");
			}

			if (propName === "static") {
				if (!argValue) {
					transpilerError([
						`<$red:SomMark.static Argument Error:$> The argument to SomMark.static must be a string.{line}`
					]);
				}

				// If the code contains a top-level return statement, wrap it in an async IIFE
				let finalStaticCode = argValue.trim();
					if (finalStaticCode.includes("return")) {
						finalStaticCode = `(async () => {\n${argValue}\n})()`;
					}

					// Run securely inside the active QuickJS VM sandbox
					let result;
					try {
						result = await evaluator.execute(finalStaticCode);
					} catch (err) {
						transpilerError([
							`<$red:SomMark.static Execution Error:$> ${err.message}{line}`,
							`<$yellow:Static Code:$> <$blue:${argValue}$>{line}`
						]);
					}

					// Serialize the return value safely
					let serialized = "";
					if (result === undefined) {
						serialized = "undefined";
					} else if (typeof result === "object") {
						serialized = JSON.stringify(result);
					} else if (typeof result === "string") {
						serialized = JSON.stringify(result); // Automatically escapes quotes and special chars
					} else {
						serialized = String(result);
					}

					// Slice out SomMark.static(...) and splice in the serialized value
					preprocessedCode =
						preprocessedCode.slice(0, match.start) +
						serialized +
						preprocessedCode.slice(match.end);
			} else if (propName === "import") {
				if (!argValue) {
					transpilerError([
						`<$red:SomMark.import Argument Error:$> The argument to SomMark.import must be a static, non-empty string literal.{line}`
					]);
				}

				// Resolve the file path relative to the template's base directory
				let baseDir = instance?.cwd || "/";
				if (filename && filename !== "anonymous") {
					baseDir = path.dirname(path.resolve(filename));
				}

				// Block absolute paths — path.resolve would ignore baseDir entirely
				if (path.isAbsolute(argValue)) {
					transpilerError([
						`<$red:Security Error:$> Absolute import paths are not allowed: <$magenta:${argValue}$>{line}`,
						`<$yellow:Use a path relative to the template file, e.g.$> <$green:SomMark.import("./data.json")$> <$yellow:or$> <$green:SomMark.import("../shared/data.json")$><$yellow:.$>{line}`,
						`<$yellow:Base directory:$> <$blue:${baseDir}$>{line}`
					]);
				}

				const resolvedPath = path.resolve(baseDir, argValue);

				// Block path traversal — resolved path must stay inside baseDir
				const safeBases = baseDir.endsWith(path.sep) ? baseDir : baseDir + path.sep;
				if (!resolvedPath.startsWith(safeBases) && resolvedPath !== baseDir) {
					transpilerError([
						`<$red:Security Error:$> Import path escapes the project directory: <$magenta:${argValue}$>{line}`,
						`<$yellow:Resolved Path:$> <$blue:${resolvedPath}$>{line}`
					]);
				}

				const fsImpl = instance?.fs || await getNodeFs();

				// File presence validation
				if (!fsImpl || !await fsImpl.exists(resolvedPath)) {
					transpilerError([
						`<$red:SomMark.import File Error:$> File not found: <$magenta:${argValue}$>{line}`,
						`<$yellow:Resolved Path:$> <$blue:${resolvedPath}$>{line}`
					]);
				}

				// Security Extension restriction validation
				const ext = path.extname(resolvedPath).toLowerCase();
				if (security?.allowedExtensions && !security.allowedExtensions.includes(ext)) {
					transpilerError([
						`<$red:Security Error:$> File extension <$yellow:${ext}$> is not allowed by security policy.{line}`,
						`<$yellow:Import path:$> <$blue:${argValue}$>{line}`
					]);
				}

				let serialized = "";
				const content = await fsImpl.readFile(resolvedPath, "utf-8");

				if (ext === ".json") {
					// Validate JSON structure
					let parsed;
					try {
						parsed = JSON.parse(content);
					} catch (err) {
						transpilerError([
							`<$red:JSON Parse Error:$> Failed to parse JSON file <$magenta:${argValue}$>:{line}`,
							`<$yellow:Error:$> ${err.message}{line}`
						]);
					}
					serialized = JSON.stringify(parsed);
				} else {
					// Fallback for plain text, .smark, and other extensions: Serialize as JSON-escaped string
					serialized = JSON.stringify(content);
				}

				// Slice out SomMark.import(...) and splice in the serialized content
				preprocessedCode =
					preprocessedCode.slice(0, match.start) +
					serialized +
					preprocessedCode.slice(match.end);
			}
		}
	}

	// LSP / Linter Safety Guard Injection
	// If the resulting code references the global SomMark keyword, prepend fallback declarations to prevent crashes.
	const hasSomMarkRef = /\bSomMark\b/.test(preprocessedCode);
	if (hasSomMarkRef) {
		const safetyGuard = `/* global SomMark */\nif (typeof globalThis.SomMark === 'undefined') { globalThis.SomMark = { static: (c) => c, import: (c) => c }; }\n`;
		preprocessedCode = safetyGuard + preprocessedCode;
	}

	return preprocessedCode;
}
