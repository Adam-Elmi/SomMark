import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import { block_value, block_id, inline_id, inline_value, at_id, at_value, end_keyword } from "./names.js";
import { lexerError } from "./validator.js";

function concatText(input, index, scope_state) {
	let text = "";
	if (
		(Array.isArray(input) || typeof input === "string") &&
		input.length > 0 &&
		typeof index === "number" &&
		typeof scope_state === "boolean"
	) {
		for (let i = index; i < input.length; i++) {
			const char = input[i];
			if (char === "\n") {
				break;
			} else if (char === "[" && !scope_state) {
				break;
			} else if (char === "=" && !scope_state) {
				break;
			} else if (char === "]" && !scope_state) {
				break;
			} else if (char === "(" && !scope_state) {
				break;
			} else if (char === "-" && peek(input, i, 1) === ">" && !scope_state) {
				break;
			} else if (char === "@" && peek(input, i, 1) === "_") {
				break;
			} else if (char === "_" && peek(input, i, 1) === "@") {
				break;
			} else if (char === "#" && !scope_state) {
				break;
			} else if (char === "\\") {
				break;
			}
			text += char;
		}
		return text;
	} else {
		lexerError([
			"{line}<$red:Invalid Arguments:$> <$yellow:Assign arguments to their correct types, ",
			"'input' must be an array and have to be not empty, 'index' must be a number value, and 'scope_state' ",
			"must be a boolean.$>{line}."
		]);
	}
}

function concatEscape(input, index) {
	if ((Array.isArray(input) || typeof input === "string") && input.length > 0 && typeof index === "number") {
		let str = "";
		if (input[index] === "\\" && peek(input, index, 1)) {
			str += "\\" + peek(input, index, 1);
		} else {
			lexerError(["{line}<$red:Next character is not found:$> <$yellow:There is no character after escape character!$>{line}"]);
		}
		return str;
	} else {
		lexerError([
			"{line}<$red:Invalid Arguments:$> <$yellow:Assign arguments to their correct types, ",
			"'input' must be an array and have to be not empty, and 'index' must be a number value.$>{line}"
		]);
	}
}

function concatChar(input, index, stop_at_char, scope_state) {
	if (
		(Array.isArray(input) || typeof input === "string") &&
		input.length > 0 &&
		typeof index === "number" &&
		typeof scope_state === "boolean"
	) {
		let str = "";
		if (Array.isArray(stop_at_char) && stop_at_char.length > 0) {
			for (let i = index; i < input.length; i++) {
				const char = input[i];
				if (stop_at_char.includes(char)) {
					break;
				}
				str += char;
			}
		} else {
			lexerError([
				"{line}<$red:Invalid Type:$> <$yellow:Argument 'stop_at_char' must be an array and have to be not empty array$>{line}"
			]);
		}
		return str;
	} else {
		lexerError([
			"{line}<$red:Invalid Arguments:$> <$yellow:Assign arguments to their correct types, ",
			"'input' must be an array and have to be not empty, 'index' must be a number value, and 'scope_state' ",
			"must be a boolean.$>{line}"
		]);
	}
}

function lexer(src) {
	if (src && typeof src === "string") {
		const tokens = [];
		let scope_state = false;
		let line = 1;
		let start;
		let end;
		let depth_stack = [];
		let context = "",
			temp_str = "",
			previous_value = "";

		function addToken(type, value) {
			tokens.push({ type, value, line, start, end, depth: depth_stack.length });
		}

		for (let i = 0; i < src.length; i++) {
			let current_char = src[i];
			// Token: Open Bracket
			if (current_char === "[" && !scope_state) {
				if (i === 0) {
					// Update Column
					start = 1;
					end = start;
				} else {
					// Update Column
					start = end !== undefined ? end : 1;
					end = start;
				}
				// Push to depth if next token is not end_keyword
				temp_str = concatChar(src, i + 1, ["]"], scope_state);
				if (temp_str && temp_str.length > 0) {
					if (temp_str.trim() !== end_keyword) {
						depth_stack.push("Block");
					}
				}
				addToken(TOKEN_TYPES.OPEN_BRACKET, current_char);
				previous_value = current_char;
			}
			// Token: Equal Sign
			else if (current_char === "=" && !scope_state) {
				// Update Column
				start = end !== undefined ? end : 1;
				end = start;
				addToken(TOKEN_TYPES.EQUAL, current_char);
				previous_value = current_char;
			}
			// Token: Close Bracket
			else if (current_char === "]" && !scope_state) {
				// Update Column
				start = end !== undefined ? end : 1;
				end = start;
				addToken(TOKEN_TYPES.CLOSE_BRACKET, current_char);
				if (previous_value === end_keyword) {
					depth_stack.pop();
				}
				previous_value = current_char;
			}
			// Token: Open Parenthesis
			else if (current_char === "(" && !scope_state) {
				// Update Column
				start = previous_value === "\n" ? end : end !== undefined ? end + 1 : 1;
				end = start;
				addToken(TOKEN_TYPES.OPEN_PAREN, current_char);
				if (previous_value !== "->") {
					previous_value = current_char;
				}
			}
			// Token: Thin Arrow
			else if (current_char === "-" && peek(src, i, 1) === ">") {
				temp_str = current_char + peek(src, i, 1);
				i += temp_str.length - 1;
				// Update Column
				start = end !== undefined ? end : 1;
				end = start + temp_str.length;
				addToken(TOKEN_TYPES.THIN_ARROW, temp_str);
				previous_value = temp_str;
			}
			// Token: Close Parenthesis
			else if (current_char === ")" && !scope_state) {
				// Update Column
				start = end !== undefined ? end : 1;
				end = start;
				addToken(TOKEN_TYPES.CLOSE_PAREN, current_char);
				previous_value = current_char;
			}
			// Token: Open At (@_)
			else if (current_char === "@" && peek(src, i, 1) === "_") {
				temp_str = current_char + peek(src, i, 1);
				i += temp_str.length - 1;
				// Update Column
				start = end !== undefined ? end : 1;
				end = start + temp_str.length;
				scope_state = true;
				addToken(TOKEN_TYPES.OPEN_AT, temp_str);
				previous_value = temp_str;
			}
			// Token: Close At (_@)
			else if (current_char === "_" && peek(src, i, 1) === "@") {
				temp_str = current_char + peek(src, i, 1);
				i += temp_str.length - 1;
				// Update Column
				start = end !== undefined ? end + 1 : 1;
				end = start + temp_str.length;
				addToken(TOKEN_TYPES.CLOSE_AT, temp_str);
				previous_value = temp_str;
			}
			// Token: Colon
			else if (current_char === ":" && previous_value === "_@") {
				// Update Column
				start = end !== undefined ? end : 1;
				end = start;
				addToken(TOKEN_TYPES.COLON, current_char);
				previous_value = current_char;
			}
			// Token: Newline
			else if (current_char === "\n") {
				line++;
				start = 0;
				end = 0;
				previous_value = current_char;
				addToken(TOKEN_TYPES.NEWLINE, current_char);
			}
			// Escape character
			else if (current_char === "\\") {
				temp_str = concatEscape(src, i, scope_state);
				if (temp_str.trim() && temp_str.length > 0) {
					i += temp_str.length - 1;
					addToken(TOKEN_TYPES.ESCAPE, temp_str);
				}
			}
			// Token: Block Identifier
			// Token: Block Value
			// Token: End Keyword
			else {
				if (previous_value === "[" || (previous_value === "=" && !scope_state)) {
					temp_str = concatChar(src, i, ["=", "]", "\n"], scope_state);
					i += temp_str.length - 1;
					// Update Column
					start = end !== undefined ? end : 1;
					end = start + temp_str.length;
					if (temp_str.trim()) {
						if (previous_value === "[") {
							// Token: End Keyword
							if (temp_str.trim() === end_keyword) {
								addToken(TOKEN_TYPES.END_KEYWORD, temp_str);
								previous_value = temp_str.trim();
								scope_state = false;
							}
							// Token: Block Identifier
							else {
								addToken(TOKEN_TYPES.IDENTIFIER, temp_str);
								previous_value = block_id;
							}
						}
						// Token: Block Value
						else if (previous_value === "=") {
							addToken(TOKEN_TYPES.VALUE, temp_str);
							previous_value = block_value;
						}
					}
				}
				// Token: Inline Value
				// Token: Inline Identifier
				else if (previous_value === "(" || (previous_value === "->" && !scope_state)) {
					temp_str = concatChar(src, i, [")", "[", "\\"], scope_state);
					i += temp_str.length - 1;
					// Update Column
					start = end !== undefined ? end : 1;
					end = start + temp_str.length;
					if (temp_str.trim()) {
						if (previous_value === "(") {
							// Token: Inline Value
							addToken(TOKEN_TYPES.VALUE, temp_str);
							previous_value = inline_value;
						} else if (previous_value === "->") {
							// Token: Inline Identifier
							addToken(TOKEN_TYPES.IDENTIFIER, temp_str);
							previous_value = inline_id;
						}
					}
				}
				// Token: At Identifier
				// Token: At Value
				// Token: End Keyword
				else if (previous_value === "@_" || previous_value === ":") {
					temp_str = concatChar(src, i, ["_", "\n"], scope_state);
					i += temp_str.length - 1;
					if (temp_str.trim()) {
						// Update Column
						start = end !== undefined ? end + 1 : 1;
						end = start + temp_str.length;
						if (previous_value === "@_") {
							// Token: End Keyword
							if (temp_str.trim() === end_keyword) {
								addToken(TOKEN_TYPES.END_KEYWORD, temp_str);
								previous_value = temp_str.trim();
								scope_state = false;
							}
							// Token: At Identifier
							else {
								addToken(TOKEN_TYPES.IDENTIFIER, temp_str);
								previous_value = at_id;
							}
						}
						// Token: At Value
						else if (previous_value === ":") {
							addToken(TOKEN_TYPES.VALUE, temp_str);
							previous_value = at_value;
						}
					}
				}
				// Token: Comment
				else if (current_char === "#") {
					temp_str = concatChar(src, i, ["\n"], scope_state);
					// Update Column
					start = previous_value === "\n" ? end : end !== undefined ? end + 1 : 1;
					end = start + temp_str.length;
					if (temp_str.trim()) {
						i += temp_str.length - 1;
						addToken(TOKEN_TYPES.COMMENT, temp_str);
					}
				}
				// Token: Text
				else {
					context = concatText(src, i, scope_state);
					i += context.length - 1;
					// Update Column
					start = previous_value === "\n" ? end : end !== undefined ? end + 1 : 1;
					end = start + context.length;
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
		lexerError(["{line}<$red:Invalid Source Code:$> <$yellow:Source code is not a string or is empty.$>{line}"]);
	}
}

export default lexer;
