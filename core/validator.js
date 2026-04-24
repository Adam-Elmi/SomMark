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
	const id = (target.id) ? (Array.isArray(target.id) ? target.id.join(" | ") : target.id) : "Unknown";
	const context = instance ? { src: instance.src, range: node.range, filename: instance.filename } : null;

	// -- Structural Integrity (Self-Closing) ------------------------------ //
	if (rules.is_self_closing && (node.type === "Block" && (node.body && node.body.length > 0))) {
		transpilerError(
			[
				"<$red:Validation Error:$> ",
				`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:is self-closing and cannot have children (body).$>`
			],
			context
		);
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
			instance.filename = node.args?.filename || oldFilename;
			if (node.body) {
				node.body.forEach(child => validateNode(child));
			}
			instance.filename = oldFilename;
			return;
		}

		// 1. Identify Target
		if (node.id) {
			const target = mapperFile.get(node.id) || (mapperFile.getUnknownTag ? mapperFile.getUnknownTag(node) : null);
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
