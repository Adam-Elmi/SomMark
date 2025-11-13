import peek from "./helpers/peek.js";
import TOKEN_TYPES from "./tokenTypes.js";

const tree = [];
const nodes = [];

function parseBlock(tokens, current_index = 0) {
  if (tokens.length === 0) {
    return;
  }
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i]?.value === "[" && peek(tokens, i, 1)?.value !== "end") {
      nodes.push({});
      nodes[current_index]["type"] = "Block";
      i++;
      if (tokens[i].type === TOKEN_TYPES.IDENTIFIER) {
        nodes[current_index]["id"] = tokens[i].value;
        i++;
      }
      if (tokens[i].value === "=") {
        nodes[current_index]["arguments"] = peek(tokens, i, 1)
          ?.value.trim()
          .split(" ");
        i += 2;
      }
      if (tokens[i].value === "]") {
        i++;
      } else {
        throw new Error(
          `expected ']' at line ${tokens[i].line}, column ${tokens[i].column_start}`,
        );
      }
      nodes[current_index]["body"] = [];

      if (tokens[i].type === TOKEN_TYPES.CONTENT) {
        const [node_object, steps] = parseText(tokens, i);
        nodes[current_index]["body"].push(node_object);
        i += steps;
      }
       if(tokens[i]?.value === "[" && peek(tokens, i, 1)?.value !== "end") {
        parseBlock(tokens.slice(i), current_index + 1);
      }
      
    } else {
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
  i++;
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
  i++;
  if (tokens[i].type === TOKEN_TYPES.VALUE) {
    node["value"] = tokens[i].value;
    i++;
    if (tokens[i].value === ")") {
      i++;
      if (tokens[i].value === "->") {
        i++;
        if (tokens[i].value === "(") {
          i++;
          if (tokens[i].type === TOKEN_TYPES.IDENTIFIER) {
            node["id"] = tokens[i].value;
            i++;
            if (tokens[i].value === ")") {
              i++; 
            } else {
              throw new Error("Expected  )");
            }
          } else {
            throw new Error("Expected  id");
          }
        } else {
          throw new Error("Expected  (");
        }
      } else {
        throw new Error("Expected  )");
      }
    } else {
      throw new Error("Expected  )");
    }
  } else {
    throw new Error("Expected a value");
  }
  count_steps = i - count_steps;
  return [node, count_steps];
}

function parseAtBlock(token) {}

function parseEndKeyword() {}

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
