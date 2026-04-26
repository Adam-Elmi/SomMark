import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import { end_keyword } from "./labels.js";
import { lexerError } from "./errors.js";

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

	let prev_type = "";
	let last_non_junk_type = ""; // Tracks the last real token for context guessing
	let i = 0;
	let line = 0, character = 0;

	// State Variables
	let isInAtBlockBody = false;
	let isInQuote = false;
	let isInHeader = false; // Tracks if we are in a structural header context
	let isInInlineHead = false; // Specific for (key:val) after ->
	let parenDepth = 0; // To track balanced parentheses in inlines
	let delimiterStack = []; // To track block nesting for body mode

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
			range: { start, end },
			depth: delimiterStack.length
		});

		prev_type = type;
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
				if ((src[i] === "j" && src[i+1] === "s" && src[i+2] === "{") || (src[i] === "p" && src[i+1] === "{")) {
					const isJS = (src[i] === "j");
					if (quoteValue.length > 0) {
						addToken(TOKEN_TYPES.VALUE, quoteValue);
						quoteValue = "";
					}
					
					let braceDepth = 1;
					let prefixValue = isJS ? "js{" : "p{";
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
					addToken(isJS ? TOKEN_TYPES.PREFIX_JS : TOKEN_TYPES.PREFIX_P, prefixValue);
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
			while (i < src.length && src[i] !== "\n") {
				comm += src[i];
				i++;
			}
			addToken(TOKEN_TYPES.COMMENT, comm);
			continue;
		}

		// ESCAPE CHARACTER (Sequence-based)
		if (char === "\\") {
			const seq = i + 1 < src.length ? "\\" + src[i + 1] : "\\";
			addToken(TOKEN_TYPES.ESCAPE, seq);
			i += seq.length;
			continue;
		}

		// PREFIX LAYERS (js{...} or p{...})
		if ((char === "j" && next === "s" && src[i+2] === "{") || (char === "p" && next === "{")) {
			const isJS = (char === "j");
			const isP = (char === "p");
			
			// Context Check
			const top = (delimiterStack.length > 0) ? delimiterStack[delimiterStack.length - 1] : null;
			const isInBlockHeader = isInHeader && top === "[";
			const isInNormalText = !isInHeader && !isInInlineHead && !isInAtBlockBody && parenDepth === 0;
			
			let allowed = false;
			if (isJS && isInBlockHeader) allowed = true;
			if (isP && (isInBlockHeader || isInNormalText)) allowed = true;

			if (allowed) {
				let braceDepth = 1;
				let prefixValue = isJS ? "js{" : "p{";
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
				addToken(isJS ? TOKEN_TYPES.PREFIX_JS : TOKEN_TYPES.PREFIX_P, prefixValue);
				continue;
			}
			// If not allowed, it will fall through to normal word scanning
		}

		// MULTI-CHAR MARKERS
		if (char === "@" && next === "_") {
			addToken(TOKEN_TYPES.OPEN_AT, "@_");
			i += 2;
			if (!isInAtBlockBody) delimiterStack.push("@");
			isInHeader = true; // At-Blocks start with a header part
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

		// SINGLE-CHAR MARKERS
		if (char === "[") {
			if (isInAtBlockBody || (parenDepth > 0 && !isInInlineHead)) {
				addToken(TOKEN_TYPES.TEXT, "[");
			} else {
				addToken(TOKEN_TYPES.OPEN_BRACKET, "[");
				delimiterStack.push("[");
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
				const top = delimiterStack[delimiterStack.length - 1];
				if (top === "@") {
					if (lastRealType === TOKEN_TYPES.END_KEYWORD) {
						delimiterStack.pop();
						isInAtBlockBody = false;
						isInHeader = false;
					}
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
					if (isInInlineHead) isInInlineHead = false;
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
				const allowed = [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.KEY, TOKEN_TYPES.CLOSE_AT, TOKEN_TYPES.VALUE, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.QUOTE, TOKEN_TYPES.PREFIX_JS, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT];
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
				const allowed = [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.KEY, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.QUOTE, TOKEN_TYPES.PREFIX_JS, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT];
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
				const allowed = [TOKEN_TYPES.VALUE, TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.QUOTE, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.PREFIX_JS, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT];
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
				const allowed = [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.VALUE, TOKEN_TYPES.CLOSE_AT, TOKEN_TYPES.CLOSE_PAREN, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.QUOTE, TOKEN_TYPES.PREFIX_JS, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT];
				if (allowed.includes(last_non_junk_type)) {
					addToken(TOKEN_TYPES.SEMICOLON, ";");
					isInHeader = false; // Semicolon ends the At-Block header
					// Trigger body mode for At-Blocks
					if (delimiterStack.length > 0) {
						const top = delimiterStack[delimiterStack.length - 1];
						if (top === "@") {
							isInAtBlockBody = true;
						}
					}
				} else {
					addToken(TOKEN_TYPES.TEXT, ";");
				}
			}
			i++;
			continue;
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

		let stopChars = "[](){}:=;,@_>\"'#\\ \t\n\r";
		if (isStartOfBlockId || (parenDepth > 0 && !isInInlineHead)) {
			stopChars = stopChars.replace(":", "");
		}
		if (!isInHeader && !isInInlineHead) {
			stopChars = "[]@_()\\#\n\r"; // In normal text, stop at markers, comments and newlines
		}

		while (i < src.length && !stopChars.includes(src[i])) { 
			// Lookahead for -> marker in normal text
			if (!isInHeader && src[i] === "-" && src[i+1] === ">") break;

			// Stop if we hit an ALLOWED prefix trigger
			if ((src[i] === "p" && src[i+1] === "{")) {
				const top = (delimiterStack.length > 0) ? delimiterStack[delimiterStack.length - 1] : null;
				const isInBlockHeader = isInHeader && top === "[";
				const isInNormalText = !isInHeader && !isInInlineHead && !isInAtBlockBody && parenDepth === 0;
				if (isInBlockHeader || isInNormalText) break;
			}
			if (src[i] === "j" && src[i+1] === "s" && src[i+2] === "{") {
				const top = (delimiterStack.length > 0) ? delimiterStack[delimiterStack.length - 1] : null;
				if (isInHeader && top === "[") break;
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
						if (delimiterStack[delimiterStack.length - 1] === "[") delimiterStack.pop();
					}
					else if (word === "import") addToken(TOKEN_TYPES.IMPORT, word);
					else if (word === "$use-module") addToken(TOKEN_TYPES.USE_MODULE, word);
					else addToken(TOKEN_TYPES.IDENTIFIER, word);
				} else {
					// Use lookahead to distinguish KEY from VALUE
					const p = peekStructural(i);
					if (p === ":") {
						addToken(TOKEN_TYPES.KEY, word);
					} else {
						addToken(TOKEN_TYPES.VALUE, word);
					}
				}
			} else {
				// Normal text
				addToken(TOKEN_TYPES.TEXT, word);
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

export default lexer;
