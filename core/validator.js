import colorize from "../helpers/colorize.js";

function formatMessage(text) {
	/*
	Format:
	{line} = Horizontal line
	{N} = Newline
  <color: Text> = Colored Text

  [No Nest]
  -----------------------------
	Example: <$red: Expected token$> <$magenta: ']'$> {N} at line <$red: 1$> {N} column <$green: 2$> {line}
	*/
	const horizontal_rule = "\n----------------------------------------------------------------------------------------------\n";
	const pattern = /<\$([^:]+):([^$]+)\$>/g;

	if (Array.isArray(text)) {
		text = text.join("");
	}

	text = text.replace(pattern, (match, color, content) => {
		return colorize(color, content.trim());
	});
	text = text.replaceAll("{line}", horizontal_rule);
	text = text.replaceAll("{N}", "\n");

	text = text
		.split("\n")
		.filter(value => value !== "")
		.join("\n")
		.trim();

	return text;
}

class ParserError extends Error {
	constructor(message) {
		super(message);
		this.name = "Parser Error";
		this.message = formatMessage(`<$cyan:[${this.name}]$>:`) + "\n" + formatMessage(message);
	}
}
class TranspilerError extends Error {
	constructor(message) {
		super(message);
		this.name = "Transpiler Error";
		this.message = formatMessage(`<$cyan:[${this.name}]$>:`) + "\n" + formatMessage(message);
	}
}

function parserError(errorMessage) {
	if (Array.isArray(errorMessage) && errorMessage.length > 0) {
		throw new ParserError(errorMessage).message;
	}
}

function transpilerError(errorMessage) {
	if (Array.isArray(errorMessage) && errorMessage.length > 0) {
		throw new TranspilerError(errorMessage).message;
	}
}

function report(type, message) {
	const msg = formatMessage(message);
	switch (type) {
		case "parser":
			throw new ParserError(msg).message;
		case "transpiler":
			throw new TranspilerError(msg).message;
		default:
			throw new Error(msg).message;
	}
}

function validateId(id) {
	if (!/^[a-zA-Z]+$/.test(id)) {
		report(
			"parser",
			`{line}<$red:Invalid Identifier:$><$blue: '${id}'$>{N}<$yellow:Identifier must contain only letters$> <$cyan: (A–Z, a–z).$>{line}`
		);
	}
}

export { parserError, transpilerError, report, validateId };
