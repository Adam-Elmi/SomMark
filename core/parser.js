/**
 * SomMark Parser
 */
import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import { parserError } from "./errors.js";
import {
	BLOCK,
	TEXT,
	COMMENT,
	COMMENT_BLOCK,
	STATIC_LOGIC,
	RUNTIME_LOGIC,
	IMPORT,
	USE_MODULE,
	block_id,
	block_key,
	block_value,
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
		parserError([`{line}<$red:Invalid ${name}:$><$blue: '${id}'$>{N}<$yellow:${name} ${ruleMessage}$> <$cyan: ${rule}.$>`]);
	}
}

/** Creates a new empty Block node. */
function makeBlockNode() {
	return {
		type: BLOCK,
		structure: "Block",
		id: "",
		props: {},
		directives: {},
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
	const errorLine = current.range.start.line;
	const errorColStart = current.range.start.character;
	const errorColEnd = current.range.end.character;
	const source = current.source || filename;

	// Collect all tokens on the error line for the source snippet
	let lineStartIndex = i;
	while (
		lineStartIndex > 0 &&
		tokens[lineStartIndex - 1] &&
		tokens[lineStartIndex - 1].range.start.line === errorLine &&
		(tokens[lineStartIndex - 1].source || filename) === source
	) {
		lineStartIndex--;
	}
	let lineEndIndex = i;
	while (
		lineEndIndex < tokens.length - 1 &&
		tokens[lineEndIndex + 1] &&
		tokens[lineEndIndex + 1].range.start.line === errorLine &&
		(tokens[lineEndIndex + 1].source || filename) === source
	) {
		lineEndIndex++;
	}

	const lineContent = tokens.slice(lineStartIndex, lineEndIndex + 1).map(t => t.value).join('');
	const contentBefore = tokens.slice(lineStartIndex, i).map(t => t.value).join('');
	const pointerPadding = " ".repeat(contentBefore.length);

	// Location header — file, line, column
	const lineNum = errorLine + 1;
	const isMultiLine = current.range.start.line !== current.range.end.line;
	const colDisplay = isMultiLine
		? `${errorColStart} → line ${current.range.end.line + 1} col ${errorColEnd}`
		: errorColStart === errorColEnd ? `${errorColStart}` : `${errorColStart}–${errorColEnd}`;

	// Error description — avoid nested <$color:...$> tags (breaks the non-greedy regex)
	let errorDesc;
	if (frontText) {
		errorDesc = `<$red:${frontText}$>`;
	} else {
		errorDesc = `<$red:Expected$> <$blue:'${expectedValue}'$>`;
		if (behindValue) errorDesc += ` <$red:after$> <$blue:'${behindValue}'$>`;
	}

	const tokenDisplay = current.value === ""   ? "end of input"
		: current.value === "\n" ? "newline (\\n)"
		: `'${current.value}'`;

	const parts = [`{line}`];
	if (source) parts.push(`<$cyan:File:$> ${source}{N}`);
	parts.push(`<$cyan:Line:$> <$yellow:${lineNum}$> <$cyan:Col:$> <$yellow:${colDisplay}$>{N}`);
	parts.push(`{line}`);
	parts.push(`<$red:Here where error occurred:$>{N}`);
	parts.push(`  ${lineContent}{N}`);
	parts.push(`  ${pointerPadding}<$yellow:^$>{N}`);
	parts.push(`${errorDesc}{N}`);
	parts.push(`<$yellow:Received:$> <$blue:${tokenDisplay}$>{N}`);
	parts.push(`{line}`);
	return parts;
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
//  Read Prefix Key/Fallback from structured p{}/v{} tokens                  //
// ========================================================================== //
function readPrefixKeyFallback(tokens, i, prefixType = "p") {
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.PREFIX_OPEN) i++;
	i = skipJunk(tokens, i);

	let key = "";
	let fallback = undefined;

	// Read key — must be quoted or unquoted identifier
	const keyToken = current_token(tokens, i);
	if (!keyToken || keyToken.type === TOKEN_TYPES.PREFIX_CLOSE) {
		parserError(errorMessage(tokens, i, "key", "{", 'Prefix requires a key — write p{key} or p{key | "fallback"}'));
	}
	if (keyToken.type === TOKEN_TYPES.QUOTE) {
		i++; // skip opening QUOTE
		while (current_token(tokens, i) &&
			current_token(tokens, i).type !== TOKEN_TYPES.QUOTE &&
			current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_CLOSE &&
			current_token(tokens, i).type !== TOKEN_TYPES.PIPELINE) {
			key += current_token(tokens, i).value;
			i++;
		}
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.QUOTE) i++;
	} else if (keyToken.type === TOKEN_TYPES.KEY) {
		key = keyToken.value.trim();
		const isValidIdent = /^[a-zA-Z_$][a-zA-Z0-9_$-]*$/.test(key);
		const isNumeric = /^\d+$/.test(key);
		// p{} keys must be identifiers; v{} keys may also be positional integers
		if (!isValidIdent && !(prefixType === "v" && isNumeric)) {
			parserError(errorMessage(tokens, i, "key", "{", `Invalid prefix key '${key}' — must start with a letter, _ or $`));
		}
		i++;
	} else {
		parserError(errorMessage(tokens, i, "key", "{", "Invalid prefix key — must be a quoted string or identifier"));
	}

	i = skipJunk(tokens, i);

	// After key: only | or } is valid
	const afterKey = current_token(tokens, i);
	if (!afterKey || (afterKey.type !== TOKEN_TYPES.PIPELINE && afterKey.type !== TOKEN_TYPES.PREFIX_CLOSE)) {
		parserError(errorMessage(tokens, i, "| or }", key, "Expected '|' or '}' after prefix key"));
	}

	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.PIPELINE) {
		i++; // skip PIPELINE
		i = skipJunk(tokens, i);

		// Fallback must be a quoted string — any content allowed inside quotes
		const fallbackToken = current_token(tokens, i);
		if (!fallbackToken || fallbackToken.type === TOKEN_TYPES.PREFIX_CLOSE) {
			parserError(errorMessage(tokens, i, '"fallback"', "|", 'Expected a quoted fallback after \'|\' — write p{key | "default"}'));
		}
		if (fallbackToken.type === TOKEN_TYPES.QUOTE) {
			fallback = "";
			i++; // skip opening QUOTE
			while (current_token(tokens, i) &&
				current_token(tokens, i).type !== TOKEN_TYPES.QUOTE &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_CLOSE) {
				fallback += current_token(tokens, i).value;
				i++;
			}
			if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.QUOTE) i++;
		} else {
			parserError(errorMessage(tokens, i, '"fallback"', "|", 'Fallback must be a quoted string — write p{key | "default"}'));
		}
	}

	i = skipJunk(tokens, i);

	// After key (or fallback): only } is valid
	const afterFallback = current_token(tokens, i);
	if (!afterFallback || afterFallback.type !== TOKEN_TYPES.PREFIX_CLOSE) {
		parserError(errorMessage(tokens, i, "}", key, "Unexpected content inside prefix — only one key and one optional fallback are allowed"));
	}

	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.PREFIX_CLOSE) i++;

	return [key, fallback, i];
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
			if (token.type === TOKEN_TYPES.PREFIX_P || token.type === TOKEN_TYPES.PREFIX_V) {
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
	} else if (current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD || current_token(tokens, i).type === TOKEN_TYPES.RUNTIME_KEYWORD) {
		if (!allowLogic) {
			parserError(errorMessage(tokens, i, "literal value", "", "Logic blocks are not allowed in this context."));
		}
		let isStatic = current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD;
		let nextI = skipJunk(tokens, i + 1);

		if (!current_token(tokens, nextI) || current_token(tokens, nextI).type !== TOKEN_TYPES.LOGIC_OPEN) {
			// Keyword not followed by ${ — treat as literal text
			return [current_token(tokens, i).value, i + 1, false];
		}

		// Skip LOGIC_OPEN, read LOGIC body
		nextI++;
		const logicToken = current_token(tokens, nextI);
		const node = makeLogicNode(isStatic ? STATIC_LOGIC : RUNTIME_LOGIC);
		node.code = logicToken ? logicToken.value : "";
		node.range = logicToken ? logicToken.range : current_token(tokens, i).range;
		nextI++;

		// Consume LOGIC_CLOSE if present
		if (current_token(tokens, nextI) && current_token(tokens, nextI).type === TOKEN_TYPES.LOGIC_CLOSE) {
			nextI++;
		}

		return [node, nextI, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.LOGIC_OPEN) {
		if (!allowLogic) {
			parserError(errorMessage(tokens, i, "literal value", "", "Logic blocks are not allowed in this context."));
		}
		let nextI = i + 1;
		const logicToken = current_token(tokens, nextI);
		const node = makeLogicNode(STATIC_LOGIC);
		node.code = logicToken ? logicToken.value : "";
		node.range = logicToken ? logicToken.range : current_token(tokens, i).range;
		nextI++;

		if (current_token(tokens, nextI) && current_token(tokens, nextI).type === TOKEN_TYPES.LOGIC_CLOSE) {
			nextI++;
		}

		return [node, nextI, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.PREFIX_V) {
		i++; // consume PREFIX_V keyword
		const [vKey, vFallback, vNextI] = readPrefixKeyFallback(tokens, i, "v");
		i = vNextI;
		if (variables[vKey] !== undefined) {
			val = variables[vKey];
			if (!variables.__consumed__) {
				Object.defineProperty(variables, "__consumed__", {
					value: new Set(),
					enumerable: false,
					configurable: true
				});
			}
			variables.__consumed__.add(vKey);
		} else {
			// Encode fallback in the envelope key so resolveAstVariables can apply it
			// at instantiation time instead of baking it in now.
			val = getPrefixValue('v', vFallback !== undefined ? `${vKey}|${vFallback}` : vKey);
		}
		return [val, i, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.PREFIX_P) {
		i++; // consume PREFIX_P keyword
		const [pKey, pFallback, pNextI] = readPrefixKeyFallback(tokens, i);
		i = pNextI;
		val = placeholders[pKey] !== undefined ? placeholders[pKey] : (pFallback !== undefined ? pFallback : getPrefixValue('p', pKey));
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
				token.type === TOKEN_TYPES.EXCLAMATION_MARK) break;

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
	if (!idToken || idToken.type === TOKEN_TYPES.EOF || idToken.type === TOKEN_TYPES.CLOSE_BRACKET) {
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
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_V &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_P &&
				current_token(tokens, i).type !== TOKEN_TYPES.LOGIC_OPEN &&
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
			if (k && k.startsWith("smark-")) {
				blockNode.directives[k.slice(6)] = v; // strip "smark-" prefix
			} else {
				blockNode.props[String(argIndex++)] = v;
				if (k) blockNode.props[k] = v;
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

			// Named closing: [end:blockname] — the lexer emits END_KEYWORD "end:name" as one
			// token because ':' is stripped from stop chars at block-start (XML namespace support).
			const endValue = current.value.trim();
			if (endValue.includes(":")) {
				const closingName = endValue.slice(endValue.indexOf(":") + 1);
				if (!closingName) {
					parserError(errorMessage(tokens, i - 1, "block name", "", "Missing block name — write [end:blockname] to name the closing tag"));
				}
				const expected = end_stack[end_stack.length - 1];
				if (expected && closingName !== expected.id) {
					parserError(errorMessage(tokens, i - 1, closingName, "",
						`Mismatched closing tag: [end:${closingName}] cannot close '${closingName}' — '${expected.id}' is still open (opened at line ${expected.line}, col ${expected.col})`
					));
				}
			}

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
			if (tokens[nextIdx] && tokens[nextIdx].type === TOKEN_TYPES.LOGIC_OPEN) {
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
			i++; // consume PREFIX_P keyword
			const [tpKey, tpFallback, tpNextI] = readPrefixKeyFallback(tokens, i);
			i = tpNextI;
			if (placeholders[tpKey] !== undefined) {
				textNode.text += String(placeholders[tpKey]);
			} else {
				textNode.text += tpFallback !== undefined ? tpFallback : getPrefixValue('p', tpKey);
			}
		} else if (token.type === TOKEN_TYPES.PREFIX_V) {
			i++; // consume PREFIX_V keyword
			const [tvKey, tvFallback, tvNextI] = readPrefixKeyFallback(tokens, i, "v");
			i = tvNextI;
			if (variables[tvKey] !== undefined) {
				textNode.text += String(variables[tvKey]);
				if (!variables.__consumed__) {
					Object.defineProperty(variables, "__consumed__", {
						value: new Set(),
						enumerable: false,
						configurable: true
					});
				}
				variables.__consumed__.add(tvKey);
			} else {
				// Encode fallback in envelope so resolveAstVariables can apply it later.
				textNode.text += getPrefixValue('v', tvFallback !== undefined ? `${tvKey}|${tvFallback}` : tvKey);
			}
		} else {
			break;
		}

		updateData(tokens, i);
		textNode.range.end = tokens[i - 1].range.end;
	}
	return [textNode, i];
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
	//  Logic Block                                                               //
	// ========================================================================== //
	else if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD || current_token(tokens, i).type === TOKEN_TYPES.RUNTIME_KEYWORD)) {
		let isStatic = current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD;
		let startRange = current_token(tokens, i).range;
		let nextI = skipJunk(tokens, i + 1);

		if (!current_token(tokens, nextI) || current_token(tokens, nextI).type !== TOKEN_TYPES.LOGIC_OPEN) {
			// Keyword not followed by ${ — treat as normal text
			return parseText(tokens, i, placeholders, variables, depth);
		}

		if (isStatic) global_static_logic_count++;

		// Skip LOGIC_OPEN, read LOGIC body
		nextI++;
		const logicToken = current_token(tokens, nextI);
		const node = makeLogicNode(isStatic ? STATIC_LOGIC : RUNTIME_LOGIC);
		node.code = logicToken ? logicToken.value : "";
		node.depth = depth;
		node.range = {
			start: startRange.start,
			end: logicToken ? logicToken.range.end : startRange.end
		};
		nextI++;

		// Consume LOGIC_CLOSE if present
		if (current_token(tokens, nextI) && current_token(tokens, nextI).type === TOKEN_TYPES.LOGIC_CLOSE) {
			nextI++;
		}

		return [node, nextI];
	}
	// ========================================================================== //
	//  Bare Logic Block (${ }$ without explicit static/runtime — defaults to static)
	// ========================================================================== //
	else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.LOGIC_OPEN) {
		global_static_logic_count++;
		let nextI = i + 1;
		const logicToken = current_token(tokens, nextI);
		const node = makeLogicNode(STATIC_LOGIC);
		node.code = logicToken ? logicToken.value : "";
		node.depth = depth;
		node.range = {
			start: current_token(tokens, i).range.start,
			end: logicToken ? logicToken.range.end : current_token(tokens, i).range.end
		};
		nextI++;

		if (current_token(tokens, nextI) && current_token(tokens, nextI).type === TOKEN_TYPES.LOGIC_CLOSE) {
			nextI++;
		}

		return [node, nextI];
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
				if (dist > 0 && dist <= 2) return ` Did you mean '[end]'?`;
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
