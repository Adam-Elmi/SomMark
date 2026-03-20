/**
 * SomMark Format Plugin
 * Cleans up and formats your SomMark code into a neat and readable style.
 */
export default {
	name: "sommark-format",
	type: "on-ast",
	author: "Adam-Elmi",
	description: "Cleans up and formats your SomMark code into a neat and readable style.",
	options: {
		indentString: "\t"
	},
	onAst(ast) {
		const indentStr = this.options?.indentString || "\t";
		// ========================================================================== //
		//  1. Escaping Helpers                                                      //
		// ========================================================================== //

		const escapeArg = (val, type) => {
			let escaped = String(val)
				.replace(/\\/g, "\\\\")
				.replace(/,/g, "\\,");

			if (type === "Block" || type === "AtBlock") {
				escaped = escaped.replace(/:/g, "\\:");
			}
			if (type === "AtBlock") {
				escaped = escaped.replace(/;/g, "\\;");
			}
			if (type === "Block" && escaped.startsWith("=")) {
				escaped = escaped.replace(/^=/, "\\=");
			}
			return escaped;
		};

		const escapeInlineValue = (val) => {
			return String(val)
				.replace(/\\/g, "\\\\")
				.replace(/\)/g, "\\)");
		};

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
		// ========================================================================== //
		//  2. Formatting Logic                                                      //
		// ========================================================================== //
		const shouldQuote = (val) => {
			if (typeof val !== "string") return false;
			return /[ \t\n\r,:[\]()@#]/.test(val);
		};

		const formatArgs = (args, type) => {
			if (!args || args.length === 0) return "";
			let usedKeys = new Set();
			let formattedArgs = [];

			for (let i = 0; i < args.length; i++) {
				let val = args[i];
				let matchedKey = null;
				if (type !== "Inline") {
					for (let key of Object.keys(args)) {
						if (isNaN(parseInt(key)) && args[key] === val && !usedKeys.has(key)) {
							matchedKey = key;
							usedKeys.add(key);
							break;
						}
					}
				}

				let escapedVal = escapeArg(val, type);
				if (shouldQuote(val)) {
					const quotedVal = String(val)
						.replace(/\\/g, "\\\\")
						.replace(/"/g, '\\"');
					escapedVal = `"${quotedVal}"`;
				}

				if (matchedKey) {
					formattedArgs.push(`${matchedKey}: ${escapedVal}`);
				} else {
					formattedArgs.push(escapedVal);
				}
			}

			let res = formattedArgs.join(", ");
			if (!res) return "";

			if (type === "Block") return " = " + res;
			if (type === "AtBlock") return ": " + res + ";";
			if (type === "Inline") return ": " + res;

			return res;
		};

		const formatBody = (body, depth) => {
			if (!body || !Array.isArray(body)) return "";
			const innerIndentStr = depth >= 0 ? indentStr.repeat(depth) : "";
			let result = "";
			let currentText = "";

			const flushText = () => {
				if (!currentText) return;
				let cleanText = currentText
					.replace(/[ \t]+/g, " ")             // collapse horizontal spaces
					.replace(/\n([ \t]*\n)+/g, "\n\n")   // preserve max 1 empty line (paragraphs)
					.trim();

				if (cleanText) {
					const indentedText = cleanText.split('\n').map(line => {
						return line.trim() ? innerIndentStr + line.trim() : "";
					}).join('\n');
					result += `${indentedText}\n`;
				}
				currentText = "";
			};

			for (let i = 0; i < body.length; i++) {
				const child = body[i];
				if (child.type === "Text") {
					let textStr = escapeText(child.text);

					// ========================================================================== //
					//  Separate Text from a preceding Inline statement                   //
					// ========================================================================== //
					if (i > 0 && body[i - 1].type === "Inline") {
						// Don't add space if the text starts with punctuation or already starts with whitespace
						if (textStr.length > 0 && !/^\s/.test(textStr) && !/^[.,!?;:\])}>"']/.test(textStr)) {
							textStr = " " + textStr;
						}
					}
					currentText += textStr;
				} else if (child.type === "Inline") {
					const argsStr = formatArgs(child.args, "Inline");
					const inlineVal = child.value ? String(child.value).trim() : "";
					const inlineStr = `(${escapeInlineValue(inlineVal)})->(${child.id}${argsStr})`;

					if (i > 0) {
						const prev = body[i - 1];
						if (prev.type === "Inline") {
							if (!/[ \t\n\r]$/.test(currentText)) currentText += " ";
						} else if (prev.type === "Text") {
							if (currentText.length > 0 && !/[ \t\n\r]$/.test(currentText)) {
								// Don't add space if text ends with opening punctuation/quotes
								if (!/[({\[<"']$/.test(currentText)) currentText += " ";
							}
						}
					}
					currentText += inlineStr;
				} else {
					// ========================================================================== //
					//  Helper: check if a block has no meaningful body content           //
					// ========================================================================== //
					const isEmptyBlock = (node) => {
						if (node.type !== "Block") return false;
						if (!node.body || node.body.length === 0) return true;
						// Body with only whitespace text nodes
						return node.body.every(
							n => n.type === "Text" && !n.text.trim()
						);
					};

					if (child.type === "Block" && isEmptyBlock(child)) {
						// Keep empty blocks inline with surrounding text
						const argsStr = formatArgs(child.args, "Block");
						const blockStr = `[${child.id}${argsStr}][end]`;

						if (i > 0) {
							const prev = body[i - 1];
							if (prev.type === "Text" || prev.type === "Inline") {
								if (currentText.length > 0 && !/[ \t\n\r]$/.test(currentText)) {
									if (!/[({\[<"']$/.test(currentText)) currentText += " ";
								}
							}
						}
						currentText += blockStr;
					} else {
						// ========================================================================== //
						//  Process Block, AtBlock, and Comment nodes                         //
						// ========================================================================== //
						flushText();
						if (child.type === "Block") {
							const argsStr = formatArgs(child.args, "Block");
							result += `${innerIndentStr}[${child.id}${argsStr}]\n`;
							result += formatBody(child.body, depth + 1);
							result += `${innerIndentStr}[end]\n`;
						} else if (child.type === "AtBlock") {
							const argsStr = formatArgs(child.args, "AtBlock");
							const atHeader = argsStr ? `@_${child.id}_@${argsStr}` : `@_${child.id}_@;`;
							result += `${innerIndentStr}${atHeader}\n`;
							if (child.content) {
								// ========================================================================== //
								//  Remove leading spaces from messy text block and re-indent         //
								// ========================================================================== //
								const lines = child.content.replace(/\r\n/g, '\n').split('\n');
								while (lines.length && !lines[0].trim()) lines.shift();
								while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

								let minIndent = Infinity;
								for (const line of lines) {
									if (line.trim()) {
										const leadingSpaces = line.match(/^[ \t]*/)[0].length;
										if (leadingSpaces < minIndent) minIndent = leadingSpaces;
									}
								}
								if (minIndent === Infinity) minIndent = 0;

								const indentedContent = lines.map(line => {
									if (!line.trim()) return "";
									return innerIndentStr + indentStr + line.substring(minIndent);
								}).join('\n');

								result += indentedContent + "\n";
							}
							result += `${innerIndentStr}@_end_@\n`;
						} else if (child.type === "Comment") {
							result += `${innerIndentStr}# ${child.text.replace(/^#+\s*/, "").trim()}\n`;
						}
					}
				}
			}
			flushText();
			return result;
		};

		const rootNodes = Array.isArray(ast) ? ast : [ast];

		// ========================================================================== //
		//  The formatted string is available via `plugin.formattedSource`            //
		// ========================================================================== //
		this.formattedSource = formatBody(rootNodes, 0).trim() + "\n";

		return ast; // Return original AST
	}
};
