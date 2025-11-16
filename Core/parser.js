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
    throw new Error("Expected '['");
  }
  i++;

  if (current_token(tokens, i).type === TOKEN_TYPES.IDENTIFIER) {
    blockNode.id = current_token(tokens, i).value.trim();
  } else {
    if(current_token(tokens, i).value === "=") {
      throw new Error("Expected block identifier before '='");
    } else {
      throw new Error("Expected '[' before block identifier");
    }
  }
  i++;
  if ( current_token(tokens, i) && current_token(tokens, i).value === "=") {
    i++;
    if (current_token(tokens, i).type === TOKEN_TYPES.VALUE) {
      current_token(tokens, i).value.trim().split(",").forEach((value) => {
        blockNode.args.push(value);
      })
    } else {
      throw new Error("Expected block value after '='");
    }
    i++;
  }

  if (current_token(tokens, i) && current_token(tokens, i).value !== "]") {
    throw new Error("Expected ']'");
  }
  i++;
  
  while(i < tokens.length) {
    if(current_token(tokens, i).value === "[" && peek(tokens, i, 1).value !== "end") {
      const [childNode, nextIndex] = parseBlock(tokens, i);
      blockNode.body.push(childNode);
      i = nextIndex;
    } 
    else if(current_token(tokens, i).value === "[" && peek(tokens, i, 1).value === "end") {
      console.log(peek(tokens, i, 2));
      if(peek(tokens, i, 2) === null || peek(tokens, i, 2).value !== "]") {
        throw new Error("Expected ']' after 'end'");
      }
      i += 2;
      break;
    } else {
      i++;
    }
  }
  return [blockNode, i];
}

function parseText() {}

function parseInline() {}

function parseAtBlock() {}

function parseNode(tokens, i) {
  if (current_token(tokens, i).value === "[" && peek(tokens, i, 1) !== "end") {
    return parseBlock(tokens, i);
  }  {
  }
   return [null, i + 1];
}

function parser(tokens) {
  const ast = [];
  for (let i = 0; i < tokens.length; i++) {
    let [nodes, nextIndex] = parseNode(tokens, i);
    if(nodes) {
      ast.push(nodes);
      i = nextIndex;
    } else {
      i++;
    }
  }
  return JSON.stringify(ast, null, 2);
}

export default parser;
