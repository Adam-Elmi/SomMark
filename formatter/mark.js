class MarkdownBuilder {
	constructor() {}
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
			return `\n${"#".repeat(level)} ${text}\n`;
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
		return ` ${type === "image" ? "!" : ""}[${text}](${url + (title ? " " : "")}${title ? JSON.stringify(title) : ""}) `;
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
	codeBlock(code, language = "") {
		if (!code) return "";

		const normalizeContent = c => {
			if (Array.isArray(c)) return c.join("\n");
			if (typeof c === "string") return c;
			return "";
		};

		const content = normalizeContent(code);

		if (!content) return "";

		const lang = language ? language : "";
		return `\n\`\`\`${lang}\n${content}\`\`\`\n`;
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
		if (!text) return "";

		const special = /[\\*_{}\[\]()#+\-.!>|]/g;

		return text.replace(special, "\\$&");
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
				if (typeof row === "string") {
					columns = row.split(",").map(c => c.trim());
				} else if (Array.isArray(row)) {
					columns = row.map(c => String(c).trim());
				} else {
					return "";
				}

				if (columns.length > 0 && columns[0].startsWith("-")) {
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
