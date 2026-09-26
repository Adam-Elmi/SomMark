// ###################
// Warn about blocks that are not HTML, SVG, MathML or components
// ###################

import { htmlTagNames } from "html-tag-names";
import { svgTagNames } from "svg-tag-names";
import { mathmlTagNames } from "mathml-tag-names";
import { NODE_TYPES as N } from "./parser.js";
import closest from "./suggest.js";

const HTML = new Set(htmlTagNames);
const SVG = new Set(svgTagNames);
const SVG_LOWER = new Set(svgTagNames.map((t) => t.toLowerCase()));
const MATHML = new Set(mathmlTagNames);
const KNOWN = [...new Set([...htmlTagNames, ...svgTagNames, ...mathmlTagNames])];

const isKnown = (id) => {
	const lower = id.toLowerCase();
	return HTML.has(lower) || SVG.has(id) || SVG_LOWER.has(lower) || MATHML.has(lower) || lower === "doctype" || id.includes("-");
};

// ###################
// Returns warnings; runs no code
// ###################
export default function unknownTags(graph) {
	const warnings = [];
	for (const mod of graph.modules.values()) {
		const components = [...mod.imports.keys()];
		const visit = (nodes) => {
			for (const node of nodes) {
				if (node.type === N.BLOCK && !isKnown(node.id)) {
					const hint = closest(node.id, components) ?? closest(node.id.toLowerCase(), KNOWN);
					warnings.push({
						source: mod.id,
						position: node.range.start,
						message: `[${node.id}] is not an HTML element or an imported component${hint ? ` (did you mean [${hint}]?)` : ""}`
					});
				}
				if (node.body) visit(node.body);
			}
		};
		visit(mod.ast);
	}
	return warnings;
}
