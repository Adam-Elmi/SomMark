class MarkdownBuilder {
	constructor() { }
	// ========================================================================== //
	//  Headings                                                                  //
	// ========================================================================== //
	heading(text, level) {
		if (!text && !level) {
			return "";
		}
		const min = 1,
			max = 6;
		if (typeof text === "string" && (typeof level === "number" || typeof level === "string")) {
			if (typeof level === "string") {
				level = Number(level);
			}
			if (level > max) {
				level = max;
			} else if (level < min) {
				level = min;
			}
			return `${"#".repeat(level)} ${text}\n`;
		}
		return text;
	}
	// ========================================================================== //
	//  Url                                                                       //
	// ========================================================================== //
	url(type = "", text, url = "", title = "") {
		if (!text && !url) {
			return "";
		}
		return ` ${type === "image" ? "!" : ""}[${text}](${url + (title ? " " : "")}${title}) `;
	}
	// ========================================================================== //
	//  Bold                                                                      //
	// ========================================================================== //
	bold(text, is_underscore = false) {
		if (!text) {
			return "";
		}
		const format = is_underscore ? "__" : "**";
		return `${format}${text}${format}`;
	}
	// ========================================================================== //
	//  Italic                                                                    //
	// ========================================================================== //
	italic(text, is_underscore = false) {
		if (!text) {
			return "";
		}
		const format = is_underscore ? "_" : "*";
		return `${format}${text}${format}`;
	}
	// ========================================================================== //
	//  Emphasis                                                                  //
	// ========================================================================== //
	emphasis(text, is_underscore = false) {
		if (!text) {
			return "";
		}
		const format = is_underscore ? "___" : "***";
		return `${format}${text}${format}`;
	}
	// ========================================================================== //
	//  Code Block                                                                //
	// ========================================================================== //
	codeBlock(code, language) {
		if (!code) {
			return "";
		}
		const blocks = [];
		if (Array.isArray(code)) {
			for (const code_block of code) {
				blocks.push(code_block);
			}
			if (!language) {
				return "\n```" + "\n" + blocks.join("\n") + "\n```\n";
			}
			return "\n```" + language + "\n" + blocks.join("\n") + "\n```\n";
		} else if (typeof code === "string") {
			if (!language) {
				return "\n```" + "\n" + code + "\n```\n";
			}
			return "\n```" + language + "\n" + code + "\n```\n";
		}
		if (!code && !language) {
			return "";
		}
	}
	// ========================================================================== //
	//  Horizontal rule                                                           //
	// ========================================================================== //
	horizontal(format = "*") {
		return `\n${format.repeat(3)}\n`;
	}
	// ========================================================================== //
	//  Escape                                                                    //
	// ========================================================================== //
	escape(text) {
		const special_char = ["\\", "*", "_", "{", "}", "[", "]", "(", ")", "#", "+", "-", ".", "!", ">", "|"];
		if (!text) {
			return "";
		}

		text = text
			.split("")
			.map(char => {
				if (special_char.includes(char)) {
					return `\\${char}`;
				}
				return char;
			})
			.join("");
		return text;
	}
	// ========================================================================== //
	//  Table                                                                     //
	// ========================================================================== //
	table(headers, rows) {
		let result = "\n\n";
		const isNotEmptyArray = arr => Array.isArray(arr) && arr.length > 0;
		if (isNotEmptyArray(headers) && isNotEmptyArray(rows)) {
			for (let i = 0; i < headers.length; i++) {
				const header = headers[i];
				result += i === 0 ? `| ${header} |` : ` ${header} |${i === headers.length - 1 ? "\n" : ""}`;
			}
			for (let i = 0; i < headers.length; i++) {
				const header = headers[i];
				result +=
					i === 0
						? `|${"-".repeat(header.length + 2)}|`
						: `${"-".repeat(header.length + 2)}|${i === headers.length - 1 ? "\n" : ""}`;
			}
			rows = rows.map(row => {
				let columns;
				if (typeof row === 'string') {
					columns = row.split(',').map(c => c.trim());
				} else if (Array.isArray(row)) {
					columns = row.map(c => String(c).trim());
				} else {
					return "";
				}

				if (columns.length > 0 && columns[0].startsWith('-')) {
					columns[0] = `- ${columns[0].substring(1).trim()}`;
				}

				return `| ${columns.join(" | ")}`;
			});
			for (const row of rows) {
				result += `${row} |\n`;
			}
		}
		return result + "\n";
	}
	// ========================================================================== //
	//  Todo                                                                      //
	// ========================================================================== //
	todo(checked = false, text) {
		if (!text) return "";
		return checked ? `- [x] ${text}\n` : `- [ ] ${text}\n`;
	}
}
export default MarkdownBuilder;
