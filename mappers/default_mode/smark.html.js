import Mapper from "../mapper.js";
const html = new Mapper();
const { tag, code, list } = html;

html.env = "browser";

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
	return tag("img").attributes({ src: args[0], alt: content }).selfClose();
});
// Code
html.create("code", ({ args, content }) => {
	return code(args, content);
}, { escape: false });
// List
html.create(["list", "List"], ({ content }) => {
	return list(content);
}, { escape: false });
// Table
html.create("table", ({ content, args }) => {
	return html.htmlTable(content.split(/\n/), args);
}, { escape: false });
// Horizontal Rule
html.create("hr", () => {
	return tag("hr").selfClose();
});

export default html;
