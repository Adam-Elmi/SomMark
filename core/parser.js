import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import { parserError } from "./errors.js";
import {
	BLOCK,
	TEXT,
	INLINE,
	ATBLOCK,
	COMMENT,
	SEMICOLON,
	block_id,
	block_value,
	inline_id,
	inline_value,
	at_id,
	at_value,
	end_keyword
} from "./labels.js";

function current_token(tokens, i) {
	return tokens[i] || null;
}

function validateName(
	id,
	keyRegex = /^[a-zA-Z0-9]+$/,
	name = "Identifier",
	rule = "(A–Z, a–z, 0–9)",
	ruleMessage = "must contain only letters and numbers"
) {
	if (!keyRegex.test(id)) {
		parserError([`{line}<$red:Invalid ${name}:$><$blue: '${id}'$>{N}<$yellow:${name} ${ruleMessage}$> <$cyan: ${rule}.$>{line}`]);
	}
}

function makeBlockNode() {
	return {
		type: BLOCK,
		id: "",
		args: [],
		body: [],
		depth: 0
	};
}

function makeTextNode() {
	return {
		type: TEXT,
		text: "",
		depth: 0
	};
}

function makeCommentNode() {
	return {
		type: COMMENT,
		text: "",
		depth: 0
	};
}

function makeInlineNode() {
	return {
		type: INLINE,
		value: "",
		id: "",
		args: [],
		depth: 0
	};
}

function makeAtBlockNode() {
	return {
		type: ATBLOCK,
		id: "",
		args: [],
		content: "",
		depth: 0
	};
}

let end_stack = [];
let tokens_stack = [];
let line = 1,
	start = 1,
	end = 1,
	value = "";

const fallback = {
	value: "Unknown",
	line: "Unknown",
	start: "Unknown",
	end: "Unknown",
	tokens_stack: ["--Empty--"]
};
const updateData = (tokens, i) => {
	if (tokens[i]) {
		tokens_stack.push(tokens[i].value);
		line = tokens[i].line;
		start = tokens[i].start;
		end = tokens[i].end;
		value = tokens[i].value;
	}
};

let real_cause = "";

const errorMessage = (tokens, i, expectedValue, behindValue, frontText) => {
	const tokensUntilError = tokens.slice(0, i);
	const contextText = tokensUntilError.map(t => t.value).join("");
	const pointerPadding = " ".repeat(contextText.length);
	const current = tokens[i] ?? fallback;
	return [
		`<$blue:{line}$><$red:Here where error occurred:$>{N}${contextText}${current.value}{N}${pointerPadding}<$yellow:^$>{N}{N}`,
		`<$red:${frontText ? frontText : "Expected token"}$> <$blue:'${expectedValue}'$> ${behindValue ? "after <$blue:'" + behindValue + "'$>" : ""} at line <$yellow:${line}$>,`,
		` from column <$yellow: ${start}$> to <$yellow: ${end}$>`,
		`{N}<$yellow:Received:$> <$blue:'${value === "\n" ? "\\n' (newline)" : value}'$>`,
		` at line <$yellow:${current.line}$>,`,
		` from column <$yellow: ${current.start}$> to <$yellow: ${current.end}$>{N}`,
		"<$blue:{line}$>"
	];
};

// ========================================================================== //
//  Parse Block                                                               //
// ========================================================================== //
function parseBlock(tokens, i) {
	const blockNode = makeBlockNode();
	// ========================================================================== //
	//  consume '['                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.IDENTIFIER)) {
		parserError(errorMessage(tokens, i, block_id, "["));
	}
	const id = current_token(tokens, i).value;
	if (id === end_keyword) {
		parserError(errorMessage(tokens, i, id, "", `'${id}' is a reserved keyword and cannot be used as an identifier.`));
	}
	validateName(id);
	blockNode.id = id;
	blockNode.depth = current_token(tokens, i).depth;
	end_stack.push(id);
	// ========================================================================== //
	//  consume Block Identifier                                                  //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.EQUAL) {
		// ========================================================================== //
		//  consume '='                                                               //
		// ========================================================================== //
		i++;
		updateData(tokens, i);
		// ========================================================================== //
		//  consume key-Value                                                         //
		// ========================================================================== //
		let k = "";
		let v = "";
		while (i < tokens.length) {
			if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
				k = current_token(tokens, i).value;
				validateName(k);
				// ========================================================================== //
				//  consume Key                                                               //
				// ========================================================================== //
				i++;
				updateData(tokens, i);
				if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.COLON)) {
					parserError(errorMessage(tokens, i, ":", at_id));
				}
				// ========================================================================== //
				//  consume ':'                                                               //
				// ========================================================================== //
				i++;
				updateData(tokens, i);
				if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
					parserError(errorMessage(tokens, i, ":", "", "Found extra"));
				}
				continue;
			} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
				v += current_token(tokens, i).value.slice(1);
				// ========================================================================== //
				//  consume Escape Character '\'                                              //
				// ========================================================================== //
				i++;
				updateData(tokens, i);
				continue;
			} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
				v += current_token(tokens, i).value;
				// ========================================================================== //
				//  consume Value                                                             //
				// ========================================================================== //
				i++;
				updateData(tokens, i);
				for (let e = i; e < tokens.length; e++) {
					if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
						v += current_token(tokens, i).value.slice(1);
						// ========================================================================== //
						//  consume Escape Character '\'                                              //
						// ========================================================================== //
						i++;
						updateData(tokens, i);
						continue;
					} else {
						break;
					}
				}
				blockNode.args.push(v);
				if (k) {
					blockNode.args[k] = v;
				}
				k = "";
				v = "";
				if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
					// ========================================================================== //
					//  consume ','                                                               //
					// ========================================================================== //
					i++;
					updateData(tokens, i);
					if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
						parserError(errorMessage(tokens, i, ",", "", "Found extra"));
					} else if (
						!current_token(tokens, i) ||
						(current_token(tokens, i) &&
							current_token(tokens, i).type !== TOKEN_TYPES.VALUE &&
							current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE &&
							current_token(tokens, i).type !== TOKEN_TYPES.IDENTIFIER)
					) {
						parserError(errorMessage(tokens, i, at_value, ","));
					}
					continue;
				}
				continue;
			} else {
				break;
			}
		}
	}
	// ========================================================================== //
	//  Close Bracket                                                             //
	// ========================================================================== //
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_BRACKET)) {
		if (peek(tokens, i, -1) && peek(tokens, i, -1).type === TOKEN_TYPES.VALUE) {
			parserError(errorMessage(tokens, i, "]", block_value));
		} else {
			parserError(errorMessage(tokens, i, "]", block_id));
		}
	}
	// ========================================================================== //
	//  consume ']'                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	tokens_stack.length = 0;
	while (i < tokens.length) {
		if (
			current_token(tokens, i) &&
			current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET &&
			peek(tokens, i, 1) &&
			peek(tokens, i, 1).type !== TOKEN_TYPES.END_KEYWORD
		) {
			const [childNode, nextIndex] = parseBlock(tokens, i);
			blockNode.body.push(childNode);
			// ========================================================================== //
			//  consume child node                                                        //
			// ========================================================================== //
			i = nextIndex;
			updateData(tokens, i);
		} else if (
			current_token(tokens, i) &&
			current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET &&
			peek(tokens, i, 1) &&
			peek(tokens, i, 1).type === TOKEN_TYPES.END_KEYWORD
		) {
			// ========================================================================== //
			//  consume '['                                                               //
			// ========================================================================== //
			i++;
			if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.END_KEYWORD)) {
				parserError(errorMessage(tokens, i, "end", "["));
			}
			// ========================================================================== //
			//  consume End Keyword                                                       //
			// ========================================================================== //
			i++;
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
			i++;
			updateData(tokens, i);
			break;
		} else {
			const [childNode, nextIndex] = parseNode(tokens, i);
			if (!childNode) {
				i += 1;
				continue;
			}
			blockNode.body.push(childNode);
			i = nextIndex;
			updateData(tokens, i);
		}
	}
	return [blockNode, i];
}
// ========================================================================== //
//  Parse Inline Statements                                                   //
// ========================================================================== //
function parseInline(tokens, i) {
	const inlineNode = makeInlineNode();
	// ========================================================================== //
	//  consume '('                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.VALUE)) {
		parserError(errorMessage(tokens, i, inline_value, "("));
	}
	inlineNode.value = current_token(tokens, i).value;
	// ========================================================================== //
	//  consume Inline Value                                                      //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
		while (i < tokens.length) {
			if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
				inlineNode.value += current_token(tokens, i).value.slice(1);
				// ========================================================================== //
				//  consume Escape Character '\'                                              //
				// ========================================================================== //
				i++;
				continue;
			} else {
				break;
			}
		}
	}
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN)) {
		parserError(errorMessage(tokens, i, ")", inline_value));
	}
	// ========================================================================== //
	//  consume ')'                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.THIN_ARROW)) {
		parserError(errorMessage(tokens, i, "->", ")"));
	}
	// ========================================================================== //
	//  consume '->'                                                              //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.OPEN_PAREN)) {
		parserError(errorMessage(tokens, i, "(", "->"));
	}
	// ========================================================================== //
	//  consume '('                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.IDENTIFIER)) {
		parserError(errorMessage(tokens, i, inline_id, "("));
	}
	validateName(current_token(tokens, i).value);
	inlineNode.id = current_token(tokens, i).value;
	// ========================================================================== //
	//  consume Inline Identifier                                                 //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
		// ========================================================================== //
		//  consume ':'                                                               //
		// ========================================================================== //
		i++;
		updateData(tokens, i);
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
			parserError(errorMessage(tokens, i, ":", "", "Found extra"));
		}
		if (
			!current_token(tokens, i) ||
			(current_token(tokens, i) &&
				current_token(tokens, i).type !== TOKEN_TYPES.VALUE &&
				current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE)
		) {
			parserError(errorMessage(tokens, i, inline_value, ":"));
		}
		let v = "";
		while (i < tokens.length) {
			if (
				current_token(tokens, i) &&
				(current_token(tokens, i).type === TOKEN_TYPES.VALUE || current_token(tokens, i).type === TOKEN_TYPES.ESCAPE)
			) {
				if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
					v += current_token(tokens, i).value.slice(1);
					// ========================================================================== //
					//  consume Escape Character '\'                                              //
					// ========================================================================== //
					i++;
					updateData(tokens, i);
					if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
						for (let e = i; e < tokens.length; e++) {
							if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
								v += current_token(tokens, i).value.slice(1);
								// ========================================================================== //
								//  consume Escape Character '\'                                              //
								// ========================================================================== //
								i++;
								updateData(tokens, i);
								continue;
							} else {
								break;
							}
						}
					}
					continue;
				}
				v += current_token(tokens, i).value;
				// ========================================================================== //
				//  consume Inline Value                                                      //
				// ========================================================================== //
				i++;
				updateData(tokens, i);
				if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
					for (let e = i; e < tokens.length; e++) {
						if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
							v += current_token(tokens, i).value.slice(1);
							// ========================================================================== //
							//  consume Escape Character '\'                                              //
							// ========================================================================== //
							i++;
							updateData(tokens, i);
							continue;
						} else {
							break;
						}
					}
				}
				inlineNode.args.push(v);
				inlineNode.args[v] = v;
				v = "";
				if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
					// ========================================================================== //
					//  consume ','                                                               //
					// ========================================================================== //
					i++;
					updateData(tokens, i);
					if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
						parserError(errorMessage(tokens, i, ",", "", "Found extra"));
					}
					if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.VALUE)) {
						parserError(errorMessage(tokens, i, inline_value, ","));
					}
					continue;
				}
				continue;
			} else {
				break;
			}
		}
	}
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN)) {
		parserError(errorMessage(tokens, i, ")", inline_id));
	}
	// ========================================================================== //
	//  consume ')'                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	tokens_stack.length = 0;
	return [inlineNode, i];
}
// ========================================================================== //
//  Parse Text                                                                //
// ========================================================================== //
function parseText(tokens, i) {
	const textNode = makeTextNode();
	textNode.depth = current_token(tokens, i).depth;
	while (i < tokens.length) {
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.TEXT) {
			textNode.text += current_token(tokens, i).value;
			// ========================================================================== //
			//  consume Text Node                                                         //
			// ========================================================================== //
			i++;
			updateData(tokens, i);
		} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
			textNode.text += current_token(tokens, i).value.slice(1);
			// ========================================================================== //
			//  consume Text Node                                                         //
			// ========================================================================== //
			i++;
			updateData(tokens, i);
		} else {
			break;
		}
	}
	return [textNode, i];
}
// ========================================================================== //
//  Parse AtBlock                                                             //
// ========================================================================== //
function parseAtBlock(tokens, i) {
	const atBlockNode = makeAtBlockNode();
	// ========================================================================== //
	//  consume '@_'                                                              //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	const id = current_token(tokens, i).value;
	if (id === end_keyword) {
		parserError(errorMessage(tokens, i, id, "", `'${id}' is a reserved keyword and cannot be used as an identifier.`));
	}
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
		validateName(id);
		atBlockNode.id = id;
		atBlockNode.depth = current_token(tokens, i).depth;
	} else {
		parserError(errorMessage(tokens, i, at_id, "@_"));
	}
	// ========================================================================== //
	//  consume Atblock Identifier                                                //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT)) {
		parserError(errorMessage(tokens, i, "_@", at_id));
	}
	// ========================================================================== //
	//  consume '_@'                                                              //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (
		current_token(tokens, i) &&
		current_token(tokens, i).type === TOKEN_TYPES.TEXT &&
		(current_token(tokens, i).value.includes("[") || current_token(tokens, i).value.includes("]"))
	) {
		parserError(
			errorMessage(
				tokens,
				i,
				current_token(tokens, i).value,
				"",
				`SomMark uses a scope-based state system to control tokenizing.When @_ is encountered, tokenizing is turned off.Tokenizing is turned back on after the lexer encounters @_end_@. If the At-Block syntax is not completed, all remaining characters are concatenated and treated as plain text until the end of input.`
			)
		);
	}
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
		// ========================================================================== //
		//  consume ':'                                                               //
		// ========================================================================== //
		i++;
		updateData(tokens, i);
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
			parserError(errorMessage(tokens, i, ":", "", "Found extra"));
		}
		if (
			!current_token(tokens, i) ||
			(current_token(tokens, i) &&
				current_token(tokens, i).type !== TOKEN_TYPES.IDENTIFIER &&
				current_token(tokens, i).type !== TOKEN_TYPES.VALUE &&
				current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE)
		) {
			parserError(errorMessage(tokens, i, `${at_id} or ${at_value}`, ":"));
		}
		let k = "";
		let v = "";
		while (i < tokens.length) {
			if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
				validateName(current_token(tokens, i).value);
				k = current_token(tokens, i).value;
				// ========================================================================== //
				//  consume Key                                                               //
				// ========================================================================== //
				i++;
				updateData(tokens, i);
				if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.COLON)) {
					parserError(errorMessage(tokens, i, ":", at_id));
				}
				// ========================================================================== //
				//  consume ':'                                                               //
				// ========================================================================== //
				i++;
				updateData(tokens, i);
				if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
					parserError(errorMessage(tokens, i, ":", "", "Found extra"));
				}
				continue;
			} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
				v += current_token(tokens, i).value.slice(1);
				// ========================================================================== //
				//  consume Escape Character '\'                                              //
				// ========================================================================== //
				i++;
				updateData(tokens, i);
				continue;
			} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
				v += current_token(tokens, i).value;
				// ========================================================================== //
				//  consume Value                                                             //
				// ========================================================================== //
				i++;
				for (let e = i; e < tokens.length; e++) {
					if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
						v += current_token(tokens, i).value.slice(1);
						// ========================================================================== //
						//  consume Escape Character '\'                                              //
						// ========================================================================== //
						i++;
						updateData(tokens, i);
						continue;
					} else {
						break;
					}
				}
				atBlockNode.args.push(v);
				if (k) {
					atBlockNode.args[k] = v;
				}
				k = "";
				v = "";
				if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
					// ========================================================================== //
					//  consume ','                                                               //
					// ========================================================================== //
					i++;
					updateData(tokens, i);
					if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
						parserError(errorMessage(tokens, i, ",", "", "Found extra"));
					} else if (
						!current_token(tokens, i) ||
						(current_token(tokens, i) &&
							current_token(tokens, i).type !== TOKEN_TYPES.VALUE &&
							current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE &&
							current_token(tokens, i).type !== TOKEN_TYPES.IDENTIFIER)
					) {
						parserError(errorMessage(tokens, i, at_value, ","));
					}
					continue;
				}
				continue;
			} else {
				break;
			}
		}
	}
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.SEMICOLON)) {
		parserError(errorMessage(tokens, i, ";", at_value));
	}
	// ========================================================================== //
	//  consume ';'                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (
		!current_token(tokens, i) ||
		(current_token(tokens, i) &&
			current_token(tokens, i).type !== TOKEN_TYPES.TEXT &&
			current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE)
	) {
		parserError(errorMessage(tokens, i, "Text", at_value));
	}
	if (
		current_token(tokens, i) &&
		(current_token(tokens, i).type === TOKEN_TYPES.TEXT || current_token(tokens, i).type === TOKEN_TYPES.ESCAPE)
	) {
		const [childNode, nextIndex] = parseText(tokens, i);
		atBlockNode.content = childNode.text;
		i = nextIndex;
		updateData(tokens, i);
	}
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.OPEN_AT)) {
		parserError(errorMessage(tokens, i, "@_", TEXT));
	}
	// ========================================================================== //
	//  consume '@_'                                                              //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.END_KEYWORD)) {
		parserError(errorMessage(tokens, i, end_keyword, "@_"));
	}
	// ========================================================================== //
	//  consume End Keyword                                                       //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT)) {
		parserError(errorMessage(tokens, i, "_@", end_keyword));
	}
	// ========================================================================== //
	//  consume '_@'                                                              //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	tokens_stack.length = 0;
	return [atBlockNode, i];
}
// ========================================================================== //
//  Parse Comments                                                            //
// ========================================================================== //
function parseCommentNode(tokens, i) {
	const commentNode = makeCommentNode();
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMENT) {
		commentNode.text = current_token(tokens, i).value;
		commentNode.depth = current_token(tokens, i).depth;
	}
	// ========================================================================== //
	//  consume Comment '#'                                                       //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	return [commentNode, i];
}

function parseNode(tokens, i) {
	if (!current_token(tokens, i) || (current_token(tokens, i) && !current_token(tokens, i).value)) {
		return [null, i];
	}
	// ========================================================================== //
	//  Comment                                                                   //
	// ========================================================================== //
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMENT) {
		return parseCommentNode(tokens, i);
	}
	// ========================================================================== //
	//  Block                                                                     //
	// ========================================================================== //
	else if (current_token(tokens, i).value === "[" && peek(tokens, i, 1) && peek(tokens, i, 1).type !== TOKEN_TYPES.END_KEYWORD) {
		return parseBlock(tokens, i);
	}
	// ========================================================================== //
	//  Inline Statement                                                          //
	// ========================================================================== //
	else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.OPEN_PAREN) {
		return parseInline(tokens, i);
	}
	// ========================================================================== //
	//  Text                                                                      //
	// ========================================================================== //
	else if (
		current_token(tokens, i) &&
		(current_token(tokens, i).type === TOKEN_TYPES.TEXT || current_token(tokens, i).type === TOKEN_TYPES.ESCAPE)
	) {
		return parseText(tokens, i);
	}
	// ========================================================================== //
	//  Atblock                                                                   //
	// ========================================================================== //
	else if (current_token(tokens, i).value === "@_") {
		return parseAtBlock(tokens, i);
	} else {
		parserError(errorMessage(tokens, i, current_token(tokens, i).value, "", "Syntax Error:"));
	}
	return [null, i + 1];
}

function parser(tokens) {
	end_stack = [];
	tokens_stack = [];
	line = 1;
	start = 1;
	end = 1;
	value = "";
	let ast = [];
	let i = 0;
	while (i < tokens.length) {
		let [nodes, nextIndex] = parseNode(tokens, i);
		if (current_token(tokens, i).type !== TOKEN_TYPES.COMMENT && current_token(tokens, i).depth === 0) {
			parserError(errorMessage(tokens, i, "[", ""));
		}
		switch (real_cause) {
			case SEMICOLON:
				parserError(errorMessage(tokens, i, ";", at_value));
				break;
			// ...
		}
		if (nodes) {
			ast.push(nodes);
			i = nextIndex;
		} else {
			i++;
		}
	}
	if (end_stack.length !== 0) {
		parserError(errorMessage(tokens, tokens.length - 1, "[end]", "", "Missing"));
	}
	return ast;
}

export default parser;
