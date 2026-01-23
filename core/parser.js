import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import { parserError, validateId } from "./validator.js";
import PREDEFINED_IDS from "./ids.js";
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

let real_cause = "";

const errorMessage = (tokens, i, expectedValue, behindValue, frontText) => {
	if (tokens[i]) {
		const tokensUntilError = tokens.slice(0, i);
		const contextText = tokensUntilError.map(t => t.value).join("");
		const pointerPadding = " ".repeat(contextText.length);

		return [
			`<$blue:{line}$><$red:Here where error occurred:$>{N}${contextText}${tokens[i].value}{N}${pointerPadding}<$yellow:^$>{N}{N}`,
			`<$red:${frontText ? frontText : "Expected token"}$> <$blue:'${expectedValue}'$> ${behindValue ? "after <$blue:'" + behindValue + "'$>" : ""} at line <$yellow:${line}$>,`,
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
		end_stack.push(id);
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
	tokens_stack.length = 0;
	while (i < tokens.length) {
		if (current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET && peek(tokens, i, 1).type !== TOKEN_TYPES.END_KEYWORD) {
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
			end_stack.pop();
			// consume end keyword and ']'
			i += 2;
			// Update Data
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
		const v = current_token(tokens, i).value.slice(0, current_token(tokens, i).value.indexOf(":"));
		let targetId = PREDEFINED_IDS.find(_id => _id === v);

		if (targetId) {
			inlineNode.id = targetId.trim();
			validateId(inlineNode.id);
			const currentValue = current_token(tokens, i).value;
			let data = null;
			let title = null;
			if (currentValue.includes('"')) {
				data = currentValue.slice(currentValue.indexOf(`${targetId}:`) + `${targetId}:`.length, currentValue.indexOf('"')).trim();
				title = currentValue.slice(currentValue.indexOf('"'));
				if (typeof title === "string" && title.length > 1 && title.startsWith('"') && title.endsWith('"')) {
				} else {
					parserError(
						errorMessage(
							tokens,
							i,
							`${targetId.trim()}: ${data
								? title.length === 1 && title.endsWith('"')
									? data.split(" ")[0] + ' "' + data.split(" ")[1]
									: data + " "
								: ""
							}${title}${title.length > 1 && !title.endsWith('"') ? '"' : ""}`,
							""
						)
					);
				}
				if (data === "") {
					parserError(errorMessage(tokens, i, `${targetId.trim()}: value ${title ? title : ""}`, "("));
				}
				inlineNode.data = data;
				inlineNode.title = title;
			} else {
				data = currentValue.slice(currentValue.indexOf(`${targetId}:`) + `${targetId}:`.length).trim();
				if (data === "") {
					parserError(errorMessage(tokens, i, `${targetId.trim()}: value ${title ? title : ""}`, "("));
				}
				inlineNode.data = data;
			}
		} else {
			targetId = PREDEFINED_IDS.find(_id => _id === current_token(tokens, i).value);
			if (targetId) {
				parserError([`{line}<$yellow: '${targetId}'$> <$red: is a reserved identifier and cannot be used as an ID$>{line}`]);
			} else {
				inlineNode.id = current_token(tokens, i).value;
				validateId(inlineNode.id);
			}
		}
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
	textNode.depth = current_token(tokens, i).depth;

	while (i < tokens.length) {
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.TEXT) {
			textNode.text += current_token(tokens, i).value;
			i++;
			// Update Data
			updateData(tokens, i);
		} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
			textNode.text += current_token(tokens, i).value.slice(1);
			i++;
			// Update Data
			updateData(tokens, i);
		} else {
			break;
		}
	}
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
			if (current_token(tokens, i) === null || current_token(tokens, i).type !== TOKEN_TYPES.SEMICOLON) {
				real_cause = SEMICOLON;
				parserError(errorMessage(tokens, i, ";", at_value));
			}
			// consume ';'
			i++;
			// Update Data
			updateData(tokens, i);
		} else {
			parserError(errorMessage(tokens, i, at_value, ":"));
		}
	}

	// Update Data
	updateData(tokens, i);
	if (
		(current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.TEXT) ||
		(current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE)
	) {
		while (i < tokens.length) {
			if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.TEXT) {
				atBlockNode.content.push(current_token(tokens, i).value);
				// consume TEXT
				i++;
				// Update Data
				updateData(tokens, i);
			} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.ESCAPE) {
				atBlockNode.content.push(current_token(tokens, i).value.slice(1));
				// consume escape character
				i++;
				// Update Data
				updateData(tokens, i);
			} else {
				break;
			}
		}
	} else {
		parserError(errorMessage(tokens, i, "Text", at_value));
	}
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.OPEN_AT) {
		parserError(errorMessage(tokens, i, "@_", TEXT));
	}
	// consume '@_'
	i++;
	// Update Data
	updateData(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.END_KEYWORD) {
		parserError(errorMessage(tokens, i, end_keyword, "@_"));
	}
	// consume end keyword
	i++;
	// Update Data
	updateData(tokens, i);
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT) {
		parserError(errorMessage(tokens, i, "_@", end_keyword));
	}
	// consume '_@'
	i++;
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
	else if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.TEXT || current_token(tokens, i).type === TOKEN_TYPES.ESCAPE)) {
		return parseText(tokens, i);
	}
	// At_Block
	else if (current_token(tokens, i).value === "@_") {
		return parseAtBlock(tokens, i);
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
		parserError(errorMessage(tokens, tokens.length - 1, "Block end", "", "Missing"));
	}
	return ast;
}

export default parser;
