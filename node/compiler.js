// ###################
// ArcMoon compiler: .arcm source to an HTML string
// ###################

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname, isAbsolute, join } from "node:path";
import { toHtml } from "hast-util-to-html";
import { find, html, svg } from "property-information";
import loadModules from "../core/modules.js";
import evaluate from "./evaluator.js";
import buildRuntime from "./runtime.js";
import { check } from "./protector.js";
import unknownTags from "../core/tags.js";
import pkg from "../package.json" with { type: "json" };

export class CompilerError extends Error {
	constructor(message, source, position) {
		const where = position ? `${source}:${position.line + 1}:${position.character + 1}` : source;
		super(`${where}  ${message}`);
		this.name = "CompilerError";
		this.source = source;
		this.position = position;
	}
}

const isRuntime = (v) => v !== null && typeof v === "object" && v.type === "runtime";

const notYet = (node) => {
	throw new CompilerError("runtime ${ }$ is not supported yet (runtime bundling is not built)", node.source, node.range?.start);
};

// ###################
// .arcm prop names to hast property names
// ###################
const toProperties = (props, schema, tagName) => {
	const properties = {};
	for (const [key, value] of Object.entries(props)) {
		if (/^\d+$/.test(key)) continue;
		if (value === null || value === undefined || value === false) continue;
		if (isRuntime(value)) notYet(value);
		if (typeof value === "object") {
			throw new CompilerError(`prop "${key}" on [${tagName}] is an object; attributes must be text, numbers or booleans`, "");
		}

		const info = find(schema, key);
		let v = value;
		if (typeof v === "string" && info.spaceSeparated) v = v.split(/\s+/).filter(Boolean);
		else if (typeof v === "string" && info.commaSeparated) v = v.split(",").map((x) => x.trim()).filter(Boolean);
		properties[info.property] = v;
	}
	return properties;
};

// ###################
// Evaluator tree to real hast
// ###################
const toHast = (node, inSvg = false) => {
	switch (node.type) {
		case "root":
			return { type: "root", children: node.children.map((c) => toHast(c, inSvg)) };
		case "text":
		case "raw":
		case "comment":
			return { type: node.type, value: node.value };
		case "runtime":
			return notYet(node);
		case "element": {
			if (node.tagName.toLowerCase() === "doctype") {
				if (node.children.length || Object.keys(node.properties).length) {
					throw new CompilerError("[doctype] takes no props or body; write [doctype!]", "");
				}
				return { type: "doctype" };
			}
			const svgHere = inSvg || node.tagName === "svg";
			const childSvg = svgHere && node.tagName !== "foreignObject";
			return {
				type: "element",
				tagName: node.tagName,
				properties: toProperties(node.properties, svgHere ? svg : html, node.tagName),
				children: node.children.map((c) => toHast(c, childSvg))
			};
		}
		default:
			throw new CompilerError(`unknown tree node ${node.type}`, "");
	}
};

// ###################
// "pkg/File.arcm" is looked up in node_modules, like Node does
// ###################
const fromNodeModules = (path, from) => {
	let dir = dirname(from);
	while (true) {
		const file = join(dir, "node_modules", path);
		if (existsSync(file)) return file;
		const up = dirname(dir);
		if (up === dir) return resolve(dirname(from), "node_modules", path);
		dir = up;
	}
};

// ###################
// Put the runtime bundle at the end of <body>, or of the page
// ###################
const addScript = (tree, js) => {
	const script = { type: "raw", value: `<script type="module">${js}</script>` };
	const find = (node) => {
		if (node.type === "element" && node.tagName === "body") return node;
		for (const c of node.children ?? []) {
			const hit = find(c);
			if (hit) return hit;
		}
		return null;
	};
	(find(tree) ?? tree).children.push(script);
};

// ###################
// Load the [import] tree; lexes and parses only, runs nothing
// ###################
export const loadGraph = (options = {}) => {
	const { src, filename, importAliases = {}, cwd = process.cwd() } = options;
	if (src === undefined && !filename) throw new TypeError("ArcMoon: pass src or filename");

	const id = filename ? resolve(cwd, filename) : resolve(cwd, "anonymous.arcm");
	const aliases = Object.fromEntries(
		Object.entries(importAliases).map(([alias, target]) => [alias, resolve(cwd, target)])
	);
	const host = {
		resolve: (path, from) => {
			if (isAbsolute(path)) return path;
			if (path.startsWith(".")) return resolve(dirname(from), path);
			return fromNodeModules(path, from);
		},
		readFile: (file) => readFile(file, "utf8")
	};
	return loadModules({ id, src }, host, { importAliases: aliases });
};

export default class ArcMoon {
	constructor(options = {}) {
		this.options = options;
	}

	// ###################
	// Run the pipeline and return HTML
	// ###################
	async compile() {
		const {
			props = {},
			removeComments = true,
			timeout = 5000,
			bundle = [],
			cwd = process.cwd(),
			root = cwd
		} = this.options;

		const graph = await loadGraph(this.options);
		for (const w of unknownTags(graph)) {
			console.warn(`⚠ ${w.source}:${w.position.line + 1}:${w.position.character + 1}  ${w.message}`);
		}
		await check(graph, { root });
		const result = await evaluate(graph, { props, removeComments, timeout, version: pkg.version, cwd });
		const js = await buildRuntime(result, { bundle, version: pkg.version, cwd });
		const tree = toHast(result.tree);
		if (js) addScript(tree, js);
		return toHtml(tree, { allowDangerousHtml: true, characterReferences: { useNamedReferences: true } });
	}
}
