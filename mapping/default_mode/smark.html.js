import Mapping from "../mapping.js";
const html = new Mapping();
const { tag } = html;
// Block 
html.create("Block", (_, children) => {
	return children;
});
// Section
html.create("Section", (_, children) => {
	return tag("section").body(children);
});
// Headings
html.create("h1", (_, children) => {
	return tag("h1").body(children);
});
html.create("h2", (_, children) => {
	return tag("h2").body(children);
});
html.create("h3", (_, children) => {
	return tag("h3").body(children);
});
html.create("h4", (_, children) => {
	return tag("h4").body(children);
});
html.create("h5", (_, children) => {
	return tag("h5").body(children);
});
html.create("h6", (_, children) => {
	return tag("h6").body(children);
});
// Bold
html.create(["bold", "b"], (_, children) => {
	return tag("strong").body(children);
});
// Italic
html.create(["italic", "i"], (_, children) => {
	return tag("i").body(children);
});
// Italic
html.create(["emphasis", "e"], (_, children) => {
	return tag("span").attributes({ style: "font-weight:bold; font-style: italic;" }).body(children);
});
// Colored Text
html.create("color", (args, children) => {
	return tag("span")
		.attributes({ style: `color:${args[0]}` })
		.body(children);
});
export default html;
