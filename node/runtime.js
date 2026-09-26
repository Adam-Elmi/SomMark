// ###################
// ArcMoon runtime build: refs, live values, exported values, esbuild bundle
// ###################

import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { builtinModules } from "node:module";
import * as acorn from "acorn";
import { build } from "esbuild";
import closest from "../core/suggest.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const CLIENT = resolve(HERE, "../runtime/client.js");
const REACTIVE = resolve(HERE, "../runtime/reactive.js");
const ACORN = { ecmaVersion: "latest", sourceType: "module", allowAwaitOutsideFunction: true, locations: true };
const BUILTINS = new Set(builtinModules);

export class RuntimeError extends Error {
	constructor(message, source, position) {
		const where = position ? `${source}:${position.line + 1}:${position.character + 1}` : source;
		super(`${where}  ${message}`);
		this.name = "RuntimeError";
		this.source = source;
		this.position = position;
	}
}

const isMarker = (v) => v !== null && typeof v === "object" && v.type === "runtime";
const siteKey = (m) => `${m.range.start.line}:${m.range.start.character}`;

// ###################
// Small AST walker with parent
// ###################
const walk = (node, visit, parent = null) => {
	if (!node || typeof node.type !== "string") return;
	visit(node, parent);
	for (const key of Object.keys(node)) {
		const child = node[key];
		if (Array.isArray(child)) child.forEach((c) => walk(c, visit, node));
		else if (child && typeof child.type === "string") walk(child, visit, node);
	}
};

const patternNames = (p, out) => {
	if (!p) return;
	if (p.type === "Identifier") out.add(p.name);
	else if (p.type === "ObjectPattern") p.properties.forEach((q) => patternNames(q.type === "RestElement" ? q.argument : q.value, out));
	else if (p.type === "ArrayPattern") p.elements.forEach((e) => patternNames(e, out));
	else if (p.type === "RestElement") patternNames(p.argument, out);
	else if (p.type === "AssignmentPattern") patternNames(p.left, out);
};

// ###################
// Every name declared anywhere in the code
// ###################
const declaredIn = (ast, out = new Set()) => {
	walk(ast, (n) => {
		if (n.type === "VariableDeclarator") patternNames(n.id, out);
		else if (/^(Function|Class)(Declaration|Expression)$/.test(n.type) && n.id) out.add(n.id.name);
		if (/Function/.test(n.type)) n.params.forEach((p) => patternNames(p, out));
		if (n.type === "CatchClause") patternNames(n.param, out);
		if (/^Import(Default|Namespace)?Specifier$/.test(n.type)) out.add(n.local.name);
	});
	return out;
};

// ###################
// Every name the code reads
// ###################
const referencedIn = (ast, out = new Set()) => {
	walk(ast, (n, p) => {
		if (n.type !== "Identifier" || !p) return;
		if (p.type === "MemberExpression" && p.property === n && !p.computed) return;
		if ((p.type === "Property" || p.type === "MethodDefinition" || p.type === "PropertyDefinition") && p.key === n && !p.computed && !p.shorthand) return;
		if (/Label|Break|Continue/.test(p.type)) return;
		if (/^(Import|Export)/.test(p.type)) return;
		out.add(n.name);
	});
	return out;
};

// ###################
// Values that can be copied into the bundle
// ###################
const toJS = (v, name, seen = new Set()) => {
	if (v === undefined) return "undefined";
	if (v === null || typeof v === "boolean" || typeof v === "string") return JSON.stringify(v);
	if (typeof v === "number") return Number.isFinite(v) ? String(v) : v !== v ? "NaN" : v > 0 ? "Infinity" : "-Infinity";
	if (typeof v === "bigint") return `${v}n`;
	if (typeof v === "function") throw new Error(`"${name}" is a function; functions can't be sent to the browser`);
	if (typeof v !== "object") throw new Error(`"${name}" can't be sent to the browser`);
	if (seen.has(v)) throw new Error(`"${name}" has a circular reference`);
	seen.add(v);
	let out;
	if (Array.isArray(v)) out = `[${v.map((x) => toJS(x, name, seen)).join(",")}]`;
	else if (v instanceof Date) out = `new Date(${v.getTime()})`;
	else if (v instanceof Map) out = `new Map([${[...v].map(([a, b]) => `[${toJS(a, name, seen)},${toJS(b, name, seen)}]`).join(",")}])`;
	else if (v instanceof Set) out = `new Set([${[...v].map((x) => toJS(x, name, seen)).join(",")}])`;
	else if (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null) {
		out = `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}:${toJS(x, name, seen)}`).join(",")}}`;
	} else {
		throw new Error(`"${name}" is a ${v.constructor?.name ?? "class"} instance; only plain values can be sent to the browser`);
	}
	seen.delete(v);
	return out;
};

const suggest = (name, names) => {
	const best = closest(name, names);
	return best ? ` (did you mean "${best}"?)` : "";
};

// ###################
// Build the page's runtime bundle; changes the tree in place
// ###################
export default async function buildRuntime(result, options = {}) {
	const { tree, uses, modules } = result;
	const { bundle: allowed = [], version = "0.0.0", cwd = process.cwd() } = options;

	const perUse = uses.map((u) => ({ ...u, blocks: new Map(), live: new Map(), attached: new Map(), children: [] }));
	for (const u of perUse) if (u.parent !== null) perUse[u.parent].children.push(u.id);

	let elementCount = 0;
	const initialTargets = [];

	const addLive = (marker, target) => {
		const u = perUse[marker.use];
		const key = siteKey(marker);
		if (!u.live.has(key)) u.live.set(key, { marker, targets: [] });
		u.live.get(key).targets.push(target);
		return target;
	};

	// ###################
	// 1. Walk the tree: take out blocks, mark live values and refs
	// ###################
	const visit = (children, parentTag) => {
		for (let k = 0; k < children.length; k++) {
			const node = children[k];

			if (node.type === "runtime") {
				if (node.kind === "block") {
					perUse[node.use].blocks.set(siteKey(node), node);
					children.splice(k--, 1);
				} else {
					const id = `t${elementCount++}`;
					const text = { type: "text", value: "" };
					node.where = parentTag ? `inside [${parentTag}]` : "in markup";
					children.splice(k, 1, { type: "comment", value: `arcm:${id}` }, text, { type: "comment", value: "/arcm" });
					k += 2;
					initialTargets.push({ marker: node, text, target: addLive(node, { id, text: true }) });
				}
				continue;
			}

			if (node.type !== "element") continue;

			const { directives } = node.data;
			const u = perUse[node.data.use];
			const refName = directives.ref ?? directives["shared-ref"];
			const shared = directives["shared-ref"] !== undefined;

			if (directives.ref !== undefined && directives["shared-ref"] !== undefined) {
				throw new RuntimeError(`[${node.tagName}] can't have both arcm-ref and arcm-shared-ref`, u.module);
			}
			if (refName !== undefined) {
				if (typeof refName !== "string" || !refName) {
					throw new RuntimeError(`arcm-ref on [${node.tagName}] must be a quoted name`, u.module);
				}
				const seen = u.attached.get(refName);
				if (seen && (!shared || !seen.shared)) {
					throw new RuntimeError(`single ref "${refName}" is attached to 2 elements; use arcm-shared-ref`, u.module);
				}
				if (!seen) u.attached.set(refName, { name: refName, id: `${refName}-u${u.id}`, shared, used: false });
				node.properties["data-arcm-ref"] = u.attached.get(refName).id;
			}

			for (const [key, value] of Object.entries(node.properties)) {
				if (!isMarker(value)) continue;
				delete node.properties[key];
				value.where = `for "${key}" on [${node.tagName}]`;
				node.properties["data-arcm-ref"] ??= `e${elementCount++}`;
				const target = addLive(value, { id: node.properties["data-arcm-ref"], attr: key });
				initialTargets.push({ marker: value, element: node, key, target });
			}

			visit(node.children, node.tagName);
		}
	};
	visit(tree.children, null);

	// ###################
	// 2. Per file: parse runtime code once
	// ###################
	const files = new Map();
	const fileOf = (id) => {
		if (files.has(id)) return files.get(id);
		const blocks = new Map();
		const sites = new Map();
		for (const u of perUse) {
			if (u.module !== id) continue;
			for (const [k, b] of u.blocks) blocks.set(k, b);
			for (const [k, s] of u.live) sites.set(k, s.marker);
		}
		const f = { id, blocks: [...blocks.values()], sites: [...sites.entries()], parsed: null };
		files.set(id, f);
		return f;
	};

	const at = (marker, loc) => ({
		line: marker.range.start.line + (loc ? loc.line - 1 : 0),
		character: loc && loc.line > 1 ? loc.column : marker.range.start.character
	});

	const parseFile = (f) => {
		const info = modules.get(f.id) ?? { staticNames: new Set(), exportNames: new Set() };
		const hoisted = new Set();
		const declared = new Set();
		const refsDefined = new Map();
		const refCalls = [];
		const signals = new Map();
		const bodies = [];
		const lives = [];

		const scan = (ast, marker) => {
			walk(ast, (n, p) => {
				const isArc = (name) => n.type === "CallExpression" && n.callee.type === "MemberExpression" &&
					n.callee.object.name === "ArcMoon" && n.callee.property.name === name;
				if (isArc("defineRef")) {
					const arg = n.arguments[0];
					if (!arg || arg.type !== "Literal" || typeof arg.value !== "string") {
						throw new RuntimeError("ArcMoon.defineRef() needs a quoted name", f.id, at(marker, n.loc.start));
					}
					refsDefined.set(arg.value, at(marker, n.loc.start));
					if (p?.type === "VariableDeclarator" && p.id.type === "Identifier") refCalls.push({ bind: p.id.name, name: arg.value });
				}
				for (const fn of ["ref", "refs"]) {
					if (!isArc(fn)) continue;
					const arg = n.arguments[0];
					let name = null;
					if (arg?.type === "CallExpression" && arg.arguments[0]?.type === "Literal") name = arg.arguments[0].value;
					else if (arg?.type === "Identifier") name = { bind: arg.name };
					refCalls.push({ fn, name, pos: at(marker, n.loc.start) });
				}
			});
		};

		for (const b of f.blocks) {
			let ast;
			try {
				ast = acorn.parse(b.code, ACORN);
			} catch (err) {
				throw new RuntimeError(`SyntaxError: ${err.message.replace(/ \(\d+:\d+\)$/, "")}`, f.id, at(b, err.loc));
			}
			let code = b.code;
			const edits = [];
			for (const s of ast.body) {
				if (s.type === "ImportDeclaration") {
					hoisted.add(b.code.slice(s.start, s.end));
					edits.push(s);
				} else if (/^Export/.test(s.type)) {
					throw new RuntimeError("export is not allowed in runtime code", f.id, at(b, s.loc.start));
				} else if (s.type === "VariableDeclaration") {
					for (const d of s.declarations) {
						const init = d.init;
						if (d.id.type === "Identifier" && init?.type === "CallExpression" && init.callee.name === "signal" && init.arguments.length === 1) {
							const a = init.arguments[0];
							if (a.type === "Literal" && !a.regex) signals.set(d.id.name, { value: a.value });
							else if (a.type === "Identifier") signals.set(d.id.name, { from: a.name });
						}
					}
				}
			}
			for (const s of edits.reverse()) code = code.slice(0, s.start) + code.slice(s.start, s.end).replace(/[^\n]/g, " ") + code.slice(s.end);
			declaredIn(ast, declared);
			scan(ast, b);
			bodies.push({ code, ast, marker: b });
		}

		f.sites.forEach(([key, marker], index) => {
			let ast;
			try {
				ast = acorn.parse(`(${marker.code}\n)`, ACORN);
			} catch (err) {
				throw new RuntimeError(
					`runtime \${ }$ ${marker.where ?? "in markup"} must be one expression (a live value).\n  To run statements, move this runtime \${ }$ to the top level of the file.`,
					f.id,
					at(marker)
				);
			}
			scan(ast, marker);
			lives.push({ key, index, marker, ast, expr: ast.body[0].expression });
		});

		// ###################
		// Compile-time names used here must be exported
		// ###################
		const used = new Set();
		for (const x of [...bodies, ...lives]) referencedIn(x.ast, used);
		const values = [];
		for (const name of used) {
			if (declared.has(name) || !info.staticNames.has(name)) continue;
			if (!info.exportNames.has(name)) {
				const m = (bodies[0] ?? lives[0]).marker;
				throw new RuntimeError(`runtime code uses "${name}", which is not exported from \${ }$. Add "export" to its declaration, or write export { ${name} }, to send it to visitors' browsers.`, f.id, at(m));
			}
			values.push(name);
		}

		f.parsed = { hoisted, bodies, lives, values, refsDefined, refCalls, signals };
		return f.parsed;
	};

	// ###################
	// 3. The generated function for one file
	// ###################
	const sourceOf = (f) => {
		const { hoisted, bodies, lives, values } = f.parsed;
		const lines = [...hoisted];
		if (lives.length) lines.push(`import { effect as __effect } from "arcmoon/reactive";`);
		lines.push("export default function (ArcMoon, __values, __live, __setAttr) {");
		if (values.length) lines.push(`const { ${values.join(", ")} } = __values;`);
		for (const b of bodies) lines.push(b.code);
		for (const l of lives) {
			const expr = l.marker.code;
			const first = perUse.flatMap((u) => u.live.get(l.key)?.targets ?? [])[0];
			if (first?.text) {
				lines.push(`__live(${l.index}, (__node) => __effect(() => { __node.data = String((${expr}) ?? ""); }));`);
			} else if (/^on/i.test(first.attr)) {
				lines.push(`__live(${l.index}, (__el) => { __el.addEventListener(${JSON.stringify(first.attr.slice(2).toLowerCase())}, (${expr})); });`);
			} else {
				lines.push(`__live(${l.index}, (__el) => __effect(() => { __setAttr(__el, ${JSON.stringify(first.attr)}, (${expr})); }));`);
			}
		}
		lines.push("}");
		return lines.join("\n");
	};

	// ###################
	// 4. Per use: refs table, live targets, values, initial values
	// ###################
	const runs = [];
	const descendants = (u) => u.children.flatMap((c) => [perUse[c], ...descendants(perUse[c])]);

	for (const u of perUse) {
		const f = fileOf(u.module);
		const hasCode = f.blocks.length || f.sites.length;
		if (!hasCode) continue;
		const parsed = f.parsed ?? parseFile(f);

		const refs = {};
		for (const [name, pos] of parsed.refsDefined) {
			let found = u.attached.get(name);
			if (!found) {
				const inside = descendants(u).map((d) => d.attached.get(name)).filter(Boolean);
				if (inside.length > 1) throw new RuntimeError(`ref "${name}" is attached in more than one component; give each a different name`, f.id, pos);
				found = inside[0];
			}
			if (!found) {
				const names = [u, ...descendants(u)].flatMap((d) => [...d.attached.keys()]);
				throw new RuntimeError(`defineRef("${name}") matches no arcm-ref in ${u.module}${suggest(name, names)}`, f.id, pos);
			}
			found.used = true;
			refs[name] = { name, id: found.id, shared: found.shared };
		}

		const binds = new Map(parsed.refCalls.filter((c) => c.bind).map((c) => [c.bind, c.name]));
		for (const c of parsed.refCalls) {
			if (!c.fn || c.name === null) continue;
			const name = typeof c.name === "string" ? c.name : binds.get(c.name.bind);
			const ref = name && refs[name];
			if (!ref) continue;
			if (c.fn === "ref" && ref.shared) throw new RuntimeError(`ArcMoon.ref() used with shared ref "${name}"; use ArcMoon.refs()`, f.id, c.pos);
			if (c.fn === "refs" && !ref.shared) throw new RuntimeError(`ArcMoon.refs() used with single ref "${name}"; use ArcMoon.ref()`, f.id, c.pos);
		}

		const live = {};
		for (const l of parsed.lives) live[l.index] = u.live.get(l.key)?.targets ?? [];

		let values;
		try {
			values = `{${parsed.values.map((n) => `${JSON.stringify(n)}:${toJS(u.values[n], n)}`).join(",")}}`;
		} catch (err) {
			throw new RuntimeError(err.message, f.id);
		}

		runs.push({ file: f, use: u, refs, live, values });
	}

	// ###################
	// 5. Initial values for live signals: signal(0) or signal(exported)
	// ###################
	for (const t of initialTargets) {
		const f = files.get(t.marker.source);
		const l = f?.parsed?.lives.find((x) => x.key === siteKey(t.marker));
		const e = l?.expr;
		if (!e || e.type !== "CallExpression" || e.arguments.length || e.callee.type !== "Identifier") continue;
		const sig = f.parsed.signals.get(e.callee.name);
		if (!sig) continue;
		const value = "value" in sig ? sig.value : perUse[t.marker.use].values[sig.from];
		if (value === undefined || value === null) continue;
		if (t.text) t.text.value = String(value);
		else if (!/^on/i.test(t.key)) t.element.properties[t.key] = value;
	}

	for (const u of perUse) {
		for (const a of u.attached.values()) {
			if (!a.used) console.warn(`⚠ ${u.module}  arcm-ref "${a.name}" is never used by runtime code`);
		}
	}

	if (!runs.length) return null;

	// ###################
	// 6. Bundle with esbuild
	// ###################
	const fileList = [...new Set(runs.map((r) => r.file))];
	const entry = [
		`import { run } from ${JSON.stringify(CLIENT)};`,
		...fileList.map((f, i) => `import m${i} from "arcm-file:${i}";`),
		...runs.map((r) => {
			const i = fileList.indexOf(r.file);
			return `run(m${i}, { file: ${JSON.stringify(r.use.module)}, version: ${JSON.stringify(version)}, refs: ${JSON.stringify(r.refs)}, live: ${JSON.stringify(r.live)}, values: ${r.values} });`;
		})
	].join("\n");

	const allowedSet = new Set(allowed);
	const plugin = {
		name: "arcmoon",
		setup(b) {
			b.onResolve({ filter: /^arcm-file:/ }, (a) => ({ path: a.path, namespace: "arcm" }));
			b.onLoad({ filter: /.*/, namespace: "arcm" }, (a) => {
				const f = fileList[Number(a.path.slice("arcm-file:".length))];
				return { contents: sourceOf(f), loader: "js", resolveDir: isAbsolute(f.id) ? dirname(f.id) : cwd };
			});
			b.onResolve({ filter: /^arcmoon\/reactive$/ }, () => ({ path: REACTIVE }));
			b.onResolve({ filter: /^[^./]/ }, (a) => {
				if (a.namespace !== "arcm") return;
				const pkg = a.path.startsWith("@") ? a.path.split("/").slice(0, 2).join("/") : a.path.split("/")[0];
				if (a.path.startsWith("node:") || BUILTINS.has(pkg)) {
					return { errors: [{ text: `runtime import "${a.path}" is a Node.js module, which doesn't exist in the browser` }] };
				}
				if (!allowedSet.has(pkg)) {
					return { errors: [{ text: `runtime import "${pkg}" is not listed in bundle (arcmoon.config.js)` }] };
				}
			});
		}
	};

	try {
		const out = await build({
			stdin: { contents: entry, resolveDir: cwd, loader: "js" },
			bundle: true,
			write: false,
			format: "esm",
			platform: "browser",
			minify: true,
			logLevel: "silent",
			plugins: [plugin]
		});
		return out.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
	} catch (err) {
		const first = err.errors?.[0];
		const match = first?.location?.file?.match(/arcm-file:(\d+)/);
		const where = match ? fileList[Number(match[1])].id : "runtime bundle";
		throw new RuntimeError(first ? first.text : err.message, where);
	}
}
