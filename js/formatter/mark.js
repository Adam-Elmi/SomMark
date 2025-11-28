class MarkdownBuilder {
	constructor() {
	}
	// Headings
	heading(text, level) {
		// Heading levels:
		// level 1 -> #
		// level 2 -> ##
		// level 3 -> ###
		// level 4 -> ####
		// level 5 -> #####
		// level 6 -> ######
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
}
function url(type = "", text, url, title = "") {
	/*
	Format:
	[text](url "optional title")
	----------------------------
	Example:
	[SomCheat](https://www.somcheat.dev "SomCheat site")
	----------------------------
	Info:
	Optional title: is used for tooltip
	*/
	if (!text && !url) {
		return "";
	}
	return `${type === "image" ? "!" : ""}[${text}](${url + (title ? " " : "")}${title})`;
}
function codeBlock(code, language) {
	/*
	Format:
	``` + language
	...code block..
	```
	Example:
	```js
	console.log('Hello from SomMark');
	```
	*/
	if (!code) {
		return "";
	}
	const blocks = [];
	if (Array.isArray(code)) {
		for (const code_block of code) {
			blocks.push(code_block);
		}
		if (!language) {
			return "```" + "\n" + blocks.join("\n") + "\n```";
		}
		return "```" + language + "\n" + blocks.join("\n") + "\n```";
	} else if (typeof code === "string") {
		if (!language) {
			return "```" + "\n" + code + "\n```";
		}
		return "```" + language + "\n" + code + "\n```";
	}
	if (!code && !language) {
		return "";
	}
}
function bold(text, is_underscore = false) {
	/*
 Example: **text** or __text__
*/
	if (!text) {
		return "";
	}
	const format = is_underscore ? "__" : "**";
	return `${format}${text}${format}`;
}
function italic(text) {
	/*
 Example: *text* or _text_
*/
	if (!text) {
		return "";
	}
	const format = is_underscore ? "_" : "*";
	return `${format}${text}${format}`;
}
function boldItalic(text) {
	/*
Bold and Italic
Example: ***text***
*/
	if (!text) {
		return "";
	}
	const format = is_underscore ? "___" : "***";
	return `${format}${text}${format}`;
}
function horizontal(format = "*" || "_" || "-") {
	/*
 Format: --- or ___ or ***
 */
	if (!format) {
		return "\n***\n";
	}
	return format === "*" ? "\n***\n" : format === "_" ? "___" : format === "*" ? "***" : "";
}
function escape(text, char) {
	/*
  Special characters:
  `\` `*` `_` `{` `}` `[` `]` `(` `)` `#` `+` `-` `.` `!` `>` `|`
  */
	if (!text) {
		return "";
	}
	if (text && !char) {
		return text;
	}
	text = text.replaceAll(char, `\\${char}`);
	return text;
}
function list() {
	/*
  Unordered list:
  - Item 1
  - Item 2
    - Nested item
      - Nested item
  - Item 3
  - Item 4
 	----------------------------
  1. First
  2. Second
     1. Nested
      1. Nested
  3. Third
  4. Four
  5. Five
  */
}
function table() {
	/*
Example:
| Name  | Age | City       |
|-------|-----|------------|
| Adam  | 23  | Hargeisa   |
| Elmi  | 30  | Hargeisa   |
*/
}
function blockQuote() {}
export default MarkdownBuilder;