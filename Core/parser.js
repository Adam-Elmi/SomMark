import TOKEN_TYPES from "./tokenTypes.js";
import peek from "./helpers/peek.js";

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

function makeCommentNode() {
  return {
    type: "Comment",
    text: "",
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
    content: [],
  };
}

function makeNewlineNode(value) {
  return {
    type: "Newline",
    value,
  };
}

let depth = [];
function parseBlock(tokens, i) {
  depth.push(1);
  const blockNode = makeBlockNode();
  if (
    current_token(tokens, i).value !== "[" &&
    peek(tokens, i, 1).value !== "end"
  ) {
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
      depth.pop();
      if (peek(tokens, i, 2) === null || peek(tokens, i, 2).value !== "]") {
        throw new Error("Expected token ']' after 'end'");
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
    current_token(tokens, i).type === TOKEN_TYPES.TEXT
  ) {
    textNode.text = current_token(tokens, i).value;
  }
  i++;
  while (i < tokens.length) {
    if (current_token(tokens, i) && current_token(tokens, i).value === "(") {
      const [node, nextIndex] = parseInline(tokens, i);
      let id = node.id.includes(":") ? node.id.slice(0, node.id.indexOf(":")) : node.id;
      textNode.text += ` $${id}:${node.value}$`;
      textNode.inline.push(node);
      i = nextIndex;
    } else if (
      current_token(tokens, i) &&
      current_token(tokens, i).type === TOKEN_TYPES.TEXT
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
    !current_token(tokens, i) &&
    current_token(tokens, i).type !== TOKEN_TYPES.NEWLINE
  ) {
    throw new Error("Expected token '\n' after 'at_value'");
  }
  i++;
  while(i < tokens.length) {
    if (
      current_token(tokens, i) &&
      current_token(tokens, i).type === TOKEN_TYPES.TEXT
    ) {
      atBlockNode.content.push(current_token(tokens, i).value);
      i++;
    } else if (
      current_token(tokens, i) &&
      current_token(tokens, i).type === TOKEN_TYPES.NEWLINE
    ) {
      i++;
      continue;
    } else {
      break;
    }
  }
  if (
    current_token(tokens, i) &&
    current_token(tokens, i).type === TOKEN_TYPES.NEWLINE
  ) {
    i++;
  }
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

function parseCommentNode(tokens, i) {
  const commentNode = makeCommentNode();
  if (
    current_token(tokens, i) &&
    current_token(tokens, i).type === TOKEN_TYPES.COMMENT
  ) {
    commentNode.text = current_token(tokens, i).value;
  }
  i++;
  return [commentNode, i];
}

function parseNode(tokens, i) {
  if (!current_token(tokens, i) || !current_token(tokens, i).value)
    return [null, i];
  if (
    current_token(tokens, i) &&
    current_token(tokens, i).type === TOKEN_TYPES.COMMENT
  ) {
    return parseCommentNode(tokens, i);
  } else if (
    current_token(tokens, i).value === "[" &&
    peek(tokens, i, 1).value !== "end"
  ) {
    return parseBlock(tokens, i);
  } else if (
    current_token(tokens, i) &&
    current_token(tokens, i).value === "("
  ) {
    return parseInline(tokens, i);
  } else if (
    current_token(tokens, i) &&
    current_token(tokens, i).type === TOKEN_TYPES.TEXT
  ) {
    return parseText(tokens, i);
  } else if (
    current_token(tokens, i).value === "@_" &&
    peek(tokens, i, 1).value !== "end"
  ) {
    return parseAtBlock(tokens, i);
  } else if (
    current_token(tokens, i) &&
    current_token(tokens, i).type === TOKEN_TYPES.NEWLINE
  ) {
    return [makeNewlineNode(current_token(tokens, i).value), i + 1];
  } else if (
    current_token(tokens, i).value === "[" &&
    peek(tokens, i, 1).value === "end"
  ) {
    depth.pop();
  }
  return [null, i + 1];
}

let preTextNodes = [];

function astCleanUp(ast) {

  for (let i = 0; i < ast.length; i++) {
    if(ast[i].type === "Block") {
      let bNodes = ast[i].body; 
      for (let j = 0; j < bNodes.length; j++) {
        const node = bNodes[j];
        if(node.type === "Text" && preTextNodes.length === 0) {
          continue;
        } 
        else if(node.type === "Text" && preTextNodes.length > 0) {
          console.log(preTextNodes);
          for (let k = 0; k < preTextNodes.length; k++) {
            let n = preTextNodes[k];
            let temp_text = node.text.split(" ");
            if(n.type === "Newline") {
              temp_text.splice(k, 0, n.value);
              node.text = temp_text.join(" ");
            } else {
              let id = n.id.includes(":") ? n.id.slice(0, n.id.indexOf(":")) : n.id;
              temp_text.splice(k, 0, `$${id}:${n.value}$`);
              node.text = temp_text.join(" ");
              node.inline.unshift(n);
            }
          }
          preTextNodes = [];
        } 
        else if(node.type === "Inline" && peek(bNodes, j, 1)?.type === "Newline") {
           preTextNodes = [];
          continue;
        }
        else if(node.type === "Newline" || node.type === "Inline") {
          preTextNodes.push(node);
          bNodes.splice(j, 1);
          j--; 
        }
        else if(node.type === "Block") {
          preTextNodes = [];
          astCleanUp([node]);
        }
        else{
          preTextNodes = [];
          break;
        }
      }
    }
  }

  return ast;
}

function parser(tokens) {
  let ast = [];
  for (let i = 0; i < tokens.length; i++) {
    let [nodes, nextIndex] = parseNode(tokens, i);
    if(depth.length !== 0) {
      throw new Error("Block is missing '[end]'");
    } else if(depth.length === 0) {
      depth = [];
    }
    if (nodes) {
      ast.push(nodes);
      i = nextIndex;
    } else {
      i++;
    }
  }
  // ast clean up
  ast = astCleanUp(ast);
  return ast;
}

export default parser;
