import Mapping from "../mapping.js";
const html = new Mapping();
const { tag } = html;
html.create("Block", (args, children) => {
	return children;
});
html.create("color", (args, children) => {
  return tag("span").attributes({style: `color:${args[0]}`}).body(children);
});
export default html;
