import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import { end_keyword } from "./labels.js";
import { lexerError } from "./errors.js";

/**
 * SomMark Lexer
 */

// ========================================================================== //
//  Helper Functions                                                         //
// ========================================================================== //

const atBlockEndRegex = new RegExp(`^@_\\s*${end_keyword}\\s*_@`);

// Checks if we reached the end of an At-Block
function isAtBlockEnd(input, index) {
	const slice = typeof input === "string" ? input.slice(index, index + 100) : input.slice(index, index + 100).join("");
	return atBlockEndRegex.test(slice);
}

// Collects characters inside a quoted string
function concatQuote(input, index) {
	let text = "\"";
	for (let i = index + 1; i < input.length; i++) {
		const char = input[i];
		if (char === "\\" && peek(input, i, 1) === "\"") {
			text += "\\\"";
			i++;
			continue;
		}
		text += char;
		if (char === "\"") return text;
	}
	lexerError(["[Lexer Error]: Unclosed quote"]);
	return text;
}

// Collects plain text until a special character is found
function concatText(input, index, isInHeader, isInAtBlockBody, isLiberalValue = false) {
	let text = "";
	if (index >= input.length) return text;
	for (let i = index; i < input.length; i++) {
		const char = input[i];
		const stopConditions = [
			["[", !isInAtBlockBody],
			["(", !isInAtBlockBody],
			["#", !isInAtBlockBody && !isLiberalValue],
			["=", isInHeader && !isInAtBlockBody],
			["\"", isInHeader],
			["]", isInHeader],
			[")", isInHeader],
			["-", peek(input, i, 1) === ">" && (isInHeader || true)],
			["@", peek(input, i, 1) === "_" && (!isInAtBlockBody || isAtBlockEnd(input, i))],
			["_", peek(input, i, 1) === "@" && isInHeader],
			["\\", true],
			[":", isInHeader && !isInAtBlockBody],
			[";", isInHeader],
			[",", isInHeader]
		];
		let shouldStop = false;
		for (const [stopChar, conditionMet] of stopConditions) {
			if (conditionMet && input.substring(i, i + stopChar.length) === stopChar) {
				shouldStop = true;
				break;
			}
		}
		if (shouldStop) break;
		text += char;
	}
	return text;
}

// Handles backslash escapes in the text
function concatEscape(input, index) {
	if (index >= input.length) return "";
	const nextChar = peek(input, index, 1);
	const WHITESPACES = [" ", "\t", "\n", "\r", "\v", "\f"];
	if (WHITESPACES.includes(nextChar)) lexerError(["[Lexer Error]: Invalid escape sequence (escaped whitespace)"]);
	if (input[index] === "\\" && nextChar !== null) return "\\" + nextChar;
	lexerError(["[Lexer Error]: Invalid escape sequence"]);
	return "";
}

// ========================================================================== //
//  Main Lexer Function                                                      //
// ========================================================================== //

function lexer(src) {
	if (!src || typeof src !== "string") return [];
	const tokens = [];
	let isInHeader = false, isInAtBlockBody = false;
	let line = 0, character = 0, depth_stack = [];

	// ========================================================================== //
	//  Token Creation Helpers                                                   //
	// ========================================================================== //

	function addToken(type, value, rawValue) {
		if (typeof rawValue === "string" && typeof value === "string" && rawValue !== value) {
			const offset = rawValue.indexOf(value);
			if (offset !== -1) {
				advance(rawValue.slice(0, offset));
				const startPos = { line, character }; advance(value);
				const endPos = { line, character };
				tokens.push({ type, value, range: { start: startPos, end: endPos }, depth: depth_stack.length });
				advance(rawValue.slice(offset + value.length));
				return;
			}
		}
		const startPos = { line, character }; advance(rawValue || value);
		const endPos = { line, character };
		tokens.push({ type, value, range: { start: startPos, end: endPos }, depth: depth_stack.length });
	}

	function advance(text) {
		const newlines = (text.match(/\n/g) || []).length;
		if (newlines > 0) { line += newlines; character = text.split("\n").pop().length; }
		else character += text.length;
	}

	function validateIdentifier(id, charPos) {
		if (!/^[a-zA-Z0-9\-_$]+$/.test(id.trim())) {
			lexerError([`[Lexer Error]: Invalid Identifier: '${id.trim()}' at line ${line + 1}, col ${charPos || character}`]);
		}
	}

	// ========================================================================== //
	//  Main Tokenization Loop                                                   //
	// ========================================================================== //

	for (let i = 0; i < src.length; i++) {
		const char = src[i];
		const next = peek(src, i, 1);
		
		// ========================================================================== //
		//  Look back at previous tokens to determine current context                //
		// ========================================================================== //
		let prev_type = "", prev_prev_type = "", count = 0;
		for (let j = tokens.length - 1; j >= 0; j--) {
			const t = tokens[j];
			if (t.type !== TOKEN_TYPES.TEXT && t.type !== TOKEN_TYPES.COMMENT) {
				if (count === 0) prev_type = t.type;
				else if (count === 1) prev_prev_type = t.type;
				count++; if (count >= 2) break;
			}
		}

		// ========================================================================== //
		//  Check for structural characters ([ ], ( ), @_, _@)                      //
		// ========================================================================== //

		if (char === "[" && !isInAtBlockBody) {
			let idPeek = ""; for (let j = i + 1; j < src.length && !/[=\]:#]/.test(src[j]); j++) idPeek += src[j];
			if (idPeek.trim() !== end_keyword) depth_stack.push("B");
			addToken(TOKEN_TYPES.OPEN_BRACKET, char); isInHeader = true;
		} else if (char === "]" && isInHeader) {
			addToken(TOKEN_TYPES.CLOSE_BRACKET, char); isInHeader = false;
			// Reliable depth pop on [end]
			for (let j = tokens.length - 1; j >= 0; j--) {
				const t = tokens[j];
				if (t.type === TOKEN_TYPES.IDENTIFIER || t.type === TOKEN_TYPES.END_KEYWORD) {
					if (t.type === TOKEN_TYPES.END_KEYWORD || t.value.trim() === end_keyword) depth_stack.pop();
					break;
				}
			}
		} else if (char === "(" && !isInAtBlockBody) {
			addToken(TOKEN_TYPES.OPEN_PAREN, char); isInHeader = true;
		} else if (char === ")" && isInHeader) {
			addToken(TOKEN_TYPES.CLOSE_PAREN, char); isInHeader = false;
		} else if (char === "@" && next === "_" && (!isInAtBlockBody || isAtBlockEnd(src, i))) {
			let idPeek = ""; for (let j = i + 2; j < src.length && !/[_@:#]/.test(src[j]); j++) idPeek += src[j];
			if (idPeek.trim() !== end_keyword) depth_stack.push("A");
			addToken(TOKEN_TYPES.OPEN_AT, "@_"); i++; isInHeader = true;
		} else if (char === "_" && next === "@" && (isInHeader || isInAtBlockBody)) {
			addToken(TOKEN_TYPES.CLOSE_AT, "_@"); i++;
			for (let j = tokens.length - 1; j >= 0; j--) {
				const t = tokens[j];
				if (t.type === TOKEN_TYPES.IDENTIFIER || t.type === TOKEN_TYPES.END_KEYWORD) {
					if (t.type === TOKEN_TYPES.END_KEYWORD || t.value.trim() === end_keyword) depth_stack.pop();
					break;
				}
			}
			isInHeader = true; isInAtBlockBody = false;
		} else if (char === ";" && isInHeader) {
			addToken(TOKEN_TYPES.SEMICOLON, char); isInHeader = false; isInAtBlockBody = true;
		} else if (char === "=" && isInHeader && !isInAtBlockBody) {
			addToken(TOKEN_TYPES.EQUAL, char);
		} else if (char === ":" && isInHeader && !isInAtBlockBody && (prev_type === TOKEN_TYPES.IDENTIFIER || prev_type === TOKEN_TYPES.CLOSE_AT)) {
			addToken(TOKEN_TYPES.COLON, char);
		} else if (char === "," && isInHeader) {
			addToken(TOKEN_TYPES.COMMA, char);
		} else if (char === "-" && next === ">" && (isInHeader || prev_type === TOKEN_TYPES.CLOSE_PAREN)) {
			addToken(TOKEN_TYPES.THIN_ARROW, "->"); i++;
		} else if (char === "\"" && isInHeader) {
			const quote = concatQuote(src, i); addToken(TOKEN_TYPES.VALUE, quote); i += quote.length - 1;
		} else if (char === "\\") {
			const esc = concatEscape(src, i); addToken(TOKEN_TYPES.ESCAPE, esc); i += esc.length - 1;
		} else if (char === "#" && !isInAtBlockBody) {
			let comm = ""; for (; i < src.length && src[i] !== "\n"; i++) comm += src[i];
			addToken(TOKEN_TYPES.COMMENT, comm, comm); i--;
		} else if (char === "\n" && !isInAtBlockBody) {
			advance(char);
		} else {
			// ========================================================================== //
			//  Capture plain text or Identifier values                                 //
			// ========================================================================== //
			const isValueContext = (prev_type === TOKEN_TYPES.COLON || prev_type === TOKEN_TYPES.EQUAL);
			const context = concatText(src, i, isInHeader, isInAtBlockBody, isValueContext);
			if (context.length > 0) {
				if (isInHeader) {
					const trimmed = context.trim();
					if ((prev_type === TOKEN_TYPES.OPEN_BRACKET || prev_type === TOKEN_TYPES.OPEN_AT) && trimmed === end_keyword) {
						addToken(TOKEN_TYPES.END_KEYWORD, trimmed, context);
					} else if (trimmed.length > 0) {
						let isNextColon = false;
						for (let j = i + context.length; j < src.length; j++) {
							const c = src[j];
							if (c === " " || c === "\t" || c === "\n") continue;
							if (c === ":") isNextColon = true;
							break;
						}
						
						const isBlockStart = (prev_type === TOKEN_TYPES.OPEN_BRACKET || prev_type === TOKEN_TYPES.OPEN_AT);
						const isMapperHead = (prev_type === TOKEN_TYPES.OPEN_PAREN && prev_prev_type === TOKEN_TYPES.THIN_ARROW);
						const isMandatoryId = (isNextColon || prev_type === TOKEN_TYPES.THIN_ARROW);
						
						if (isBlockStart || isMapperHead || isMandatoryId) {
							validateIdentifier(trimmed, character + context.indexOf(trimmed));
							addToken(TOKEN_TYPES.IDENTIFIER, trimmed, context);
						} else {
							addToken(TOKEN_TYPES.VALUE, trimmed, context);
						}
					} else {
						advance(context);
					}
				} else {
					addToken(TOKEN_TYPES.TEXT, context);
				}
				i += context.length - 1;
			} else {
				addToken(TOKEN_TYPES.TEXT, char);
			}
		}
	}
	// ========================================================================== //
	//  Finalize with End-of-File token                                          //
	// ========================================================================== //
	addToken(TOKEN_TYPES.EOF, "");
	return tokens;
}

export default lexer;
