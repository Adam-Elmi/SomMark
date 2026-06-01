/**
 * Wraps runtime JavaScript logic inside target-specific scoped structures.
 * 
 * @param {string} code - The preprocessed javascript code.
 * @param {string} format - The active compilation target format (e.g., 'html', 'mdx').
 * @param {string|null} parentId - The unique tracking identifier of the parent element.
 * @param {boolean} isGlobal - Whether the script is at the root level or block-level.
 * @returns {string} - The formatted, target-scoped runtime code.
 */
export function wrapRuntimeLogic(code, format, parentId, isGlobal) {
	const trimmedCode = code
		.split("\n")
		.filter(line => line.trim() !== "")
		.join("\n");

	if (isGlobal || !parentId) {
		return `\n${trimmedCode}\n`;
	}

	const lowerFormat = format?.toLowerCase();
	if (lowerFormat === "html" || lowerFormat === "mdx") {
		const selfDefinition = `const self = document.querySelector('[data-sommark-id="${parentId}"]');`;
		return `\n(async function(){${selfDefinition}\nif (self) {\n${trimmedCode}\n}\n})();\n`;
	}

	// Fallback/Default for other formats: return the raw code untouched
	return `\n${trimmedCode}\n`;
}
