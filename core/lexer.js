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
				["@", peek(input, i, 1) === "_"],
				["_", peek(input, i, 1) === "@"],
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
		if (!text) {
			sommarkError([`{line}<$red:Concatenation failed:$> string value is  <$yellow:'${text}'$>{line}`]);
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
		if (input[index] === "\\" && peek(input, index, 1)) {
			str += "\\" + peek(input, index, 1);
		} else {
			sommarkError(["{line}<$red:Next character is not found:$> <$yellow:There is no character after escape character!$>{line}"]);
		}
		if (!str) {
			sommarkError([`{line}<$red:Concatenation failed:$> string value is  <$yellow:'${str}'$>{line}`]);
		}
		if (WHITESPACE_SET.has(str[1])) {
			const matchedCharacter = Array.from(WHITESPACE_SET).find(ch => ch === str[1]);
			lexerError([
				`{line}<$red:Invalid escape sequence$>{N}
<$yellow:Escape character '\\' must be followed immediately by a character.$>{N}
<$yellow:Found$> <$blue:${JSON.stringify(matchedCharacter)}$> <$yellow:after escape character$>
{line}
`
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
		if (!str) {
			sommarkError([`{line}<$red:Concatenation failed:$> string value is  <$yellow:'${str}'$>{line}`]);
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
		let line = 1;
		let start = 1;
		let end = 0;
		let depth_stack = [];
		let context = "",
			temp_str = "",
			previous_value = "";

		function addToken(type, value) {
			tokens.push({ type, value, line, start, end, depth: depth_stack.length });
		}

		const updateMetadata = (text) => {
			const newlines = updateNewLine(text) || 0;
			if (newlines > 0) {
				const lines = text.split('\n');
				const lastLineLength = lines[lines.length - 1].length;
				start = end + 1;
				end = lastLineLength;
				line += newlines;
			} else {
				const cols = updateColumn(end, text.length);
				start = cols.start;
				end = cols.end;
			}
		};

		for (let i = 0; i < src.length; i++) {
			let current_char = src[i];
			// ========================================================================== //
			//  Token: Open Bracket                                                       //
			// ========================================================================== //
			if (current_char === "[" && !scope_state && previous_value !== "(") {
				// Update Metadata
				updateMetadata(current_char);
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
				// Update Metadata
				updateMetadata(current_char);
				addToken(TOKEN_TYPES.EQUAL, current_char);
				previous_value = current_char;
			}
			// ========================================================================== //
			//  Token: Close Bracket                                                      //
			// ========================================================================== //
			else if (current_char === "]" && !scope_state) {
				// Update Metadata
				updateMetadata(current_char);
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
				// Update Metadata
				updateMetadata(current_char);
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
				// Update Metadata
				updateMetadata(temp_str);
				addToken(TOKEN_TYPES.THIN_ARROW, temp_str);
				previous_value = temp_str;
			}
			// ========================================================================== //
			//  Token: Close Parenthesis ')'                                              //
			// ========================================================================== //
			else if (current_char === ")" && !scope_state) {
				// Update Metadata
				updateMetadata(current_char);
				addToken(TOKEN_TYPES.CLOSE_PAREN, current_char);
				previous_value = current_char;
			}
			// ========================================================================== //
			//  Token: Open At '@_'                                                       //
			// ========================================================================== //
			else if (current_char === "@" && peek(src, i, 1) === "_") {
				temp_str = current_char + peek(src, i, 1);
				i += temp_str.length - 1;
				// Update Metadata
				updateMetadata(temp_str);
				scope_state = true;
				addToken(TOKEN_TYPES.OPEN_AT, temp_str);
				// is next token end keyword?
				const endKey = concatChar(src, i + 1, ["_"]);
				if (endKey.trim() === end_keyword) {
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
				// Update Metadata
				updateMetadata(temp_str);
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
					previous_value === INLINECOLON)
			) {
				// Update Metadata
				updateMetadata(current_char);
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
				// Update Metadata
				updateMetadata(current_char);
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
				(current_char === ";" && previous_value === ";") ||
				(current_char === ";" && previous_value === ATBLOCKCOMMA)
			) {
				// Update Metadata
				updateMetadata(current_char);
				addToken(TOKEN_TYPES.SEMICOLON, current_char);
				previous_value = current_char;
			}
			// ========================================================================== //
			//  Token: Escape Character '\'                                               //
			// ========================================================================== //
			else if (current_char === "\\") {
				temp_str = concatEscape(src, i);
				i += temp_str.length - 1;
				updateMetadata(temp_str);
				temp_str = temp_str.trim();
				if (temp_str && temp_str.length > 0) {
					// Add Token
					addToken(TOKEN_TYPES.ESCAPE, temp_str);
				}
			}
			// ========================================================================== //
			//  Count Newlines                                                            //
			// ========================================================================== //
			else if (current_char === "\n") {
				line++;
				start = 1;
				end = 0;
				continue;
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
					// Update Metadata
					updateMetadata(temp_str);
					if (temp_str.trim()) {
						// Add Token
						addToken(TOKEN_TYPES.IDENTIFIER, temp_str);
						// Update Previous Value
						previous_value = block_id;
					}
				}
				// ========================================================================== //
				//  Token: Block Value                                                        //
				// ========================================================================== //
				else if ((previous_value === "=" || previous_value === BLOCKCOMMA || previous_value === BLOCKCOLON || previous_value === block_value) && !scope_state) {
					temp_str = concatChar(src, i, ["]", "\\", ",", ":"]);
					i += temp_str.length - 1;
					const nextToken = peek(src, i, 1);
					// Update Metadata
					updateMetadata(temp_str);
					if (temp_str.trim()) {
						// Add token
						switch (nextToken) {
							case ":":
								addToken(TOKEN_TYPES.IDENTIFIER, temp_str);
								previous_value = block_id_2;
								break;
							default:
								addToken(TOKEN_TYPES.VALUE, temp_str);
								previous_value = block_value;
								break;
						}
					}
				}
				// ========================================================================== //
				//  Token: Inline Identifier                                                  //
				// ========================================================================== //
				else if (previous_value === "->" && !scope_state) {
					temp_str = concatChar(src, i, ["(", ")", ":"]);
					i += temp_str.length - 1;
					const nextToken = peek(src, i, 1);
					// Update Metadata
					updateMetadata(temp_str);
					if (temp_str.trim()) {
						// Add Token
						switch (nextToken) {
							case ":":
								addToken(TOKEN_TYPES.IDENTIFIER, temp_str);
								previous_value = inline_id_2;
								break;
							default:
								addToken(TOKEN_TYPES.IDENTIFIER, temp_str);
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
					temp_str = concatChar(src, i, [
						")",
						"\\",
						",",
						previous_value === INLINECOLON ? ":" : null
					]);
					i += temp_str.length - 1;
					// Update Metadata
					updateMetadata(temp_str);
					if (temp_str.trim()) {
						// Add Token
						addToken(TOKEN_TYPES.VALUE, temp_str);
						// Update Previous Value
						previous_value = inline_value;
					}
				}
				// ========================================================================== //
				//  Token: At Identifier                                                      //
				// ========================================================================== //
				else if (previous_value === "@_") {
					temp_str = concatChar(src, i, ["_"]);
					i += temp_str.length - 1;
					// Update Metadata
					updateMetadata(temp_str);
					if (temp_str.trim()) {
						// Add Token
						addToken(TOKEN_TYPES.IDENTIFIER, temp_str);
						previous_value = at_id;
					}
				}
				// ========================================================================== //
				//  Token: At Value                                                           //
				// ========================================================================== //
				else if (previous_value === ATBLOCKCOLON || previous_value === ATBLOCKCOMMA || previous_value === at_value) {
					temp_str = concatChar(src, i, [";", "\\", ",", ":"]);
					i += temp_str.length - 1;
					const nextToken = peek(src, i, 1);
					// Update Metadata
					updateMetadata(temp_str);
					if (temp_str.trim()) {
						switch (nextToken) {
							case ":":
								addToken(TOKEN_TYPES.IDENTIFIER, temp_str);
								previous_value = at_id_2;
								break;
							default:
								addToken(TOKEN_TYPES.VALUE, temp_str);
								previous_value = at_value;
								break;
						}
					}
				}
				// ========================================================================== //
				//  Token:End Keyword                                                         //
				// ========================================================================== //
				else if ((previous_value === block_end && !scope_state) || previous_value === at_end) {
					temp_str = concatChar(src, i, ["]", "_"]);
					i += temp_str.length - 1;
					// Update Metadata
					updateMetadata(temp_str);
					if (temp_str.trim()) {
						addToken(TOKEN_TYPES.END_KEYWORD, temp_str);
						// Update Previous Value
						previous_value = end_keyword;
						scope_state = false;
					}
				}
				// ========================================================================== //
				//  Token: Comment                                                            //
				// ========================================================================== //
				else if (current_char === "#") {
					temp_str = concatChar(src, i, ["\n"]);
					// Update Metadata
					updateMetadata(temp_str);
					if (temp_str.trim()) {
						i += temp_str.length - 1;
						addToken(TOKEN_TYPES.COMMENT, temp_str);
					}
				}
				// ========================================================================== //
				//  Token: Text                                                               //
				// ========================================================================== //
				else {
					context = concatText(src, i, scope_state, [
						[":", previous_value === inline_id_2],
						[",", previous_value === block_value || previous_value === at_value || previous_value === inline_value],
						[":", previous_value === "_@+" || previous_value === at_value],
						[";", previous_value === at_value],
						[")", previous_value === inline_value]
					]);
					i += context.length - 1;
					// Update Metadata
					updateMetadata(context);
					if (context.trim()) {
						addToken(TOKEN_TYPES.TEXT, context);
					}
				}
			}
			context = "";
			temp_str = "";
		}
		return tokens;
	} else {
		lexerError([
			`{line}<$red:Invalid SomMark syntax:$> <$yellow:Expected source input to be a string, got$> <$blue: '${typeof src}'$>{line}`
		]);
	}
}

export default lexer;
