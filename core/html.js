// ###################
// Page tree to HTML: attribute names, doctype, the runtime script
// ###################

import { find, html, svg } from "property-information";

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
	throw new CompilerError("runtime ${ }$ was not prepared before building HTML", node.source, node.range?.start);
};

// ###################
// .arcm prop names to hast property names
// ###################
const toProperties = (props, schema, tagName) => {
	const properties = {};
	const vars = [];
	for (const [key, value] of Object.entries(props)) {
		if (/^\d+$/.test(key)) continue;
		if (key.startsWith("--")) {
			if (isRuntime(value)) notYet(value);
			if (value !== null && value !== undefined && value !== false) vars.push(`${key}: ${value}`);
			continue;
		}
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

	// ###################
	// --name props join the style attribute: style="color: red; --x: 1"
	// ###################
	if (vars.length) {
		const style = typeof properties.style === "string" ? properties.style.trim().replace(/;$/, "") : "";
		properties.style = [style, ...vars].filter(Boolean).join("; ");
	}
	return properties;
};

// ###################
// A value can't end the <style> tag early
// ###################
const styleText = (value) => value.replace(/<\/(style)/gi, "<\\/$1");

// ###################
// Evaluator tree to real hast
// ###################
// ###################
// Plain one-line text for a warning { source, position, message }
// ###################
export const formatWarning = (w) => {
	const where = w.position ? `${w.source}:${w.position.line + 1}:${w.position.character + 1}` : w.source;
	return `⚠ ${where}  ${w.message}`;
};

export const toHast = (node, inSvg = false) => {
	switch (node.type) {
		case "root": {
			// ###################
			// Nothing may come before <!doctype html>, not even whitespace
			// ###################
			let children = node.children;
			const doctype = children.findIndex((c) => c.type === "element" && c.tagName.toLowerCase() === "doctype");
			if (doctype > 0 && children.slice(0, doctype).every((c) => c.type === "text" && !c.value.trim())) {
				children = children.slice(doctype);
			}
			return { type: "root", children: children.map((c) => toHast(c, inSvg)) };
		}
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
				children: node.children.map((c) => {
					const out = toHast(c, childSvg);
					return node.tagName.toLowerCase() === "style" && out.type === "text" ? { ...out, value: styleText(out.value) } : out;
				})
			};
		}
		default:
			throw new CompilerError(`unknown tree node ${node.type}`, "");
	}
};

// ###################
// Put the runtime bundle at the end of <body>, or of the page
// ###################
const bodyOf = (node) => {
	if (node.type === "element" && node.tagName === "body") return node;
	for (const c of node.children ?? []) {
		const hit = bodyOf(c);
		if (hit) return hit;
	}
	return null;
};

export const addScript = (tree, js) => {
	(bodyOf(tree) ?? tree).children.push({ type: "raw", value: `<script type="module">${js}</script>` });
};

// ###################
// <script type="module" src="…"> for a bundled file
// ###################
export const addScriptSrc = (tree, src) => {
	(bodyOf(tree) ?? tree).children.push({ type: "element", tagName: "script", properties: { type: "module", src }, children: [] });
};
