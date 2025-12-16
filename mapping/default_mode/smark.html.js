import Mapping from "../mapping.js";
const html = new Mapping();
const { tag, setHeader } = html;
setHeader(null, {
	rawData: ["<div><p>Hello from <span style='color:green;'>SomMark</span></p></div>"],
	elements: [
		{
			tagName: "p",
			class: "text",
			text: "Hello Adam"
		},
		{
			tagName: "a",
			href: "www.somcheat.dev",
			text: "SomCheat"
		},
	],
	resetData: true
});
html.create("Section", (args, children) => {
	return tag("section").body(children);
});
html.create("color", (args, children) => {
  return tag("span").attributes({style: `color:${args[0]}`}).body(children);
});
export default html;
