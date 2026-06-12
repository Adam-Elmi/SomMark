/**
 * Token Types in SomMark.
 * These represent the basic lexical atoms identified by the lexer.
 * 
 * @constant {Object}
 * @property {string} OPEN_BRACKET - '[' char.
 * @property {string} CLOSE_BRACKET - ']' char.
 * @property {string} END_KEYWORD - 'end' value.
 * @property {string} IDENTIFIER - Block or inline name (e.g. 'Person', 'import', '$use-module').
 * @property {string} EQUAL - '=' char.
 * @property {string} VALUE - Data values. Encapsulates Quoted Strings ("...") and Prefix Layers (js{}, p{}).
 * @property {string} TEXT - Plain unformatted text content.
 * @property {string} THIN_ARROW - '->' sequence.
 * @property {string} OPEN_PAREN - '(' char.
 * @property {string} CLOSE_PAREN - ')' char.
 * @property {string} OPEN_AT - '@_' sequence (At-Block start).
 * @property {string} CLOSE_AT - '_@' sequence (At-Header end).
 * @property {string} COLON - ':' char.
 * @property {string} COMMA - ',' char.
 * @property {string} SEMICOLON - ';' char (At-Block separator).
 * @property {string} COMMENT - '#' comments.
 * @property {string} COMMENT_BLOCK - '###' comments.
 * @property {string} ESCAPE - '\' char. Used for literalizing structural chars like '\"' or '\['.
 * @property {string} QUOTE - '"' delimiter.
 * @property {string} EXCLAMATION_MARK - '!' char.
 * @property {string} IMPORT - 'import' keyword.
 * @property {string} USE_MODULE - '$use-module' keyword.
 * @property {string} PREFIX_JS - 'js{}' prefix layer.
 * @property {string} PREFIX_P - 'p{}' placeholder layer.
 * @property {string} PREFIX_V - 'v{}' local variable layer.
 * @property {string} EOF - End of File indicator.
 */
const TOKEN_TYPES = {
  OPEN_BRACKET: "OPEN_BRACKET",
  CLOSE_BRACKET: "CLOSE_BRACKET",
  END_KEYWORD: "END_KEYWORD",
  IMPORT: "IMPORT",
  USE_MODULE: "USE_MODULE",
  IDENTIFIER: "IDENTIFIER",
  EQUAL: "EQUAL",
  VALUE: "VALUE",
  QUOTE: "QUOTE",
  PREFIX_JS: "PREFIX_JS",
  PREFIX_P: "PREFIX_P",
  PREFIX_V: "PREFIX_V",
  TEXT: "TEXT",
  THIN_ARROW: "THIN_ARROW",
  OPEN_PAREN: "OPEN_PAREN",
  CLOSE_PAREN: "CLOSE_PAREN",
  OPEN_AT: "OPEN_AT",
  CLOSE_AT: "CLOSE_AT",
  COLON: "COLON",
  COMMA: "COMMA",
  SEMICOLON: "SEMICOLON",
  COMMENT: "COMMENT",
  COMMENT_BLOCK: "COMMENT_BLOCK",
  ESCAPE: "ESCAPE",
  EXCLAMATION_MARK: "EXCLAMATION_MARK",
  SLOT_KEYWORD: "SLOT_KEYWORD",
  KEY: "KEY",
  WHITESPACE: "WHITESPACE",
  STATIC_KEYWORD: "STATIC_KEYWORD",
  RUNTIME_KEYWORD: "RUNTIME_KEYWORD",
  LOGIC: "LOGIC",
  FOR_EACH: "FOR_EACH",
  EOF: "EOF"
};

/**
 * Looks at an item in a list or string without moving your current position.
 * You can look ahead or behind by using a positive or negative offset.
 * 
 * @param {Array|string} input - The list or string to check.
 * @param {number} index - Your current spot in the list.
 * @param {number} offset - How many spots to look ahead or behind.
 * @returns {any|null} - The item you found, or null if it is out of range.
 */
function peek(input, index, offset) {
  if (input === null || index < 0 || offset < -index) {
    return null;
  }
  if (index + offset < input.length) {
    if (input[index + offset] !== undefined) {
      return input[index + offset];
    }
  }
  return null;
}

/**
 * These labels identify different parts of the code (like blocks or text) 
 * so the system knows how to handle them.
 */
const BLOCK = "Block",
	TEXT = "Text",
	INLINE = "Inline",
	ATBLOCK = "AtBlock",
	COMMENT = "Comment",
	COMMENT_BLOCK = "CommentBlock",
	IMPORT = "Import",
	USE_MODULE = "$use-module",
	SLOT = "Slot",
	STATIC_LOGIC = "StaticLogic",
	RUNTIME_LOGIC = "RuntimeLogic",
	FOR_EACH = "ForEach";

/**
 * Names for symbols used to separate parts of the code (like commas and colons).
 */
const SEMICOLON = "Semicolon",
	BLOCKCOMMA = "Block-comma",
	ATBLOCKCOMMA = "Atblock-comma",
	INLINECOMMA = "Inline-comma",
	BLOCKCOLON = "Block-colon",
	ATBLOCKCOLON = "Atblock-colon",
	INLINECOLON = "Inline-colon";

/**
 * These names are used in error messages to tell you exactly which part 
 * of your code has a mistake.
 */
const block_id = "Block Identifier",
	block_value = "Block Value",
	block_key = "Block Key",
	block_end = "Block end",
	inline_id = "Inline Identifier",
	inline_text = "Inline Text",
	at_id = "At Identifier",
	at_value = "At Value",
	atblock_key = "AtBlock Key",
	at_end = "Atblock End",
	/** Reserved keyword for closing blocks */
	end_keyword = "end",
	slot_keyword = "slot",
	for_each_keyword = "for-each";

var labels = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ATBLOCK: ATBLOCK,
  ATBLOCKCOLON: ATBLOCKCOLON,
  ATBLOCKCOMMA: ATBLOCKCOMMA,
  BLOCK: BLOCK,
  BLOCKCOLON: BLOCKCOLON,
  BLOCKCOMMA: BLOCKCOMMA,
  COMMENT: COMMENT,
  COMMENT_BLOCK: COMMENT_BLOCK,
  FOR_EACH: FOR_EACH,
  IMPORT: IMPORT,
  INLINE: INLINE,
  INLINECOLON: INLINECOLON,
  INLINECOMMA: INLINECOMMA,
  RUNTIME_LOGIC: RUNTIME_LOGIC,
  SEMICOLON: SEMICOLON,
  SLOT: SLOT,
  STATIC_LOGIC: STATIC_LOGIC,
  TEXT: TEXT,
  USE_MODULE: USE_MODULE,
  at_end: at_end,
  at_id: at_id,
  at_value: at_value,
  atblock_key: atblock_key,
  block_end: block_end,
  block_id: block_id,
  block_key: block_key,
  block_value: block_value,
  end_keyword: end_keyword,
  for_each_keyword: for_each_keyword,
  inline_id: inline_id,
  inline_text: inline_text,
  slot_keyword: slot_keyword
});

/**
 * Wraps your text in a color if colors are turned on.
 * 
 * @param {string} color - The color to use (red, green, yellow, blue, magenta, or cyan).
 * @param {string} text - The text you want to color.
 * @returns {string} - The colored text, or plain text if colors are off.
 * @throws {Error} - Fails if you forget to provide the text.
 */
function colorize(color, text) {
        if (!text) throw new Error("argument 'text' is not defined.");
        return text;
}

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

/** Helper to throw Runtime or Module errors. */
const runtimeError = getError("runtime");

/** Helper to throw general internal SomMark errors. */
const sommarkError = getError("sommark");

/**
 * SomMark Lexer
 * 
 * Transforms a raw SomMark source string into a stream of tokens.
 * It uses a state-machine approach to handle complex contexts like At-Block bodies,
 * quoted values, and hierarchical headers.
 * 
 * @param {string} src - The raw SomMark source code.
 * @param {string} [filename="anonymous"] - Source filename for error reporting.
 * @returns {Array<Object>} Array of token objects.
 */
function lexer(src, filename = "anonymous") {
	if (!src || typeof src !== "string") return [];
	const tokens = [];
	let last_non_junk_type = ""; // Tracks the last real token for context guessing
	let i = 0;
	let line = 0, character = 0;

	// State Variables
	let isInAtBlockBody = false;
	let isInQuote = false;
	let isInHeader = false; // Tracks if we are in a structural header context
	let isInAtBlockHeader = false; // Specific for At-Block headers (@_ ... _@)
	let isInInlineHead = false; // Specific for (key:val) after ->
	let parenDepth = 0; // To track balanced parentheses in inlines

	/**
	 * Adds a token to the stream and updates the scanner's position tracking.
	 * 
	 * @param {string} type - The type of token (from TOKEN_TYPES).
	 * @param {string} value - The literal text content of the token.
	 */
	function addToken(type, value) {
		const start = { line, character };

		// Update position
		const parts = value.split("\n");
		if (parts.length > 1) {
			line += parts.length - 1;
			character = parts[parts.length - 1].length;
		} else {
			character += value.length;
		}

		const end = { line, character };
		tokens.push({
			type,
			value,
			source: filename,
			range: { start, end }
		});
		if (type !== TOKEN_TYPES.WHITESPACE && type !== TOKEN_TYPES.COMMENT) {
			if (type !== TOKEN_TYPES.TEXT || value.trim() !== "") {
				last_non_junk_type = type;
			}
		}
	}

	/**
	 * Looks ahead to find the next structural character, skipping whitespace and comments.
	 * Used for context-guessing (e.g., distinguishing KEY from VALUE).
	 * 
	 * @param {number} start - Index to start peeking from.
	 * @returns {string|null} The next structural character or null if EOF.
	 */
	function peekStructural(start) {
		let j = start;
		while (j < src.length) {
			const c = src[j];
			if (c === " " || c === "\t" || c === "\n" || c === "\r") {
				j++;
				continue;
			}
			if (c === "#") {
				while (j < src.length && src[j] !== "\n") j++;
				continue;
			}
			if (c === "\\") {
				// Escape sequence: jump over the backslash and the escaped char
				j += 2;
				continue;
			}
			return c;
		}
		return null;
	}

	while (i < src.length) {
		// --- PHASE 1: AT-BLOCK BODY MODE ---
		// In this mode, we consume everything as raw text until we hit the @_ marker.
		if (isInAtBlockBody) {
			if (src[i] === "@" && src[i + 1] === "_") {
				isInAtBlockBody = false;
			} else {
				let body = "";
				while (i < src.length) {
					// Handle escapes in At-Block Body
					if (src[i] === "\\" && i + 1 < src.length) {
						body += src[i + 1];
						i += 2;
						continue;
					}
					// Stop at end marker
					if (src[i] === "@" && src[i + 1] === "_") {
						break;
					}
					body += src[i];
					i++;
				}
				if (body.length > 0) {
					addToken(TOKEN_TYPES.TEXT, body);
				}
				continue;
			}
		}
		const char = src[i];
		const next = src[i + 1];

		// --- PHASE 2: QUOTE MODE ---
		// Handles balanced strings and allows prefix layers (js{}, p{}) inside them.
		if (isInQuote) {
			let quoteValue = "";
			const quoteChar = tokens[tokens.length - 1].value;
			while (i < src.length) {
				if (src[i] === "\\" && i + 1 < src.length) {
					// Inside quotes, we split escapes if we want to match reliability tests
					if (quoteValue.length > 0) addToken(TOKEN_TYPES.VALUE, quoteValue);
					addToken(TOKEN_TYPES.ESCAPE, "\\" + src[i + 1]);
					quoteValue = "";
					i += 2;
					continue;
				}

				// Support Prefix Layers inside quotes!
				if ((src[i] === "j" && src[i + 1] === "s" && src[i + 2] === "{") || (src[i] === "p" && src[i + 1] === "{") || (src[i] === "v" && src[i + 1] === "{")) {
					const isJS = (src[i] === "j");
					const isV = (src[i] === "v");
					if (quoteValue.length > 0) {
						addToken(TOKEN_TYPES.VALUE, quoteValue);
						quoteValue = "";
					}

					let braceDepth = 1;
					let prefixValue = isJS ? "js{" : (isV ? "v{" : "p{");
					i += isJS ? 3 : 2;

					let internalString = null;
					while (i < src.length && braceDepth > 0) {
						const c = src[i];
						const n = src[i + 1];
						if (internalString) {
							if (c === "\\" && (n === internalString || n === "\\")) {
								prefixValue += c + n;
								i += 2;
								continue;
							}
							if (c === internalString) internalString = null;
						} else {
							if (c === "\"" || c === "'") internalString = c;
							else if (c === "{") braceDepth++;
							else if (c === "}") braceDepth--;
						}
						prefixValue += c;
						i++;
					}
					let tokenType = isJS ? TOKEN_TYPES.PREFIX_JS : (isV ? TOKEN_TYPES.PREFIX_V : TOKEN_TYPES.PREFIX_P);
					addToken(tokenType, prefixValue);
					continue;
				}

				if (src[i] === quoteChar) {
					// Guess role based on next structural character
					let nextStructural = peekStructural(i + 1);
					let tokenType = (isInHeader || isInInlineHead) && (nextStructural === ":" || nextStructural === "=")
						? TOKEN_TYPES.KEY
						: TOKEN_TYPES.VALUE;

					if (quoteValue.length > 0) addToken(tokenType, quoteValue);
					addToken(TOKEN_TYPES.QUOTE, quoteChar);
					isInQuote = false;
					i++;
					break;
				}
				quoteValue += src[i];
				i++;
			}
			if (!isInQuote) continue;
		}

		// --- PHASE 3: STRUCTURAL PARSING ---
		// Handles markers, whitespace, and structural symbols.

		// WHITESPACE
		if (char === "\n") {
			addToken(TOKEN_TYPES.WHITESPACE, char);
			i++;
			continue;
		}

		if (char === " " || char === "\t" || char === "\r") {
			let ws = "";
			while (i < src.length && (src[i] === " " || src[i] === "\t" || src[i] === "\r")) {
				ws += src[i];
				i++;
			}
			addToken(TOKEN_TYPES.WHITESPACE, ws);
			continue;
		}

		// COMMENTS
		if (char === "#") {
			let comm = "";
			// Check for Multiline Comment ### (must have no spaces)
			if (src[i + 1] === "#" && src[i + 2] === "#") {
				comm = "###";
				i += 3;
				while (i < src.length) {
					if (src[i] === "#" && src[i + 1] === "#" && src[i + 2] === "#") {
						comm += "###";
						i += 3;
						break;
					}
					comm += src[i];
					i++;
				}
				addToken(TOKEN_TYPES.COMMENT_BLOCK, comm);
			} else {
				// Single line comment
				while (i < src.length && src[i] !== "\n") {
					comm += src[i];
					i++;
				}
				addToken(TOKEN_TYPES.COMMENT, comm);
			}
			continue;
		}

		// ESCAPE CHARACTER (Sequence-based)
		if (char === "\\") {
			const seq = i + 1 < src.length ? "\\" + src[i + 1] : "\\";
			addToken(TOKEN_TYPES.ESCAPE, seq);
			i += seq.length;
			continue;
		}

		// PREFIX LAYERS (js{...} or p{...} or v{...})
		if ((char === "j" && next === "s" && src[i + 2] === "{") || (char === "p" && next === "{") || (char === "v" && next === "{")) {
			const isJS = (char === "j");
			const isP = (char === "p");
			const isV = (char === "v");

			// Context Check
			const isBlockHeader = isInHeader && !isInAtBlockHeader;
			const isNormalText = !isInHeader && !isInInlineHead && !isInAtBlockBody && parenDepth === 0;

			let allowed = false;
			if (isJS && isBlockHeader) allowed = true;
			if (isP && (isBlockHeader || isNormalText)) allowed = true;
			if (isV && (isBlockHeader || isNormalText)) allowed = true;

			if (allowed) {
				let braceDepth = 1;
				let prefixValue = isJS ? "js{" : (isV ? "v{" : "p{");
				i += isJS ? 3 : 2;

				let inString = null; // Track if we are inside " " or ' '
				while (i < src.length && braceDepth > 0) {
					const c = src[i];
					const n = src[i + 1];

					if (inString) {
						if (c === "\\" && (n === inString || n === "\\")) {
							prefixValue += c + n;
							i += 2;
							continue;
						}
						if (c === inString) inString = null;
					} else {
						if (c === "\"" || c === "'") inString = c;
						else if (c === "{") braceDepth++;
						else if (c === "}") braceDepth--;
					}
					prefixValue += c;
					i++;
				}
				let tokenType = isJS ? TOKEN_TYPES.PREFIX_JS : (isV ? TOKEN_TYPES.PREFIX_V : TOKEN_TYPES.PREFIX_P);
				addToken(tokenType, prefixValue);
				continue;
			}
			// If not allowed, it will fall through to normal word scanning
		}

		// MULTI-CHAR MARKERS
		if (char === "@" && next === "_") {
			addToken(TOKEN_TYPES.OPEN_AT, "@_");
			i += 2;
			isInHeader = true; // At-Blocks start with a header part
			isInAtBlockHeader = true;
			continue;
		}
		if (char === "-" && next === ">") {
			if (isInAtBlockBody || (parenDepth > 0 && !isInInlineHead)) {
				addToken(TOKEN_TYPES.TEXT, "-");
				i++; // Swallowed one char
			} else {
				addToken(TOKEN_TYPES.THIN_ARROW, "->");
				i += 2;
				isInInlineHead = true; // The following ( ) will be structural
			}
			continue;
		}

		// STATIC KEYWORD
		if (char === "s" && src.slice(i, i + 6) === "static") {
			const afterStatic = src.slice(i + 6);
			const hasSpace = afterStatic.startsWith(" ");
			const hasLogic = hasSpace ? afterStatic.slice(1).startsWith("${") : afterStatic.startsWith("${");

			const isMainIdentifier = (
				last_non_junk_type === TOKEN_TYPES.OPEN_BRACKET ||
				last_non_junk_type === TOKEN_TYPES.OPEN_AT ||
				(last_non_junk_type === TOKEN_TYPES.OPEN_PAREN && isInInlineHead)
			);

			if ((hasLogic || isInHeader) && !isMainIdentifier) {
				addToken(TOKEN_TYPES.STATIC_KEYWORD, hasSpace ? "static " : "static");
				i += hasSpace ? 7 : 6;
				continue;
			}
		}

		// RUNTIME KEYWORD
		if (char === "r" && src.slice(i, i + 7) === "runtime") {
			const afterRuntime = src.slice(i + 7);
			const hasSpace = afterRuntime.startsWith(" ");
			const hasLogic = hasSpace ? afterRuntime.slice(1).startsWith("${") : afterRuntime.startsWith("${");

			const isMainIdentifier = (
				last_non_junk_type === TOKEN_TYPES.OPEN_BRACKET ||
				last_non_junk_type === TOKEN_TYPES.OPEN_AT ||
				(last_non_junk_type === TOKEN_TYPES.OPEN_PAREN && isInInlineHead)
			);

			if ((hasLogic || isInHeader) && !isMainIdentifier) {
				addToken(TOKEN_TYPES.RUNTIME_KEYWORD, hasSpace ? "runtime " : "runtime");
				i += hasSpace ? 8 : 7;
				continue;
			}
		}

		// LOGIC BLOCKS (${ ... }$)
		if (char === "$" && next === "{" && (last_non_junk_type === TOKEN_TYPES.STATIC_KEYWORD || last_non_junk_type === TOKEN_TYPES.RUNTIME_KEYWORD)) {
			const startLine = line;
			const startCharacter = character;
			i += 2;
			let logicCode = "";
			let braceDepth = 1;
			let internalString = null;
			let foundClosing = false;

			while (i < src.length) {
				const c = src[i];
				const n = src[i + 1];

				// Stop condition: }$ (only if not inside a JS string and at top-level brace depth)
				if (c === "}" && n === "$" && !internalString && braceDepth === 1) {
					i += 2;
					braceDepth = 0;
					foundClosing = true;
					break;
				}

				if (internalString) {
					if (c === "\\" && (n === internalString || n === "\\")) {
						logicCode += c + n;
						i += 2;
						continue;
					}
					if (c === internalString) internalString = null;
				} else {
					if (c === "/" && n === "/") {
						logicCode += c + n;
						i += 2;
						while (i < src.length && src[i] !== "\n" && src[i] !== "\r") {
							logicCode += src[i];
							i++;
						}
						continue;
					}
					if (c === "/" && n === "*") {
						logicCode += c + n;
						i += 2;
						while (i < src.length) {
							if (src[i] === "*" && src[i + 1] === "/") {
								logicCode += "*/";
								i += 2;
								break;
							}
							logicCode += src[i];
							i++;
						}
						continue;
					}

					if (c === "\"" || c === "'" || c === "`") internalString = c;
					else if (c === "{") braceDepth++;
					else if (c === "}") braceDepth--;
				}

				logicCode += c;
				i++;
			}

			if (!foundClosing) {
				lexerError("Unclosed logic block. Expected '}$' to close the block starting with '${'.", {
					src,
					filename,
					range: {
						start: { line: startLine, character: startCharacter },
						end: { line: startLine, character: startCharacter + 2 }
					}
				});
			}

			addToken(TOKEN_TYPES.LOGIC, logicCode);
			continue;
		}

		// SINGLE-CHAR MARKERS
		if (char === "[") {
			if (isInAtBlockBody || (parenDepth > 0 && !isInInlineHead)) {
				addToken(TOKEN_TYPES.TEXT, "[");
			} else {
				addToken(TOKEN_TYPES.OPEN_BRACKET, "[");
				isInHeader = true;
			}
			i++;
			continue;
		}
		if (char === "_" && next === "@") {
			if (isInAtBlockBody || (parenDepth > 0 && !isInInlineHead)) {
				addToken(TOKEN_TYPES.TEXT, "_@");
			} else {
				const lastRealType = last_non_junk_type;
				addToken(TOKEN_TYPES.CLOSE_AT, "_@");
				// Removed delimiter stack check
				if (lastRealType === TOKEN_TYPES.END_KEYWORD) {
					isInAtBlockBody = false;
					isInHeader = false;
					isInAtBlockHeader = false;
				}
			}
			i += 2;
			continue;
		}
		if (char === "]") {
			if (isInAtBlockBody || (parenDepth > 0 && !isInInlineHead)) {
				addToken(TOKEN_TYPES.TEXT, "]");
			} else {
				addToken(TOKEN_TYPES.CLOSE_BRACKET, "]");
				isInHeader = false;
			}
			i++;
			continue;
		}
		if (char === "(") {
			if (isInAtBlockBody || (parenDepth > 0 && !isInInlineHead)) {
				addToken(TOKEN_TYPES.TEXT, "(");
				parenDepth++;
			} else {
				addToken(TOKEN_TYPES.OPEN_PAREN, "(");
				parenDepth++;
			}
			i++;
			continue;
		}
		if (char === ")") {
			if (isInAtBlockBody || (parenDepth > 1 && !isInInlineHead)) {
				addToken(TOKEN_TYPES.TEXT, ")");
				parenDepth--;
			} else if (parenDepth > 0) {
				// This ends the content part if depth drops to 0
				parenDepth--;
				if (parenDepth === 0) {
					addToken(TOKEN_TYPES.CLOSE_PAREN, ")");
					if (isInInlineHead) {
						isInInlineHead = false;
						isInHeader = false;
					}
				} else {
					addToken(TOKEN_TYPES.TEXT, ")");
				}
			} else {
				addToken(TOKEN_TYPES.TEXT, ")");
			}
			i++;
			continue;
		}
		if (char === ":") {
			if (isInAtBlockBody || (parenDepth > 0 && !isInInlineHead)) {
				addToken(TOKEN_TYPES.TEXT, ":");
			} else {
				const allowed = [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.KEY, TOKEN_TYPES.CLOSE_AT, TOKEN_TYPES.VALUE, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.QUOTE, TOKEN_TYPES.PREFIX_JS, TOKEN_TYPES.PREFIX_V, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT, TOKEN_TYPES.LOGIC, TOKEN_TYPES.STATIC_KEYWORD, TOKEN_TYPES.RUNTIME_KEYWORD, TOKEN_TYPES.FOR_EACH];
				if (allowed.includes(last_non_junk_type)) {
					addToken(TOKEN_TYPES.COLON, ":");
					isInHeader = true;
				} else {
					addToken(TOKEN_TYPES.TEXT, ":");
				}
			}
			i++;
			continue;
		}
		if (char === "=") {
			if (isInAtBlockBody || (parenDepth > 0 && !isInInlineHead)) {
				addToken(TOKEN_TYPES.TEXT, "=");
			} else {
				const allowed = [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.KEY, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.QUOTE, TOKEN_TYPES.PREFIX_JS, TOKEN_TYPES.PREFIX_V, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT, TOKEN_TYPES.LOGIC, TOKEN_TYPES.STATIC_KEYWORD, TOKEN_TYPES.RUNTIME_KEYWORD, TOKEN_TYPES.FOR_EACH];
				if (allowed.includes(last_non_junk_type)) {
					addToken(TOKEN_TYPES.EQUAL, "=");
				} else {
					addToken(TOKEN_TYPES.TEXT, "=");
				}
			}
			i++;
			continue;
		}
		if (char === ",") {
			if (isInAtBlockBody || (parenDepth > 0 && !isInInlineHead)) {
				addToken(TOKEN_TYPES.TEXT, ",");
			} else {
				const allowed = [TOKEN_TYPES.VALUE, TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.QUOTE, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.PREFIX_JS, TOKEN_TYPES.PREFIX_V, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT, TOKEN_TYPES.LOGIC, TOKEN_TYPES.STATIC_KEYWORD, TOKEN_TYPES.RUNTIME_KEYWORD, TOKEN_TYPES.FOR_EACH];
				if (allowed.includes(last_non_junk_type)) {
					addToken(TOKEN_TYPES.COMMA, ",");
				} else {
					addToken(TOKEN_TYPES.TEXT, ",");
				}
			}
			i++;
			continue;
		}
		if (char === ";") {
			if (isInAtBlockBody || (parenDepth > 0 && !isInInlineHead)) {
				addToken(TOKEN_TYPES.TEXT, ";");
			} else {
				const allowed = [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.VALUE, TOKEN_TYPES.CLOSE_AT, TOKEN_TYPES.CLOSE_PAREN, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.QUOTE, TOKEN_TYPES.PREFIX_JS, TOKEN_TYPES.PREFIX_V, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT, TOKEN_TYPES.LOGIC, TOKEN_TYPES.STATIC_KEYWORD, TOKEN_TYPES.RUNTIME_KEYWORD, TOKEN_TYPES.FOR_EACH];
				if (allowed.includes(last_non_junk_type)) {
					addToken(TOKEN_TYPES.SEMICOLON, ";");
					// ONLY trigger body mode if we were actually in an At-Block header
					if (isInAtBlockHeader) {
						isInHeader = false;
						isInAtBlockHeader = false;
						isInAtBlockBody = true;
					}
				} else {
					addToken(TOKEN_TYPES.TEXT, ";");
				}
			}
			i++;
			continue;
		}
		if (char === "!") {
			if (isInHeader) {
				addToken(TOKEN_TYPES.EXCLAMATION_MARK, "!");
				i++;
				continue;
			}
		}
		if (char === "\"" || char === "'") {
			const valTriggers = [TOKEN_TYPES.COLON, TOKEN_TYPES.EQUAL, TOKEN_TYPES.COMMA, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.OPEN_BRACKET, TOKEN_TYPES.OPEN_AT];
			const wasValueTrigger = valTriggers.includes(last_non_junk_type);
			addToken(TOKEN_TYPES.QUOTE, char);
			i++;
			// Enable quote mode
			// NOTE: We allow quotes basically anywhere in headers as values/keys
			if (isInHeader || wasValueTrigger) {
				isInQuote = true;
			}
			continue;
		}

		// --- PHASE 4: WORD / TEXT SCANNING ---
		// This is the "Fallback" mode where we scan for identifiers, keys, or values.
		// It uses lookahead and context variables to guess the role of a word.
		let word = "";
		// Only Blocks ([ ]) allow ':' in their main identifier.
		// At-Blocks (@_) and Inlines (->( )) do NOT allow ':' in the ID.
		const isStartOfBlockId = (last_non_junk_type === TOKEN_TYPES.OPEN_BRACKET);

		let stopChars = "[](){}:=;,@>\"'#\\ \t\n\r!";
		if (isStartOfBlockId || (parenDepth > 0 && !isInInlineHead)) {
			stopChars = stopChars.replace(":", "");
		}
		const isInNormalText = !isInHeader && !isInInlineHead && !isInAtBlockBody;
		if (isInNormalText) {
			stopChars = "[]@()>_()\\#\n\r"; // In normal text, stop at markers, comments and newlines
		}

		while (i < src.length && !stopChars.includes(src[i])) {
			// Stop ONLY if $ is followed by { (Logic block start)
			if (src[i] === "$" && src[i + 1] === "{") break;

			// Lookahead for At-Block markers (_@ or @_)
			if (src[i] === "_" && src[i + 1] === "@") break;
			if (src[i] === "@" && src[i + 1] === "_") break;

			// Lookahead for 'static ${' or 'runtime ${' (only if we're not at the very start of the word scanning)
			if (word.length > 0) {
				if (src[i] === "s" && src.slice(i, i + 7) === "static " && src[i + 7] === "$" && src[i + 8] === "{") break;
				if (src[i] === "s" && src.slice(i, i + 6) === "static" && src[i + 6] === "$" && src[i + 7] === "{") break;
				if (src[i] === "r" && src.slice(i, i + 8) === "runtime " && src[i + 8] === "$" && src[i + 9] === "{") break;
				if (src[i] === "r" && src.slice(i, i + 7) === "runtime" && src[i + 7] === "$" && src[i + 8] === "{") break;
			}

			// Lookahead for -> marker in normal text
			if (!isInHeader && src[i] === "-" && src[i + 1] === ">") break;

			// Stop if we hit an ALLOWED prefix trigger
			if ((src[i] === "p" && src[i + 1] === "{") || (src[i] === "v" && src[i + 1] === "{")) {
				if (isInHeader || isInNormalText) break;
			}
			if (src[i] === "j" && src[i + 1] === "s" && src[i + 2] === "{") {
				if (isInHeader) break;
			}
			word += src[i];
			i++;
		}

		if (word.length > 0) {
			// Guess role based on context
			if (parenDepth > 0 && !isInInlineHead) {
				// Inside Inline Content (raw text)
				addToken(TOKEN_TYPES.TEXT, word);
			} else if (isInHeader || isInInlineHead) {
				// Inside a structural header context
				const isMainIdentifier = (
					last_non_junk_type === TOKEN_TYPES.OPEN_BRACKET ||
					last_non_junk_type === TOKEN_TYPES.OPEN_AT ||
					(last_non_junk_type === TOKEN_TYPES.OPEN_PAREN && isInInlineHead)
				);

				if (isMainIdentifier) {
					if (word === end_keyword) {
						addToken(TOKEN_TYPES.END_KEYWORD, word);
					}
					else if (word === "import") addToken(TOKEN_TYPES.IMPORT, word);
					else if (word === "$use-module") addToken(TOKEN_TYPES.USE_MODULE, word);
					else if (word === "slot") addToken(TOKEN_TYPES.SLOT_KEYWORD, word);
					else if (word === "for-each") addToken(TOKEN_TYPES.FOR_EACH, word);
					else addToken(TOKEN_TYPES.IDENTIFIER, word);
				} else {
					// Use lookahead to distinguish KEY from VALUE
					const p = peekStructural(i);
					if (p === ":") {
						addToken(TOKEN_TYPES.KEY, word);
					} else if (word === "static") {
						addToken(TOKEN_TYPES.STATIC_KEYWORD, word);
					} else if (word === "runtime") {
						addToken(TOKEN_TYPES.RUNTIME_KEYWORD, word);
					} else {
						addToken(TOKEN_TYPES.VALUE, word);
					}
				}
			} else {
				// Normal text
				if (word.trim() === "static") {
					addToken(TOKEN_TYPES.STATIC_KEYWORD, word);
				} else if (word.trim() === "runtime") {
					addToken(TOKEN_TYPES.RUNTIME_KEYWORD, word);
				} else {
					addToken(TOKEN_TYPES.TEXT, word);
				}
			}
		} else {
			// Fallback for any unhandled characters
			if (i < src.length) {
				addToken(TOKEN_TYPES.TEXT, src[i]);
				i++;
			}
		}
	}

	addToken(TOKEN_TYPES.EOF, "");
	return tokens;
}

/**
 * A safe parser that turns Javascript-like strings into real objects and arrays.
 * It is built to handle data structures without running any dangerous code or
 * accessing other parts of your project.
 * 
 * It supports: 
 * - Standard JSON: {"key": "val"}
 * - Javascript-style: { key: 'val' }
 * - Basic data: true, false, null, numbers, and strings
 */
function safeDataParse(str) {
    if (typeof str !== "string") return str;
    const s = str.trim();
    if (!s) return null;

    let index = 0;

    function skipWhitespace() {
        while (index < s.length && /\s/.test(s[index])) {
            index++;
        }
    }

    function parseValue() {
        skipWhitespace();
        const char = s[index];

        if (char === '{') return parseObject();
        if (char === '[') return parseArray();
        if (char === '"' || char === "'") return parseString();

        // Primitives or Unquoted identifiers
        return parsePrimitiveOrIdentifier();
    }

    function parseString() {
        const quote = s[index++];
        let result = "";
        while (index < s.length && s[index] !== quote) {
            if (s[index] === '\\') index++; // Skip escape
            result += s[index++];
        }
        index++; // Skip closing quote
        return result;
    }

    function parseObject() {
        index++; // Skip {
        const obj = {};
        skipWhitespace();

        while (index < s.length && s[index] !== '}') {
            skipWhitespace();
            // Key can be unquoted, quoted "key", or quoted 'key'
            let key;
            if (s[index] === '"' || s[index] === "'") {
                key = parseString();
            } else {
                let keyMatch = s.slice(index).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
                if (!keyMatch) break;
                key = keyMatch[0];
                index += key.length;
            }

            skipWhitespace();
            if (s[index] !== ':') break;
            index++; // Skip :

            obj[key] = parseValue();

            skipWhitespace();
            if (s[index] === ',') index++; // Skip optional comma
            skipWhitespace();
        }
        index++; // Skip }
        return obj;
    }

    function parseArray() {
        index++; // Skip [
        const arr = [];
        skipWhitespace();

        while (index < s.length && s[index] !== ']') {
            arr.push(parseValue());
            skipWhitespace();
            if (s[index] === ',') index++; // Skip optional comma
            skipWhitespace();
        }
        index++; // Skip ]
        return arr;
    }

    function parsePrimitiveOrIdentifier() {
        const start = index;
        while (index < s.length && /[a-zA-Z0-9_$+\-.]/.test(s[index])) {
            index++;
        }
        const token = s.slice(start, index);

        if (token === "true") return true;
        if (token === "false") return false;
        if (token === "null") return null;
        if (!isNaN(Number(token))) return Number(token);

        return token; // Fallback to string if it looks like an identifier
    }

    try {
        return parseValue();
    } catch (e) {
        return str; // Fallback to raw string if parsing fails
    }
}

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for "Did you mean?" suggestions and fuzzy matching in validation.
 * 
 * @param {string} a - First string.
 * @param {string} b - Second string.
 * @returns {number} - The edit distance between the two strings.
 */
function levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                        if (b.charAt(i - 1) === a.charAt(j - 1)) {
                                matrix[i][j] = matrix[i - 1][j - 1];
                        } else {
                                matrix[i][j] = Math.min(
                                        matrix[i - 1][j - 1] + 1,
                                        matrix[i][j - 1] + 1,
                                        matrix[i - 1][j] + 1
                                );
                        }
                }
        }
        return matrix[b.length][a.length];
}

// -- Unresolved Placeholder Helpers ---------------------------------------- //

const UNRESOLVED_PREFIX = "SOMMARK_UNRESOLVED";
const UNRESOLVED_SUFFIX = "SOMMARK";

/**
 * Official method to get the unique envelope for an unresolved prefix value.
 * @param {string} prefix - The layer ('p' or 'v').
 * @param {string} expectedValue - The placeholder key.
 * @returns {string} - The unique envelope string.
 */
function getPrefixValue(prefix, expectedValue) {
	if (!prefix || (prefix !== "p" && prefix !== "v")) {
		sommarkError([
			`<$red:getPrefixValue Error:$> {N}`,
			`<$yellow:prefix must be 'p' or 'v'. Received:$> <$cyan:'${prefix}'$>`
		]);
	}

	if (!expectedValue || typeof expectedValue !== "string" || expectedValue.trim() === "") {
		sommarkError([
			`<$red:getPrefixValue Error:$> {N}`,
			`<$yellow:expectedValue must be a non-empty string. Received:$> <$cyan:'${expectedValue}'$>`
		]);
	}

	return `${UNRESOLVED_PREFIX}_${prefix}_${expectedValue}_${UNRESOLVED_SUFFIX}`;
}

/**
 * SomMark Parser
 */


// ========================================================================== //
//  Helper Functions                                                         //
// ========================================================================== //

/**
 * Returns the token at the current position.
 * 
 * @param {Object[]} tokens - The list of tokens.
 * @param {number} i - The current index.
 * @returns {Object|null} - The token or null if at the end.
 */
function current_token(tokens, i) {
	return tokens[i] || null;
}

/**
 * Skip whitespaces and comments in structural contexts.
 * 
 * @param {Object[]} tokens - The list of tokens.
 * @param {number} i - The current index.
 * @returns {number} - The new index.
 */
function skipJunk(tokens, i) {
	while (i < tokens.length) {
		const t = tokens[i];
		const type = t.type;
		if (type === TOKEN_TYPES.WHITESPACE || type === TOKEN_TYPES.COMMENT || type === TOKEN_TYPES.COMMENT_BLOCK) {
			i++;
		} else if (type === TOKEN_TYPES.TEXT && t.value.trim() === "") {
			i++;
		} else {
			break;
		}
	}
	return i;
}

/**
 * Checks if a name is valid (using letters, numbers, and certain symbols).
 * 
 * @param {string} id - The name to check.
 * @param {RegExp} [keyRegex] - The rule to follow.
 * @param {string} [name] - The type of thing we are checking.
 * @param {string} [rule] - A human-readable version of the rule.
 * @param {string} [ruleMessage] - The error message to show.
 */
function validateName(
	id,
	allowColon = false,
	name = "Identifier"
) {
	const keyRegex = allowColon ? /^[a-zA-Z0-9\-_$:]+$/ : /^[a-zA-Z0-9\-_$]+$/;
	const rule = allowColon ? "(A–Z, a–z, 0–9, -, _, $, :)" : "(A–Z, a–z, 0–9, -, _, $)";
	const ruleMessage = allowColon
		? "must contain only letters, numbers, hyphens, underscores, dollar signs ($), or colons (:)"
		: "must contain only letters, numbers, hyphens, underscores, or dollar signs ($)";

	if (!keyRegex.test(id)) {
		parserError([`{line}<$red:Invalid ${name}:$><$blue: '${id}'$>{N}<$yellow:${name} ${ruleMessage}$> <$cyan: ${rule}.$>{line}`]);
	}
}

/** Creates a new empty Block node. */
function makeBlockNode() {
	return {
		type: BLOCK,
		structure: "Block",
		id: "",
		args: {},
		body: [],
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}
/** Creates a new empty Text node. */
function makeTextNode() {
	return {
		type: TEXT,
		structure: "Text",
		text: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}
/** Creates a new empty Comment node. */
function makeCommentNode() {
	return {
		type: COMMENT,
		structure: "Comment",
		text: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}
/** Creates a new empty Inline node. */
function makeInlineNode() {
	return {
		type: INLINE,
		structure: "Inline",
		value: "",
		id: "",
		args: {},
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}

// ========================================================================== //
//  Node Creators                                                             //
// ========================================================================== //
/** Creates a new empty AtBlock node. */
function makeAtBlockNode() {
	return {
		type: ATBLOCK,
		structure: "AtBlock",
		id: "",
		args: {},
		content: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}

/** Creates a new empty Logic node. */
function makeLogicNode(type = RUNTIME_LOGIC) {
	return {
		type: type,
		structure: "Block",
		code: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}
let end_stack = [];
let tokens_stack = [];

const fallback = {
	value: "Unknown",
	range: {
		start: { line: 0, character: 0 },
		end: { line: 0, character: 0 }
	}};
const updateData = (tokens, i) => {
	if (tokens[i]) {
		tokens_stack.push(tokens[i].value);
		tokens[i].range;
		tokens[i].value;
	}
};

const errorMessage = (tokens, i, expectedValue, behindValue, frontText, filename = null) => {
	const current = tokens[i] || fallback;
	const errorLineNumber = current.range.start.line;
	current.range.start.character;
	const source = current.source || filename;
	const sourceLabel = source ? ` [${source}]` : "";

	let lineStartIndex = i;
	while (
		lineStartIndex > 0 &&
		tokens[lineStartIndex - 1] &&
		tokens[lineStartIndex - 1].range.start.line === errorLineNumber &&
		(tokens[lineStartIndex - 1].source || filename) === source
	) {
		lineStartIndex--;
	}

	let lineEndIndex = i;
	while (
		lineEndIndex < tokens.length - 1 &&
		tokens[lineEndIndex + 1] &&
		tokens[lineEndIndex + 1].range.start.line === errorLineNumber &&
		(tokens[lineEndIndex + 1].source || filename) === source
	) {
		lineEndIndex++;
	}

	// Get all tokens on the error line
	const lineTokens = tokens.slice(lineStartIndex, lineEndIndex + 1);
	const lineContent = lineTokens.map(t => t.value).join('');

	// Get content on the line before the error token
	const tokensBeforeErrorOnLine = tokens.slice(lineStartIndex, i);
	const contentBeforeErrorOnLine = tokensBeforeErrorOnLine.map(t => t.value).join('');

	const pointerPadding = " ".repeat(contentBeforeErrorOnLine.length);
	const rangeInfo = current.range.start.line === current.range.end.line
		? `from column <$yellow:${current.range.start.character}$> to <$yellow:${current.range.end.character}$>`
		: `from line <$yellow:${current.range.start.line + 1}$>, column <$yellow:${current.range.start.character}$> to line <$yellow:${current.range.end.line + 1}$>, column <$yellow:${current.range.end.character}$>`;

	return [
		`<$blue:{line}$><$red:Here where error occurred${sourceLabel}:$>{N}${lineContent}{N}${pointerPadding}<$yellow:^$>{N}{N}`,
		`<$red:${frontText ? frontText : "Expected token"}$>${!frontText ? " <$blue:'" + expectedValue + "'$>" : ""} ${behindValue ? "after <$blue:'" + behindValue + "'$>" : ""} at line <$yellow:${current.range.start.line + 1}$>,`,
		` ${rangeInfo}`,
		`{N}<$yellow:Received:$> <$blue:'${current.value === "\n" ? "\\n' (newline)" : current.value}'$>`,
		` at line <$yellow:${current.range.start.line + 1}$>,`,
		` ${rangeInfo}{N}`,
		"<$blue:{line}$>"
	];
};
// ========================================================================== //
//  Parse Key                                                                 //
// ========================================================================== //
function parseKey(tokens, i) {
	let key = "";
	if (current_token(tokens, i).type === TOKEN_TYPES.QUOTE) {
		i++; // consume opening QUOTE
		key = current_token(tokens, i).value;
		i++; // consume Key
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.QUOTE) {
			i++; // consume closing QUOTE
		}
	} else {
		key = current_token(tokens, i).value.trim();
		i++;
	}
	updateData(tokens, i);
	return [key, i];
}
// ========================================================================== //
//  Parse Value                                                               //
// ========================================================================== //
function parseValue(tokens, i, placeholders = {}, variables = {}, allowLogic = true) {
	let val = current_token(tokens, i).value;
	// consume Value
	if (current_token(tokens, i).type === TOKEN_TYPES.QUOTE) {
		i++; // consume opening QUOTE
		val = "";
		while (i < tokens.length && current_token(tokens, i).type !== TOKEN_TYPES.QUOTE) {
			const token = current_token(tokens, i);
			if (token.type === TOKEN_TYPES.PREFIX_P || token.type === TOKEN_TYPES.PREFIX_JS || token.type === TOKEN_TYPES.PREFIX_V) {
				const [resolvedVal, nextI] = parseValue(tokens, i, placeholders, variables, allowLogic);
				val += resolvedVal;
				i = nextI;
			} else {
				val += token.value;
				i++;
			}
		}

		if (i >= tokens.length) {
			parserError(errorMessage(tokens, i - 1, "\"", "unclosed string", "Unclosed quote"));
		}

		i++; // consume closing QUOTE
		return [val, i, true];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.PREFIX_JS) {
		val = current_token(tokens, i).value;
		// V4 NATIVE DATA: Strip js{ } and parse safely
		if (val.startsWith("js{") && val.endsWith("}")) {
			const clean = val.slice(3, -1).trim();
			val = safeDataParse(clean);
		}
		i++;
		return [val, i, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.LOGIC || current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD || current_token(tokens, i).type === TOKEN_TYPES.RUNTIME_KEYWORD) {
		if (!allowLogic) {
			parserError(errorMessage(tokens, i, "literal value", "", "Logic blocks are not allowed in this context."));
		}
		let isStatic = current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD;
		let isRuntimeKeyword = current_token(tokens, i).type === TOKEN_TYPES.RUNTIME_KEYWORD;
		let nextI = i;

		if (isStatic || isRuntimeKeyword) {
			nextI = skipJunk(tokens, i + 1);
			if (!current_token(tokens, nextI) || current_token(tokens, nextI).type !== TOKEN_TYPES.LOGIC) {
				// Treat as literal text if keyword is not followed by a logic block
				return [current_token(tokens, i).value, i + 1, false];
			}
			i = nextI;
		}

		const logicToken = current_token(tokens, i);
		const node = makeLogicNode(isStatic ? STATIC_LOGIC : RUNTIME_LOGIC);
		node.code = logicToken.value;
		node.range = logicToken.range;

		return [node, i + 1, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.PREFIX_V) {
		val = current_token(tokens, i).value;
		// V4.1.0 VARIABLE: Strip v{ } and resolve from local variables
		if (val.startsWith("v{") && val.endsWith("}")) {
			const key = val.slice(2, -1).trim();
			if (variables[key] !== undefined) {
				val = variables[key];
				if (!variables.__consumed__) {
					Object.defineProperty(variables, "__consumed__", {
						value: new Set(),
						enumerable: false,
						configurable: true
					});
				}
				variables.__consumed__.add(key);
			} else {
				val = getPrefixValue('v', key);
			}
		}
		i++;
		return [val, i, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.PREFIX_C) {
		val = current_token(tokens, i).value;
		// PREFIX_C is preserved for the resolveModules expansion phase
		i++;
		return [val, i, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.PREFIX_P) {
		val = current_token(tokens, i).value;
		// V4 PLACEHOLDER: Strip p{ } and resolve from config
		if (val.startsWith("p{") && val.endsWith("}")) {
			const key = val.slice(2, -1).trim();
			val = placeholders[key] !== undefined ? placeholders[key] : getPrefixValue('p', key);
		}
		i++;
		return [val, i, false];
	} else {
		val = "";
		while (i < tokens.length) {
			const token = current_token(tokens, i);
			if (!token) break;

			// Stop at any structural marker or whitespace
			if (token.type === TOKEN_TYPES.WHITESPACE ||
				token.type === TOKEN_TYPES.COMMA ||
				token.type === TOKEN_TYPES.CLOSE_BRACKET ||
				token.type === TOKEN_TYPES.COLON ||
				token.type === TOKEN_TYPES.SEMICOLON ||
				token.type === TOKEN_TYPES.EXCLAMATION_MARK ||
				token.type === TOKEN_TYPES.CLOSE_PAREN) break;

			if (token.type === TOKEN_TYPES.ESCAPE) {
				// Remove backslash
				val += token.value.slice(1);
			} else {
				val += token.value;
			}
			i++;
		}
	}

	updateData(tokens, i);
	return [val, i, false];
}
// ========================================================================== //
//  Parse ','                                                                 //
// ========================================================================== //
function parseComma(tokens, i, beforeChar = "") {
	i = skipJunk(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
		i++;
		i = skipJunk(tokens, i);
		updateData(tokens, i);

		if (
			!current_token(tokens, i) ||
			(current_token(tokens, i) &&
				current_token(tokens, i).type !== TOKEN_TYPES.VALUE &&
				current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE &&
				current_token(tokens, i).type !== TOKEN_TYPES.IDENTIFIER &&
				current_token(tokens, i).type !== TOKEN_TYPES.KEY &&
				current_token(tokens, i).type !== TOKEN_TYPES.QUOTE &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_JS &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_P)
		) {
			parserError(errorMessage(tokens, i, "value", ","));
		}
	} else {
		parserError(errorMessage(tokens, i, ",", beforeChar));
	}
	return i;
}
// ========================================================================== //
//  Parse ':'                                                                 //
// ========================================================================== //
function parseColon(tokens, i, afterChar = "") {
	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.COLON)) {
		parserError(errorMessage(tokens, i, ":", afterChar));
	}
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);
	return i;
}
// ========================================================================== //
//  Parse ';'                                                                 //
// ========================================================================== //
function parseSemiColon(tokens, i, afterChar = "") {
	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.SEMICOLON)) {
		parserError(errorMessage(tokens, i, ";", afterChar));
	}
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);
	return i;
}
/**
 * Parses a standard SomMark Block ([id] ... [end]).
 * Blocks are structural elements that can contain nested content.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {string|null} filename - Source filename.
 * @param {Object} placeholders - Dynamic public API data.
 * @returns {[Object, number]} The parsed Block node and new index.
 */
function parseBlock(tokens, i, filename = null, placeholders = {}, variables = {}, depth = 0) {
	const blockNode = makeBlockNode();
	blockNode.depth = depth;
	const openBracketToken = current_token(tokens, i);
	// ========================================================================== //
	//  consume '['                                                               //
	// ========================================================================== //
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);

	const idToken = current_token(tokens, i);
	if (!idToken || idToken.type === TOKEN_TYPES.EOF) {
		parserError(errorMessage(tokens, i, "Block ID", "[", "Missing Block Identifier"));
	}
	const id = idToken.value;
	if (id.trim() === end_keyword) {
		parserError(errorMessage(tokens, i, id, "", `'${id.trim()}' is a reserved keyword and cannot be used as an identifier.`));
	}
	blockNode.id = id.trim();
	if (!blockNode.id) {
		parserError(errorMessage(tokens, i, "Block ID", "[", "Block identifier cannot be empty"));
	}
	if (blockNode.id === "import") {
		blockNode.type = IMPORT;
	} else if (blockNode.id === "$use-module") {
		blockNode.type = USE_MODULE;
	} else if (idToken.type === TOKEN_TYPES.SLOT_KEYWORD) {
		blockNode.type = SLOT;
		// Prevent nested slots
		if (end_stack.some(e => e.id === "slot")) {
			parserError(errorMessage(tokens, i, "slot", "", "Nested slots are not allowed. A [slot] cannot be placed inside another [slot]."));
		}
	} else if (idToken.type === TOKEN_TYPES.FOR_EACH || blockNode.id === "for-each") {
		blockNode.type = FOR_EACH;
	}
	validateName(blockNode.id, true);
	blockNode.range.start = openBracketToken.range.start;
	end_stack.push({ id, line: openBracketToken.range.start.line + 1, col: openBracketToken.range.start.character });
	// ========================================================================== //
	//  consume Block Identifier                                                  //
	// ========================================================================== //
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.EQUAL) {
		// ========================================================================== //
		//  consume '='                                                               //
		// ========================================================================== //
		i++;
		i = skipJunk(tokens, i);
		updateData(tokens, i);

		if (
			!current_token(tokens, i) ||
			(current_token(tokens, i) &&
				current_token(tokens, i).type !== TOKEN_TYPES.VALUE &&
				current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE &&
				current_token(tokens, i).type !== TOKEN_TYPES.IDENTIFIER &&
				current_token(tokens, i).type !== TOKEN_TYPES.IMPORT &&
				current_token(tokens, i).type !== TOKEN_TYPES.USE_MODULE &&
				current_token(tokens, i).type !== TOKEN_TYPES.END_KEYWORD &&
				current_token(tokens, i).type !== TOKEN_TYPES.KEY &&
				current_token(tokens, i).type !== TOKEN_TYPES.QUOTE &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_JS &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_V &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_P &&
				current_token(tokens, i).type !== TOKEN_TYPES.LOGIC &&
				current_token(tokens, i).type !== TOKEN_TYPES.STATIC_KEYWORD &&
				current_token(tokens, i).type !== TOKEN_TYPES.RUNTIME_KEYWORD)
		) {
			parserError(errorMessage(tokens, i, block_value, "="));
		}
		// ========================================================================== //
		//  consume key-Value                                                         //
		// ========================================================================== //
		let k = "";
		let v = "";
		let vIsQuoted = false;
		let argIndex = 0;
		while (i < tokens.length) {
			i = skipJunk(tokens, i);
			const token = current_token(tokens, i);
			if (!token || token.type === TOKEN_TYPES.CLOSE_BRACKET) break;

			const isQuotedKey = token.type === TOKEN_TYPES.QUOTE && peek(tokens, i, 1) && (peek(tokens, i, 1).type === TOKEN_TYPES.KEY);

			if (token.type === TOKEN_TYPES.KEY || isQuotedKey) {
				let [key, keyIndex] = parseKey(tokens, i);
				k = key;
				i = keyIndex;
				i = skipJunk(tokens, i);
				i = parseColon(tokens, i, block_key);
				i = skipJunk(tokens, i);

				// Ensure there is a value after the colon
				const nextToken = current_token(tokens, i);
				if (!nextToken || nextToken.type === TOKEN_TYPES.CLOSE_BRACKET || nextToken.type === TOKEN_TYPES.COMMA) {
					parserError(errorMessage(tokens, i, block_value, ":", "Missing value after colon"));
				}

				// Validate only if it was a plain KEY token (not from a quote)
				if (token.type === TOKEN_TYPES.KEY) {
					validateName(k, true);
				}
			}

			// Parse Value (handles both quoted, unquoted, and prefixes)
			let [value, valueIndex, isQuoted] = parseValue(tokens, i, placeholders, variables);
			v = value;
			vIsQuoted = isQuoted;
			i = valueIndex;

			// Store Argument
			blockNode.args[String(argIndex++)] = v;
			if (k) {
				blockNode.args[k] = v;
			}
			k = "";
			v = "";

			i = skipJunk(tokens, i);
			const separatorToken = current_token(tokens, i);
			if (separatorToken && (separatorToken.type === TOKEN_TYPES.COMMA || separatorToken.type === TOKEN_TYPES.COLON)) {
				i++; // consume , or :
				i = skipJunk(tokens, i);
				updateData(tokens, i);

				// Ensure next token is NOT the closing bracket (trailing separator)
				const afterSeparator = current_token(tokens, i);
				if (!afterSeparator || afterSeparator.type === TOKEN_TYPES.CLOSE_BRACKET) {
					parserError(errorMessage(tokens, i, "value", "", "Unexpected trailing separator"));
				}
			} else {
				// No separator, must be end of arguments or ]
				break;
			}
		}
		if (v !== "") {
			if (typeof v === "string") {
				if (!vIsQuoted) v = v.trim();
				if (v.startsWith('"') && v.endsWith('"')) {
					v = v.slice(1, -1);
				}
			}
		}
	}

	i = skipJunk(tokens, i);

	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.EXCLAMATION_MARK) {
		blockNode.isSelfClosing = true;
		i++;
		i = skipJunk(tokens, i);
	}

	// ========================================================================== //
	//  Close Bracket                                                             //
	// ========================================================================== //
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_BRACKET)) {
		parserError(errorMessage(tokens, i, "]", block_id));
	}
	// ========================================================================== //
	//  consume ']'                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);

	if (blockNode.isSelfClosing) {
		end_stack.pop();
		blockNode.range.end = current_token(tokens, i - 1).range.end;
		return [blockNode, i];
	}

	tokens_stack.length = 0;
	while (i < tokens.length) {
		const nextIdx = skipJunk(tokens, i + 1);
		const nextToken = tokens[nextIdx];
		if (
			current_token(tokens, i) &&
			current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET &&
			nextToken &&
			nextToken.type !== TOKEN_TYPES.END_KEYWORD &&
			nextToken.value.trim() !== end_keyword
		) {
			const [childNode, nextIndex] = parseBlock(tokens, i, filename, placeholders, variables, depth + 1);

			blockNode.body.push(childNode);
			i = nextIndex;
		} else if (
			current_token(tokens, i) &&
			current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET &&
			nextToken &&
			(nextToken.type === TOKEN_TYPES.END_KEYWORD || nextToken.value.trim() === end_keyword)
		) {
			// ========================================================================== //
			//  consume '['                                                               //
			// ========================================================================== //
			i++;
			i = skipJunk(tokens, i);
			const current = current_token(tokens, i);
			if (!current || (current.type !== TOKEN_TYPES.END_KEYWORD && current.value.trim() !== end_keyword)) {
				let extraInfo = "";
				if (current && current.value) {
					const dist = levenshtein(current.value.trim().toLowerCase(), "end");
					if (dist <= 2) {
						extraInfo = ` (Did you mean <$cyan:'[end]'$>?)`;
					}
				}
				parserError(errorMessage(tokens, i, "end", "[", extraInfo));
			}
			// ========================================================================== //
			//  consume End Keyword                                                       //
			// ========================================================================== //
			i++;
			i = skipJunk(tokens, i);
			updateData(tokens, i);
			if (
				!current_token(tokens, i) ||
				(current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_BRACKET)
			) {
				parserError(errorMessage(tokens, i, "]", "end"));
			}
			end_stack.pop();
			// ========================================================================== //
			//  consume ']'                                                               //
			// ========================================================================== //
			const closeBracketToken = current_token(tokens, i);
			i++;
			updateData(tokens, i);
			blockNode.range.end = closeBracketToken.range.end;
			break;
		} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.WHITESPACE) {
			blockNode.body.push({
				type: TEXT,
				text: current_token(tokens, i).value,
				range: current_token(tokens, i).range
			});
			i++;
		} else {
			const [childNode, nextIndex] = parseNode(tokens, i, filename, placeholders, variables, depth + 1);
			if (childNode) {
				blockNode.body.push(childNode);
				i = nextIndex;
			} else {
				i++; // Should not happen with current parseNode fallback but good for safety
			}
		}
	}
	return [blockNode, i];
}
/**
 * Parses an Inline Statement ((content) -> (id)).
 * Inlines are fast, non-nesting formatting elements.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {Object} placeholders - Dynamic public API data.
 * @returns {[Object, number]} The parsed Inline node and new index.
 */
function parseInline(tokens, i, placeholders = {}, depth = 0) {
	const inlineNode = makeInlineNode();
	inlineNode.depth = depth;
	const openParenToken = current_token(tokens, i);
	inlineNode.range.start = openParenToken.range.start;

	// consume '('
	i++;
	updateData(tokens, i);

	// Phase 1: Content capture (Lexer provides high-level TEXT/ESCAPE tokens here)
	while (i < tokens.length) {
		const token = current_token(tokens, i);
		if (!token || token.type === TOKEN_TYPES.CLOSE_PAREN) break;

		if (token.type === TOKEN_TYPES.ESCAPE) {
			inlineNode.value += token.value.slice(1);
		} else if (token.type !== TOKEN_TYPES.COMMENT) {
			inlineNode.value += token.value;
		}
		i++;
	}

	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN) {
		parserError(errorMessage(tokens, i, ")", "inline content"));
	}
	i++; // consume ')'

	// Collapse newlines and whitespace for "inline" behavior
	inlineNode.value = inlineNode.value.replace(/\s+/g, " ").trim();

	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.THIN_ARROW) {
		parserError(errorMessage(tokens, i, "->", ")"));
	}
	i++; // consume '->'

	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.OPEN_PAREN) {
		parserError(errorMessage(tokens, i, "(", "->"));
	}
	i++; // consume '('
	i = skipJunk(tokens, i);
	const idToken = current_token(tokens, i);
	const allowedInlineIdTypes = new Set([
		TOKEN_TYPES.IDENTIFIER,
		TOKEN_TYPES.KEY,
		TOKEN_TYPES.IMPORT,
		TOKEN_TYPES.USE_MODULE,
		TOKEN_TYPES.SLOT_KEYWORD,
		TOKEN_TYPES.FOR_EACH
	]);
	if (!idToken || !allowedInlineIdTypes.has(idToken.type)) {
		parserError(errorMessage(tokens, i, inline_id, "("));
	}
	inlineNode.id = idToken.value.trim();
	validateName(inlineNode.id);

	i++; // consume ID
	i = skipJunk(tokens, i);

	const hasArgsTrigger = current_token(tokens, i) && (
		current_token(tokens, i).type === TOKEN_TYPES.COLON ||
		current_token(tokens, i).type === TOKEN_TYPES.EQUAL
	);

	if (hasArgsTrigger) {
		const separator = current_token(tokens, i).value;
		i++; // consume ':' or '='
		i = skipJunk(tokens, i);

		// Ensure there is a value after the separator
		const nextToken = current_token(tokens, i);
		if (!nextToken || nextToken.type === TOKEN_TYPES.CLOSE_PAREN || nextToken.type === TOKEN_TYPES.COMMA) {
			parserError(errorMessage(tokens, i, inline_value, separator, `Missing value after ${separator === "=" ? "equals" : "colon"}`));
		}

		let k = "";
		let v = "";
		let argIndex = 0;

		while (i < tokens.length) {
			i = skipJunk(tokens, i);
			const token = current_token(tokens, i);
			if (!token || token.type === TOKEN_TYPES.CLOSE_PAREN) break;

			if (token.type === TOKEN_TYPES.KEY) {
				let [key, keyIndex] = parseKey(tokens, i);
				k = key;
				i = keyIndex;
				i = skipJunk(tokens, i);
				i = parseColon(tokens, i, "inline argument");
				i = skipJunk(tokens, i);

				// Ensure there is a value after the colon
				const nextToken = current_token(tokens, i);
				if (!nextToken || nextToken.type === TOKEN_TYPES.CLOSE_PAREN || nextToken.type === TOKEN_TYPES.COMMA) {
					parserError(errorMessage(tokens, i, inline_value, ":", "Missing value after colon"));
				}
				validateName(k);
			}

			let [value, valueIndex, isQuoted] = parseValue(tokens, i, placeholders, {}, false);
			v = value;
			i = valueIndex;

			inlineNode.args[String(argIndex++)] = v;
			if (k) {
				inlineNode.args[k] = v;
			}
			k = "";
			v = "";

			i = skipJunk(tokens, i);
			if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
				i = parseComma(tokens, i, "inline argument");
			} else {
				break;
			}
		}
	}

	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN) {
		parserError(errorMessage(tokens, i, ")", inlineNode.id));
	}
	const finalParenToken = current_token(tokens, i);
	i++; // consume ')'
	inlineNode.range.end = finalParenToken.range.end;

	return [inlineNode, i];
}
/**
 * Parses a stream of text tokens into a single Text node.
 * Handles unescaping and placeholder resolution.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {Object} [placeholders={}] - Global data for p{keyword} resolution.
 * @param {Object} [variables={}] - Local data for v{keyword} resolution.
 * @param {Object} [options={}] - Formatting options.
 * @returns {[Object, number]} The Text node and new index.
 */
function parseText(tokens, i, placeholders = {}, variables = {}, depth = 0, options = {}) {
	const textNode = makeTextNode();
	textNode.depth = depth;
	const startToken = current_token(tokens, i);
	textNode.range.start = startToken.range.start;
	const { selectiveUnescape = false } = options;

	while (i < tokens.length) {
		const token = current_token(tokens, i);
		if (!token) break;

		if (token.type === TOKEN_TYPES.TEXT || token.type === TOKEN_TYPES.WHITESPACE || token.type === TOKEN_TYPES.VALUE) {
			textNode.text += token.value;
			i++;
		} else if (token.type === TOKEN_TYPES.STATIC_KEYWORD || token.type === TOKEN_TYPES.RUNTIME_KEYWORD) {
			const nextIdx = skipJunk(tokens, i + 1);
			if (tokens[nextIdx] && tokens[nextIdx].type === TOKEN_TYPES.LOGIC) {
				// Stop consuming text; this is the start of a logic block
				break;
			}
			textNode.text += token.value;
			i++;
		} else if (token.type === TOKEN_TYPES.ESCAPE) {
			if (selectiveUnescape) {
				const char = token.value.slice(1);
				if (char === "@" || char === "_") {
					textNode.text += char;
				} else {
					textNode.text += token.value;
				}
			} else {
				textNode.text += token.value.slice(1); // Standard behavior: unescape all
			}
			i++;
		} else if (token.type === TOKEN_TYPES.PREFIX_P) {
			const val = token.value;
			if (val.startsWith("p{") && val.endsWith("}")) {
				const match = [val.slice(2, -1).trim(), val, 'p'];
				const key = match[0];
				const layer = match[2]; // 'p' or 'v'

				if (placeholders[key] !== undefined) {
					textNode.text += String(placeholders[key]);
				} else {
					// Use the unique 'Unresolved Envelope' format via helper
					textNode.text += getPrefixValue(layer, key);
				}
			} else {
				textNode.text += val;
			}
			i++;
		} else if (token.type === TOKEN_TYPES.PREFIX_V) {
			const val = token.value;
			if (val.startsWith("v{") && val.endsWith("}")) {
				const key = val.slice(2, -1).trim();
				if (variables[key] !== undefined) {
					textNode.text += String(variables[key]);
					if (!variables.__consumed__) {
						Object.defineProperty(variables, "__consumed__", {
							value: new Set(),
							enumerable: false,
							configurable: true
						});
					}
					variables.__consumed__.add(key);
				} else {
					// Use the unique 'Unresolved Envelope' format via helper
					textNode.text += getPrefixValue('v', key);
				}
			} else {
				textNode.text += val;
			}
			i++;
		} else {
			break;
		}

		updateData(tokens, i);
		textNode.range.end = tokens[i - 1].range.end;
	}
	return [textNode, i];
}
/**
 * Parses an At-Block (@_id_@: args; content @_end_@).
 * At-Blocks maintain raw content preservation.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {string|null} filename - Source filename.
 * @param {Object} placeholders - Dynamic public API data.
 * @returns {[Object, number]} The At-Block node and new index.
 */
function parseAtBlock(tokens, i, filename = null, placeholders = {}, depth = 0) {
	const atBlockNode = makeAtBlockNode();
	atBlockNode.depth = depth;
	const openAtToken = current_token(tokens, i);
	atBlockNode.range.start = openAtToken.range.start;

	// consume '@_'
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);

	const idToken = current_token(tokens, i);
	if (!idToken || idToken.type === TOKEN_TYPES.EOF) {
		parserError(errorMessage(tokens, i, "AtBlock ID", "@_", "Missing AtBlock Identifier"));
	}

	const id = idToken.value;
	if (id.trim() === end_keyword) {
		parserError(errorMessage(tokens, i, id, "", `'${id.trim()}' is a reserved keyword and cannot be used as an identifier.`));
	}

	atBlockNode.id = id.trim();
	validateName(atBlockNode.id);

	// consume ID
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);

	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT)) {
		parserError(errorMessage(tokens, i, "_@", "at-block identifier"));
	}
	// consume '_@'
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);

	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
		// consume ':'
		i++;
		i = skipJunk(tokens, i);

		// Ensure there is a value after the colon
		const nextToken = current_token(tokens, i);
		if (!nextToken || nextToken.type === TOKEN_TYPES.SEMICOLON || nextToken.type === TOKEN_TYPES.COMMA) {
			parserError(errorMessage(tokens, i, at_value, ":", "Missing value after colon"));
		}

		let k = "";
		let v = "";
		let argIndex = 0;

		while (i < tokens.length) {
			i = skipJunk(tokens, i);
			const token = current_token(tokens, i);
			if (!token || token.type === TOKEN_TYPES.SEMICOLON) break;

			const isQuotedKey = token.type === TOKEN_TYPES.QUOTE && peek(tokens, i, 1) && (peek(tokens, i, 1).type === TOKEN_TYPES.KEY);

			if (token.type === TOKEN_TYPES.KEY || isQuotedKey) {
				let [key, keyIndex] = parseKey(tokens, i);
				k = key;
				i = keyIndex;
				i = skipJunk(tokens, i);
				i = parseColon(tokens, i, "at-block argument");
				i = skipJunk(tokens, i);

				// Ensure there is a value after the colon
				const nextToken = current_token(tokens, i);
				if (!nextToken || nextToken.type === TOKEN_TYPES.SEMICOLON || nextToken.type === TOKEN_TYPES.COMMA) {
					parserError(errorMessage(tokens, i, at_value, ":", "Missing value after colon"));
				}

				if (token.type === TOKEN_TYPES.KEY) {
					validateName(k);
				}
			}

			let [value, valueIndex, isQuoted] = parseValue(tokens, i, placeholders, {}, false);
			v = value;
			i = valueIndex;

			atBlockNode.args[String(argIndex++)] = v;
			if (k) {
				atBlockNode.args[k] = v;
			}
			k = "";
			v = "";

			i = skipJunk(tokens, i);
			if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
				i = parseComma(tokens, i, "at-block argument");
			} else {
				break;
			}
		}
	}

	// Semicolon is ALWAYS required after ID or ARGS
	i = parseSemiColon(tokens, i, "at-block header");

	// Body Capture
	i = skipJunk(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.TEXT) {
		atBlockNode.content = current_token(tokens, i).value;
		i++;
	} else {
		parserError(errorMessage(tokens, i, "content", "at-block body"));
	}

	// End Marker (@_end_@)
	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.OPEN_AT) {
		parserError(errorMessage(tokens, i, "@_", "at-block content"));
	}
	i++; // consume '@_'
	i = skipJunk(tokens, i);
	const endToken = current_token(tokens, i);
	if (!endToken || (endToken.type !== TOKEN_TYPES.END_KEYWORD && endToken.value.trim() !== end_keyword)) {
		let extraInfo = "";
		if (endToken && endToken.value) {
			const dist = levenshtein(endToken.value.trim().toLowerCase(), "end");
			if (dist > 0 && dist <= 2) {
				extraInfo = ` (Did you mean '@_end_@'?)`;
			}
		}
		parserError(errorMessage(tokens, i, "end", "AtBlock Body", extraInfo));
	}
	i++; // consume 'end'
	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT) {
		parserError(errorMessage(tokens, i, "_@", "end marker"));
	}
	const closeAtToken = current_token(tokens, i);
	i++; // consume '_@'
	atBlockNode.range.end = closeAtToken.range.end;

	return [atBlockNode, i];
}
// ========================================================================== //
//  Parse Comments                                                            //
// ========================================================================== //
function parseCommentNode(tokens, i, depth = 0) {
	const commentNode = makeCommentNode();
	const token = current_token(tokens, i);
	if (token && (token.type === TOKEN_TYPES.COMMENT || token.type === TOKEN_TYPES.COMMENT_BLOCK)) {
		commentNode.type = token.type === TOKEN_TYPES.COMMENT ? COMMENT : COMMENT_BLOCK;
		// Clean the text here instead of the transpiler
		const raw = token.value;
		commentNode.text = token.type === TOKEN_TYPES.COMMENT
			? raw.replace(/^#/, "").trim()
			: raw.replace(/^###[\r\n]*/, "").replace(/[\r\n]*###$/, "").trim();

		commentNode.depth = depth;
		commentNode.range = token.range;
	}
	// ========================================================================== //
	//  consume Comment '#'                                                       //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	return [commentNode, i];
}

// ========================================================================== //
//  Main Node Dispatcher                                                     //
// ========================================================================== //

/**
 * Dispatches the current token to the appropriate specialized parser function.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {string|null} filename - Source filename.
 * @param {Object} placeholders - Dynamic public API data.
 * @returns {[Object, number]} The parsed node and new index.
 */
function parseNode(tokens, i, filename = null, placeholders = {}, variables = {}, depth = 0) {
	if (!current_token(tokens, i) || (current_token(tokens, i) && !current_token(tokens, i).value)) {
		return [null, i];
	}
	// ========================================================================== //
	//  Comment                                                                   //
	// ========================================================================== //
	if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.COMMENT || current_token(tokens, i).type === TOKEN_TYPES.COMMENT_BLOCK)) {
		return parseCommentNode(tokens, i, depth);
	}
	// ========================================================================== //
	//  Block or Reserved Keyword                                                 //
	// ========================================================================== //
	else if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET)) {
		return parseBlock(tokens, i, filename, placeholders, variables, depth);
	}
	// ========================================================================== //
	//  Inline Statement or Text                                                  //
	// ========================================================================== //
	else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.OPEN_PAREN) {
		let j = i + 1;
		let parenCount = 1;
		let foundArrow = false;
		while (j < tokens.length) {
			const token = tokens[j];
			if (token.type === TOKEN_TYPES.OPEN_PAREN) {
				parenCount++;
			} else if (token.type === TOKEN_TYPES.CLOSE_PAREN) {
				parenCount--;
			}

			if (parenCount === 0) {
				const nextIdx = skipJunk(tokens, j + 1);
				if (tokens[nextIdx] && tokens[nextIdx].type === TOKEN_TYPES.THIN_ARROW) {
					foundArrow = true;
				}
				break;
			}
			// Safe-guard: If we hit a [ or @, it's highly unlikely to be an inline statement content
			// unless it's escaped, but lexer already handles [ and @ as structural tokens if not escaped.
			if (token.type === TOKEN_TYPES.OPEN_BRACKET || token.type === TOKEN_TYPES.OPEN_AT) break;
			j++;
		}

		if (foundArrow) {
			return parseInline(tokens, i, placeholders, depth);
		}

		// Treat as text if not an inline
		const textNode = makeTextNode();
		textNode.text = current_token(tokens, i).value;
		textNode.depth = depth;
		textNode.range = current_token(tokens, i).range;
		return [textNode, i + 1];
	}
	// ========================================================================== //
	//  Logic Block                                                               //
	// ========================================================================== //
	else if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD || current_token(tokens, i).type === TOKEN_TYPES.RUNTIME_KEYWORD || current_token(tokens, i).type === TOKEN_TYPES.LOGIC)) {
		let isStatic = current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD;
		let isRuntimeKeyword = current_token(tokens, i).type === TOKEN_TYPES.RUNTIME_KEYWORD;
		let startRange = current_token(tokens, i).range;
		let nextI = i;

		if (isStatic || isRuntimeKeyword) {
			nextI = skipJunk(tokens, i + 1);
			if (!current_token(tokens, nextI) || current_token(tokens, nextI).type !== TOKEN_TYPES.LOGIC) {
				// Treat as normal text if keyword is not followed by a logic block
				return parseText(tokens, i, placeholders, variables, depth);
			}
			i = nextI;
		}

		const logicToken = current_token(tokens, i);
		const node = makeLogicNode(isStatic ? STATIC_LOGIC : RUNTIME_LOGIC);
		node.code = logicToken.value;
		node.depth = depth;
		node.range = {
			start: (isStatic || isRuntimeKeyword) ? startRange.start : logicToken.range.start,
			end: logicToken.range.end
		};

		return [node, i + 1];
	}
	// ========================================================================== //
	//  Text or Placeholder                                                       //
	// ========================================================================== //
	else if (
		current_token(tokens, i) &&
		(current_token(tokens, i).type === TOKEN_TYPES.TEXT ||
			current_token(tokens, i).type === TOKEN_TYPES.WHITESPACE ||
			current_token(tokens, i).type === TOKEN_TYPES.ESCAPE ||
			current_token(tokens, i).type === TOKEN_TYPES.VALUE ||
			current_token(tokens, i).type === TOKEN_TYPES.PREFIX_V ||
			current_token(tokens, i).type === TOKEN_TYPES.PREFIX_P)
	) {
		return parseText(tokens, i, placeholders, variables, depth);
	}
	// ========================================================================== //
	//  Atblock                                                                   //
	// ========================================================================== //
	else if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.OPEN_AT)) {
		return parseAtBlock(tokens, i, filename, placeholders, depth);
	} else {
		// FALLBACK: Treat any other token as TEXT to avoid infinite loops and allow literal content
		const textNode = makeTextNode();
		textNode.text = current_token(tokens, i).value;
		textNode.depth = depth;
		textNode.range = current_token(tokens, i).range;
		return [textNode, i + 1];
	}
}

// ========================================================================== //
//  Main Parser Entry Point                                                  //
// ========================================================================== //

/**
 * SomMark Parser Entry Point.
 * 
 * Orchestrates the recursive descent parsing of the token stream into a 
 * hierarchical Abstract Syntax Tree (AST).
 * 
 * @param {Object[]} tokens - The stream of tokens from the Lexer.
 * @param {string|null} [filename=null] - Source filename for error context.
 * @param {Object} [placeholders={}] - Global data for p{keyword} resolution.
 * @param {Object} [variables={}] - Local data for v{keyword} resolution.
 * @returns {Array<Object>} The final Abstract Syntax Tree.
 */
function parser(tokens, filename = null, placeholders = {}, variables = {}) {
	end_stack = [];
	let ast = [];
	let i = 0;
	while (i < tokens.length) {
		let [node, nextIndex] = parseNode(tokens, i, filename, placeholders, variables, 1);
		if (node) {
			ast.push(node);
			i = nextIndex;
		} else {
			i++;
		}
	}
	if (end_stack.length !== 0) {
		let extraInfo = "";

		const checkTypo = (token) => {
			if (token && token.value) {
				const val = token.value.trim().toLowerCase();
				if (val === "") return "";
				const dist = levenshtein(val, "end");
				if (dist > 0 && dist <= 2) return ` (Did you mean <$cyan:'[end]'$>?)`;
			}
			return "";
		};

		// Check last few tokens for a typo
		for (let j = 1; j <= 5; j++) {
			const token = tokens[tokens.length - j];
			if (!token) break;
			extraInfo = checkTypo(token);
			if (extraInfo) break;
		}

		const lastOpen = end_stack[end_stack.length - 1];
		parserError(errorMessage(tokens, tokens.length - 1, "[end]", "", extraInfo ? `Missing '[end]' for block '${lastOpen.id}' (opened at line ${lastOpen.line}, col ${lastOpen.col})${extraInfo}` : `Missing '[end]' for block '${lastOpen.id}' (opened at line ${lastOpen.line}, col ${lastOpen.col})`, filename));
	}
	return ast;
}

const lexSync = (src, filename = "anonymous") => {
    if (src === undefined || src === null) {
        runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for tokenization.$>{line}`]);
    }
    if (typeof src !== "string") {
        runtimeError([`{line}<$red:Invalid Source Type:$> <$yellow:The 'src' argument must be a string, received ${typeof src}.$>{line}`]);
    }
    return lexer(src, filename);
};

const lex = async (src, filename = "anonymous") => lexSync(src, filename);

const parseSync = (src, filename = "anonymous") => {
    if (src === undefined || src === null) {
        runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for parsing.$>{line}`]);
    }
    if (typeof src !== "string") {
        runtimeError([`{line}<$red:Invalid Source Type:$> <$yellow:The 'src' argument must be a string, received ${typeof src}.$>{line}`]);
    }
    const tokens = lexer(src, filename);
    return parser(tokens, filename);
};

const parse = async (src, filename = "anonymous") => parseSync(src, filename);

export { TOKEN_TYPES, labels, lex, lexSync, parse, parseSync };
