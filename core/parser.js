import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import { parserError, validateId } from "./validator.js";
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

function makeNewlineNode(value, depth = 0) {
	return {
		type: NEWLINE,
		value,
		depth: depth
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
	// consume '['
	i++;
	// Update Data
	updateData(tokens, i);
	if (current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
		const id = current_token(tokens, i).value.trim();
		validateId(id);
		blockNode.id = id;
		blockNode.depth = current_token(tokens, i).depth;
	} else {
		parserError(errorMessage(tokens, i, block_id, "["));
	}
	// consume Block identifier
	i++;
	// Update Data
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.EQUAL) {
		// consume '='
		i++;
		// Update Data
		updateData(tokens, i);
		if (current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
			current_token(tokens, i)
				.value.split(",")
				.forEach(value => {
					blockNode.args.push(value.trim());
				});
		} else {
			parserError(errorMessage(tokens, i, block_value, "="));
		}
		// consume Block value
		i++;
		// Update Data
		updateData(tokens, i);
	}
	if (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_BRACKET) {
		if (peek(tokens, i, -1) && peek(tokens, i, -1).type === TOKEN_TYPES.VALUE) {
			parserError(errorMessage(tokens, i, "]", block_value));
		} else {
			parserError(errorMessage(tokens, i, "]", block_id));
		}
	}
	// consume ']'
	i++;
	// Update Data
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type == TOKEN_TYPES.NEWLINE) {
		// consume '\n'
		i++;
		// Update Data
		updateData(tokens, i);
	}
	tokens_stack.length = 0;
	while (i < tokens.length) {
		if (current_token(tokens, i).value === "[" && peek(tokens, i, 1).value !== "end") {
			const [childNode, nextIndex] = parseBlock(tokens, i);
			blockNode.body.push(childNode);
			// consume child node
			i = nextIndex;
			// Update Data
			updateData(tokens, i);
		} else if (
			current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET &&
			peek(tokens, i, 1).type === TOKEN_TYPES.END_KEYWORD
		) {
			// consume end keyword
			i++;
			// Update Data
			updateData(tokens, i);
			if (current_token(tokens, i).type === TOKEN_TYPES.END_KEYWORD) {
				if (peek(tokens, i, 1) && peek(tokens, i, 1).type !== TOKEN_TYPES.CLOSE_BRACKET) {
					parserError(errorMessage(tokens, i, "]", end_keyword));
				}
			}
			block_stack.pop();
			// consume end keyword and ']'
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
			i = nextIndex;
		}
	}
	return [blockNode, i];
}

// Parse Inline Statements
function parseInline(tokens, i) {
	const inlineNode = makeInlineNode();
	// consume '('
	i++;
	// Update Data
	updateData(tokens, i);
	if (current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
		inlineNode.value = current_token(tokens, i).value;
		inlineNode.depth = current_token(tokens, i).depth;
	} else {
		parserError(errorMessage(tokens, i, inline_value, "("));
	}
	// consume Inline Value
	i++;
	// Edge case
	let escape_characters = "";
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
		while (i < tokens.length) {
			if (current_token(tokens, i).type === TOKEN_TYPES.ESCAPE || current_token(tokens, i).type === TOKEN_TYPES.TEXT) {
				switch (current_token(tokens, i).type) {
					case TOKEN_TYPES.ESCAPE:
						inlineNode.value += current_token(tokens, i).value.slice(1);
						break;
					case TOKEN_TYPES.TEXT:
						inlineNode.value += current_token(tokens, i).value;
						break;
				}
				i++;
			} else {
				break;
			}
		}
	}
	// Update Data
	updateData(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN) {
		parserError(errorMessage(tokens, i, ")", inline_value));
	}
	// consume ')'
	i++;
	// Update Data
	updateData(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.THIN_ARROW) {
		parserError(errorMessage(tokens, i, "->", ")"));
	}
	// consume '->'
	i++;
	// Update Data
	updateData(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.OPEN_PAREN) {
		parserError(errorMessage(tokens, i, "(", "->"));
	}
	// consume '('
	i++;
	// Update Data
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
		for (const id of PREDEFINED_IDS) {
			if (current_token(tokens, i).value.includes(`${id}:`)) {
				inlineNode.id = id.trim();
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
		validateId(inlineNode.id);
	} else {
		parserError(errorMessage(tokens, i, inline_id, "("));
	}
	// consume Inline Identifier
	i++;
	// Update Data
	updateData(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN) {
		parserError(errorMessage(tokens, i, ")", inline_id));
	}
	// consume ')'
	i++;
	// Update Data
	updateData(tokens, i);
	tokens_stack.length = 0;
	return [inlineNode, i];
}

// Parse Text
function parseText(tokens, i) {
	const textNode = makeTextNode();
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.TEXT) {
		textNode.text = current_token(tokens, i).value;
		textNode.depth = current_token(tokens, i).depth;
	}
	// consume TEXT
	i++;
	// Update Data
	updateData(tokens, i);
	return [textNode, i];
}

// Parse At_Block
function parseAtBlock(tokens, i) {
	const atBlockNode = makeAtBlockNode();
	// consume '@_'
	i++;
	// Update Data
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.END_KEYWORD) {
		parserError(errorMessage(tokens, i, at_id, "@_"));
	}
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
		const id = current_token(tokens, i).value.trim();
		validateId(id);
		atBlockNode.id = id;
		atBlockNode.depth = current_token(tokens, i).depth;
	} else {
		parserError(errorMessage(tokens, i, at_id, "@_"));
	}
	// consume Atblock Identifier
	i++;
	// Update Data
	updateData(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT) {
		parserError(errorMessage(tokens, i, "_@", at_id));
	}
	// consume '_@'
	i++;
	// Update Data
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
		// consume ':'
		i++;
		// Update Data
		updateData(tokens, i);
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
			current_token(tokens, i)
				.value.split(",")
				.forEach(value => {
					atBlockNode.args.push(value.trim());
				});
			// consume Atblock Value
			i++;
			// Update Data
			updateData(tokens, i);
		} else {
			parserError(errorMessage(tokens, i, at_value, ":"));
		}
	}
	if (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.NEWLINE) {
		parserError(errorMessage(tokens, i, "\\n", "_@"));
	}
	// consume '\n'
	i++;
	// Update Data
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.TEXT) {
		parserError(errorMessage(tokens, i, "Text", "\\n"));
	}
	while (i < tokens.length) {
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.TEXT) {
			atBlockNode.content.push(current_token(tokens, i).value);
			// consume TEXT
			i++;
			// Update Data
			updateData(tokens, i);
		} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.NEWLINE) {
			// consume '\n'
			i++;
			// Update Data
			updateData(tokens, i);
			continue;
		} else {
			break;
		}
	}
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.NEWLINE) {
		// consume '\n'
		i++;
		// Update Data
		updateData(tokens, i);
	}
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.OPEN_AT) {
		parserError(errorMessage(tokens, i, "@_", "\\n"));
	}
	// consume '@_'
	i++;
	// Update Data
	updateData(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.END_KEYWORD) {
		parserError(errorMessage(tokens, i, end_keyword, "@_"));
	}
	// console end keyword
	i++;
	// Update Data
	updateData(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT) {
		parserError(errorMessage(tokens, i, "_@", end_keyword));
	}
	// consume '_@'
	i++;
	// Update Data
	updateData(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).value !== "\n") {
		parserError(errorMessage(tokens, i, "\\n", "_@"));
	}
	// consume '\n'
	i++;
	// Update Data
	updateData(tokens, i);
	tokens_stack.length = 0;
	return [atBlockNode, i];
}

// Parse Comments
function parseCommentNode(tokens, i) {
	const commentNode = makeCommentNode();
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMENT) {
		commentNode.text = current_token(tokens, i).value;
		commentNode.depth = current_token(tokens, i).depth;
	}
	// consume Comment
	i++;
	// Update Data
	updateData(tokens, i);
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
	else if (current_token(tokens, i).value === "@_") {
		return parseAtBlock(tokens, i);
	}
	// Newline
	else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.NEWLINE) {
		return [makeNewlineNode(current_token(tokens, i).value, current_token(tokens, i).depth), i + 1];
	}
	// End Block
	else if (current_token(tokens, i).value === "[" && peek(tokens, i, 1).type === TOKEN_TYPES.END_KEYWORD) {
		end_stack.push(1);
	}
	return [null, i + 1];
}

function parser(tokens) {
	block_stack = [];
	end_stack = [];
	tokens_stack = [];
	line = 1;
	start = 1;
	end = 1;
	value = "";
	let ast = [];
	for (let i = 0; i < tokens.length; i++) {
		let [nodes, nextIndex] = parseNode(tokens, i);
		if (current_token(tokens, i).type === TOKEN_TYPES.NEWLINE && current_token(tokens, i).depth === 0) {
			continue;
		}
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
