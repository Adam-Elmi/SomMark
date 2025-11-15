import peek from "./helpers/peek.js";
import TOKEN_TYPES from "./tokenTypes.js";

const tree = [];
const nodes = [];
let previous_index = 0;

function consume(
  tokens,
  i,
  expected_token = "",
  expected_type = "",
  increment = 1,
) {
  console.log(tokens[i].value);
  if (tokens[i].value === expected_token) {
    i += increment;
  } else if (tokens[i].type === expected_type) {
    i += increment;
  } else {
    throw new Error(`expected ${expected_token}`);
  }
  return i;
}

function parseBlock(tokens, current_index = 0) {
  // Base Case
  if (tokens.length === 0) {
    return;
  }
  for (let i = 0; i < tokens.length; i++) {
    // Outer Block
    if (
      tokens[i]?.value === "[" &&
      tokens[i].depth === 1 &&
      peek(tokens, i, 1)?.value !== "end"
    ) {
      nodes.push({});
      nodes[current_index]["type"] = "Block";
      nodes[current_index]["body"] = [];
    }
    // Inner Block
    else if (
      tokens[i]?.value === "[" &&
      tokens[i].depth > 1 &&
      peek(tokens, i, 1)?.value !== "end"
    ) {
      console.log(tokens[i]);
      // nodes[current_index]["id"] = tokens[i].value;
    }
    // Block Identifier
    else if (
      tokens[i].type === TOKEN_TYPES.IDENTIFIER &&
      (peek(tokens, i, 1).value === "=" || peek(tokens, i, 1).value === "]")
    ) {
      nodes[current_index]["id"] = tokens[i].value.trim();
    }
    // Equal Sign - Block Value
    else if (tokens[i].value === "=") {
      nodes[current_index]["arguments"] = peek(tokens, i, 1)
        ?.value.trim()
        .split(",");
      i = consume(tokens, i, "=");
      i = consume(tokens, i, null, TOKEN_TYPES.VALUE);
      i = consume(tokens, i, "]");
    }
    // Text 
    else if (tokens[i].type === TOKEN_TYPES.CONTENT) {
      const [node_object, steps] = parseText(tokens, i);
      nodes[current_index]["body"].push(node_object);
      i += steps;
    }
    // At Block 
    else if (tokens[i].value === "@_" && peek(tokens, i, 1).value !== "end") {
      const [node_object, steps] = parseAtBlock(tokens, i);
      nodes[current_index]["body"].push(node_object);
      i += steps;
    } else if (tokens[i].value === "@_" && peek(tokens, i, 1).value === "end") {
      const steps = parseEndKeyword(tokens, i);
      i += steps;
    }
    // Block end keyword
    else if (
      tokens[i].value === "[" &&
      tokens[i].depth > 1 &&
      peek(tokens, i, 1).value === "end"
    ) {
      const steps = parseEndKeyword(tokens, i);
      i += steps;
    } else {
      console.log(tokens[i]);
      break;
    }
  }
  return nodes;
}

function parseText(tokens, i) {
  const node = {
    type: "text",
    text: tokens[i].value,
    inline_statements: [],
  };
  i = consume(tokens, i, null, TOKEN_TYPES.CONTENT);
  let steps = 1;
  if (tokens[i].value === "(") {
    const [node_object, count_steps] = parseInlineStatement(tokens, i);
    const { value, id } = node_object;
    node.text += value;
    node.inline_statements.push({
      value,
      id,
    });
    steps += count_steps;
  }
  return [node, steps];
}

function parseInlineStatement(tokens, i) {
  const node = {};
  let count_steps = i;
  i = consume(tokens, i, "(");
  i = consume(tokens, i, null, TOKEN_TYPES.VALUE);
  i = consume(tokens, i, ")");
  i = consume(tokens, i, "->");
  i = consume(tokens, i, "(");
  i = consume(tokens, i, null, TOKEN_TYPES.IDENTIFIER);
  i = consume(tokens, i, ")");
  count_steps = i - count_steps;
  return [node, count_steps];
}

function parseAtBlock(tokens, i) {
  const node = {
    id: "",
    arguments: [],
    text: [],
  };
  let count_steps = i;
  i = consume(tokens, i, "@_");
  node["id"] = tokens[i].value;
  i = consume(tokens, i, null, TOKEN_TYPES.IDENTIFIER);
  i = consume(tokens, i, "_@");
  i = consume(tokens, i, ":");
  node["arguments"].push(tokens[i].value.slice(","));
  i = consume(tokens, i, null, TOKEN_TYPES.VALUE);
  node["text"].push(tokens[i].value);
  i = consume(tokens, i, null, TOKEN_TYPES.CONTENT);
  return [node, i - count_steps];
}

function parseEndKeyword(tokens, i) {
  let count_steps = i;
  switch (tokens[i].value) {
    case "[":
      i = consume(tokens, i, "[");
      i = consume(tokens, i, "end");
      i = consume(tokens, i, "]");
      break;
    case "@_":
      i = consume(tokens, i, "@_");
      i = consume(tokens, i, "end");
      i = consume(tokens, i, "_@");
      break;
  }
  return i - count_steps;
}

function parser(tokens) {
  if (tokens) {
    const nodes = parseBlock(tokens);
    for (const node of nodes) {
      tree.push(node);
    }
  }
  return JSON.stringify(tree, null, 2);
}
export default parser;
