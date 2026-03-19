/**
 * SomMark Parser
 */
import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import { parserError } from "./errors.js";
import {
	BLOCK,
	TEXT,
	INLINE,
	ATBLOCK,
	COMMENT,
	IMPORT,
	USE_MODULE,
	block_id,
	block_value,
	inline_id,
	inline_value,
	at_id,
	at_value,
	end_keyword
} from "./labels.js";
import { levenshtein } from "../helpers/utils.js";

// ========================================================================== //
//  Helper Functions                                                         //
// ========================================================================== //

function current_token(tokens, i) {
	return tokens[i] || null;
}

function validateName(
	id,
	keyRegex = /^[a-zA-Z0-9\-_$]+$/,
	name = "Identifier",
	rule = "(A–Z, a–z, 0–9, -, _, $)",
	ruleMessage = "must contain only letters, numbers, hyphens, underscores, or dollar signs ($)"
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
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}

function makeTextNode() {
	return {
		type: TEXT,
		text: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}

function makeCommentNode() {
	return {
		type: COMMENT,
		text: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}

function makeInlineNode() {
	return {
		type: INLINE,
		value: "",
		id: "",
		args: [],
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}

// ========================================================================== //
//  Node Creators (Factories)                                                //
// ========================================================================== //

function makeAtBlockNode() {
	return {
		type: ATBLOCK,
		id: "",
		args: [],
		content: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}

// ========================================================================== //
//  Parser State and Error Tracking                                          //
// ========================================================================== //

let end_stack = [];
let tokens_stack = [];
let range = {
	start: { line: 0, character: 0 },
	end: { line: 0, character: 0 }
},
	value = "";

const fallback = {
	value: "Unknown",
	range: {
		start: { line: 0, character: 0 },
		end: { line: 0, character: 0 }
	},
	tokens_stack: ["--Empty--"]
};
const updateData = (tokens, i) => {
	if (tokens[i]) {
		tokens_stack.push(tokens[i].value);
		range = tokens[i].range;
		value = tokens[i].value;
	}
};

const errorMessage = (tokens, i, expectedValue, behindValue, frontText, filename = null) => {
	const current = tokens[i] || fallback;
	const errorLineNumber = current.range.start.line;
	const errorCharNumber = current.range.start.character;
	const source = current.source || filename;
	const sourceLabel = source ? ` [${source}]` : "";

	let lineStartIndex = i;
	while (
		lineStartIndex > 0 &&
		tokens[lineStartIndex - 1].range.start.line === errorLineNumber &&
		(tokens[lineStartIndex - 1].source || filename) === source
	) {
		lineStartIndex--;
	}

	let lineEndIndex = i;
	while (
		lineEndIndex < tokens.length - 1 &&
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
	let key = current_token(tokens, i).value.trim();
	// ========================================================================== //
	//  consume Key                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	return [key, i];
}
// ========================================================================== //
//  Parse Value                                                               //
// ========================================================================== //
function parseValue(tokens, i) {
	let val = current_token(tokens, i).value;
	// consume Value
	i++;
	updateData(tokens, i);
	return [val, i];
}
// ========================================================================== //
//  Parse ','                                                                 //
// ========================================================================== //
function parseComma(tokens, i, beforeChar = "") {
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
		parserError(errorMessage(tokens, i, beforeChar, ","));
	}
	return i;
}
// ========================================================================== //
//  Parse Escape                                                              //
// ========================================================================== //
function parseEscape(tokens, i) {
	let escape_character = current_token(tokens, i).value.slice(1);
	// ========================================================================== //
	//  consume Escape Character '\'                                              //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	return [escape_character, i];
}
// ========================================================================== //
//  Parse ':'                                                                 //
// ========================================================================== //
function parseColon(tokens, i, afterChar = "") {
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.COLON)) {
		parserError(errorMessage(tokens, i, ":", afterChar));
	}
	// ========================================================================== //
	//  consume ':'                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
		parserError(errorMessage(tokens, i, ":", "", "Found extra"));
	}
	return i;
}
// ========================================================================== //
//  Parse ';'                                                                 //
// ========================================================================== //
function parseSemiColon(tokens, i, afterChar = "") {
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.SEMICOLON)) {
		parserError(errorMessage(tokens, i, ";", afterChar));
	}
	// ========================================================================== //
	//  consume ';'                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.SEMICOLON) {
		parserError(errorMessage(tokens, i, ";", "", "Found extra"));
	}
	return i;
}
// ========================================================================== //
//  Parse Block                                                               //
// ========================================================================== //
function parseBlock(tokens, i, filename = null) {
	const blockNode = makeBlockNode();
	const openBracketToken = current_token(tokens, i);
	// ========================================================================== //
	//  consume '['                                                               //
	// ========================================================================== //
	i++;
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
	}
	validateName(blockNode.id);
	blockNode.depth = idToken.depth;
	blockNode.range.start = openBracketToken.range.start;
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
		if (
			!current_token(tokens, i) ||
			(current_token(tokens, i) &&
				current_token(tokens, i).type !== TOKEN_TYPES.VALUE &&
				current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE &&
				current_token(tokens, i).type !== TOKEN_TYPES.IDENTIFIER)
		) {
			parserError(errorMessage(tokens, i, block_value, "="));
		}
		// ========================================================================== //
		//  consume key-Value                                                         //
		// ========================================================================== //
		let k = "";
		let v = "";
		while (i < tokens.length) {
			if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
				let [key, keyIndex] = parseKey(tokens, i);
				k = key;
				i = keyIndex;
				const prev = current_token(tokens, i);
				i = parseColon(tokens, i, block_id);
				if (current_token(tokens, i).type !== TOKEN_TYPES.VALUE && current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE) {
					parserError(errorMessage(tokens, i, block_value, ":"));
				}
				validateName(k);
				continue;
			} else if (
				current_token(tokens, i) &&
				(current_token(tokens, i).type === TOKEN_TYPES.VALUE || current_token(tokens, i).type === TOKEN_TYPES.ESCAPE)
			) {
				if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
					let [escape_character, escapeIndex] = parseEscape(tokens, i);
					v += escape_character;
					i = escapeIndex;
				} else {
					let [value, valueIndex] = parseValue(tokens, i);
					v += value;
					i = valueIndex;
				}

				while (
					i < tokens.length &&
					current_token(tokens, i) &&
					(current_token(tokens, i).type === TOKEN_TYPES.VALUE || current_token(tokens, i).type === TOKEN_TYPES.ESCAPE)
				) {
					if (current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
						let [escape_character, escapeIndex] = parseEscape(tokens, i);
						v += escape_character;
						i = escapeIndex;
					} else {
						let [value, valueIndex] = parseValue(tokens, i);
						v += value;
						i = valueIndex;
					}
				}

				if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
					v = v.trim();
					if (v.startsWith('"') && v.endsWith('"')) {
						v = v.slice(1, -1);
					}
					blockNode.args.push(v);
					if (k) {
						blockNode.args[k] = v;
					}
					k = "";
					v = "";
					i = parseComma(tokens, i, block_value);
					continue;
				}
				continue;
			} else {
				break;
			}
		}
		if (v !== "") {
			v = v.trim();
			if (v.startsWith('"') && v.endsWith('"')) {
				v = v.slice(1, -1);
			}
			blockNode.args.push(v);
			if (k) {
				blockNode.args[k] = v;
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
			const [childNode, nextIndex] = parseBlock(tokens, i, filename);
			blockNode.body.push(childNode);
			// ========================================================================== //
			//  consume child node                                                        //
			// ========================================================================== //
			i = nextIndex;
		} else if (
			current_token(tokens, i) &&
			current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET &&
			peek(tokens, i, 1) &&
			(peek(tokens, i, 1).type === TOKEN_TYPES.END_KEYWORD || peek(tokens, i, 1).value.trim() === end_keyword)
		) {
			// ========================================================================== //
			//  consume '['                                                               //
			// ========================================================================== //
			i++;
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
		} else {
			const [childNode, nextIndex] = parseNode(tokens, i, filename);
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
// ========================================================================== //
//  Parse Inline Statements                                                   //
// ========================================================================== //
function parseInline(tokens, i) {
	const inlineNode = makeInlineNode();
	const openParenToken = current_token(tokens, i);
	inlineNode.range.start = openParenToken.range.start;
	// ========================================================================== //
	//  consume '('                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (current_token(tokens, i)) {
		inlineNode.depth = current_token(tokens, i).depth;
	}
	while (i < tokens.length) {
		const token = current_token(tokens, i);
		if (!token || token.type === TOKEN_TYPES.CLOSE_PAREN) {
			break;
		}
		if (token.type === TOKEN_TYPES.ESCAPE) {
			inlineNode.value += token.value.slice(1);
		} else {
			inlineNode.value += token.value;
		}
		i++;
		updateData(tokens, i);
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
	inlineNode.id = current_token(tokens, i).value.trim();
	if (inlineNode.id === end_keyword) {
		parserError(errorMessage(tokens, i, inlineNode.id, "", `'${inlineNode.id}' is a reserved keyword and cannot be used as an identifier.`));
	}
	validateName(inlineNode.id);
	// ========================================================================== //
	//  consume Inline Identifier                                                 //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
		i = parseColon(tokens, i, inline_id);
		if (
			!current_token(tokens, i) ||
			(current_token(tokens, i) &&
				current_token(tokens, i).type !== TOKEN_TYPES.VALUE &&
				current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE)
		) {
			parserError(errorMessage(tokens, i, inline_value, ":"));
		}
		let v = "";
		const pushArg = () => {
			if (v !== "") {
				v = v.trim();
				if (v.startsWith('"') && v.endsWith('"')) {
					v = v.slice(1, -1);
				}
				inlineNode.args.push(v);
				v = "";
			}
		};

		while (i < tokens.length) {
			if (
				current_token(tokens, i) &&
				(current_token(tokens, i).type === TOKEN_TYPES.VALUE || current_token(tokens, i).type === TOKEN_TYPES.ESCAPE)
			) {
				if (current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
					// Escape Character
					const [escape_character, escapeIndex] = parseEscape(tokens, i);
					v += escape_character;
					i = escapeIndex;
				} else {
					// Value
					const [value, valueIndex] = parseValue(tokens, i);
					v += value;
					i = valueIndex;
				}

				while (
					i < tokens.length &&
					current_token(tokens, i) &&
					(current_token(tokens, i).type === TOKEN_TYPES.VALUE || current_token(tokens, i).type === TOKEN_TYPES.ESCAPE)
				) {
					if (current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
						const [escape_character, escapeIndex] = parseEscape(tokens, i);
						v += escape_character;
						i = escapeIndex;
					} else {
						const [value, valueIndex] = parseValue(tokens, i);
						v += value;
						i = valueIndex;
					}
				}

				if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
					pushArg();
					// ========================================================================== //
					//  consume ','                                                               //
					// ========================================================================== //
					i++;
					updateData(tokens, i);
					if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
						parserError(errorMessage(tokens, i, ",", "", "Found extra"));
					}
					if (
						!current_token(tokens, i) ||
						(current_token(tokens, i) &&
							current_token(tokens, i).type !== TOKEN_TYPES.VALUE &&
							current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE)
					) {
						parserError(errorMessage(tokens, i, inline_value, ","));
					}
					continue;
				}
				continue;
			} else {
				break;
			}
		}
		pushArg();
	}
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN)) {
		parserError(errorMessage(tokens, i, ")", inline_id));
	}
	// ========================================================================== //
	//  consume ')'                                                               //
	// ========================================================================== //
	const finalParenToken = current_token(tokens, i);
	i++;
	updateData(tokens, i);
	inlineNode.range.end = finalParenToken.range.end;
	tokens_stack.length = 0;
	return [inlineNode, i];
}
// ========================================================================== //
//  Parse Text                                                                //
// ========================================================================== //
function parseText(tokens, i, options = {}) {
	const textNode = makeTextNode();
	const startToken = current_token(tokens, i);
	textNode.range.start = startToken.range.start;
	textNode.depth = startToken.depth;
	const { selectiveUnescape = false } = options;

	while (i < tokens.length) {
		const token = current_token(tokens, i);
		if (token && token.type === TOKEN_TYPES.TEXT) {
			textNode.text += token.value;
			i++;
			updateData(tokens, i);
		} else if (token && token.type === TOKEN_TYPES.ESCAPE) {
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
			updateData(tokens, i);
		} else {
			break;
		}
		textNode.range.end = current_token(tokens, i - 1).range.end;
	}
	return [textNode, i];
}
// ========================================================================== //
//  Parse AtBlock                                                             //
// ========================================================================== //
function parseAtBlock(tokens, i, filename = null) {
	const atBlockNode = makeAtBlockNode();
	const openAtToken = current_token(tokens, i);
	atBlockNode.range.start = openAtToken.range.start;
	// ========================================================================== //
	//  consume '@_'                                                              //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	const id = current_token(tokens, i).value;
	if (id.trim() === end_keyword) {
		parserError(errorMessage(tokens, i, id, "", `'${id.trim()}' is a reserved keyword and cannot be used as an identifier.`));
	}
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
		atBlockNode.id = id.trim();
		validateName(atBlockNode.id);
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
				let [key, keyIndex] = parseKey(tokens, i);
				k = key;
				i = keyIndex;
				i = parseColon(tokens, i, at_id);
				if (current_token(tokens, i).type !== TOKEN_TYPES.VALUE && current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE) {
					parserError(errorMessage(tokens, i, at_value, ":"));
				}
				validateName(k);
				continue;
			} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
				let [escape_character, escapeIndex] = parseEscape(tokens, i);
				v += escape_character;
				i = escapeIndex;
				continue;
			} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
				let [value, valueIndex] = parseValue(tokens, i);
				v += value;
				i = valueIndex;
				for (let e = i; e < tokens.length; e++) {
					if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
						let [escape_character, escapeIndex] = parseEscape(tokens, i);
						v += escape_character;
						i = escapeIndex;
						continue;
					} else {
						break;
					}
				}
				v = v.trim();
				if (v.startsWith('"') && v.endsWith('"')) {
					v = v.slice(1, -1);
				}
				atBlockNode.args.push(v);
				if (k) {
					atBlockNode.args[k] = v;
				}
				k = "";
				v = "";
				if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
					i = parseComma(tokens, i, at_value);
					continue;
				}
				continue;
			} else {
				break;
			}
		}
	}
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.SEMICOLON)) {
		parserError(errorMessage(tokens, i, ";", at_value, "A semicolon (;) is required after the AtBlock identifier or its arguments (e.g., '@_Table_@:' or '@_Table_@: key, val;').", filename));
	}
	i = parseSemiColon(tokens, i, at_value);
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
		const [childNode, nextIndex] = parseText(tokens, i, { selectiveUnescape: true });
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
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.END_KEYWORD && current_token(tokens, i).value.trim() !== end_keyword)) {
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
	const closeAtToken = current_token(tokens, i);
	i++;
	updateData(tokens, i);
	atBlockNode.range.end = closeAtToken.range.end;
	tokens_stack.length = 0;
	return [atBlockNode, i];
}
// ========================================================================== //
//  Parse Comments                                                            //
// ========================================================================== //
function parseCommentNode(tokens, i) {
	const commentNode = makeCommentNode();
	const token = current_token(tokens, i);
	if (token && token.type === TOKEN_TYPES.COMMENT) {
		commentNode.text = token.value;
		commentNode.depth = token.depth;
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

function parseNode(tokens, i, filename = null) {
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
	//  Block or Reserved Keyword                                                 //
	// ========================================================================== //
	else if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET)) {
		const next = peek(tokens, i, 1);
		if (next && (next.type === TOKEN_TYPES.END_KEYWORD || next.value.trim() === end_keyword)) {
			parserError(errorMessage(tokens, i + 1, "Block ID", "[", `'${next.value.trim()}' is a reserved keyword and cannot be used as a start identifier.`));
		}
		return parseBlock(tokens, i);
	}
	// ========================================================================== //
	//  Inline Statement or Text                                                  //
	// ========================================================================== //
	else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.OPEN_PAREN) {
		// Look ahead to see if this is an inline statement: (...) -> (...)
		let j = i + 1;
		let foundClose = false;
		while (j < tokens.length) {
			if (tokens[j].type === TOKEN_TYPES.CLOSE_PAREN) {
				foundClose = true;
				break;
			}
			// Avoid going too far if it's definitely not an inline (not matching the value part structure)
			if (tokens[j].type === TOKEN_TYPES.OPEN_PAREN || tokens[j].type === TOKEN_TYPES.OPEN_BRACKET) break;
			j++;
		}

		if (foundClose && tokens[j + 1] && tokens[j + 1].type === TOKEN_TYPES.THIN_ARROW) {
			return parseInline(tokens, i);
		}

		// Treat as text if not an inline
		const textNode = makeTextNode();
		textNode.text = current_token(tokens, i).value;
		textNode.range = current_token(tokens, i).range;
		return [textNode, i + 1];
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
	else if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.OPEN_AT)) {
		return parseAtBlock(tokens, i, filename);
	} else {
		// FALLBACK: Treat any other token as TEXT to avoid infinite loops and allow literal content
		const textNode = makeTextNode();
		textNode.text = current_token(tokens, i).value;
		textNode.range = current_token(tokens, i).range;
		return [textNode, i + 1];
	}
}

// ========================================================================== //
//  Main Parser Entry Point                                                  //
// ========================================================================== //

function parser(tokens, filename = null) {
	// Filter out structural whitespace (junk) that was emitted for highlighting purposes
	tokens = tokens.filter(t => !t.isStructural);
	end_stack = [];
	tokens_stack = [];
	range = {
		start: { line: 0, character: 0 },
		end: { line: 0, character: 0 }
	};
	value = "";
	let ast = [];
	let i = 0;
	while (i < tokens.length) {
		let [node, nextIndex] = parseNode(tokens, i, filename);
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

		parserError(errorMessage(tokens, tokens.length - 1, "[end]", "", extraInfo ? `Missing '[end]'${extraInfo}` : "Missing '[end]'", filename));
	}
	return ast;
}

export default parser;
