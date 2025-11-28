import colorize from "../helpers/colorize.js";

function formatMessage(text) {
	/*
  Format:
  {line} = Horizontal line
  {N} = Newline
  <color: Text> = Colored Text
  -----------------------------
  Example:
   <red: Expected token> <magenta: ']'> {N} at line <red: 1> {N} column <green: 2> {line}
  */
	const horizontal_rule = "\n----------------------------------------------------------------------------------------------\n";
	const pattern = /\n*<[^>]+>\n*/g;
	const color_pattern = /<([^:>]+):/;
	if (text) {
		if (Array.isArray(text)) {
			text = text.join("");
		}
		const m = text.match(pattern);
		for (let matchedText of m) {
			let color = color_pattern.exec(matchedText)[0];
			matchedText = matchedText.replace(color_pattern, "").replace(">", "");
			text = text.replace(color_pattern, "").replace(">", "");
			color = color.replace("<", "").replace(":", "");
			text = text.replace(matchedText, colorize(color, matchedText));
		}
	}

	text = text
		.split("\n")
		.filter(value => value !== "")
		.join(" ");
	text = text.replaceAll("{line}", horizontal_rule);
	text = text.replaceAll("{N}", "\n").trim();
	return text;
}

class ParserError extends Error {
	constructor(message) {
		super(message);
		this.name = "ParserError";
		this.message = formatMessage(`<cyan:[${this.name}]>:`) + "\n" + formatMessage(message);
	}
}

function parserError(token, line, start, end) {
	const errorMessage = [
		`{line}<red:Expected token> <blue:'${token}'> at line <yellow: ${line}>, `,
		`from column <yellow: ${start}>  to <yellow:  ${end}> `,
		"{line}"
	];
	throw new ParserError(errorMessage).message;
}

export { parserError };
