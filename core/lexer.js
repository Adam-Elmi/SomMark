import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import {
	block_value,
	block_id,
	block_id_2,
	block_end,
	inline_id,
	inline_value,
	inline_id_2,
	at_id,
	at_value,
	at_id_2,
	at_end,
	end_keyword,
	BLOCKCOMMA,
	ATBLOCKCOMMA,
	INLINECOMMA,
	BLOCKCOLON,
	ATBLOCKCOLON,
	INLINECOLON
} from "./labels.js";
import { lexerError, sommarkError } from "./errors.js";

const atBlockEndRegex = new RegExp(`^@_\\s*${end_keyword}\\s*_@`);
function isAtBlockEnd(input, index) {
	const slice = typeof input === "string" ? input.slice(index, index + 100) : input.slice(index, index + 100).join("");
	return atBlockEndRegex.test(slice);
}

const updateNewLine = text => {
	if (text && typeof text === "string") {
		return text.split("").filter(value => value === "\n").length;
	}
	return;
};

const updateColumn = (end = 0, textLength) => {
	const start = end + 1;
	const newEnd = start + textLength - 1;
	return { start, end: newEnd };
};

function concatText(input, index, scope_state, extraConditions = []) {
	let text = "";
	if (index >= input.length) {
		return text;
	}
	if (
		(Array.isArray(input) || typeof input === "string") &&
		input.length > 0 &&
		typeof index === "number" &&
		typeof scope_state === "boolean"
	) {
		for (let i = index; i < input.length; i++) {
			const char = input[i];
			const defaultConditions = [
				["[", !scope_state],
				["=", !scope_state],
				["]", !scope_state],
				["(", !scope_state],
				["-", peek(input, i, 1) === ">" && !scope_state],
				["@", peek(input, i, 1) === "_" && (!scope_state || isAtBlockEnd(input, i))],
				["_", peek(input, i, 1) === "@" && !scope_state],
				["#", !scope_state],
				["\\", true]
			];
			if (defaultConditions.some(([ch, condition]) => (!ch || ch === char) && condition)) {
				break;
			} else if (extraConditions.some(([ch, condition]) => (!ch || ch === char) && condition)) {
				break;
			}
			text += char;
		}
		return text;
	} else {
		sommarkError([
			"{line}<$red:Invalid Arguments:$> <$yellow:Assign arguments to their correct types, ",
			"'input' must be an array and have to be not empty, 'index' must be a number value, and 'scope_state' ",
			"must be a boolean.$>{line}."
		]);
	}
}

function concatEscape(input, index) {
	let str = "";
	if (index >= input.length) {
		return str;
	}
	const WHITESPACES = [
		" ",
		"\t",
		"\n",
		"\r",
		"\v",
		"\f",
		//+++++++//
		"\u00A0",
		"\u1680",
		"\u2000",
		"\u2001",
		"\u2002",
		"\u2003",
		"\u2004",
		"\u2005",
		"\u2006",
		"\u2007",
		"\u2008",
		"\u2009",
		"\u200A",
		"\u202F",
		"\u205F",
		"\u3000"
	];
	let WHITESPACE_SET = new Set(WHITESPACES);
	if ((Array.isArray(input) || typeof input === "string") && input.length > 0 && typeof index === "number") {
		const nextChar = peek(input, index, 1);
		if (input[index] === "\\" && nextChar !== null) {
			str += "\\" + nextChar;
		} else {
			lexerError([
				"{line}<$red:Invalid escape sequence$>{N}",
				"<$yellow:Escape character '\\' must be followed immediately by a character.$>{N}",
				nextChar === null ? "<$yellow:Found end of file after escape character$>" : "<$yellow:Missing character after escape character$>",
				"{line}"
			]);
		}
		if (WHITESPACE_SET.has(str[1])) {
			const matchedCharacter = Array.from(WHITESPACE_SET).find(ch => ch === str[1]);
			lexerError([
				"{line}<$red:Invalid escape sequence$>{N}",
				"<$yellow:Escape character '\\' must be followed immediately by a character.$>{N}",
				`<$yellow:Found$> <$blue:${JSON.stringify(matchedCharacter)}$> <$yellow:after escape character$>{N}`,
				"{line}"
			]);
		}
		return str;
	} else {
		sommarkError([
			"{line}<$red:Invalid Arguments:$> <$yellow:Assign arguments to their correct types, ",
			"'input' must be an array and have to be not empty, and 'index' must be a number value.$>{line}"
		]);
	}
}

function concatChar(input, index, stop_at_char) {
	if ((Array.isArray(input) || typeof input === "string") && input.length > 0 && typeof index === "number") {
		let str = "";
		if (index >= input.length) {
			return str;
		}
		if (Array.isArray(stop_at_char) && stop_at_char.length > 0) {
			for (let i = index; i < input.length; i++) {
				const char = input[i];
				if (stop_at_char.includes(char)) {
					break;
				}
				str += char;
			}
		} else {
			sommarkError([
				"{line}<$red:Invalid Type:$> <$yellow:Argument 'stop_at_char' must be an array and have to be not empty array$>{line}"
			]);
		}
		return str;
	} else {
		sommarkError([
			"{line}<$red:Invalid Arguments:$> <$yellow:Assign arguments to their correct types, ",
			"'input' must be an array and have to be not empty, 'index' must be a number value$>{line}"
		]);
	}
}

function lexer(src) {
	if (src && typeof src === "string") {
		const tokens = [];
		let scope_state = false;
		let line = 0;
		let character = 0;
		let depth_stack = [];
		let context = "",
			temp_str = "",
			previous_value = "";

		function validateIdentifier(id, type = "Identifier") {
			if (!/^[a-zA-Z0-9\-_$]+$/.test(id.trim())) {
				lexerError([
					`{line}<$red:Invalid ${type}:$>{N}`,
					`<$yellow:Identifiers can only contain letters, numbers, underscores (_), dollar signs, and hyphens (-). Got$> <$blue:'${id.trim()}'$> at line <$yellow:${line + 1}$>, from column <$yellow:${character}$>{N}`,
					"{line}"
				]);
			}
		}

		function addToken(type, value, rawValue) {
			const startPos = { line, character };
			advance(rawValue || value);
			const endPos = { line, character };
            // console.log(`DEBUG addToken: type=${type} start=${startPos.line},${startPos.character} end=${endPos.line},${endPos.character} val='${value}'`);
			tokens.push({
				type,
				value,
				range: { start: startPos, end: endPos },
				depth: depth_stack.length
			});
		}

		// Helper to advance position without adding a token (e.g., for whitespace/newlines that don't emit tokens)
		function advance(text) {
			const newlines = (text.match(/\n/g) || []).length;
			if (newlines > 0) {
				line += newlines;
				const parts = text.split("\n");
				character = parts[parts.length - 1].length;
			} else {
				character += text.length;
			}
		}

		for (let i = 0; i < src.length; i++) {
			let current_char = src[i];
			// ========================================================================== //
			//  Token: Open Bracket                                                       //
			// ========================================================================== //
			if (current_char === "[" && !scope_state && previous_value !== "(") {
				// i + 1 -> skip current character
				temp_str = concatChar(src, i + 1, ["]"]);
				if (temp_str && temp_str.length > 0) {
					if (temp_str.trim() !== end_keyword) {
						depth_stack.push("Block");
					}
				}
				addToken(TOKEN_TYPES.OPEN_BRACKET, current_char);
				// is next token end keyword?
				if (temp_str.trim() === end_keyword) {
					previous_value = block_end;
				} else {
					previous_value = current_char;
				}
			}
			// ========================================================================== //
			//  Token: Equal Sign                                                         //
			// ========================================================================== //
			else if (current_char === "=" && !scope_state) {
				addToken(TOKEN_TYPES.EQUAL, current_char);
				previous_value = current_char;
			}
			// ========================================================================== //
			//  Token: Close Bracket                                                      //
			// ========================================================================== //
			else if (current_char === "]" && !scope_state) {
				addToken(TOKEN_TYPES.CLOSE_BRACKET, current_char);
				if (previous_value === end_keyword) {
					depth_stack.pop();
				}
				previous_value = current_char;
			}
			// ========================================================================== //
			//  Token: Open Parenthesis '('                                               //
			// ========================================================================== //
			else if (current_char === "(" && !scope_state) {
				addToken(TOKEN_TYPES.OPEN_PAREN, current_char);
				if (previous_value !== "->") {
					previous_value = current_char;
				}
			}
			// ========================================================================== //
			//  Token: Thin Arrow '->'                                                    //
			// ========================================================================== //
			else if (current_char === "-" && peek(src, i, 1) === ">") {
				temp_str = current_char + peek(src, i, 1);
				i += temp_str.length - 1;
				addToken(TOKEN_TYPES.THIN_ARROW, temp_str);
				previous_value = temp_str;
			}
			// ========================================================================== //
			//  Token: Close Parenthesis ')'                                              //
			// ========================================================================== //
			else if (current_char === ")" && !scope_state) {
				addToken(TOKEN_TYPES.CLOSE_PAREN, current_char);
				previous_value = current_char;
			}
			// ========================================================================== //
			//  Token: Open At '@_'                                                       //
			// ========================================================================== //
			else if (
				current_char === "@" &&
				peek(src, i, 1) === "_" &&
				(!scope_state || isAtBlockEnd(src, i))
			) {
				temp_str = current_char + peek(src, i, 1);
				i += temp_str.length - 1;
				addToken(TOKEN_TYPES.OPEN_AT, temp_str);
				// is next token end keyword?
				if (isAtBlockEnd(src, i - 1)) {
					previous_value = at_end;
				} else {
					previous_value = temp_str;
				}
			}
			// ========================================================================== //
			//  Token: Close At '_@'                                                      //
			// ========================================================================== //
			else if (current_char === "_" && peek(src, i, 1) === "@") {
				temp_str = current_char + peek(src, i, 1);
				i += temp_str.length - 1;
				addToken(TOKEN_TYPES.CLOSE_AT, temp_str);
				switch (previous_value) {
					case at_id:
						previous_value = temp_str + "+";
						break;
					default:
						previous_value = temp_str;
						break;
				}
			}
			// ========================================================================== //
			//  Token: Colon ':'                                                          //
			// ========================================================================== //
			else if (
				current_char === ":" &&
				(previous_value === "_@+" ||
					previous_value === BLOCKCOMMA ||
					previous_value === block_id_2 ||
					previous_value === inline_id_2 ||
					previous_value === at_id_2 ||
					previous_value === at_value ||
					previous_value === BLOCKCOLON ||
					previous_value === ATBLOCKCOLON ||
					previous_value === INLINECOLON) &&
				!scope_state
			) {
				addToken(TOKEN_TYPES.COLON, current_char);
				switch (previous_value) {
					case block_id_2:
						previous_value = BLOCKCOLON;
						break;
					case "_@+":
						previous_value = ATBLOCKCOLON;
						break;
					case at_id_2:
						previous_value = ATBLOCKCOLON;
						break;
					case inline_id_2:
						previous_value = INLINECOLON;
						break;
				}
			}
			// ========================================================================== //
			//  Token: Comma ','                                                          //
			// ========================================================================== //
			else if (
				current_char === "," &&
				(previous_value === block_value ||
					previous_value === at_value ||
					previous_value === inline_value ||
					previous_value === BLOCKCOMMA ||
					previous_value === ATBLOCKCOMMA ||
					previous_value === INLINECOMMA)
			) {
				addToken(TOKEN_TYPES.COMMA, current_char);
				switch (previous_value) {
					case "=":
						previous_value = BLOCKCOMMA;
						break;
					case block_value:
						previous_value = BLOCKCOMMA;
						break;
					case at_value:
						previous_value = ATBLOCKCOMMA;
						break;
					case inline_value:
						previous_value = INLINECOMMA;
						break;
				}
			}
			// ========================================================================== //
			//  Token: Semi-colon ';'                                                     //
			// ========================================================================== //
			else if (
				(current_char === ";" && previous_value === at_value) ||
				(current_char === ";" && previous_value === "_@+") || // New: Allow semicolon directly after identifier
				(current_char === ";" && previous_value === ";") ||
				(current_char === ";" && previous_value === ATBLOCKCOMMA)
			) {
				addToken(TOKEN_TYPES.SEMICOLON, current_char);
				scope_state = true;
				previous_value = current_char;
			}
			// ========================================================================== //
			//  Token: Escape Character '\'                                               //
			// ========================================================================== //
			else if (current_char === "\\") {
				temp_str = concatEscape(src, i);
				i += temp_str.length - 1;
				if (temp_str.trim()) {
					addToken(TOKEN_TYPES.ESCAPE, temp_str);
				} else {
					advance(temp_str);
				}
			}
			// ========================================================================== //
			//  Count Newlines and Whitespace (No Tokens)                                 //
			// ========================================================================== //
			else if (current_char === "\n") {
				if (!scope_state) {
					advance(current_char);
					continue;
				}
			}
			// ========================================================================== //
			//  +++++++++++++++++                                                        //
			// ========================================================================== //
			else {
				// ========================================================================== //
				//  Token: Block Identifier                                                   //
				// ========================================================================== //
				if (previous_value === "[" && !scope_state) {
					temp_str = concatChar(src, i, ["=", "]"]);
					i += temp_str.length - 1;
					if (temp_str.trim()) {
						const trimmedStr = temp_str.trim();
						if (trimmedStr !== end_keyword) {
							validateIdentifier(trimmedStr, "Block Identifier");
						}
						// Add Token
						addToken(TOKEN_TYPES.IDENTIFIER, trimmedStr, temp_str);
						// Update Previous Value
						previous_value = block_id;
					} else {
						advance(temp_str);
					}
				}
				// ========================================================================== //
				//  Token: Block Value                                                        //
				// ========================================================================== //
				else if (
					(previous_value === "=" ||
						previous_value === BLOCKCOMMA ||
						previous_value === BLOCKCOLON ||
						previous_value === block_value) &&
					!scope_state
				) {
					temp_str = concatChar(src, i, ["]", "\\", ",", ":"]);
					i += temp_str.length - 1;
					const nextToken = peek(src, i, 1);
					if (temp_str.trim()) {
						// Add token
						switch (nextToken) {
							case ":":
								const trimmedKey = temp_str.trim();
								validateIdentifier(trimmedKey, "Argument Key");
								addToken(TOKEN_TYPES.IDENTIFIER, trimmedKey, temp_str);
								previous_value = block_id_2;
								break;
							default:
								addToken(TOKEN_TYPES.VALUE, temp_str.trim(), temp_str);
								previous_value = block_value;
								break;
						}
					} else {
						advance(temp_str);
					}
				}
				// ========================================================================== //
				//  Token: Inline Identifier                                                  //
				// ========================================================================== //
				else if (previous_value === "->" && !scope_state) {
					temp_str = concatChar(src, i, ["(", ")", ":"]);
					i += temp_str.length - 1;
					const nextToken = peek(src, i, 1);
					if (temp_str.trim()) {
						// Add Token
						switch (nextToken) {
							case ":":
								const trimmedKey = temp_str.trim();
								validateIdentifier(trimmedKey, "Argument Key");
								addToken(TOKEN_TYPES.IDENTIFIER, trimmedKey, temp_str);
								previous_value = inline_id_2;
								break;
							default:
								const trimmedId = temp_str.trim();
								validateIdentifier(trimmedId, "Inline Identifier");
								addToken(TOKEN_TYPES.IDENTIFIER, trimmedId, temp_str);
								previous_value = inline_id;
								break;
						}
					}
				}
				// ========================================================================== //
				//  Token: Inline Value                                                       //
				// ========================================================================== //
				else if (
					(previous_value === "(" ||
						previous_value === INLINECOLON ||
						previous_value === INLINECOMMA ||
						previous_value === inline_value) &&
					!scope_state
				) {
					temp_str = concatChar(src, i, [")", "\\", ",", previous_value === INLINECOLON ? ":" : null]);
					i += temp_str.length - 1;
					if (temp_str.trim()) {
						// Add Token
						addToken(TOKEN_TYPES.VALUE, temp_str.trim(), temp_str);
						// Update Previous Value
						previous_value = inline_value;
					}
				}
				// ========================================================================== //
				//  Token: Inline Identifier (after open parenthesis)                         //
				// ========================================================================== //
				else if (previous_value === "(" && !scope_state) {
					temp_str = concatChar(src, i, ["-", ")", "\\"]);
					i += temp_str.length - 1;
					if (temp_str.trim()) {
						addToken(TOKEN_TYPES.IDENTIFIER, temp_str.trim(), temp_str);
						previous_value = inline_id;
					} else {
						advance(temp_str);
					}
				}
				// ========================================================================== //
				//  Token: At Identifier                                                      //
				// ========================================================================== //
				else if (previous_value === "@_") {
					temp_str = concatChar(src, i, ["_", ":"]);
					i += temp_str.length - 1;
					if (temp_str.trim()) {
						const trimmedStr = temp_str.trim();
						if (trimmedStr !== end_keyword) {
							validateIdentifier(trimmedStr, "At-Block Identifier");
						}
						// Add Token
						addToken(TOKEN_TYPES.IDENTIFIER, trimmedStr, temp_str);
						previous_value = at_id;
					} else {
						advance(temp_str);
					}
				}
				// ========================================================================== //
				//  Token: At Value                                                           //
				// ========================================================================== //
				else if (previous_value === ATBLOCKCOLON || previous_value === ATBLOCKCOMMA || previous_value === at_value) {
					temp_str = concatChar(src, i, [";", "\\", ",", ":"]);
					i += temp_str.length - 1;
					const nextToken = peek(src, i, 1);
					if (temp_str.trim()) {
						switch (nextToken) {
							case ":":
								const trimmedKey = temp_str.trim();
								validateIdentifier(trimmedKey, "Argument Key");
								addToken(TOKEN_TYPES.IDENTIFIER, trimmedKey, temp_str);
								previous_value = at_id_2;
								break;
							default:
								addToken(TOKEN_TYPES.VALUE, temp_str.trim(), temp_str);
								previous_value = at_value;
								break;
						}
					} else {
						advance(temp_str);
					}
				}
				// ========================================================================== //
				//  Token:End Keyword                                                         //
				// ========================================================================== //
				else if ((previous_value === block_end && !scope_state) || previous_value === at_end) {
					temp_str = concatChar(src, i, ["]", "_"]);
					i += temp_str.length - 1;
					if (temp_str.trim()) {
						addToken(TOKEN_TYPES.END_KEYWORD, temp_str);
						// Update Previous Value
						previous_value = end_keyword;
						scope_state = false;
					} else {
						advance(temp_str);
					}
				}
				// ========================================================================== //
				//  Token: Comment                                                            //
				// ========================================================================== //
				else if (current_char === "#") {
					temp_str = concatChar(src, i, ["\n"]);
					if (temp_str.trim()) {
						i += temp_str.length - 1;
						addToken(TOKEN_TYPES.COMMENT, temp_str);
					} else {
						i += temp_str.length - 1;
						advance(temp_str);
					}
				}
				// ========================================================================== //
				//  Token: Text                                                               //
				// ========================================================================== //
				else {
					if (previous_value === "_@+") {
						// Strictly wait for semicolon or arguments on the same line.
						// No more heuristic lookahead.
					}
					context = concatText(src, i, scope_state, [
						[":", previous_value === inline_id_2],
						[",", previous_value === block_value || previous_value === at_value || previous_value === inline_value],
						[":", (previous_value === "_@+" && !scope_state) || previous_value === at_value],
						[";", previous_value === at_value],
						[")", previous_value === inline_value]
					]);
					i += context.length - 1;
					if (context.trim()) {
						addToken(TOKEN_TYPES.TEXT, context);
					} else {
						advance(context);
					}
				}
			}
			context = "";
			temp_str = "";
		}

		// Ensure EOF token
		const eofPos = { line, character };
		tokens.push({
			type: TOKEN_TYPES.EOF,
			value: "",
			range: { start: eofPos, end: eofPos },
			depth: depth_stack.length
		});

		return tokens;
	} else {
		lexerError([
			`{line}<$red:Invalid SomMark syntax:$> ${src === "" ? "<$yellow: Got empty string '' $>" : `<$yellow:Expected source input to be a string, got$> <$blue: '${typeof src}'$>`} at line <$yellow:${line + 1}$>, from column <$yellow:${character}$>{line}`
		]);
	}
}

export default lexer;
