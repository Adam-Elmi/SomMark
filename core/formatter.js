import { IMPORT, USE_MODULE, TEXT, INLINE, BLOCK, ATBLOCK, COMMENT } from "./labels.js";

/**
 * Turns an AST back into a clean SomMark source string.
 * This is useful for "pretty-printing" or saving changes back to a file.
 * 
 * @param {Object[]|Object} ast - The AST or single node to turn into text.
 * @param {Object} [options] - Optional settings for formatting.
 * @returns {string} - The final SomMark source code.
 */
export function formatAST(ast, options = {}) {
	const indentStr = options.indentString || "\t";

	// -- Escaping Helpers ----------------------------------------------------- //
	
	/**
	 * Escapes special characters in argument values so they don't break the syntax.
	 * 
	 * @param {any} val - The value to escape.
	 * @param {string} type - The type of tag (e.g., Block or Inline).
	 * @returns {string} - The safely escaped text.
	 */
	const escapeArg = (val, type) => {
		let escaped = String(val).replace(/\\/g, "\\\\").replace(/,/g, "\\,");
		if (type === BLOCK || type === ATBLOCK) escaped = escaped.replace(/:/g, "\\:");
		if (type === ATBLOCK) escaped = escaped.replace(/;/g, "\\;");
		if (type === BLOCK && escaped.startsWith("=")) escaped = escaped.replace(/^=/, "\\=");
		return escaped;
	};

	/**
	 * Escapes characters in the left side of an inline statement (the text in parentheses).
	 * 
	 * @param {any} val - The text inside parentheses.
	 * @returns {string} - The safely escaped text.
	 */
	const escapeInlineValue = (val) => String(val).replace(/\\/g, "\\\\").replace(/\)/g, "\\)");

	/**
	 * Escapes special characters in plain text so they aren't mistaken for SomMark tags.
	 * 
	 * @param {string} str - The raw text to escape.
	 * @returns {string} - The safe text.
	 */
	const escapeText = (str) => {
		return String(str)
			.replace(/\\/g, "\\\\")
			.replace(/\[/g, "\\[")
			.replace(/\]/g, "\\]")
			.replace(/\(/g, "\\(")
			.replace(/\)/g, "\\)")
			.replace(/->/g, "\\->")
			.replace(/@_/g, "\\@_")
			.replace(/_@/g, "\\_@")
			.replace(/#/g, "\\#");
	};

	/**
	 * Checks if a value needs to be wrapped in double quotes (like if it has spaces or commas).
	 * 
	 * @param {any} val - The value to check.
	 * @returns {boolean} - True if quotes are needed.
	 */
	const shouldQuote = (val) => {
		if (typeof val !== "string") return false;
		return /[ \t\n\r,:[\]()@#]/.test(val);
	};

	// -- Formatting Logic ----------------------------------------------------- //
	
	/**
	 * Formats the arguments of a node into a SomMark string (e.g., "= key: value, 123").
	 * 
	 * @param {Object} args - The list of arguments to format.
	 * @param {string} type - The type of tag.
	 * @returns {string} - The final formatted argument string.
	 */
	const formatArgs = (args, type) => {
		if (!args || Object.keys(args).length === 0) return "";
		let usedKeys = new Set();
		let formattedArgs = [];

		const keys = Object.keys(args);
		const positionalCount = keys.filter(k => !isNaN(parseInt(k))).length;

		for (let i = 0; i < positionalCount; i++) {
			let val = args[i];
			let matchedKey = null;

			// Find if this value has a named alias
			if (type !== INLINE) {
				for (const key of keys) {
					if (isNaN(parseInt(key)) && args[key] === val && !usedKeys.has(key)) {
						matchedKey = key;
						usedKeys.add(key);
						break;
					}
				}
			}

			let escapedVal = escapeArg(val, type);
			if (shouldQuote(val)) {
				const quotedVal = String(val).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
				escapedVal = `"${quotedVal}"`;
			}

			if (matchedKey) formattedArgs.push(`${matchedKey}: ${escapedVal}`);
			else formattedArgs.push(escapedVal);
		}

		const res = formattedArgs.join(", ");
		if (!res) return "";

		if (type === BLOCK || type === IMPORT || type === USE_MODULE) return " = " + res;
		if (type === ATBLOCK) return ": " + res + ";";
		if (type === INLINE) return ": " + res;
		return res;
	};

	/**
	 * Formats a list of nodes (like the body of a block) into indented SomMark source.
	 * It also handles the correct spacing between text and inline tags.
	 * 
	 * @param {Object[]} body - The list of content nodes.
	 * @param {number} depth - How far to indent the text.
	 * @returns {string} - The final formatted text content.
	 */
	const formatBody = (body, depth) => {
		if (!body || !Array.isArray(body)) return "";
		const innerIndentStr = depth >= 0 ? indentStr.repeat(depth) : "";
		let result = "";
		let currentText = "";

		const flushText = () => {
			if (!currentText) return;
			const cleanText = currentText
				.replace(/[ \t]+/g, " ")
				.replace(/\n([ \t]*\n)+/g, "\n\n")
				.trim();

			if (cleanText) {
				const indentedText = cleanText.split("\n").map(line => {
					return line.trim() ? innerIndentStr + line.trim() : "";
				}).join("\n");
				result += `${indentedText}\n`;
			}
			currentText = "";
		};

		for (let i = 0; i < body.length; i++) {
			const child = body[i];
			if (child.type === TEXT) {
				let textStr = escapeText(child.text);
				if (i > 0 && body[i - 1].type === INLINE) {
					if (textStr.length > 0 && !/^\s/.test(textStr) && !/^[.,!?;:\])}>"']/.test(textStr)) {
						textStr = " " + textStr;
					}
				}
				currentText += textStr;
			} else if (child.type === INLINE) {
				const argsStr = formatArgs(child.args, INLINE);
				const inlineVal = child.value ? String(child.value).trim() : "";
				const inlineStr = `(${escapeInlineValue(inlineVal)})->(${child.id}${argsStr})`;
				if (i > 0) {
					const prev = body[i - 1];
					if (prev.type === INLINE) { if (!/[ \t\n\r]$/.test(currentText)) currentText += " "; }
					else if (prev.type === TEXT) { if (currentText.length > 0 && !/[ \t\n\r]$/.test(currentText) && !/[({\[<"']$/.test(currentText)) currentText += " "; }
				}
				currentText += inlineStr;
			} else {
				flushText();
				if (child.type === BLOCK) {
					const argsStr = formatArgs(child.args, BLOCK);
					// Check if it's a self-closing block (Rules support)
					const isSelfClosing = child.rules?.is_self_closing;
					if (isSelfClosing && (!child.body || child.body.length === 0)) {
						result += `${innerIndentStr}[${child.id}${argsStr}][end]\n`;
					} else {
						result += `${innerIndentStr}[${child.id}${argsStr}]\n`;
						result += formatBody(child.body, depth + 1);
						result += `${innerIndentStr}[end]\n`;
					}
				} else if (child.type === ATBLOCK) {
					const argsStr = formatArgs(child.args, ATBLOCK);
					const atHeader = argsStr ? `@_${child.id}_@${argsStr}` : `@_${child.id}_@;`;
					result += `${innerIndentStr}${atHeader}\n`;
					if (child.content) {
						const lines = child.content.replace(/\r\n/g, "\n").split("\n");
						while (lines.length && !lines[0].trim()) lines.shift();
						while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
						let minIndent = Infinity;
						for (const line of lines) { if (line.trim()) { const leading = line.match(/^[ \t]*/)[0].length; if (leading < minIndent) minIndent = leading; } }
						if (minIndent === Infinity) minIndent = 0;
						const indentedContent = lines.map(line => line.trim() ? innerIndentStr + indentStr + line.substring(minIndent) : "").join("\n");
						result += indentedContent + "\n";
					}
					result += `${innerIndentStr}@_end_@\n`;
				} else if (child.type === COMMENT) {
					result += `${innerIndentStr}# ${child.text.replace(/^#+\s*/, "").trim()}\n`;
				} else if (child.type === IMPORT) {
					const argsStr = formatArgs(child.args, IMPORT);
					result += `${innerIndentStr}[import${argsStr}][end]\n`;
				} else if (child.type === USE_MODULE) {
					const argsStr = formatArgs(child.args, USE_MODULE);
					result += `${innerIndentStr}[$use-module${argsStr}][end]\n`;
				}
			}
		}
		flushText();
		return result;
	};

	const rootNodes = Array.isArray(ast) ? ast : [ast];
	return formatBody(rootNodes, 0).trim() + "\n";
}
