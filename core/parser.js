/**
 * SomMark Parser
 */
import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import { parserError } from "./errors.js";
import { safeDataParse } from "../helpers/safeDataParser.js";
import {
	BLOCK,
	TEXT,
	INLINE,
	ATBLOCK,
	COMMENT,
	COMMENT_BLOCK,
	STATIC_LOGIC,
	RUNTIME_LOGIC,
	IMPORT,
	USE_MODULE,
	block_id,
	block_key,
	block_value,
	inline_id,
	inline_text,
	at_id,
	atblock_key,
	at_value,
	end_keyword,
	SLOT,
	slot_keyword,
	FOR_EACH,
	for_each_keyword
} from "./labels.js";
import { levenshtein, getPrefixValue } from "../helpers/utils.js";

const MAX_ITERATIONS = 10000;


// ========================================================================== //
//  Helper Functions                                                         //
// ========================================================================== //

/**
 * Returns the token at the current position.
 * 
 * @param {Object[]} tokens - The list of tokens.
 * @param {number} i - The current index.
 * @returns {Object|null} - The token or null if at the end.
 */
function current_token(tokens, i) {
	return tokens[i] || null;
}

/**
 * Skip whitespaces and comments in structural contexts.
 * 
 * @param {Object[]} tokens - The list of tokens.
 * @param {number} i - The current index.
 * @returns {number} - The new index.
 */
function skipJunk(tokens, i) {
	while (i < tokens.length) {
		const t = tokens[i];
		const type = t.type;
		if (type === TOKEN_TYPES.WHITESPACE || type === TOKEN_TYPES.COMMENT || type === TOKEN_TYPES.COMMENT_BLOCK) {
			i++;
		} else if (type === TOKEN_TYPES.TEXT && t.value.trim() === "") {
			i++;
		} else {
			break;
		}
	}
	return i;
}

/**
 * Checks if a name is valid (using letters, numbers, and certain symbols).
 * 
 * @param {string} id - The name to check.
 * @param {RegExp} [keyRegex] - The rule to follow.
 * @param {string} [name] - The type of thing we are checking.
 * @param {string} [rule] - A human-readable version of the rule.
 * @param {string} [ruleMessage] - The error message to show.
 */
function validateName(
	id,
	allowColon = false,
	name = "Identifier"
) {
	const keyRegex = allowColon ? /^[a-zA-Z0-9\-_$:]+$/ : /^[a-zA-Z0-9\-_$]+$/;
	const rule = allowColon ? "(A–Z, a–z, 0–9, -, _, $, :)" : "(A–Z, a–z, 0–9, -, _, $)";
	const ruleMessage = allowColon
		? "must contain only letters, numbers, hyphens, underscores, dollar signs ($), or colons (:)"
		: "must contain only letters, numbers, hyphens, underscores, or dollar signs ($)";

	if (!keyRegex.test(id)) {
		parserError([`{line}<$red:Invalid ${name}:$><$blue: '${id}'$>{N}<$yellow:${name} ${ruleMessage}$> <$cyan: ${rule}.$>{line}`]);
	}
}

/** Creates a new empty Block node. */
function makeBlockNode() {
	return {
		type: BLOCK,
		structure: "Block",
		id: "",
		args: {},
		body: [],
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}
/** Creates a new empty Text node. */
function makeTextNode() {
	return {
		type: TEXT,
		structure: "Text",
		text: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}
/** Creates a new empty Comment node. */
function makeCommentNode() {
	return {
		type: COMMENT,
		structure: "Comment",
		text: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}
/** Creates a new empty Inline node. */
function makeInlineNode() {
	return {
		type: INLINE,
		structure: "Inline",
		value: "",
		id: "",
		args: {},
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}

// ========================================================================== //
//  Node Creators                                                             //
// ========================================================================== //
/** Creates a new empty AtBlock node. */
function makeAtBlockNode() {
	return {
		type: ATBLOCK,
		structure: "AtBlock",
		id: "",
		args: {},
		content: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}

/** Creates a new empty Logic node. */
function makeLogicNode(type = RUNTIME_LOGIC) {
	return {
		type: type,
		structure: "Block",
		code: "",
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

let global_static_logic_count = 0;
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
		tokens[lineStartIndex - 1] &&
		tokens[lineStartIndex - 1].range.start.line === errorLineNumber &&
		(tokens[lineStartIndex - 1].source || filename) === source
	) {
		lineStartIndex--;
	}

	let lineEndIndex = i;
	while (
		lineEndIndex < tokens.length - 1 &&
		tokens[lineEndIndex + 1] &&
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
	let key = "";
	if (current_token(tokens, i).type === TOKEN_TYPES.QUOTE) {
		i++; // consume opening QUOTE
		key = current_token(tokens, i).value;
		i++; // consume Key
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.QUOTE) {
			i++; // consume closing QUOTE
		}
	} else {
		key = current_token(tokens, i).value.trim();
		i++;
	}
	updateData(tokens, i);
	return [key, i];
}
// ========================================================================== //
//  Parse Value                                                               //
// ========================================================================== //
function parseValue(tokens, i, placeholders = {}, variables = {}, allowLogic = true) {
	let val = current_token(tokens, i).value;
	// consume Value
	if (current_token(tokens, i).type === TOKEN_TYPES.QUOTE) {
		i++; // consume opening QUOTE
		val = "";
		while (i < tokens.length && current_token(tokens, i).type !== TOKEN_TYPES.QUOTE) {
			const token = current_token(tokens, i);
			if (token.type === TOKEN_TYPES.PREFIX_P || token.type === TOKEN_TYPES.PREFIX_JS || token.type === TOKEN_TYPES.PREFIX_V) {
				const [resolvedVal, nextI] = parseValue(tokens, i, placeholders, variables, allowLogic);
				val += resolvedVal;
				i = nextI;
			} else {
				val += token.value;
				i++;
			}
		}

		if (i >= tokens.length) {
			parserError(errorMessage(tokens, i - 1, "\"", "unclosed string", "Unclosed quote"));
		}

		i++; // consume closing QUOTE
		return [val, i, true];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.PREFIX_JS) {
		val = current_token(tokens, i).value;
		// V4 NATIVE DATA: Strip js{ } and parse safely
		if (val.startsWith("js{") && val.endsWith("}")) {
			const clean = val.slice(3, -1).trim();
			val = safeDataParse(clean);
		}
		i++;
		return [val, i, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.LOGIC || current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD || current_token(tokens, i).type === TOKEN_TYPES.RUNTIME_KEYWORD) {
		if (!allowLogic) {
			parserError(errorMessage(tokens, i, "literal value", "", "Logic blocks are not allowed in this context."));
		}
		let isStatic = current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD;
		let isRuntimeKeyword = current_token(tokens, i).type === TOKEN_TYPES.RUNTIME_KEYWORD;
		let nextI = i;

		if (isStatic || isRuntimeKeyword) {
			nextI = skipJunk(tokens, i + 1);
			if (!current_token(tokens, nextI) || current_token(tokens, nextI).type !== TOKEN_TYPES.LOGIC) {
				// Treat as literal text if keyword is not followed by a logic block
				return [current_token(tokens, i).value, i + 1, false];
			}
			i = nextI;
		}

		const logicToken = current_token(tokens, i);
		const node = makeLogicNode(isStatic ? STATIC_LOGIC : RUNTIME_LOGIC);
		node.code = logicToken.value;
		node.range = logicToken.range;

		return [node, i + 1, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.PREFIX_V) {
		val = current_token(tokens, i).value;
		// V4.1.0 VARIABLE: Strip v{ } and resolve from local variables
		if (val.startsWith("v{") && val.endsWith("}")) {
			const key = val.slice(2, -1).trim();
			if (variables[key] !== undefined) {
				val = variables[key];
				if (!variables.__consumed__) {
					Object.defineProperty(variables, "__consumed__", {
						value: new Set(),
						enumerable: false,
						configurable: true
					});
				}
				variables.__consumed__.add(key);
			} else {
				val = getPrefixValue('v', key);
			}
		}
		i++;
		return [val, i, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.PREFIX_C) {
		val = current_token(tokens, i).value;
		// PREFIX_C is preserved for the resolveModules expansion phase
		i++;
		return [val, i, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.PREFIX_P) {
		val = current_token(tokens, i).value;
		// V4 PLACEHOLDER: Strip p{ } and resolve from config
		if (val.startsWith("p{") && val.endsWith("}")) {
			const key = val.slice(2, -1).trim();
			val = placeholders[key] !== undefined ? placeholders[key] : getPrefixValue('p', key);
		}
		i++;
		return [val, i, false];
	} else {
		val = "";
		while (i < tokens.length) {
			const token = current_token(tokens, i);
			if (!token) break;

			// Stop at any structural marker or whitespace
			if (token.type === TOKEN_TYPES.WHITESPACE ||
				token.type === TOKEN_TYPES.COMMA ||
				token.type === TOKEN_TYPES.CLOSE_BRACKET ||
				token.type === TOKEN_TYPES.COLON ||
				token.type === TOKEN_TYPES.SEMICOLON ||
				token.type === TOKEN_TYPES.EXCLAMATION_MARK ||
				token.type === TOKEN_TYPES.CLOSE_PAREN) break;

			if (token.type === TOKEN_TYPES.ESCAPE) {
				// Remove backslash
				val += token.value.slice(1);
			} else {
				val += token.value;
			}
			i++;
		}
	}

	updateData(tokens, i);
	return [val, i, false];
}
// ========================================================================== //
//  Parse ','                                                                 //
// ========================================================================== //
function parseComma(tokens, i, beforeChar = "") {
	i = skipJunk(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
		i++;
		i = skipJunk(tokens, i);
		updateData(tokens, i);

		if (
			!current_token(tokens, i) ||
			(current_token(tokens, i) &&
				current_token(tokens, i).type !== TOKEN_TYPES.VALUE &&
				current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE &&
				current_token(tokens, i).type !== TOKEN_TYPES.IDENTIFIER &&
				current_token(tokens, i).type !== TOKEN_TYPES.KEY &&
				current_token(tokens, i).type !== TOKEN_TYPES.QUOTE &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_JS &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_P)
		) {
			parserError(errorMessage(tokens, i, "value", ","));
		}
	} else {
		parserError(errorMessage(tokens, i, ",", beforeChar));
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
	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.COLON)) {
		parserError(errorMessage(tokens, i, ":", afterChar));
	}
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);
	return i;
}
// ========================================================================== //
//  Parse ';'                                                                 //
// ========================================================================== //
function parseSemiColon(tokens, i, afterChar = "") {
	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.SEMICOLON)) {
		parserError(errorMessage(tokens, i, ";", afterChar));
	}
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);
	return i;
}
/**
 * Parses a standard SomMark Block ([id] ... [end]).
 * Blocks are structural elements that can contain nested content.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {string|null} filename - Source filename.
 * @param {Object} placeholders - Dynamic public API data.
 * @returns {[Object, number]} The parsed Block node and new index.
 */
function parseBlock(tokens, i, filename = null, placeholders = {}, variables = {}, depth = 0) {
	const blockNode = makeBlockNode();
	blockNode.depth = depth;
	const openBracketToken = current_token(tokens, i);
	// ========================================================================== //
	//  consume '['                                                               //
	// ========================================================================== //
	i++;
	i = skipJunk(tokens, i);
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
	} else if (idToken.type === TOKEN_TYPES.SLOT_KEYWORD) {
		blockNode.type = SLOT;
		// Prevent nested slots
		if (end_stack.some(e => e.id === "slot")) {
			parserError(errorMessage(tokens, i, "slot", "", "Nested slots are not allowed. A [slot] cannot be placed inside another [slot]."));
		}
	} else if (idToken.type === TOKEN_TYPES.FOR_EACH || blockNode.id === "for-each") {
		blockNode.type = FOR_EACH;
	}
	validateName(blockNode.id, true);
	blockNode.range.start = openBracketToken.range.start;
	end_stack.push({ id, line: openBracketToken.range.start.line + 1, col: openBracketToken.range.start.character });
	// ========================================================================== //
	//  consume Block Identifier                                                  //
	// ========================================================================== //
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.EQUAL) {
		// ========================================================================== //
		//  consume '='                                                               //
		// ========================================================================== //
		i++;
		i = skipJunk(tokens, i);
		updateData(tokens, i);

		if (
			!current_token(tokens, i) ||
			(current_token(tokens, i) &&
				current_token(tokens, i).type !== TOKEN_TYPES.VALUE &&
				current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE &&
				current_token(tokens, i).type !== TOKEN_TYPES.IDENTIFIER &&
				current_token(tokens, i).type !== TOKEN_TYPES.IMPORT &&
				current_token(tokens, i).type !== TOKEN_TYPES.USE_MODULE &&
				current_token(tokens, i).type !== TOKEN_TYPES.END_KEYWORD &&
				current_token(tokens, i).type !== TOKEN_TYPES.KEY &&
				current_token(tokens, i).type !== TOKEN_TYPES.QUOTE &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_JS &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_V &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_P &&
				current_token(tokens, i).type !== TOKEN_TYPES.LOGIC &&
				current_token(tokens, i).type !== TOKEN_TYPES.STATIC_KEYWORD &&
				current_token(tokens, i).type !== TOKEN_TYPES.RUNTIME_KEYWORD)
		) {
			parserError(errorMessage(tokens, i, block_value, "="));
		}
		// ========================================================================== //
		//  consume key-Value                                                         //
		// ========================================================================== //
		let k = "";
		let v = "";
		let vIsQuoted = false;
		let argIndex = 0;
		while (i < tokens.length) {
			i = skipJunk(tokens, i);
			const token = current_token(tokens, i);
			if (!token || token.type === TOKEN_TYPES.CLOSE_BRACKET) break;

			const isQuotedKey = token.type === TOKEN_TYPES.QUOTE && peek(tokens, i, 1) && (peek(tokens, i, 1).type === TOKEN_TYPES.KEY);

			if (token.type === TOKEN_TYPES.KEY || isQuotedKey) {
				let [key, keyIndex] = parseKey(tokens, i);
				k = key;
				i = keyIndex;
				i = skipJunk(tokens, i);
				i = parseColon(tokens, i, block_key);
				i = skipJunk(tokens, i);

				// Ensure there is a value after the colon
				const nextToken = current_token(tokens, i);
				if (!nextToken || nextToken.type === TOKEN_TYPES.CLOSE_BRACKET || nextToken.type === TOKEN_TYPES.COMMA) {
					parserError(errorMessage(tokens, i, block_value, ":", "Missing value after colon"));
				}

				// Validate only if it was a plain KEY token (not from a quote)
				if (token.type === TOKEN_TYPES.KEY) {
					validateName(k, true);
				}
			}

			// Parse Value (handles both quoted, unquoted, and prefixes)
			let [value, valueIndex, isQuoted] = parseValue(tokens, i, placeholders, variables);
			v = value;
			vIsQuoted = isQuoted;
			i = valueIndex;

			// Store Argument
			blockNode.args[String(argIndex++)] = v;
			if (k) {
				blockNode.args[k] = v;
			}
			k = "";
			v = "";

			i = skipJunk(tokens, i);
			const separatorToken = current_token(tokens, i);
			if (separatorToken && (separatorToken.type === TOKEN_TYPES.COMMA || separatorToken.type === TOKEN_TYPES.COLON)) {
				i++; // consume , or :
				i = skipJunk(tokens, i);
				updateData(tokens, i);

				// Ensure next token is NOT the closing bracket (trailing separator)
				const afterSeparator = current_token(tokens, i);
				if (!afterSeparator || afterSeparator.type === TOKEN_TYPES.CLOSE_BRACKET) {
					parserError(errorMessage(tokens, i, "value", "", "Unexpected trailing separator"));
				}
			} else {
				// No separator, must be end of arguments or ]
				break;
			}
		}
		if (v !== "") {
			if (typeof v === "string") {
				if (!vIsQuoted) v = v.trim();
				if (v.startsWith('"') && v.endsWith('"')) {
					v = v.slice(1, -1);
				}
			}
		}
	}

	i = skipJunk(tokens, i);

	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.EXCLAMATION_MARK) {
		blockNode.isSelfClosing = true;
		i++;
		i = skipJunk(tokens, i);
	}

	// ========================================================================== //
	//  Close Bracket                                                             //
	// ========================================================================== //
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_BRACKET)) {
		parserError(errorMessage(tokens, i, "]", block_id));
	}
	// ========================================================================== //
	//  consume ']'                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);

	if (blockNode.isSelfClosing) {
		end_stack.pop();
		blockNode.range.end = current_token(tokens, i - 1).range.end;
		return [blockNode, i];
	}

	tokens_stack.length = 0;
	while (i < tokens.length) {
		const nextIdx = skipJunk(tokens, i + 1);
		const nextToken = tokens[nextIdx];
		if (
			current_token(tokens, i) &&
			current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET &&
			nextToken &&
			nextToken.type !== TOKEN_TYPES.END_KEYWORD &&
			nextToken.value.trim() !== end_keyword
		) {
			const [childNode, nextIndex] = parseBlock(tokens, i, filename, placeholders, variables, depth + 1);

			blockNode.body.push(childNode);
			i = nextIndex;
		} else if (
			current_token(tokens, i) &&
			current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET &&
			nextToken &&
			(nextToken.type === TOKEN_TYPES.END_KEYWORD || nextToken.value.trim() === end_keyword)
		) {
			// ========================================================================== //
			//  consume '['                                                               //
			// ========================================================================== //
			i++;
			i = skipJunk(tokens, i);
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
			i = skipJunk(tokens, i);
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
		} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.WHITESPACE) {
			blockNode.body.push({
				type: TEXT,
				text: current_token(tokens, i).value,
				range: current_token(tokens, i).range
			});
			i++;
		} else {
			const [childNode, nextIndex] = parseNode(tokens, i, filename, placeholders, variables, depth + 1);
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
/**
 * Parses an Inline Statement ((content) -> (id)).
 * Inlines are fast, non-nesting formatting elements.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {Object} placeholders - Dynamic public API data.
 * @returns {[Object, number]} The parsed Inline node and new index.
 */
function parseInline(tokens, i, placeholders = {}, depth = 0) {
	const inlineNode = makeInlineNode();
	inlineNode.depth = depth;
	const openParenToken = current_token(tokens, i);
	inlineNode.range.start = openParenToken.range.start;

	// consume '('
	i++;
	updateData(tokens, i);

	// Phase 1: Content capture (Lexer provides high-level TEXT/ESCAPE tokens here)
	while (i < tokens.length) {
		const token = current_token(tokens, i);
		if (!token || token.type === TOKEN_TYPES.CLOSE_PAREN) break;

		if (token.type === TOKEN_TYPES.ESCAPE) {
			inlineNode.value += token.value.slice(1);
		} else if (token.type !== TOKEN_TYPES.COMMENT) {
			inlineNode.value += token.value;
		}
		i++;
	}

	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN) {
		parserError(errorMessage(tokens, i, ")", "inline content"));
	}
	i++; // consume ')'

	// Collapse newlines and whitespace for "inline" behavior
	inlineNode.value = inlineNode.value.replace(/\s+/g, " ").trim();

	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.THIN_ARROW) {
		parserError(errorMessage(tokens, i, "->", ")"));
	}
	i++; // consume '->'

	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.OPEN_PAREN) {
		parserError(errorMessage(tokens, i, "(", "->"));
	}
	i++; // consume '('
	i = skipJunk(tokens, i);
	const idToken = current_token(tokens, i);
	const allowedInlineIdTypes = new Set([
		TOKEN_TYPES.IDENTIFIER,
		TOKEN_TYPES.KEY,
		TOKEN_TYPES.IMPORT,
		TOKEN_TYPES.USE_MODULE,
		TOKEN_TYPES.SLOT_KEYWORD,
		TOKEN_TYPES.FOR_EACH
	]);
	if (!idToken || !allowedInlineIdTypes.has(idToken.type)) {
		parserError(errorMessage(tokens, i, inline_id, "("));
	}
	inlineNode.id = idToken.value.trim();
	validateName(inlineNode.id);

	i++; // consume ID
	i = skipJunk(tokens, i);

	const hasArgsTrigger = current_token(tokens, i) && (
		current_token(tokens, i).type === TOKEN_TYPES.COLON ||
		current_token(tokens, i).type === TOKEN_TYPES.EQUAL
	);

	if (hasArgsTrigger) {
		const separator = current_token(tokens, i).value;
		i++; // consume ':' or '='
		i = skipJunk(tokens, i);

		// Ensure there is a value after the separator
		const nextToken = current_token(tokens, i);
		if (!nextToken || nextToken.type === TOKEN_TYPES.CLOSE_PAREN || nextToken.type === TOKEN_TYPES.COMMA) {
			parserError(errorMessage(tokens, i, inline_value, separator, `Missing value after ${separator === "=" ? "equals" : "colon"}`));
		}

		let k = "";
		let v = "";
		let argIndex = 0;

		while (i < tokens.length) {
			i = skipJunk(tokens, i);
			const token = current_token(tokens, i);
			if (!token || token.type === TOKEN_TYPES.CLOSE_PAREN) break;

			if (token.type === TOKEN_TYPES.KEY) {
				let [key, keyIndex] = parseKey(tokens, i);
				k = key;
				i = keyIndex;
				i = skipJunk(tokens, i);
				i = parseColon(tokens, i, "inline argument");
				i = skipJunk(tokens, i);

				// Ensure there is a value after the colon
				const nextToken = current_token(tokens, i);
				if (!nextToken || nextToken.type === TOKEN_TYPES.CLOSE_PAREN || nextToken.type === TOKEN_TYPES.COMMA) {
					parserError(errorMessage(tokens, i, inline_value, ":", "Missing value after colon"));
				}
				validateName(k);
			}

			let [value, valueIndex, isQuoted] = parseValue(tokens, i, placeholders, {}, false);
			v = value;
			i = valueIndex;

			inlineNode.args[String(argIndex++)] = v;
			if (k) {
				inlineNode.args[k] = v;
			}
			k = "";
			v = "";

			i = skipJunk(tokens, i);
			if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
				i = parseComma(tokens, i, "inline argument");
			} else {
				break;
			}
		}
	}

	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN) {
		parserError(errorMessage(tokens, i, ")", inlineNode.id));
	}
	const finalParenToken = current_token(tokens, i);
	i++; // consume ')'
	inlineNode.range.end = finalParenToken.range.end;

	return [inlineNode, i];
}
/**
 * Parses a stream of text tokens into a single Text node.
 * Handles unescaping and placeholder resolution.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {Object} [placeholders={}] - Global data for p{keyword} resolution.
 * @param {Object} [variables={}] - Local data for v{keyword} resolution.
 * @param {Object} [options={}] - Formatting options.
 * @returns {[Object, number]} The Text node and new index.
 */
function parseText(tokens, i, placeholders = {}, variables = {}, depth = 0, options = {}) {
	const textNode = makeTextNode();
	textNode.depth = depth;
	const startToken = current_token(tokens, i);
	textNode.range.start = startToken.range.start;
	const { selectiveUnescape = false } = options;

	while (i < tokens.length) {
		const token = current_token(tokens, i);
		if (!token) break;

		if (token.type === TOKEN_TYPES.TEXT || token.type === TOKEN_TYPES.WHITESPACE || token.type === TOKEN_TYPES.VALUE) {
			textNode.text += token.value;
			i++;
		} else if (token.type === TOKEN_TYPES.STATIC_KEYWORD || token.type === TOKEN_TYPES.RUNTIME_KEYWORD) {
			const nextIdx = skipJunk(tokens, i + 1);
			if (tokens[nextIdx] && tokens[nextIdx].type === TOKEN_TYPES.LOGIC) {
				// Stop consuming text; this is the start of a logic block
				break;
			}
			textNode.text += token.value;
			i++;
		} else if (token.type === TOKEN_TYPES.ESCAPE) {
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
		} else if (token.type === TOKEN_TYPES.PREFIX_P) {
			const val = token.value;
			if (val.startsWith("p{") && val.endsWith("}")) {
				const match = [val.slice(2, -1).trim(), val, 'p'];
				const key = match[0];
				const layer = match[2]; // 'p' or 'v'

				if (placeholders[key] !== undefined) {
					textNode.text += String(placeholders[key]);
				} else {
					// Use the unique 'Unresolved Envelope' format via helper
					textNode.text += getPrefixValue(layer, key);
				}
			} else {
				textNode.text += val;
			}
			i++;
		} else if (token.type === TOKEN_TYPES.PREFIX_V) {
			const val = token.value;
			if (val.startsWith("v{") && val.endsWith("}")) {
				const key = val.slice(2, -1).trim();
				if (variables[key] !== undefined) {
					textNode.text += String(variables[key]);
					if (!variables.__consumed__) {
						Object.defineProperty(variables, "__consumed__", {
							value: new Set(),
							enumerable: false,
							configurable: true
						});
					}
					variables.__consumed__.add(key);
				} else {
					// Use the unique 'Unresolved Envelope' format via helper
					textNode.text += getPrefixValue('v', key);
				}
			} else {
				textNode.text += val;
			}
			i++;
		} else {
			break;
		}

		updateData(tokens, i);
		textNode.range.end = tokens[i - 1].range.end;
	}
	return [textNode, i];
}
/**
 * Parses an At-Block (@_id_@: args; content @_end_@).
 * At-Blocks maintain raw content preservation.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {string|null} filename - Source filename.
 * @param {Object} placeholders - Dynamic public API data.
 * @returns {[Object, number]} The At-Block node and new index.
 */
function parseAtBlock(tokens, i, filename = null, placeholders = {}, depth = 0) {
	const atBlockNode = makeAtBlockNode();
	atBlockNode.depth = depth;
	const openAtToken = current_token(tokens, i);
	atBlockNode.range.start = openAtToken.range.start;

	// consume '@_'
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);

	const idToken = current_token(tokens, i);
	if (!idToken || idToken.type === TOKEN_TYPES.EOF) {
		parserError(errorMessage(tokens, i, "AtBlock ID", "@_", "Missing AtBlock Identifier"));
	}

	const id = idToken.value;
	if (id.trim() === end_keyword) {
		parserError(errorMessage(tokens, i, id, "", `'${id.trim()}' is a reserved keyword and cannot be used as an identifier.`));
	}

	atBlockNode.id = id.trim();
	validateName(atBlockNode.id);

	// consume ID
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);

	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT)) {
		parserError(errorMessage(tokens, i, "_@", "at-block identifier"));
	}
	// consume '_@'
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);

	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
		// consume ':'
		i++;
		i = skipJunk(tokens, i);

		// Ensure there is a value after the colon
		const nextToken = current_token(tokens, i);
		if (!nextToken || nextToken.type === TOKEN_TYPES.SEMICOLON || nextToken.type === TOKEN_TYPES.COMMA) {
			parserError(errorMessage(tokens, i, at_value, ":", "Missing value after colon"));
		}

		let k = "";
		let v = "";
		let argIndex = 0;

		while (i < tokens.length) {
			i = skipJunk(tokens, i);
			const token = current_token(tokens, i);
			if (!token || token.type === TOKEN_TYPES.SEMICOLON) break;

			const isQuotedKey = token.type === TOKEN_TYPES.QUOTE && peek(tokens, i, 1) && (peek(tokens, i, 1).type === TOKEN_TYPES.KEY);

			if (token.type === TOKEN_TYPES.KEY || isQuotedKey) {
				let [key, keyIndex] = parseKey(tokens, i);
				k = key;
				i = keyIndex;
				i = skipJunk(tokens, i);
				i = parseColon(tokens, i, "at-block argument");
				i = skipJunk(tokens, i);

				// Ensure there is a value after the colon
				const nextToken = current_token(tokens, i);
				if (!nextToken || nextToken.type === TOKEN_TYPES.SEMICOLON || nextToken.type === TOKEN_TYPES.COMMA) {
					parserError(errorMessage(tokens, i, at_value, ":", "Missing value after colon"));
				}

				if (token.type === TOKEN_TYPES.KEY) {
					validateName(k);
				}
			}

			let [value, valueIndex, isQuoted] = parseValue(tokens, i, placeholders, {}, false);
			v = value;
			i = valueIndex;

			atBlockNode.args[String(argIndex++)] = v;
			if (k) {
				atBlockNode.args[k] = v;
			}
			k = "";
			v = "";

			i = skipJunk(tokens, i);
			if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMA) {
				i = parseComma(tokens, i, "at-block argument");
			} else {
				break;
			}
		}
	}

	// Semicolon is ALWAYS required after ID or ARGS
	i = parseSemiColon(tokens, i, "at-block header");

	// Body Capture
	i = skipJunk(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.TEXT) {
		atBlockNode.content = current_token(tokens, i).value;
		i++;
	} else {
		parserError(errorMessage(tokens, i, "content", "at-block body"));
	}

	// End Marker (@_end_@)
	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.OPEN_AT) {
		parserError(errorMessage(tokens, i, "@_", "at-block content"));
	}
	i++; // consume '@_'
	i = skipJunk(tokens, i);
	const endToken = current_token(tokens, i);
	if (!endToken || (endToken.type !== TOKEN_TYPES.END_KEYWORD && endToken.value.trim() !== end_keyword)) {
		let extraInfo = "";
		if (endToken && endToken.value) {
			const dist = levenshtein(endToken.value.trim().toLowerCase(), "end");
			if (dist > 0 && dist <= 2) {
				extraInfo = ` (Did you mean '@_end_@'?)`;
			}
		}
		parserError(errorMessage(tokens, i, "end", "AtBlock Body", extraInfo));
	}
	i++; // consume 'end'
	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT) {
		parserError(errorMessage(tokens, i, "_@", "end marker"));
	}
	const closeAtToken = current_token(tokens, i);
	i++; // consume '_@'
	atBlockNode.range.end = closeAtToken.range.end;

	return [atBlockNode, i];
}
// ========================================================================== //
//  Parse Comments                                                            //
// ========================================================================== //
function parseCommentNode(tokens, i, depth = 0) {
	const commentNode = makeCommentNode();
	const token = current_token(tokens, i);
	if (token && (token.type === TOKEN_TYPES.COMMENT || token.type === TOKEN_TYPES.COMMENT_BLOCK)) {
		commentNode.type = token.type === TOKEN_TYPES.COMMENT ? COMMENT : COMMENT_BLOCK;
		// Clean the text here instead of the transpiler
		const raw = token.value;
		commentNode.text = token.type === TOKEN_TYPES.COMMENT
			? raw.replace(/^#/, "").trim()
			: raw.replace(/^###[\r\n]*/, "").replace(/[\r\n]*###$/, "").trim();

		commentNode.depth = depth;
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

/**
 * Dispatches the current token to the appropriate specialized parser function.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {string|null} filename - Source filename.
 * @param {Object} placeholders - Dynamic public API data.
 * @returns {[Object, number]} The parsed node and new index.
 */
function parseNode(tokens, i, filename = null, placeholders = {}, variables = {}, depth = 0) {
	if (!current_token(tokens, i) || (current_token(tokens, i) && !current_token(tokens, i).value)) {
		return [null, i];
	}
	// ========================================================================== //
	//  Comment                                                                   //
	// ========================================================================== //
	if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.COMMENT || current_token(tokens, i).type === TOKEN_TYPES.COMMENT_BLOCK)) {
		return parseCommentNode(tokens, i, depth);
	}
	// ========================================================================== //
	//  Block or Reserved Keyword                                                 //
	// ========================================================================== //
	else if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET)) {
		return parseBlock(tokens, i, filename, placeholders, variables, depth);
	}
	// ========================================================================== //
	//  Inline Statement or Text                                                  //
	// ========================================================================== //
	else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.OPEN_PAREN) {
		let j = i + 1;
		let parenCount = 1;
		let foundArrow = false;
		while (j < tokens.length) {
			const token = tokens[j];
			if (token.type === TOKEN_TYPES.OPEN_PAREN) {
				parenCount++;
			} else if (token.type === TOKEN_TYPES.CLOSE_PAREN) {
				parenCount--;
			}

			if (parenCount === 0) {
				const nextIdx = skipJunk(tokens, j + 1);
				if (tokens[nextIdx] && tokens[nextIdx].type === TOKEN_TYPES.THIN_ARROW) {
					foundArrow = true;
				}
				break;
			}
			// Safe-guard: If we hit a [ or @, it's highly unlikely to be an inline statement content
			// unless it's escaped, but lexer already handles [ and @ as structural tokens if not escaped.
			if (token.type === TOKEN_TYPES.OPEN_BRACKET || token.type === TOKEN_TYPES.OPEN_AT) break;
			j++;
		}

		if (foundArrow) {
			return parseInline(tokens, i, placeholders, depth);
		}

		// Treat as text if not an inline
		const textNode = makeTextNode();
		textNode.text = current_token(tokens, i).value;
		textNode.depth = depth;
		textNode.range = current_token(tokens, i).range;
		return [textNode, i + 1];
	}
	// ========================================================================== //
	//  Logic Block                                                               //
	// ========================================================================== //
	else if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD || current_token(tokens, i).type === TOKEN_TYPES.RUNTIME_KEYWORD || current_token(tokens, i).type === TOKEN_TYPES.LOGIC)) {
		let isStatic = current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD;
		let isRuntimeKeyword = current_token(tokens, i).type === TOKEN_TYPES.RUNTIME_KEYWORD;
		let startRange = current_token(tokens, i).range;
		let nextI = i;

		if (isStatic || isRuntimeKeyword) {
			if (isStatic) global_static_logic_count++;
			nextI = skipJunk(tokens, i + 1);
			if (!current_token(tokens, nextI) || current_token(tokens, nextI).type !== TOKEN_TYPES.LOGIC) {
				// Treat as normal text if keyword is not followed by a logic block
				return parseText(tokens, i, placeholders, variables, depth);
			}
			i = nextI;
		}

		const logicToken = current_token(tokens, i);
		const node = makeLogicNode(isStatic ? STATIC_LOGIC : RUNTIME_LOGIC);
		node.code = logicToken.value;
		node.depth = depth;
		node.range = {
			start: (isStatic || isRuntimeKeyword) ? startRange.start : logicToken.range.start,
			end: logicToken.range.end
		};

		return [node, i + 1];
	}
	// ========================================================================== //
	//  Text or Placeholder                                                       //
	// ========================================================================== //
	else if (
		current_token(tokens, i) &&
		(current_token(tokens, i).type === TOKEN_TYPES.TEXT ||
			current_token(tokens, i).type === TOKEN_TYPES.WHITESPACE ||
			current_token(tokens, i).type === TOKEN_TYPES.ESCAPE ||
			current_token(tokens, i).type === TOKEN_TYPES.VALUE ||
			current_token(tokens, i).type === TOKEN_TYPES.PREFIX_V ||
			current_token(tokens, i).type === TOKEN_TYPES.PREFIX_P)
	) {
		return parseText(tokens, i, placeholders, variables, depth);
	}
	// ========================================================================== //
	//  Atblock                                                                   //
	// ========================================================================== //
	else if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.OPEN_AT)) {
		return parseAtBlock(tokens, i, filename, placeholders, depth);
	} else {
		// FALLBACK: Treat any other token as TEXT to avoid infinite loops and allow literal content
		const textNode = makeTextNode();
		textNode.text = current_token(tokens, i).value;
		textNode.depth = depth;
		textNode.range = current_token(tokens, i).range;
		return [textNode, i + 1];
	}
}

// ========================================================================== //
//  Main Parser Entry Point                                                  //
// ========================================================================== //

/**
 * SomMark Parser Entry Point.
 * 
 * Orchestrates the recursive descent parsing of the token stream into a 
 * hierarchical Abstract Syntax Tree (AST).
 * 
 * @param {Object[]} tokens - The stream of tokens from the Lexer.
 * @param {string|null} [filename=null] - Source filename for error context.
 * @param {Object} [placeholders={}] - Global data for p{keyword} resolution.
 * @param {Object} [variables={}] - Local data for v{keyword} resolution.
 * @returns {Array<Object>} The final Abstract Syntax Tree.
 */
function parser(tokens, filename = null, placeholders = {}, variables = {}) {
	end_stack = [];
	global_static_logic_count = 0;
	let tokens_stack = [];
	let range = {
		start: { line: 0, character: 0 },
		end: { line: 0, character: 0 }
	};
	let value = "";
	let ast = [];
	let i = 0;
	while (i < tokens.length) {
		let [node, nextIndex] = parseNode(tokens, i, filename, placeholders, variables, 1);
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

		const lastOpen = end_stack[end_stack.length - 1];
		parserError(errorMessage(tokens, tokens.length - 1, "[end]", "", extraInfo ? `Missing '[end]' for block '${lastOpen.id}' (opened at line ${lastOpen.line}, col ${lastOpen.col})${extraInfo}` : `Missing '[end]' for block '${lastOpen.id}' (opened at line ${lastOpen.line}, col ${lastOpen.col})`, filename));
	}
	return ast;
}

export default parser;
