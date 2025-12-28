import Mapper from "../mapper.js";
const html = new Mapper();
const { tag, setHeader, code, cssTheme, list } = html;

// Block
html.create("Block", ({ content }) => {
	return content;
});
// Section
html.create("Section", ({ content }) => {
	return tag("section").body(content);
});
// Headings
html.create("h1", ({ content }) => {
	return tag("h1").body(content);
});
html.create("h2", ({ content }) => {
	return tag("h2").body(content);
});
html.create("h3", ({ content }) => {
	return tag("h3").body(content);
});
html.create("h4", ({ content }) => {
	return tag("h4").body(content);
});
html.create("h5", ({ content }) => {
	return tag("h5").body(content);
});
html.create("h6", ({ content }) => {
	return tag("h6").body(content);
});
// Bold
html.create(["bold", "b"], ({ content }) => {
	return tag("strong").body(content);
});
// Italic
html.create(["italic", "i"], ({ content }) => {
	return tag("i").body(content);
});
// Italic
html.create(["emphasis", "e"], ({ content }) => {
	return tag("span").attributes({ style: "font-weight:bold; font-style: italic;" }).body(content);
});
// Colored Text
html.create("color", ({ args, content }) => {
	return tag("span")
		.attributes({ style: `color:${args[0]}` })
		.body(content);
});
// Link
html.create("link", ({ args, content }) => {
	return tag("a").attributes({ href: args[0], title: args[1] }).body(content);
});
// Image
html.create("image", ({ args, content }) => {
	return tag("img").selfClose().attributes({ src: args[0], alt: content }).body("");
});
// Code
html.create("code", ({ args, content }) => {
	return code(args, content);
});
// List
html.create(["list", "List"], ({ content }) => {
	return list(content);
});
setHeader({ rawData: [cssTheme()] });
export default html;
