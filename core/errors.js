import colorize from "../helpers/colorize.js";

/**
 * SomMark Errors
 * Handles formatting and throwing errors with beautiful CLI coloring and pointers.
 */

// ========================================================================== //
//  Message Formatting                                                       //
// ========================================================================== //

/**
 * Processes a message by applying colors and formatting.
 * Supports:
 * - {line} : Adds a horizontal line
 * - {N} : Adds a new line
 * - <$color: Text$> : Adds color (red, yellow, green, blue, magenta, cyan)
 * 
 * @param {string|string[]} text - The message or list of message parts to format.
 * @returns {string} - The final formatted and colored string.
 */
function formatMessage(text) {
	const horizontal_rule = "\n----------------------------------------------------------------------------------------------\n";
	const pattern = /<\$([^:]+):([\s\S]*?)\$>/g;

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

/**
 * Creates a detailed error message showing where the error happened in the code.
 * It adds a line number, a snippet of the code, and a pointer (^) to the exact spot.
 * 
 * @param {string} src - The original code being parsed.
 * @param {Object} range - The location of the error (line and character).
 * @param {string|null} filename - The name of the file (optional).
 * @param {string|string[]} message - The error message to show.
 * @param {string} typeName - The type of error (e.g., "Lexer" or "Parser").
 * @returns {string[]} - A list of message parts that make up the final error report.
 */
function formatErrorWithContext(src, range, filename, message, typeName) {
	if (!src || !range || !range.start) return message;

	const lines = src.split("\n");
	const lineIndex = range.start.line;
	const lineContent = lines[lineIndex] || "";
	const pointerPadding = " ".repeat(range.start.character);
	const sourceLabel = filename ? ` [${filename}]` : "";

	const rangeInfo =
		range.start.line === range.end.line
			? `from column <$yellow:${range.start.character}$> to <$yellow:${range.end.character}$>`
			: `from line <$yellow:${range.start.line + 1}$>, column <$yellow:${range.start.character}$> to line <$yellow:${range.end.line + 1}$>, column <$yellow:${range.end.character}$>`;

	const formattedMessage = [
		`<$blue:{line}$><$red:Here where error occurred${sourceLabel}:$>{N}${lineContent}{N}${pointerPadding}<$yellow:^$>{N}{N}`,
		`<$red:${typeName} Error:$> `,
		...(Array.isArray(message) ? message : [message]),
		`{N}at line <$yellow:${range.start.line + 1}$>, ${rangeInfo}{N}`,
		"<$blue:{line}$>"
	];

	return formattedMessage;
}

// ========================================================================== //
//  Error Classes                                                            //
// ========================================================================== //

/** Base class for all SomMark errors that automatically formats messages for the terminal. */
class CustomError extends Error {
	/**
	 * Creates a new error.
	 * 
	 * @param {string|string[]} message - The text describing what went wrong.
	 * @param {string} name - The name of the error type.
	 */
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
	constructor(message) { super(message, "Parser Error"); }
}

class LexerError extends CustomError {
	constructor(message) { super(message, "Lexer Error"); }
}

class TranspilerError extends CustomError {
	constructor(message) { super(message, "Transpiler Error"); }
}

class CLIError extends CustomError {
	constructor(message) { super(message, "CLI Error"); }
}

class RuntimeError extends CustomError {
	constructor(message) { super(message, "Runtime Error"); }
}

class SommarkError extends CustomError {
	constructor(message) { super(message, "SomMark Error"); }
}

// ========================================================================== //
//  Error Dispatcher (Helper)                                               //
// ========================================================================== //

/**
 * A helper that creates an error "dispatcher" for a specific category.
 * 
 * @param {string} type - The category of error (e.g., 'lexer', 'parser').
 * @returns {Function} - A function that throws the formatted error.
 */
function getError(type) {
	const validate_msg = msg => (Array.isArray(msg) && msg.length > 0) || typeof msg === "string";
	const typeNames = {
		parser: "Parser",
		transpiler: "Transpiler",
		lexer: "Lexer",
		cli: "CLI",
		runtime: "Runtime",
		sommark: "SomMark"
	};
	const ErrorClasses = {
		parser: ParserError,
		transpiler: TranspilerError,
		lexer: LexerError,
		cli: CLIError,
		runtime: RuntimeError,
		sommark: SommarkError
	};

	return (errorMessage, context = null) => {
		if (validate_msg(errorMessage)) {
			let finalMessage = errorMessage;
			if (context && context.src && context.range) {
				finalMessage = formatErrorWithContext(
					context.src,
					context.range,
					context.filename,
					errorMessage,
					typeNames[type]
				);
			}
			throw new ErrorClasses[type](finalMessage).message;
		}
	};
}

/** Helper to throw Lexer errors. */
const lexerError = getError("lexer");

/** Helper to throw Parser errors. */
const parserError = getError("parser");

/** Helper to throw Transpiler errors. */
const transpilerError = getError("transpiler");

/** Helper to throw CLI errors. */
const cliError = getError("cli");

/** Helper to throw Runtime or Module errors. */
const runtimeError = getError("runtime");

/** Helper to throw general internal SomMark errors. */
const sommarkError = getError("sommark");

export { parserError, lexerError, transpilerError, cliError, runtimeError, sommarkError, formatMessage };
