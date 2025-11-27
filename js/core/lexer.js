import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";

function concat(input, index, exclude_stop_char = true, stop_at_char = [], scope_state, include_then_break = false) {
	let str = "";
	for (let char_index = index; char_index < input.length; char_index++) {
		let char = input[char_index];
		if (exclude_stop_char) {
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
			} else if (char === "-" && peek(input, char_index, 1) === ">" && !scope_state) {
				break;
			} else if (char === "@" && peek(input, char_index, 1) === "_" && !scope_state) {
				break;
			} else if (char === "_" && peek(input, char_index, 1) === "@" && !scope_state) {
				break;
			} else if (char === "#" && !scope_state) {
				break;
			} else if (char === "`" && !scope_state) {
				break;
			}
			str += char;
		} else {
			if (stop_at_char.includes(char)) {
				include_then_break ? (str += char) : null;
				break;
			}
			str += char;
		}
	}

	return str;
}

function lexer(src) {
	if (src && typeof src === "string") {
		const tokens = [];
		let scope_state = false;
		let line = 1,
			start = 1,
			end = 1;
		let depth_stack = [];
		let context = "",
			temp_str = "",
			previous_value = "";
		const tokenNames = {
			block_id: "Block Identifier",
			block_value: "Block Value",
			inline_id: "Inline Identifier",
			inline_value: "Inline Value",
			at_id: "At Identifier",
			at_value: "At Value",
			end_keyword: "end"
		};
		const { block_id, block_value, inline_id, inline_value, at_id, at_value, end_keyword } = tokenNames;

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
					start++;
					end = start;
				}
				// Push to depth if next token is not end_keyword
				temp_str = concat(src, i + 1, false, ["]"], scope_state);
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
				start++;
				end = start;
				addToken(TOKEN_TYPES.EQUAL, current_char);
				previous_value = current_char;
			}
			// Token: Close Bracket
			else if (current_char === "]" && !scope_state) {
				// Update Column
				start++;
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
				start++;
				end = start;
				addToken(TOKEN_TYPES.OPEN_PAREN, current_char);
				previous_value = current_char;
			}
			// Token: Thin Arrow
			else if (current_char === "-" && peek(src, i, 1) === ">") {
				temp_str = current_char + peek(src, i, 1);
				i += temp_str.length - 1;
				// Update Column
				start++;
				end = end + temp_str.length;
				addToken(TOKEN_TYPES.THIN_ARROW, temp_str);
				previous_value = temp_str;
			}
			// Token: Close Parenthesis
			else if (current_char === ")" && !scope_state) {
				// Update Column
				start++;
				end = start;
				addToken(TOKEN_TYPES.CLOSE_PAREN, current_char);
				previous_value = current_char;
			}
			// Token: Open At (@_)
			else if (current_char === "@" && peek(src, i, 1) === "_") {
				temp_str = current_char + peek(src, i, 1);
				i += temp_str.length - 1;
				// Update Column
				start++;
				end = end + temp_str.length;
				scope_state = true;
				addToken(TOKEN_TYPES.OPEN_BRACKET, temp_str);
				previous_value = temp_str;
			}
			// Token: Close At (_@)
			else if (current_char === "_" && peek(src, i, 1) === "@") {
				temp_str = current_char + peek(src, i, 1);
				i += temp_str.length - 1;
				// Update Column
				start++;
				end = end + temp_str.length;
				addToken(TOKEN_TYPES.OPEN_BRACKET, temp_str);
				previous_value = temp_str;
			}
			// Token: Colon
			else if (current_char === ":" && previous_value === "_@") {
				// Update Column
				start++;
				end = start;
				addToken(TOKEN_TYPES.COLON, current_char);
				previous_value = current_char;
			}
			// Token: Newline
			else if (current_char === "\n") {
				line++;
				start = 1;
				end = 1;
				addToken(TOKEN_TYPES.NEWLINE, current_char);
			}
			// Escape character
			else if (current_char === "`" && !scope_state) {
				temp_str = current_char + concat(src, i + 1, false, ["`"], scope_state, true);
				if (temp_str && temp_str.length > 0) {
					i += temp_str.length;
					addToken(TOKEN_TYPES.TEXT, temp_str);
				}
			}
			// Token: Block Identifier OR Token: Block Value OR Token: End Keyword
			else {
				if (previous_value === "[" || (previous_value === "=" && !scope_state)) {
					temp_str = concat(src, i, false, ["=", "]", "\n"], scope_state);
					i += temp_str.length - 1;
					// Update Column
					start++;
					end = end + temp_str.length;
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
				// Token: Inline Value OR Token: Inline Identifier
				else if (previous_value === "(" || (previous_value === "->" && !scope_state)) {
					temp_str = concat(src, i, false, [")", "["], scope_state);
					i += temp_str.length - 1;
					// Update Column
					start++;
					end = end + temp_str.length;
					if (temp_str.trim()) {
						if (previous_value === "(") {
							// Token: Inline Value
							addToken(TOKEN_TYPES.VALUE, temp_str);
							previous_value = inline_value;
						} else {
							// Token: Inline Identifier
							addToken(TOKEN_TYPES.IDENTIFIER, temp_str);
							previous_value = inline_id;
						}
					}
				}
				// Token: At Identifier OR Token: At Value OR Token: End Keyword
				else if (previous_value === "@_" || previous_value === ":") {
					temp_str = concat(src, i, false, ["_", "\n"], scope_state);
					if (temp_str.trim()) {
						i += temp_str.length - 1;
						// Update Column
						start++;
						end = end + temp_str.length;
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
						else {
							addToken(TOKEN_TYPES.VALUE, temp_str);
							previous_value = at_value;
						}
					}
				}
				// Token: Comment
				else if (current_char === "#") {
					temp_str = concat(src, i, false, ["\n"], scope_state);
					// Update Column
					start++;
					end = end + temp_str.length;
					if (temp_str) {
						i += temp_str.length - 1;
						addToken(TOKEN_TYPES.COMMENT, temp_str);
					}
				}
				// Token: Text
				else {
					context = concat(src, i, true, null, scope_state);
					i += context.length - 1;
					// Update Column
					start++;
					end = end + context.length;
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
		throw new Error("Invalid Source Code");
	}
}

export default lexer;
