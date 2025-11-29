import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import { parserError } from "./validator.js";
import PREDEFINED_IDS from "./ids.js";

function current_token(tokens, i) {
	return tokens[i] || null;
}

function makeBlockNode() {
	return {
		type: "Block",
		id: "",
		args: [],
		body: [],
		depth: 0
	};
}

function makeTextNode() {
	return {
		type: "Text",
		text: "",
		depth: 0
	};
}

function makeCommentNode() {
	return {
		type: "Comment",
		text: "",
		depth: 0
	};
}

function makeInlineNode() {
	return {
		type: "Inline",
		value: "",
		id: "",
		depth: 0
	};
}

function makeAtBlockNode() {
	return {
		type: "AtBlock",
		id: "",
		args: [],
		content: [],
		depth: 0
	};
}

function makeNewlineNode(value) {
	return {
		type: "Newline",
		value,
		depth: 0
	};
}
let block_stack = [];
let end_stack = [];

// Parse Block
function parseBlock(tokens, i) {
	block_stack.push(1);
	end_stack.pop();
	const blockNode = makeBlockNode();
	// consume '['
	i++;
	if (current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
		blockNode.id = current_token(tokens, i).value;
		blockNode.depth = current_token(tokens, i).depth;
	} else {
		parserError("Block Identifier", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	i++;
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.EQUAL) {
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
		i++;
	}
	if (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_BRACKET) {
		if (peek(tokens, i, -1) && peek(tokens, i, -1).type === TOKEN_TYPES.VALUE) {
			parserError("]", tokens[i].line, tokens[i].start, tokens[i].end);
		} else {
			parserError("]", tokens[i].line, tokens[i].start, tokens[i].end);
		}
	}
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).value !== "\n") {
		parserError("\\n", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	while (i < tokens.length) {
		if (current_token(tokens, i).value === "[" && peek(tokens, i, 1).value !== "end") {
			const [childNode, nextIndex] = parseBlock(tokens, i);
			blockNode.body.push(childNode);
			i = nextIndex;
		} else if (
			current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET &&
			peek(tokens, i, 1).type === TOKEN_TYPES.END_KEYWORD
		) {
			block_stack.pop();
			if (peek(tokens, i, 2) === null || peek(tokens, i, 2).type !== TOKEN_TYPES.CLOSE_BRACKET) {
				parserError("end", tokens[i].line, tokens[i].start, tokens[i].end);
			}
			i += 3;
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
	i++;
	if (current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
		inlineNode.value = current_token(tokens, i).value;
		inlineNode.depth = current_token(tokens, i).depth;
	} else {
		parserError("Inline Value", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN) {
		parserError(")", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.THIN_ARROW) {
		parserError("->", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.OPEN_PAREN) {
		parserError("(", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
		for (const id of PREDEFINED_IDS) {
			if (current_token(tokens, i).value.includes(`${id}:`)) {
				console.log(id);
				inlineNode.id = id;
				const currentValue = current_token(tokens, i).value;
				if (currentValue.includes('"')) {
					inlineNode.data = currentValue.slice(currentValue.indexOf(`${id}:`) + `${id}:`.length, currentValue.indexOf('"')).trim();
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
		parserError("Inline Identifier", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_PAREN) {
		parserError(")", tokens[i].line, tokens[i].start, tokens[i].end);
	}
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
	i++;
	return [textNode, i];
}

// Parse At_Block
function parseAtBlock(tokens, i) {
	const atBlockNode = makeAtBlockNode();
	i++;
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
		atBlockNode.id = current_token(tokens, i).value;
		atBlockNode.depth = current_token(tokens, i).depth;
	} else {
		parserError("At Identifier", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT) {
		parserError("_@", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	i++;
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COLON) {
		i++;
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
			current_token(tokens, i)
				.value.split(",")
				.forEach(value => {
					atBlockNode.args.push(value);
				});
			i++;
		} else {
			parserError("At Value", tokens[i].line, tokens[i].start, tokens[i].end);
		}
	}
	if (!current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.NEWLINE) {
		parserError("\\n", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.TEXT) {
		parserError("Text", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	while (i < tokens.length) {
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.TEXT) {
			atBlockNode.content.push(current_token(tokens, i).value);
			i++;
		} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.NEWLINE) {
			i++;
			continue;
		} else {
			break;
		}
	}
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.NEWLINE) {
		i++;
	}
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.OPEN_AT) {
		parserError("@_", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.END_KEYWORD) {
		parserError("end", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_AT) {
		parserError("_@", tokens[i].line, tokens[i].start, tokens[i].end);
	}

	i++;
	if (!current_token(tokens, i) || current_token(tokens, i).value !== "\n") {
		parserError("\\n", tokens[i].line, tokens[i].start, tokens[i].end);
	}
	return [atBlockNode, i];
}

// Parse Comments
function parseCommentNode(tokens, i) {
	const commentNode = makeCommentNode();
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.COMMENT) {
		commentNode.text = current_token(tokens, i).value;
		commentNode.depth = current_token(tokens, i).depth;
	}
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
			parserError("[", tokens[i].line, tokens[i].start, tokens[i].end);
		}
		if (block_stack.length !== 0) {
			parserError("[end]", tokens[i].line, tokens[i].start, tokens[i].end);
		}
		if (end_stack.length !== 0) {
			parserError("Block", tokens[i].line, tokens[i].start, tokens[i].end);
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
