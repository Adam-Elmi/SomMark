import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import { end_keyword } from "./labels.js";

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
	let isInQuote = false;
	let isInHeader = false;      // Tracks if we are in a structural header context
	let isInPVPrefix = false;    // Tracks if we are scanning inside a p{} or v{} prefix
	let pendingSmarkRaw = false; // Set when KEY "smark-raw" is seen — waiting for value
	let hasSmarkRaw = false;     // Set when smark-raw: true is confirmed in header
	let isRawContent = false;    // Set when inside a smark-raw block — content collected as-is, not parsed

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
		const char = src[i];
		const next = src[i + 1];

		// --- RAW CONTENT MODE ---
		// Collect everything as-is until [end] or [end:name]. \[ escapes a literal [.
		if (isRawContent) {
			let raw = "";
			while (i < src.length) {
				if (src[i] === "\\" && src[i + 1] === "[") {
					raw += "[";
					i += 2;
					continue;
				}
				if (src[i] === "[") {
					if (src.startsWith(`[${end_keyword}]`, i) || src.startsWith(`[${end_keyword}:`, i)) break;
				}
				raw += src[i];
				i++;
			}
			if (raw) addToken(TOKEN_TYPES.TEXT, raw);
			isRawContent = false;
			continue;
		}

		// --- PHASE 1.5: PV PREFIX CONTENT MODE ---
		// Handles structured content inside p{} and v{} prefixes.
		if (isInPVPrefix && !isInQuote) {
			if (char === '"' || char === "'") {
				addToken(TOKEN_TYPES.QUOTE, char);
				i++;
				isInQuote = true;
				continue;
			}
			if (char === '|') {
				addToken(TOKEN_TYPES.PIPELINE, "|");
				i++;
				continue;
			}
			if (char === '}') {
				addToken(TOKEN_TYPES.PREFIX_CLOSE, "}");
				isInPVPrefix = false;
				i++;
				continue;
			}
			if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
				let word = '';
				while (i < src.length) {
					const c = src[i];
					if (c === '}' || c === '|' || c === '"' || c === "'" || c === ' ' || c === '\t' || c === '\n' || c === '\r') break;
					word += c;
					i++;
				}
				if (word) addToken(TOKEN_TYPES.KEY, word);
				continue;
			}
			// Whitespace: fall through to PHASE 3 whitespace handling
		}

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
				if ((src[i] === "p" && src[i + 1] === "{") || (src[i] === "v" && src[i + 1] === "{")) {
					const isV = (src[i] === "v");
					if (quoteValue.length > 0) {
						addToken(TOKEN_TYPES.VALUE, quoteValue);
						quoteValue = "";
					}

					{
						// p{} or v{}: keyword + PREFIX_OPEN + unquoted key + optional PIPELINE + fallback + PREFIX_CLOSE
						addToken(isV ? TOKEN_TYPES.PREFIX_V : TOKEN_TYPES.PREFIX_P, isV ? "v" : "p");
						addToken(TOKEN_TYPES.PREFIX_OPEN, "{");
						i += 2;
						// Scan unquoted key (cannot use same quote char as outer string)
						let key = "";
						while (i < src.length && src[i] !== "|" && src[i] !== "}" && src[i] !== quoteChar) {
							key += src[i];
							i++;
						}
						if (key.trim()) addToken(TOKEN_TYPES.KEY, key.trim());
						// Optional PIPELINE + fallback
						if (i < src.length && src[i] === "|") {
							addToken(TOKEN_TYPES.PIPELINE, "|");
							i++;
							let fallback = "";
							while (i < src.length && src[i] !== "}" && src[i] !== quoteChar) {
								fallback += src[i];
								i++;
							}
							if (fallback.trim()) addToken(TOKEN_TYPES.VALUE, fallback.trim());
						}
						// PREFIX_CLOSE
						if (i < src.length && src[i] === "}") {
							addToken(TOKEN_TYPES.PREFIX_CLOSE, "}");
							i++;
						}
					}
					continue;
				}

				if (src[i] === quoteChar) {
					// Guess role based on next structural character
					let nextStructural = peekStructural(i + 1);
					let tokenType = isInHeader && (nextStructural === ":" || nextStructural === "=")
						? TOKEN_TYPES.KEY
						: TOKEN_TYPES.VALUE;

					if (quoteValue.length > 0) addToken(tokenType, quoteValue);
					if (pendingSmarkRaw && tokenType === TOKEN_TYPES.VALUE && quoteValue === "true") {
						hasSmarkRaw = true;
						pendingSmarkRaw = false;
					}
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
				const startPos = i;
				comm = "###";
				i += 3;
				let closed = false;
				while (i < src.length) {
					if (src[i] === "#" && src[i + 1] === "#" && src[i + 2] === "#") {
						comm += "###";
						i += 3;
						closed = true;
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

		// PREFIX LAYERS (p{...} or v{...})
		if ((char === "p" && next === "{") || (char === "v" && next === "{")) {
			const isP = (char === "p");
			const isV = (char === "v");

			// Context Check
			const isBlockHeader = isInHeader;
			const isNormalText = !isInHeader;

			let allowed = false;
			if (isP && (isBlockHeader || isNormalText)) allowed = true;
			if (isV && (isBlockHeader || isNormalText)) allowed = true;

			if (allowed) {
				// p{} or v{}: emit keyword + PREFIX_OPEN, enter structured content mode
				addToken(isV ? TOKEN_TYPES.PREFIX_V : TOKEN_TYPES.PREFIX_P, isV ? "v" : "p");
				addToken(TOKEN_TYPES.PREFIX_OPEN, "{");
				i += 2; // skip "p{" or "v{"
				isInPVPrefix = true;
				continue;
			}
			// If not allowed, it will fall through to normal word scanning
		}

		// STATIC KEYWORD
		if (char === "s" && src.slice(i, i + 6) === "static") {
			const afterStatic = src.slice(i + 6);
			const hasSpace = afterStatic.startsWith(" ");
			const hasLogic = hasSpace ? afterStatic.slice(1).startsWith("${") : afterStatic.startsWith("${");

			const isMainIdentifier = last_non_junk_type === TOKEN_TYPES.OPEN_BRACKET;

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

			const isMainIdentifier = last_non_junk_type === TOKEN_TYPES.OPEN_BRACKET;

			if ((hasLogic || isInHeader) && !isMainIdentifier) {
				addToken(TOKEN_TYPES.RUNTIME_KEYWORD, hasSpace ? "runtime " : "runtime");
				i += hasSpace ? 8 : 7;
				continue;
			}
		}

		// LOGIC BLOCKS (${ ... }$) — explicit: static/runtime ${ }$  shorthand: ${ }$ = static ${ }$
		if (char === "$" && next === "{") {
			{
				addToken(TOKEN_TYPES.LOGIC_OPEN, "${");
				i += 2;

				let logicCode = "";
				let depth = 0;
				let internalString = null;

				while (i < src.length) {
					const c = src[i];
					const n = src[i + 1];

					// Close condition: }$ at depth 0, not followed by { (}${ is a template expression boundary)
					if (c === "}" && n === "$" && !internalString && depth === 0 && src[i + 2] !== "{") {
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
						else if (c === "{") depth++;
						else if (c === "}") depth--;
					}

					logicCode += c;
					i++;
				}

				addToken(TOKEN_TYPES.LOGIC, logicCode);

				if (i < src.length && src[i] === "}" && src[i + 1] === "$") {
					addToken(TOKEN_TYPES.LOGIC_CLOSE, "}$");
					i += 2;
				}

				continue;
			}
		}

		// SINGLE-CHAR MARKERS
		if (char === "[") {
			addToken(TOKEN_TYPES.OPEN_BRACKET, "[");
			isInHeader = true;
			pendingSmarkRaw = false;
			hasSmarkRaw = false;
			i++;
			continue;
		}
		if (char === "]") {
			addToken(TOKEN_TYPES.CLOSE_BRACKET, "]");
			isInHeader = false;
			if (hasSmarkRaw) {
				isRawContent = true;
				hasSmarkRaw = false;
			}
			pendingSmarkRaw = false;
			i++;
			continue;
		}
		if (char === ":") {
			const colonAllowed = [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.KEY, TOKEN_TYPES.VALUE, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.QUOTE, TOKEN_TYPES.PREFIX_V, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.PREFIX_CLOSE, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT, TOKEN_TYPES.LOGIC, TOKEN_TYPES.LOGIC_CLOSE, TOKEN_TYPES.STATIC_KEYWORD, TOKEN_TYPES.RUNTIME_KEYWORD, TOKEN_TYPES.FOR_EACH];
			if (colonAllowed.includes(last_non_junk_type)) {
				addToken(TOKEN_TYPES.COLON, ":");
				isInHeader = true;
			} else {
				addToken(TOKEN_TYPES.TEXT, ":");
			}
			i++;
			continue;
		}
		if (char === "=") {
			const eqAllowed = [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.KEY, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.QUOTE, TOKEN_TYPES.PREFIX_V, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.PREFIX_CLOSE, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT, TOKEN_TYPES.LOGIC, TOKEN_TYPES.LOGIC_CLOSE, TOKEN_TYPES.STATIC_KEYWORD, TOKEN_TYPES.RUNTIME_KEYWORD, TOKEN_TYPES.FOR_EACH];
			if (eqAllowed.includes(last_non_junk_type)) {
				addToken(TOKEN_TYPES.EQUAL, "=");
			} else {
				addToken(TOKEN_TYPES.TEXT, "=");
			}
			i++;
			continue;
		}
		if (char === ",") {
			const commaAllowed = [TOKEN_TYPES.VALUE, TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.QUOTE, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.PREFIX_V, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.PREFIX_CLOSE, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT, TOKEN_TYPES.LOGIC, TOKEN_TYPES.LOGIC_CLOSE, TOKEN_TYPES.STATIC_KEYWORD, TOKEN_TYPES.RUNTIME_KEYWORD, TOKEN_TYPES.FOR_EACH];
			if (commaAllowed.includes(last_non_junk_type)) {
				addToken(TOKEN_TYPES.COMMA, ",");
			} else {
				addToken(TOKEN_TYPES.TEXT, ",");
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
			const valTriggers = [TOKEN_TYPES.COLON, TOKEN_TYPES.EQUAL, TOKEN_TYPES.COMMA, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.OPEN_BRACKET];
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
		const isStartOfBlockId = (last_non_junk_type === TOKEN_TYPES.OPEN_BRACKET);
		const isInNormalText = !isInHeader;

		let stopChars = "[]{}:=,\"'#\\ \t\n\r!";
		if (isStartOfBlockId) {
			stopChars = stopChars.replace(":", "");
		}
		if (isInNormalText) {
			stopChars = "[]\\#\n\r"; // In normal text, stop only at block markers, escapes, comments and newlines
		}

		while (i < src.length && !stopChars.includes(src[i])) {
			// Stop ONLY if $ is followed by { (Logic block start)
			if (src[i] === "$" && src[i + 1] === "{") break;

			// Lookahead for 'static ${' or 'runtime ${' mid-word
			if (word.length > 0) {
				if (src[i] === "s" && src.slice(i, i + 7) === "static " && src[i + 7] === "$" && src[i + 8] === "{") break;
				if (src[i] === "s" && src.slice(i, i + 6) === "static" && src[i + 6] === "$" && src[i + 7] === "{") break;
				if (src[i] === "r" && src.slice(i, i + 8) === "runtime " && src[i + 8] === "$" && src[i + 9] === "{") break;
				if (src[i] === "r" && src.slice(i, i + 7) === "runtime" && src[i + 7] === "$" && src[i + 8] === "{") break;
			}

			// Stop if we hit an ALLOWED prefix trigger
			if ((src[i] === "p" && src[i + 1] === "{") || (src[i] === "v" && src[i + 1] === "{")) {
				if (isInHeader || isInNormalText) break;
			}
			word += src[i];
			i++;
		}

		if (word.length > 0) {
			// Guess role based on context
			if (isInHeader) {
				// Inside a structural header context
				const isMainIdentifier = last_non_junk_type === TOKEN_TYPES.OPEN_BRACKET;

				if (isMainIdentifier) {
					if (word === end_keyword || word.startsWith(end_keyword + ":")) {
						addToken(TOKEN_TYPES.END_KEYWORD, word);
					}
					else if (word === "import") addToken(TOKEN_TYPES.IMPORT, word);
					else if (word === "$use-module") addToken(TOKEN_TYPES.USE_MODULE, word);
					else if (word === "slot") addToken(TOKEN_TYPES.SLOT_KEYWORD, word);
					else if (word === "for-each") addToken(TOKEN_TYPES.FOR_EACH, word);
					else {
						addToken(TOKEN_TYPES.IDENTIFIER, word);
					}
				} else {
					// Use lookahead to distinguish KEY from VALUE
					const p = peekStructural(i);
					if (p === ":") {
						addToken(TOKEN_TYPES.KEY, word);
						if (word === "smark-raw") pendingSmarkRaw = true;
					} else if (word === "static") {
						addToken(TOKEN_TYPES.STATIC_KEYWORD, word);
					} else if (word === "runtime") {
						addToken(TOKEN_TYPES.RUNTIME_KEYWORD, word);
					} else {
						addToken(TOKEN_TYPES.VALUE, word);
						if (pendingSmarkRaw) {
							if (word === "true") hasSmarkRaw = true;
							pendingSmarkRaw = false;
						}
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

export default lexer;
