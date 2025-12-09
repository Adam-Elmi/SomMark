import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import { parserError } from "./validator.js";
import PREDEFINED_IDS from "./ids.js";
import {
	BLOCK,
	TEXT,
	INLINE,
	ATBLOCK,
	NEWLINE,
	COMMENT,
	block_id,
	block_value,
	inline_id,
	inline_value,
	at_id,
	at_value,
	end_keyword
} from "./names.js";

function current_token(tokens, i) {
	return tokens[i] || null;
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
		depth: 0
	};
}

function makeAtBlockNode() {
	return {
		type: ATBLOCK,
		id: "",
		args: [],
		content: [],
		depth: 0
	};
}

function makeNewlineNode(value) {
	return {
		type: NEWLINE,
		value,
		depth: 0
	};
}
let block_stack = [];
let end_stack = [];
let tokens_stack = [];
let line = 1,
  start = 1,
  end = 1,
  value = "";

const updateData = (tokens, i) => {
	if (tokens[i]) {
		tokens_stack.push(tokens[i].value);
		line = tokens[i].line;
		start = tokens[i].start;
		end = tokens[i].end;
    value = tokens[i].value;
	}
};

const errorMessage = (tokens, i, expectedValue, behindValue) => {
	if (tokens[i]) {
		return [
			`<$blue:{line}$><$red:Here where error occurred: $> {N} ${tokens_stack.join("")}{N}${" ".repeat(tokens_stack.join("").length + 1) + "<$yellow:^$>"}{N}{N}`,
			`<$red:Expected token$> <$blue:'${expectedValue}'$> ${behindValue ? "after <$blue:'" + behindValue + "'$>" : ""} at line <$yellow:${line}$>,`,
			` from column <$yellow: ${start}$> to <$yellow: ${end}$>`,
			`{N}<$yellow:Received:$> <$blue:'${value === "\n" ? "\\n' (newline)" : value}'$>`,
			` at line <$yellow:${tokens[i].line}$>,`,
			` from column <$yellow: ${tokens[i].start}$> to <$yellow: ${tokens[i].end}$>{N}`,
			"<$blue:{line}$>"
		];
	}
};

// Parse Block
function parseBlock(tokens, i) {
	block_stack.push(1);
	end_stack.pop();
	const blockNode = makeBlockNode();
	// Update Data
	updateData(tokens, i);
	i++;
	if (current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
		blockNode.id = current_token(tokens, i).value.trim();
		blockNode.depth = current_token(tokens, i).depth;
	} else {
		parserError("Block Identifier", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.EQUAL) {
		// Update Data
		updateData(tokens, i);
		i++;
		if (current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
			current_token(tokens, i)
				.value.split(",")
				.forEach(value => {
					blockNode.args.push(value);
				});
		} else {
			parserError("Block Value", tokens[i].line, tokens[i].start, tokens[i].end);
		}
		// Update Data
		updateData(tokens, i);
		i++;
	}
	if (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_BRACKET) {
		if (peek(tokens, i, -1) && peek(tokens, i, -1).type === TOKEN_TYPES.VALUE) {
			parserError(errorMessage(tokens, i, "]", block_value));
		} else {
			parserError(parserError(errorMessage(tokens, i, "]", block_id)));
		}
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).value !== "\n") {
		parserError(parserError(errorMessage(tokens, i, "\\n", "]")));
	}
	// Update Data
	updateData(tokens, i);
	i++;
	tokens_stack.length = 0;
	while (i < tokens.length) {
		if (current_token(tokens, i).value === "[" && peek(tokens, i, 1).value !== "end") {
			const [childNode, nextIndex] = parseBlock(tokens, i);
			blockNode.body.push(childNode);
			i = nextIndex;
			// Update Data
			updateData(tokens, i);
		} else if (
			current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET &&
			peek(tokens, i, 1).type === TOKEN_TYPES.END_KEYWORD
		) {
			// Update Data
			updateData(tokens, i);
			i++;
			if (current_token(tokens, i).type === TOKEN_TYPES.END_KEYWORD) {
				// Update Data
				updateData(tokens, i);
				if (peek(tokens, i, 1) && peek(tokens, i, 1).type === TOKEN_TYPES.CLOSE_BRACKET) {
					// Update Data
					updateData(tokens, i + 1);
				} else {
					parserError(errorMessage(tokens, i, "]", end_keyword));
				}
			}
			block_stack.pop();
			i += 2;
			// Update Data
			updateData(tokens, i);
			break;
		} else {
			let [childNode, nextIndex] = parseNode(tokens, i);
			if (!childNode) {
				i += 1;
				continue;
			}
			blockNode.body.push(childNode);
			if (blockNode.body[0].value === "\n") {
				blockNode.body.splice(0, 1);
			}
			i = nextIndex;
		}
	}
	i++;
	return [blockNode, i];
}

// Parse Inline Statements
function parseInline(tokens, i) {
	const inlineNode = makeInlineNode();
	// Update Data
	updateData(tokens, i);
	i++;
	if (current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
		inlineNode.value = current_token(tokens, i).value;
		inlineNode.depth = current_token(tokens, i).depth;
	} else {
		parserError(errorMessage(tokens, i, inline_value, "("));
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN) {
		parserError(errorMessage(tokens, i, ")", inline_value));
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.THIN_ARROW) {
		parserError(errorMessage(tokens, i, "->", ")"));
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.OPEN_PAREN) {
		parserError(errorMessage(tokens, i, "(", "->"));
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
		for (const id of PREDEFINED_IDS) {
			if (current_token(tokens, i).value.includes(`${id}:`)) {
				inlineNode.id = id;
				const currentValue = current_token(tokens, i).value;
				if (currentValue.includes('"')) {
					inlineNode.data = currentValue
						.slice(currentValue.indexOf(`${id}:`) + `${id}:`.length, currentValue.indexOf('"'))
						.trim();
					inlineNode.title = currentValue.slice(currentValue.indexOf('"'));
				} else {
					inlineNode.data = currentValue.slice(currentValue.indexOf(`${id}:`) + `${id}:`.length).trim();
				}
				break;
			} else {
				inlineNode.id = current_token(tokens, i).value;
			}
		}
	} else {
		parserError(errorMessage(tokens, i, inline_id, "("));
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN) {
		parserError(errorMessage(tokens, i, ")", inline_id));
	}
	// Update Data
	updateData(tokens, i);
	tokens_stack.length = 0;
	i++;
	return [inlineNode, i];
}

// Parse Text
function parseText(tokens, i) {
	const textNode = makeTextNode();
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.TEXT) {
		textNode.text = current_token(tokens, i).value;
		textNode.depth = current_token(tokens, i).depth;
	}
	// Update Data
	updateData(tokens, i);
	i++;
	return [textNode, i];
}

// Parse At_Block
function parseAtBlock(tokens, i) {
	const atBlockNode = makeAtBlockNode();
	// Update Data
	updateData(tokens, i);
	i++;
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
		atBlockNode.id = current_token(tokens, i).value;
		atBlockNode.depth = current_token(tokens, i).depth;
	} else {
		parserError(errorMessage(tokens, i, at_id, "@_"));
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT) {
		parserError(errorMessage(tokens, i, "_@", at_id));
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
		// Update Data
		updateData(tokens, i);
		i++;
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
			current_token(tokens, i)
				.value.split(",")
				.forEach(value => {
					atBlockNode.args.push(value);
				});
			// Update Data
			updateData(tokens, i);
			i++;
		} else {
			parserError(errorMessage(tokens, i, at_value, ":"));
		}
	}
	if (!current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.NEWLINE) {
		parserError(errorMessage(tokens, i, "\\n", "@_"));
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.TEXT) {
		parserError(errorMessage(tokens, i, "Text", "\\n"));
	}
	while (i < tokens.length) {
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.TEXT) {
			atBlockNode.content.push(current_token(tokens, i).value);
			// Update Data
			updateData(tokens, i);
			i++;
		} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.NEWLINE) {
			// Update Data
			updateData(tokens, i);
			i++;
			continue;
		} else {
			break;
		}
	}
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.NEWLINE) {
		// Update Data
		updateData(tokens, i);
		i++;
	}
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.OPEN_AT) {
		parserError(errorMessage(tokens, i, "@_", "\\n"));
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.END_KEYWORD) {
		parserError(errorMessage(tokens, i, end_keyword, "@_"));
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT) {
		parserError(errorMessage(tokens, i, "_@", end_keyword));
	}
	// Update Data
	updateData(tokens, i);
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).value !== "\n") {
		parserError(errorMessage(tokens, i, "\\n", "_@"));
	}
	tokens_stack.length = 0;
	i++;
	return [atBlockNode, i];
}

// Parse Comments
function parseCommentNode(tokens, i) {
	const commentNode = makeCommentNode();
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMENT) {
		commentNode.text = current_token(tokens, i).value;
		commentNode.depth = current_token(tokens, i).depth;
	}
	// Update Data
	updateData(tokens, i);
	i++;
	return [commentNode, i];
}

function parseNode(tokens, i) {
	if (!current_token(tokens, i) || !current_token(tokens, i).value) {
		return [null, i];
	}
	// Comment
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMENT) {
		return parseCommentNode(tokens, i);
	}
	// Block
	else if (current_token(tokens, i).value === "[" && peek(tokens, i, 1).type !== TOKEN_TYPES.END_KEYWORD) {
		return parseBlock(tokens, i);
	}
	// Inline Statement
	else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.OPEN_PAREN) {
		return parseInline(tokens, i);
	}
	// Text
	else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.TEXT) {
		return parseText(tokens, i);
	}
	// At_Block
	else if (current_token(tokens, i).value === "@_" && peek(tokens, i, 1).type !== TOKEN_TYPES.END_KEYWORD) {
		return parseAtBlock(tokens, i);
	}
	// Newline
	else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.NEWLINE) {
		return [makeNewlineNode(current_token(tokens, i).value), i + 1];
	}
	// End Block
	else if (current_token(tokens, i).value === "[" && peek(tokens, i, 1).type === TOKEN_TYPES.END_KEYWORD) {
		end_stack.push(1);
	}
	return [null, i + 1];
}

function parser(tokens) {
	let ast = [];
	for (let i = 0; i < tokens.length; i++) {
		let [nodes, nextIndex] = parseNode(tokens, i);
		if (current_token(tokens, i).type !== TOKEN_TYPES.COMMENT && current_token(tokens, i).depth === 0) {
			parserError(errorMessage(tokens, i, "[", ""));
		}
		if (block_stack.length !== 0) {
			parserError(errorMessage(tokens, i, "[end]", ""));
		}
		if (end_stack.length !== 0) {
			parserError(errorMessage(tokens, i, "Block", ""));
		}
		if (nodes) {
			ast.push(nodes);
			i = nextIndex;
		} else {
			i++;
		}
	}
	return ast;
}

export default parser;
