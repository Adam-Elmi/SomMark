import { transpilerError } from "./errors.js";

/**
 * SomMark Rules Validator
 * 
 * This module ensures the AST matches the expected structure.
 * It focuses on structural integrity (like self-closing tags)
 * while leaving specific patterns to the mapper's discretion.
 */

/**
 * Runs all validation rules against a single code node.
 * 
 * @param {Object} node - The code node to check.
 * @param {Object} target - The rule definition for this node.
 * @param {Object} instance - The current SomMark context.
 */
const runValidations = (node, target, instance) => {
	if (!target || !target.options) return;
	const rules = target.options.rules || {};
	const id = (target.id) ? (Array.isArray(target.id) ? target.id.join(" | ") : target.id) : (node.id || "Unknown");
	const errorRange = node.range ? {
		start: node.range.start,
		end: {
			line: node.range.start.line,
			character: node.range.start.character + (node.id || "").length + 2
		}
	} : null;
	const context = instance ? { src: instance.src, range: errorRange, filename: instance.filename } : null;

	// -- Structural Integrity (Empty Body / Self-Closing) ----------------- //
	const isEmptyBodyTarget = rules.is_empty_body;

	if (isEmptyBodyTarget && node.type === "Block" && !node.isSelfClosing && node.body) {
		const hasContent = node.body.some(child => {
			if (child.type === "Text") {
				return (child.text || "").trim().length > 0;
			}
			return true; // Any other node type (Block, Inline, etc.) counts as content
		});

		if (hasContent) {
			transpilerError(
				[
					"{N}",
					"<$red:[Validation Error]:$>{N}",
					`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:is defined as an empty-body component and cannot have children.$>`
				],
				context
			);
		}
	}

	// -- Arguments Validation (Required Args) ----------------------------- //
	const isStructural = node.type === "Block";
	if (isStructural && rules.required_args && Array.isArray(rules.required_args)) {
		const missingArgs = rules.required_args.filter(arg => {
			// Check if the argument exists in named args or as a positional arg (if arg is a number)
			if (typeof arg === "number") {
				return node.props[arg] === undefined;
			}
			return node.props[arg] === undefined;
		});

		if (missingArgs.length > 0) {
			transpilerError(
				[
					"{N}",
					`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:is missing required arguments:$> <$red:${missingArgs.join(", ")}$>{N}`,
					`<$blue:Please ensure these arguments are provided in the template usage.$>`
				],
				context
			);
		}
	}
};

/**
 * Checks every node in the entire document for structural issues.
 * 
 * @param {Object|Array} ast - The Abstract Syntax Tree to validate.
 * @param {Object} mapperFile - The mapper instance containing tag registrations.
 * @param {Object} instance - The current SomMark context.
 * @returns {Object|Array} - The validated AST.
 */
export function validateAST(ast, mapperFile, instance) {
	if (!mapperFile) return ast;

	const validateNode = (node) => {
		if (!node) return;

		// Handle filename context updates for module identity tokens
		if (instance?.moduleIdentityToken && node.id === instance.moduleIdentityToken) {
			const oldFilename = instance.filename;
			instance.filename = node.props?.filename || oldFilename;
			if (node.body) {
				node.body.forEach(child => validateNode(child));
			}
			instance.filename = oldFilename;
			return;
		}

		// 1. Identify Target
		if (node.id) {
			let target = null;
			const lowerId = node.id.toLowerCase();
			if (["import", "$use-module", "slot", "for-each"].includes(lowerId)) {
				target = {
					id: lowerId,
					options: {}
				};
			} else {
				target = mapperFile.get(node.id) || (mapperFile.getUnknownTag ? mapperFile.getUnknownTag(node) : null);
			}

			if (target) {
				runValidations(node, target, instance);
			}
		}

		// 2. Recursive Traversal
		if (node.body && Array.isArray(node.body)) {
			node.body.forEach(child => validateNode(child));
		}
	};

	const rootNodes = Array.isArray(ast) ? ast : [ast];
	rootNodes.forEach(node => validateNode(node));

	return ast;
}
