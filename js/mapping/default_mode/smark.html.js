import Mapping from "../mapping.js";

const html_mapping = new Mapping();

html_mapping.create("Block1", "block", (args, body) => {
  return `<p style='color:${args[0]};'>${body}</p>`;
});

html_mapping.create("Block2", "block", (args, body) => {
  return `\n<a href='${args[0]}'>${body}\n</a>\n`;
});

export default html_mapping;
