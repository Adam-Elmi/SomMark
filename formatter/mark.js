/**
 * MarkdownBuilder - A utility class for generating Markdown strings from structured data.
 * Used primarily by the Markdown mapper to produce formatted text.
 */
class MarkdownBuilder {
	constructor() { }

	/**
	 * Formats text as a Markdown heading.
	 * @param {string} text - The heading content.
	 * @param {number|string} [level=1] - The heading level (1-6).
	 * @returns {string} - Formatted heading string.
	 */
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
			return `${"#".repeat(level)} ${text}`;
		}
		return text;
	}

	/**
	 * Formats a Markdown link or image.
	 * @param {string} [type=""] - The link type ("image" for '!', otherwise empty).
	 * @param {string} text - The display text or alt text.
	 * @param {string} [url=""] - The target URL.
	 * @param {string} [title=""] - Optional hover title.
	 * @returns {string} - Formatted Markdown link/image string.
	 */
	url(type = "", text, url = "", title = "") {
		if (!text && !url) {
			return "";
		}
		return `${type === "image" ? "!" : ""}[${text}](${url + (title ? " " : "")}${title ? JSON.stringify(title) : ""})`;
	}

	/**
	 * Formats text as bold.
	 * @param {string} text - The content to bold.
	 * @param {boolean} [is_underscore=false] - Use underscores ('__') instead of asterisks ('**').
	 * @returns {string} - Formatted bold string.
	 */
	bold(text, is_underscore = false) {
		if (!text) {
			return "";
		}
		const format = is_underscore ? "__" : "**";
		return `${format}${text}${format}`;
	}

	/**
	 * Formats text as italic (emphasis).
	 * @param {string} text - The content to italicize.
	 * @param {boolean} [is_underscore=false] - Use underscores ('_') instead of asterisks ('*').
	 * @returns {string} - Formatted italic string.
	 */
	italic(text, is_underscore = false) {
		if (!text) {
			return "";
		}
		const format = is_underscore ? "_" : "*";
		return `${format}${text}${format}`;
	}

	/**
	 * Formats text as bold-italic (strong emphasis).
	 * @param {string} text - The content to emphasize.
	 * @param {boolean} [is_underscore=false] - Use underscores ('___') instead of asterisks ('***').
	 * @returns {string} - Formatted emphasized string.
	 */
	emphasis(text, is_underscore = false) {
		if (!text) {
			return "";
		}
		const format = is_underscore ? "___" : "***";
		return `${format}${text}${format}`;
	}

	/**
	 * Formats text with strikethrough.
	 * @param {string} text - The content to strike.
	 * @returns {string} - Formatted strikethrough string.
	 */
	strike(text) {
		if (!text) {
			return "";
		}
		return `~~${text}~~`;
	}

	/**
	 * Formats source code as a Markdown fenced code block.
	 * @param {string|Array} code - The code content.
	 * @param {string} [language=""] - The language identifier for syntax highlighting.
	 * @returns {string} - Formatted code block string.
	 */
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
		return `\n\`\`\`${lang}\n${content.trim()}\n\`\`\``;
	}

	/**
	 * Formats a Markdown horizontal rule.
	 * @param {string} [format="*"] - The character to use for the rule.
	 * @returns {string} - Formatted horizontal rule string.
	 */
	horizontal(format = "*") {
		return `\n${format.repeat(3)}`;
	}

	/**
	 * Escapes special Markdown characters to prevent unintended formatting.
	 * @param {string} text - The text to escape.
	 * @returns {string} - Escaped text string.
	 */
	escape(text) {
		if (!text) return "";

		const special = /[\\*_{}\[\]()#+\-.!>|~`]/g;

		return text.replace(special, "\\$&");
	}

	/**
	 * Smartly escapes text to prevent unintended Markdown/HTML formatting
	 * while keeping "innocent" symbols clean (e.g., math, solo symbols).
	 * 
	 * @param {string} text - The raw text to escape.
	 * @returns {string} - The safely escaped text.
	 */
	smartEscaper(text) {
		if (!text) return "";

		// 1. Literal backslashes must stay literal
		let result = text.replace(/\\/g, "\\\\");

		// 2. HTML Tags: Detect <tag ... > or </tag>
		// We do this BEFORE escaping & to prevent &amp;lt;
		result = result.replace(/<([a-zA-Z\/][^>]*?)>/g, "&lt;$1&gt;");

		// 3. Basics: Escape ampersands and quotes
		// We use a lookahead to avoid double-escaping the '&' in '&lt;' and '&gt;' we just created
		result = result.replace(/&(?!lt;|gt;)/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");

		// 4. Markdown Heading Triggers: # at the start of a line
		result = result.replace(/^#{1,6}\s+/gm, "\\$&");

		// 5. Markdown List Triggers: -, *, +, or 1. at the start of a line
		result = result.replace(/^([-*+]\s+)/gm, "\\$1");
		result = result.replace(/^(\d+\.\s+)/gm, "\\$1");

		// 6. Emphasis Triggers: *text*, **text**, _text_, ~~text~~
		// We look for balanced wrappers around non-whitespace content.
		result = result.replace(/(\*+|_+|~~)(\S[\s\S]*?\S)\1/g, (match, prefix, content) => {
			const escapedPrefix = prefix.split("").map(c => "\\" + c).join("");
			return escapedPrefix + content + escapedPrefix;
		});

		// 7. Horizontal Rule Triggers: ---, ***, ___ on their own line
		result = result.replace(/^([*_-]{3,})\s*$/gm, "\\$1");

		return result;
	}




	/**
	 * Formats data as a Markdown table.
	 * @param {Array<string>} headers - The table column headers.
	 * @param {Array<string|Array>} rows - The table row data.
	 * @returns {string} - Formatted Markdown table string.
	 */
	table(headers, rows) {
		let result = "";
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
						? `| --- |`
						: ` --- |${i === headers.length - 1 ? "\n" : ""}`;
			}
			rows = rows.map(row => {
				let columns;
				if (typeof row === "string") {
					columns = row.split(/(?<!\\),/).map(c => c.trim().replace(/\\(.)/g, "$1"));
				} else if (Array.isArray(row)) {
					columns = row.map(c => String(c).trim().replace(/\\(.)/g, "$1"));
				} else {
					return "";
				}

				if (columns.length > 0 && columns[0].startsWith("-")) {
					columns[0] = `- ${columns[0].substring(1).trim()}`;
				}

				return `| ${columns.join(" | ")}`;
			});
			for (let i = 0; i < rows.length; i++) {
				const row = rows[i];
				result += `${row} |${i === rows.length - 1 ? "" : "\n"}`;
			}
		}
		return result;
	}

	/**
	 * Formats a task list item.
	 * @param {boolean|string} [status=false] - The task status (true, "x", or "done" for checked).
	 * @param {string} text - The task description.
	 * @returns {string} - Formatted task list item string.
	 */
	todo(status = false, text) {
		if (!text) return "";
		let checked = status;
		if (typeof status === "string") {
			const s = status.trim().toLowerCase();
			checked = s === "x" || s === "done";
		}
		return checked ? `- [x] ${text}` : `- [ ] ${text}`;
	}

	/**
	 * Formats an unordered Markdown list.
	 * @param {Array<string>} items - The list items.
	 * @param {number} [depth=0] - The nesting depth for indentation.
	 * @param {string} [marker="-"] - The bullet point character.
	 * @returns {string} - Formatted unordered list string.
	 */
	unorderedList(items, depth = 0, marker = "-") {
		if (!Array.isArray(items)) return "";
		const indent = "  ".repeat(depth);
		return items.map(item => `${indent}${marker} ${item.replace(/\n/g, "\n" + indent + "  ")}`).join("\n");
	}

	/**
	 * Formats an ordered Markdown list.
	 * @param {Array<string>} items - The list items.
	 * @param {number} [depth=0] - The nesting depth for indentation.
	 * @returns {string} - Formatted ordered list string.
	 */
	orderedList(items, depth = 0) {
		if (!Array.isArray(items)) return "";
		const indent = "  ".repeat(depth);
		return items.map((item, i) => `${indent}${i + 1}. ${item.replace(/\n/g, "\n" + indent + "  ")}`).join("\n");
	}

	/**
	 * Formats text as a Markdown blockquote or GFM alert (admonition).
	 * @param {string} content - The content to quote.
	 * @param {string} [type=""] - The alert type ("note", "tip", "important", "caution", "warning").
	 * @returns {string} - Formatted blockquote string.
	 */
	/**
	 * Formats text as a Markdown blockquote or GFM alert (admonition).
	 * @param {string} content - The content to quote.
	 * @param {string} [type=""] - The alert type ("note", "tip", "important", "caution", "warning").
	 * @returns {string} - Formatted blockquote string.
	 */
	quote(content, type = "") {
		if (!content) return "";

		const alertTypes = ["note", "tip", "important", "caution", "warning"];
		const alertType = type ? type.toLowerCase().trim() : "";
		const isAlert = alertTypes.includes(alertType);

		const cleanContent = content.trim();

		const prefix = isAlert ? `[!${alertType.toUpperCase()}]\n` : "";

		const fullText = prefix + cleanContent;
		const lines = fullText.split(/\r?\n/);

		return lines.map(line => `> ${line}`).join("\n");
	}
}
export default MarkdownBuilder;
