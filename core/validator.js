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

class CustomError extends Error {
	constructor(message, name) {
		super(message);
		this.name = name;
		this.message = formatMessage(`<$cyan:[${this.name}]$>:`) + "\n" + formatMessage(message);
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

class ParserError extends CustomError {
	constructor(message) {
		super(message, "Parser Error");
	}
}

class LexerError extends CustomError {
	constructor(message) {
		super(message, "Lexer Error");
	}
}

class TranspilerError extends CustomError {
	constructor(message) {
		super(message, "Transpiler Error");
	}
}

class CLIError extends CustomError {
	constructor(message) {
		super(message, "CLI Error");
	}
}

class RuntimeError extends CustomError {
	constructor(message) {
		super(message, "Runtime Error");
	}
}

class SommarkError extends CustomError {
	constructor(message) {
		super(message, "SomMark Error");
	}
}

function getError(type) {
	const validate_msg = msg => Array.isArray(msg) && msg.length > 0;
	switch (type) {
		case "parser":
			return errorMessage => {
				if (validate_msg(errorMessage)) {
					throw new ParserError(errorMessage).message;
				}
			};
		case "transpiler":
			return errorMessage => {
				if (validate_msg(errorMessage)) {
					throw new TranspilerError(errorMessage).message;
				}
			};
		case "lexer":
			return errorMessage => {
				if (validate_msg(errorMessage)) {
					throw new LexerError(errorMessage).message;
				}
			};
		case "cli":
			return errorMessage => {
				if (validate_msg(errorMessage)) {
					throw new CLIError(errorMessage).message;
				}
			};
		case "runtime":
			return errorMessage => {
				if (validate_msg(errorMessage)) {
					throw new RuntimeError(errorMessage).message;
				}
			};
		case "sommark":
			return errorMessage => {
				if (validate_msg(errorMessage)) {
					throw new RuntimeError(errorMessage).message;
				}
			};
	}
}

const lexerError = getError("lexer");
const parserError = getError("parser");
const transpilerError = getError("transpiler");
const cliError = getError("cli");
const runtimeError = getError("runtime");
const sommarkError = getError("sommark");

function validateId(id) {
	if (!/^[a-zA-Z0-9]+$/.test(id)) {
		parserError([
			`{line}<$red:Invalid Identifier:$><$blue: '${id}'$>{N}<$yellow:Identifier must contain only letters and numbers$> <$cyan: (A–Z, a–z, 0–9).$>{line}`
		]);
	}
}

export { parserError, lexerError, transpilerError, validateId, cliError, runtimeError, sommarkError, formatMessage };
