import { text } from "node:stream/consumers";
import peek from "./helpers/peek.js";
import TOKEN_TYPES from "./tokenTypes.js";

function current_token(tokens, i) {
  return tokens[i] || null;
}

function makeBlockNode() {
  return {
    type: "Block",
    id: "",
    args: [],
    body: [],
  };
}

function makeTextNode() {
  return {
    type: "Text",
    text: "",
    inline: [],
  };
}

function makeCommentNode(value) {
  return {
    type: "comment",
    text: value,
  };
}

function makeInlineNode() {
  return {
    type: "Inline",
    value: "",
    id: "",
  };
}

function makeAtBlockNode() {
  return {
    type: "AtBlock",
    id: "",
    args: [],
    text: "",
  };
}

function parseBlock(tokens, i) {
  const blockNode = makeBlockNode();
  if (current_token(tokens, i).value !== "[") {
    throw new Error("Expected token '['");
  }
  i++;

  if (current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
    blockNode.id = current_token(tokens, i).value;
  } else {
    if (current_token(tokens, i).value === "=") {
      throw new Error("Expected token 'block identifier' before '='");
    } else {
      throw new Error("Expected token '[' before block identifier");
    }
  }
  i++;
  if (current_token(tokens, i) && current_token(tokens, i).value === "=") {
    i++;
    if (current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
      current_token(tokens, i)
        .value.split(",")
        .forEach((value) => {
          blockNode.args.push(value);
        });
    } else {
      throw new Error("Expected token 'block value' after '='");
    }
    i++;
  }

  if (current_token(tokens, i) && current_token(tokens, i).value !== "]") {
    if (current_token(tokens, i).value === "=") {
      throw new Error("Expected token ']' after block value");
    } else {
      throw new Error("Expected token ']' after block identifier");
    }
  }
  i++;

  while (i < tokens.length) {
    if (
      current_token(tokens, i).value === "[" &&
      peek(tokens, i, 1).value !== "end"
    ) {
      const [childNode, nextIndex] = parseBlock(tokens, i);
      blockNode.body.push(childNode);
      i = nextIndex;
    } else if (
      current_token(tokens, i).value === "[" &&
      peek(tokens, i, 1).value === "end"
    ) {
      if (peek(tokens, i, 2) === null || peek(tokens, i, 2).value !== "]") {
        throw new Error("Expected token ']' after 'end'");
      }
      i += 2;
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

function parseInline(tokens, i) {
  const inlineNode = makeInlineNode();
  if (!current_token(tokens, i) || current_token(tokens, i).value !== "(") {
    throw new error("Expected token '('");
  }
  i++;
  if (current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
    inlineNode.value = current_token(tokens, i).value;
  } else {
    throw new Error("Expected token 'inline value'");
  }
  i++;
  if (!current_token(tokens, i) || current_token(tokens, i).value !== ")") {
    throw new error("Expected token ')'");
  }
  i++;
  if (!current_token(tokens, i) || current_token(tokens, i).value !== "->") {
    throw new error("Expected token '->'");
  }
  i++;
  if (!current_token(tokens, i) || current_token(tokens, i).value !== "(") {
    throw new error("Expected token '('");
  }
  i++;
  if (
    current_token(tokens, i) &&
    current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER
  ) {
    inlineNode.id = current_token(tokens, i).value;
  } else {
    throw new Error("Expected token 'inline identifier'");
  }
  i++;
  if (!current_token(tokens, i) || current_token(tokens, i).value !== ")") {
    throw new error("Expected token ')'");
  }
  i++;
  return [inlineNode, i];
}

function parseText(tokens, i) {
  const textNode = makeTextNode();
  if (
    current_token(tokens, i) &&
    current_token(tokens, i).type === TOKEN_TYPES.CONTENT
  ) {
    textNode.text = current_token(tokens, i).value;
  }
  i++;
  while (i < tokens.length) {
    if (current_token(tokens, i) && current_token(tokens, i).value === "(") {
      const [node, nextIndex] = parseInline(tokens, i);
      textNode.text += " " + node.value;
      textNode.inline.push(node);
      i = nextIndex;
    } else if (
      current_token(tokens, i) &&
      current_token(tokens, i).type === TOKEN_TYPES.CONTENT
    ) {
      const [node, nextIndex] = parseText(tokens, i);
      textNode.text += " " + node.text;
      node.inline.forEach((value) => {
        textNode.inline.push(value);
      });
      i = nextIndex;
    } else {
      break;
    }
  }
  return [textNode, i];
}

function parseAtBlock(tokens, i) {
  const atBlockNode = makeAtBlockNode();
  if (!current_token(tokens, i) || current_token(tokens, i).value !== "@_") {
    throw new Error("Expected token '@_'");
  }
  i++;
  console.log(tokens[i]);
  if (
    current_token(tokens, i) &&
    current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER
  ) {
    atBlockNode.id = current_token(tokens, i).value;
  } else {
    throw new Error("Expected token 'at_identifier'");
  }
  i++;
  if (!current_token(tokens, i) || current_token(tokens, i).value !== "_@") {
    throw new Error("Expected token '_@'");
  }
  i++;
  if (current_token(tokens, i) && current_token(tokens, i).value === ":") {
    i++;
    if (
      current_token(tokens, i) &&
      current_token(tokens, i).type === TOKEN_TYPES.VALUE
    ) {
      current_token(tokens, i)
        .value.split(",")
        .forEach((value) => {
          atBlockNode.args.push(value);
        });
      i++;
    } else {
      throw new Error("Expected token 'at_value'");
    }
  }

  if (
    current_token(tokens, i) &&
    current_token(tokens, i).type === TOKEN_TYPES.CONTENT
  ) {
    atBlockNode.text = current_token(tokens, i).value;
  } else {
    throw new Error("Expected token 'text'");
  }
  i++;
  if (!current_token(tokens, i) || current_token(tokens, i).value !== "@_") {
    throw new Error("Expected token '@_'");
  }
  i++;
  if (!current_token(tokens, i) || current_token(tokens, i).value !== "end") {
    throw new Error("Expected token 'end'");
  }
  i++;
  if (!current_token(tokens, i) || current_token(tokens, i).value !== "_@") {
    throw new Error("Expected token '_@'");
  }
  i++;
  return [atBlockNode, i];
}

function parseNode(tokens, i) {
  if (current_token(tokens, i).value === "[" && peek(tokens, i, 1) !== "end") {
    return parseBlock(tokens, i);
  } else if (
    current_token(tokens, i) &&
    current_token(tokens, i).type === TOKEN_TYPES.CONTENT
  ) {
    return parseText(tokens, i);
  } else if (
    current_token(tokens, i) &&
    current_token(tokens, i).value === "("
  ) {
    return parseInline(tokens, i);
  } else if (
    current_token(tokens, i).value === "@_" &&
    peek(tokens, i, 1) !== "end"
  ) {
    return parseAtBlock(tokens, i);
  }
  return [null, i + 1];
}

function parser(tokens) {
  const ast = [];
  for (let i = 0; i < tokens.length; i++) {
    let [nodes, nextIndex] = parseNode(tokens, i);
    if (nodes) {
      ast.push(nodes);
      i = nextIndex;
    } else {
      i++;
    }
  }
  return JSON.stringify(ast, null, 2);
}

export default parser;
