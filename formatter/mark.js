class MarkdownBuilder {
	constructor() { }
	// Headings
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
	// Url
	url(type = "", text, url = "", title = "") {
		if (!text && !url) {
			return "";
		}
		return ` ${type === "image" ? "!" : ""}[${text}](${url + (title ? " " : "")}${title}) `;
	}
	// Bold
	bold(text, is_underscore = false) {
		if (!text) {
			return "";
		}
		const format = is_underscore ? "__" : "**";
		return `${format}${text}${format}`;
	}
	// Italic
	italic(text, is_underscore = false) {
		if (!text) {
			return "";
		}
		const format = is_underscore ? "_" : "*";
		return `${format}${text}${format}`;
	}
	// Emphasis
	emphasis(text, is_underscore = false) {
		if (!text) {
			return "";
		}
		const format = is_underscore ? "___" : "***";
		return `${format}${text}${format}`;
	}
	// Code Block
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
	// Horizontal rule
	horizontal(format = "*") {
		if (!format) {
			return "\n***\n";
		}
		return format === "*" ? "\n***\n" : format === "_" ? "___" : format === "*" ? "***" : "";
	}
	// Escape
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
	// Table
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
				let newRow = row;
				if (newRow.charAt(0) !== "-") {
					newRow = `- ${newRow}`;
				}
				newRow = newRow.replaceAll(/[,-]/g, " |");
				if (newRow.trim().charAt(1) !== " ") {
					newRow = newRow.trim().slice(0, 1) + " " + newRow.trim().slice(1);
				}
				return newRow.trim();
			});
			for (const row of rows) {
				result += `${row} |\n`;
			}
		}
		return result + "\n";
	}
}
export default MarkdownBuilder;
