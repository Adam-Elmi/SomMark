// ###################
// Load code in the browser: rewrite imports, then import from module URLs
// ###################

import * as acorn from "acorn";
import { EvaluatorError } from "../core/errors.js";

const ACORN = { ecmaVersion: "latest", sourceType: "module", allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true };
const NODE = new Set(["path", "events", "buffer", "url", "fs", "fs/promises"]);
const BUILTIN = new Set(["assert", "async_hooks", "child_process", "cluster", "crypto", "dgram", "dns", "http", "http2", "https", "module", "net", "os", "perf_hooks", "process", "readline", "stream", "tls", "tty", "util", "v8", "vm", "worker_threads", "zlib", ...NODE]);
const NAME = /^[A-Za-z_$][\w$]*$/;

const packageName = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);

// ###################
// toModuleURL(code) -> a URL that import() can load (blob: in a worker)
// special: exact specifiers with a fixed URL; node: false makes node: modules an error
// ###################
export function createLoader({ host, packages = {}, toModuleURL, special = {}, node = true }) {
	const cache = new Map();

	const moduleOf = (names, body) => {
		const keys = names.filter((k) => k !== "default" && NAME.test(k));
		return `${body}\nexport default __m.default ?? __m;\n${keys.length ? `export const { ${keys.join(", ")} } = __m;` : ""}`;
	};

	// ###################
	// node:path etc. come from the installed polyfills
	// ###################
	const nodeModule = (name) => {
		if (!node) throw new Error(`runtime import "node:${name}" is a Node.js module, which doesn't exist in the browser`);
		if (!NODE.has(name)) throw new Error(`"node:${name}" is not available in the browser`);
		const key = `node:${name}`;
		if (!cache.has(key)) {
			const m = globalThis.__arcmNode[name];
			cache.set(key, toModuleURL(moduleOf(Object.keys(m), `const __m = globalThis.__arcmNode[${JSON.stringify(name)}];`)));
		}
		return cache.get(key);
	};

	const localModule = async (id) => {
		if (cache.has(id)) return cache.get(id);
		const text = await host.readFile(id);
		let code;
		if (id.endsWith(".json")) {
			const data = JSON.parse(text);
			const names = data && typeof data === "object" && !Array.isArray(data) ? Object.keys(data) : [];
			code = moduleOf(names, `const __m = { default: ${JSON.stringify(data)} }; Object.assign(__m, __m.default);`);
		} else {
			code = await rewrite(text, id);
		}
		const url = toModuleURL(code);
		cache.set(id, url);
		return url;
	};

	// ###################
	// Where each import points in the browser
	// ###################
	const resolveSpec = async (spec, fromId) => {
		try {
			return await resolveSpecInner(spec, fromId);
		} catch (err) {
			err.spec ??= spec;
			throw err;
		}
	};

	const resolveSpecInner = async (spec, fromId) => {
		if (special[spec]) return special[spec];
		if (/^(https?|data|blob):/.test(spec)) return spec;
		if (spec.startsWith("node:")) return nodeModule(spec.slice(5));
		if (spec.startsWith(".") || spec.startsWith("/")) return localModule(host.resolve(spec, fromId));
		if (BUILTIN.has(spec) || BUILTIN.has(packageName(spec))) return nodeModule(spec);
		if (packages[spec]) return packages[spec];
		const pkg = packageName(spec);
		if (packages[pkg]) return packages[pkg] + spec.slice(pkg.length);
		throw new Error(`"${pkg}" is not in packages; add packages: { "${pkg}": "https://esm.sh/${pkg}" }`);
	};

	// ###################
	// Replace every import source; drop "with { type: ... }"
	// ###################
	const rewrite = async (code, fromId) => {
		const ast = acorn.parse(code, ACORN);
		const edits = [];
		const sources = [];
		for (const node of ast.body) {
			if ((node.type === "ImportDeclaration" || node.type === "ExportNamedDeclaration" || node.type === "ExportAllDeclaration") && node.source) {
				sources.push(node);
			}
		}
		for (const node of sources) {
			const url = await resolveSpec(node.source.value, fromId);
			const end = code[node.end - 1] === ";" ? node.end - 1 : node.end;
			edits.push({ start: node.source.start, end, text: JSON.stringify(url) });
		}
		let out = code;
		for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
		return out;
	};

	// ###################
	// For the evaluator: load one generated render module
	// ###################
	const importModule = async (code, id) => {
		let url;
		try {
			url = toModuleURL(await rewrite(code, id));
		} catch (err) {
			throw new EvaluatorError(err.message, id, null, err);
		}
		return { render: (await import(url)).default, keys: [url] };
	};

	// ###################
	// For runtime code: rewrite and get a module URL
	// ###################
	const moduleURL = async (code, id) => toModuleURL(await rewrite(code, id));

	return { importModule, moduleURL };
}
