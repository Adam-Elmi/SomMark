import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import isExpected from "../helpers/isExpected.js";
import { updateProps, updateStack, resetArray } from "../helpers/updateData.js";
import { blockType1, blockType2, inlineType, atType1, atType2, endType1, endType2 } from "../helpers/t_types.js";
import skipSpaces from "../helpers/skipSpaces.js";
import concat from "../helpers/concat.js";

function lexer(src) {
	if (src && typeof src === "string") {
		const tokens = [];
		let scope_state = false;
		let line = 1,
			start = 1,
			end = 1;
		let depth_stack = [],
			special_tokens = [],
			token_stack = [],
			_t = [];
		let context = "",
			temp_str = "",
			temp_value = "",
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

		function addToken(tk, props) {
			tk.push(props);
		}

		for (let i = 0; i < src.length; i++) {
			let current_char = src[i];
			// Token: Open Bracket
			if (current_char === "[" && scope_state === false) {
				if (i === 0) {
					// Update Column
					start = 1;
					end = start;
				} else {
					// Update Column
					start++;
					end = start;
				}
				// if next is '\n' then it is not a block, reset all arrays
				if (peek(src, i, 1) === "\n") {
					// Update Column
					start++;
					end = end + special_tokens.join("").length;
					addToken(tokens, {
						type: TOKEN_TYPES.TEXT,
						value: special_tokens.join(""),
						line,
						start,
						end,
						depth: depth_stack.length
					});
					resetArray(token_stack, special_tokens, _t);
				} else {
					_t.push({ type: "", value: "", line, start, end, depth: depth_stack.length });
					updateStack(token_stack, special_tokens, current_char, current_char);
				}
				previous_value = current_char;
			}
			// Token: Equal Sign
			else if (current_char === "=" && token_stack.length > 0 && scope_state === false) {
				// Update Column
				start++;
				end = start;
				_t.push({ type: "", value: "", line, start, end, depth: depth_stack.length });
				updateStack(token_stack, special_tokens, current_char, current_char);
				// if next is '\n' then it is not a block, reset all arrays
				if (peek(src, i, 1) === "\n" || peek(src, i, 1) === "]") {
					// Update Column
					start++;
					end = end + special_tokens.join("").length;
					addToken(tokens, {
						type: TOKEN_TYPES.TEXT,
						value: special_tokens.join(""),
						line,
						start,
						end,
						depth: depth_stack.length
					});
					resetArray(token_stack, special_tokens, _t);
				}
				previous_value = current_char;
			}
			// Token: Close Bracket
			else if (current_char === "]" && token_stack.length > 0 && scope_state === false) {
				// Update Column
				start++;
				end = start;
				_t.push({ type: "", value: "", line, start, end, depth: depth_stack.length });
				updateStack(token_stack, special_tokens, current_char, current_char);
				if (previous_value !== end_keyword && peek(src, i, 1) !== "\n") {
					i++;
					temp_value = skipSpaces(src, i);
					i += temp_value.length - 1;
				}
				if (i < src.length - 1) {
					// if next is not '\n' then it is not a block, reset all arrays
					if (peek(src, i, 1) !== "\n") {
						// Update Column
						start++;
						end = end + special_tokens.join("").length;
						addToken(tokens, {
							type: TOKEN_TYPES.TEXT,
							value: special_tokens.join(""),
							line,
							start,
							end,
							depth: depth_stack.length
						});
						resetArray(token_stack, special_tokens, _t);
					} else if (peek(src, i, 1) === "\n") {
						const expected_tokens = ["[", block_id, "=", block_value, "]"];
						const another_expected = ["[", block_id, "]"];
						// is block?
						if (isExpected(token_stack, expected_tokens) || isExpected(token_stack, another_expected)) {
							depth_stack.push("Block");
							_t = _t.map(tk => {
								tk.depth = depth_stack.length;
								return tk;
							});
							for (let t = 0; t < special_tokens.length; t++) {
								let token_props;
								if (special_tokens.length === expected_tokens.length) {
									token_props = updateProps(token_props, _t, special_tokens, t, blockType1);
									addToken(tokens, token_props);
								} else if (special_tokens.length === another_expected.length) {
									token_props = updateProps(token_props, _t, special_tokens, t, blockType2);
									addToken(tokens, token_props);
								}
							}
							resetArray(token_stack, special_tokens, _t);
						}
					}
				}
				if (previous_value === end_keyword) {
					const endblock_tokens = ["[", end_keyword, "]"];
					// is end block?
					if (isExpected(token_stack, endblock_tokens)) {
					// Remainder: Needs a fix
						_t = _t.map(tk => {
							tk.depth = depth_stack.length;
							return tk;
						});
						depth_stack.pop();
						for (let t = 0; t < special_tokens.length; t++) {
							let token_props;
							token_props = updateProps(token_props, _t, special_tokens, t, endType1);
							addToken(tokens, token_props);
						}
						resetArray(token_stack, special_tokens, _t);
					}
				}
				previous_value = current_char;
			}
			// Token: Open Parenthesis
			else if (current_char === "(" && scope_state === false) {
				// Update Column
				start++;
				end = start;
				_t.push({ type: "", value: "", line, start, end, depth: depth_stack.length });
				updateStack(token_stack, special_tokens, current_char, current_char);
				if (previous_value !== "->" && scope_state === false) {
					previous_value = current_char;
				}
				// if next is '\n' then it is not inline statement, reset all arrays
				if (peek(src, i, 1) === "\n") {
					// Update Column
					start++;
					end = end + special_tokens.join("").length;
					addToken(tokens, {
						type: TOKEN_TYPES.TEXT,
						value: special_tokens.join(""),
						line,
						start,
						end,
						depth: depth_stack.length
					});
					resetArray(token_stack, special_tokens, _t);
				}
			}
			// Token: Thin Arrow
			else if (current_char === "-" && peek(src, i, 1) === ">" && token_stack.length > 0 && scope_state === false) {
				temp_value = current_char + peek(src, i, 1);
				i += temp_value.length - 1;
				// Update Column
				start++;
				end = end + temp_value.length;
				_t.push({ type: "", value: "", line, start, end, depth: depth_stack.length });
				updateStack(token_stack, special_tokens, temp_value, temp_value);
				// if next is not '\n' then it is not inline statement, reset all arrays
				if (peek(src, i, 1) !== "(") {
					// Update Column
					start++;
					end = end + special_tokens.join("").length;
					addToken(tokens, {
						type: TOKEN_TYPES.TEXT,
						value: special_tokens.join(""),
						line,
						start,
						end,
						depth: depth_stack.length
					});
					resetArray(token_stack, special_tokens, _t);
				}
				previous_value = temp_value;
			}
			// Token: Close Parenthesis
			else if (current_char === ")" && token_stack.length > 0 && scope_state === false) {
				// Update Column
				start++;
				end = start;
				_t.push({ type: "", value: "", line, start, end, depth: depth_stack.length });
				updateStack(token_stack, special_tokens, current_char, current_char);
				if (previous_value === inline_value) {
					// if next is not '-' and next + 1 is not '>' then it is not inline statement, reset all arrays
					if (peek(src, i, 1) !== "-" && peek(src, i, 2) !== ">") {
						// Update Column
						start++;
						end = end + special_tokens.join("").length;
						addToken(tokens, {
							type: TOKEN_TYPES.TEXT,
							value: special_tokens.join(""),
							line,
							start,
							end,
							depth: depth_stack.length
						});
						resetArray(token_stack, special_tokens, _t);
					}
				} else if (previous_value === inline_id) {
					const expected_tokens = ["(", inline_value, ")", "->", "(", inline_id, ")"];
					// is inline?
					if (isExpected(token_stack, expected_tokens)) {
						for (let t = 0; t < special_tokens.length; t++) {
							let token_props;
							token_props = updateProps(token_props, _t, special_tokens, t, inlineType);
							addToken(tokens, token_props);
						}
						resetArray(token_stack, special_tokens, _t);
					}
					previous_value = current_char;
				}
			}
			// Token: Open At (@_)
			else if (current_char === "@" && peek(src, i, 1) === "_") {
				temp_value = current_char + peek(src, i, 1);
				i += temp_value.length - 1;
				// Update Column
				start++;
				end = end + temp_str.length;
				_t.push({ type: "", value: "", line, start, end, depth: depth_stack.length });
				updateStack(token_stack, special_tokens, temp_value, temp_value);
				// if next is '\n' then it is not at_block, reset all arrays
				if (peek(src, i, 1) === "\n") {
					// Update Column
					start++;
					end = end + special_tokens.join("").length;
					addToken(tokens, {
						type: TOKEN_TYPES.TEXT,
						value: special_tokens.join(""),
						line,
						start,
						end,
						depth: depth_stack.length
					});
					resetArray(token_stack, special_tokens, _t);
				}
				previous_value = temp_value;
			}
			// Token: Close At (_@)
			else if (current_char === "_" && peek(src, i, 1) === "@" && token_stack.length > 0) {
				temp_value = current_char + peek(src, i, 1);
				i += temp_value.length - 1;
				// Update Column
				start++;
				end = end + temp_str.length;
				_t.push({ type: "", value: "", line, start, end, depth: depth_stack.length });
				updateStack(token_stack, special_tokens, temp_value, temp_value);
				if (previous_value !== end_keyword && peek(src, i, 1) !== "\n") {
					i++;
					temp_str = skipSpaces(src, i);
					i += temp_str.length - 1;
				}
				// if next is not ':' and not '\n' then it is not at_block, reset all arrays
				if (peek(src, i, 1) !== ":" && peek(src, i, 1) !== "\n") {
					// Update Column
					start++;
					end = end + special_tokens.join("").length;
					addToken(tokens, {
						type: TOKEN_TYPES.TEXT,
						value: special_tokens.join(""),
						line,
						start,
						end,
						depth: depth_stack.length
					});
					resetArray(token_stack, special_tokens, _t);
				}
				if (previous_value === at_id) {
					const at_tokens = ["@_", at_id, "_@"];
					// is at block?
					if (isExpected(token_stack, at_tokens)) {
						scope_state = true;
						for (let t = 0; t < special_tokens.length; t++) {
							let token_props;
							token_props = updateProps(token_props, _t, special_tokens, t, atType2);
							addToken(tokens, token_props);
						}
						resetArray(token_stack, special_tokens, _t);
					}
				} else if (previous_value === end_keyword) {
					const endblock_tokens = ["@_", end_keyword, "_@"];
					// is end block?
					if (isExpected(token_stack, endblock_tokens)) {
						scope_state = false;
						for (let t = 0; t < special_tokens.length; t++) {
							let token_props;
							token_props = updateProps(token_props, _t, special_tokens, t, endType2);
							addToken(tokens, token_props);
						}
						resetArray(token_stack, special_tokens, _t);
					}
				}
				previous_value = temp_value;
			}
			// Token: Colon
			else if (current_char === ":" && previous_value === "_@" && token_stack.length > 0) {
				// Update Column
				start++;
				end = end + temp_str.length;
				_t.push({ type: "", value: "", line, start, end, depth: depth_stack.length });
				updateStack(token_stack, special_tokens, current_char, current_char);
				if (peek(src, i, 1) === "\n") {
					// Update Column
					start++;
					end = end + special_tokens.join("").length;
					addToken(tokens, {
						type: TOKEN_TYPES.TEXT,
						value: special_tokens.join(""),
						line,
						start,
						end,
						depth: depth_stack.length
					});
					resetArray(token_stack, special_tokens, _t);
				}
				previous_value = current_char;
			}
			// Token: Newline
			else if (current_char === "\n") {
				line++;
				start = 1;
				end = 1;
				addToken(tokens, {
					type: TOKEN_TYPES.NEWLINE,
					value: current_char,
					line,
					start,
					end,
					depth: depth_stack.length
				});
			}
			// Token: Block Identifier OR Token: Value (Block Value) OR Token: End Keyword
			else {
				if (previous_value === "[" || (previous_value === "=" && token_stack.length > 0 && scope_state === false)) {
					temp_str = concat(src, i, false, ["=", "]", "\n"], scope_state);
					i += temp_str.length - 1;
					// Update Column
					start++;
					end = end + temp_str.length;
					_t.push({ type: "", value: "", line, start, end, depth: depth_stack.length });
					if (temp_str.trim()) {
						if (previous_value === "[") {
							// Token: End Keyword
							if (temp_str.trim() === end_keyword) {
								updateStack(token_stack, special_tokens, temp_str, temp_str);
								if (peek(src, i, 1) !== "]") {
									// Update Column
									start++;
									end = end + special_tokens.join("").length;
									addToken(tokens, {
										type: TOKEN_TYPES.TEXT,
										value: special_tokens.join(""),
										line,
										start,
										end,
										depth: depth_stack.length
									});
									resetArray(token_stack, special_tokens, _t);
								}
								previous_value = temp_str.trim();
								scope_state = false;
							}
							// Token: Block Identifier
							else {
								updateStack(token_stack, special_tokens, block_id, temp_str.trim());
								if (peek(src, i, 1) !== "=" && peek(src, i, 1) !== "]") {
									// Update Column
									start++;
									end = end + special_tokens.join("").length;
									addToken(tokens, {
										type: TOKEN_TYPES.TEXT,
										value: special_tokens.join(""),
										line,
										start,
										end,
										depth: depth_stack.length
									});
									resetArray(token_stack, special_tokens, _t);
								}
								previous_value = block_id;
							}
						}
						// Token: Block Value
						else if (previous_value === "=") {
							updateStack(token_stack, special_tokens, block_value, temp_str.trim());
							// if next is ']' then it is not a block, reset all arrays
							if (peek(src, i, 1) !== "]") {
								// Update Column
								start++;
								end = end + special_tokens.join("").length;
								addToken(tokens, {
									type: TOKEN_TYPES.TEXT,
									value: special_tokens.join(""),
									line,
									start,
									end,
									depth: depth_stack.length
								});
								resetArray(token_stack, special_tokens, _t);
							}
							previous_value = block_value;
						}
					}
				}
				// Token: Inline Value OR Token: Inline Identifier
				else if (previous_value === "(" || (previous_value === "->" && token_stack.length > 0 && scope_state === false)) {
					temp_str = concat(src, i, false, [")", "["], scope_state);
					i += temp_str.length - 1;
					// Update Column
					start++;
					end = end + temp_str.length;
					_t.push({ type: "", value: "", line, start, end, depth: depth_stack.length });
					if (temp_str.trim()) {
						if (previous_value === "(") {
							// Token: Inline Value
							updateStack(token_stack, special_tokens, inline_value, temp_str.trim());
							// if next is not ')' then it is not inline statement, reset all arrays
							if (peek(src, i, 1) !== ")") {
								// Update Column
								start++;
								end = end + special_tokens.join("").length;
								addToken(tokens, {
									type: TOKEN_TYPES.TEXT,
									value: special_tokens.join(""),
									line,
									start,
									end,
									depth: depth_stack.length
								});
								resetArray(token_stack, special_tokens, _t);
							}
							previous_value = inline_value;
						} else {
							// Token: Inline Identifier
							updateStack(token_stack, special_tokens, inline_id, temp_str.trim());
							// if next is not ')' then it is not inline statement, reset all arrays
							if (peek(src, i, 1) !== ")") {
								// Update Column
								start++;
								end = end + special_tokens.join("").length;
								addToken(tokens, {
									type: TOKEN_TYPES.TEXT,
									value: special_tokens.join(""),
									line,
									start,
									end,
									depth: depth_stack.length
								});
								resetArray(token_stack, special_tokens, _t);
							}
							previous_value = inline_id;
						}
					}
				}
				// Token: At Identifier OR Token: At Value OR Token: End Keyword
				else if ((previous_value === "@_" || previous_value === ":") && token_stack.length > 0) {
					temp_str = concat(src, i, false, ["_", "\n"], scope_state);
					if (temp_str.trim()) {
						i += temp_str.length - 1;
						// Update Column
						start++;
						end = end + temp_str.length;
						_t.push({ type: "", value: "", line, start, end, depth: depth_stack.length });
						if (previous_value === "@_") {
							// Token: End Keyword
							if (temp_str.trim() === end_keyword) {
								updateStack(token_stack, special_tokens, temp_str.trim(), temp_str.trim());
								if (peek(src, i, 1) !== "_" && peek(src, i, 2) !== "@") {
									// Update Column
									start++;
									end = end + special_tokens.join("").length;
									addToken(tokens, {
										type: TOKEN_TYPES.TEXT,
										value: special_tokens.join(""),
										line,
										start,
										end,
										depth: depth_stack.length
									});
									resetArray(token_stack, special_tokens, _t);
								}
								previous_value = temp_str.trim();
								scope_state = false;
							}
							// Token: At Identifier
							else {
								updateStack(token_stack, special_tokens, at_id, temp_str.trim());
								if (peek(src, i, 1) !== "_" && peek(src, i, 2) !== "@") {
									// Update Column
									start++;
									end = end + special_tokens.join("").length;
									addToken(tokens, {
										type: TOKEN_TYPES.TEXT,
										value: special_tokens.join(""),
										line,
										start,
										end,
										depth: depth_stack.length
									});
									resetArray(token_stack, special_tokens, _t);
								}
								previous_value = at_id;
							}
						}
						// Token: At Value
						else {
							updateStack(token_stack, special_tokens, at_value, temp_str.trim());
							if (peek(src, i, 1) !== "\n") {
								// Update Column
								start++;
								end = end + special_tokens.join("").length;
								addToken(tokens, {
									type: TOKEN_TYPES.TEXT,
									value: special_tokens.join(""),
									line,
									start,
									end,
									depth: depth_stack.length
								});
							}
							const expected_tokens = ["@_", at_id, "_@", ":", at_value];
							// is at block?
							if (isExpected(token_stack, expected_tokens)) {
								scope_state = true;
								for (let t = 0; t < special_tokens.length; t++) {
									let token_props;
									token_props = updateProps(token_props, _t, special_tokens, t, atType1);
									addToken(tokens, token_props);
								}
								resetArray(token_stack, special_tokens, _t);
							}
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
						addToken(tokens, {
							type: TOKEN_TYPES.COMMENT,
							value: temp_str,
							line,
							start,
							end,
							depth: depth_stack.length
						});
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
						addToken(tokens, {
							type: TOKEN_TYPES.TEXT,
							value: context,
							line,
							start,
							end,
							depth: depth_stack.length
						});
					}
				}
			}
			context = "";
			temp_str = "";
			temp_value = "";
		}
		return tokens;
	} else {
		throw new Error("Invalid Source Code");
	}
}

export default lexer;
