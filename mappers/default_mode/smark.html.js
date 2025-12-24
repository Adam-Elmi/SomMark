import Mapper from "../mapper.js";
const html = new Mapper();
const { tag, setHeader, highlightCode, cssTheme } = html;

// Block
html.create("Block", ({ args, content }) => {
	return content;
});
// Section
html.create("Section", ({ args, content }) => {
	return tag("section").body(content);
});
// Headings
html.create("h1", ({ args, content }) => {
	return tag("h1").body(content);
});
html.create("h2", ({ args, content }) => {
	return tag("h2").body(content);
});
html.create("h3", ({ args, content }) => {
	return tag("h3").body(content);
});
html.create("h4", ({ args, content }) => {
	return tag("h4").body(content);
});
html.create("h5", ({ args, content }) => {
	return tag("h5").body(content);
});
html.create("h6", ({ args, content }) => {
	return tag("h6").body(content);
});
// Bold
html.create(["bold", "b"], ({ args, content }) => {
	return tag("strong").body(content);
});
// Italic
html.create(["italic", "i"], ({ args, content }) => {
	return tag("i").body(content);
});
// Italic
html.create(["emphasis", "e"], ({ args, content }) => {
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
	const value = highlightCode(content, args[0].trim());
	return tag("pre").body(
		tag("code")
			.attributes({ class: `hljs language-${args[0].trim()}` })
			.body(value)
	);
});

setHeader({ rawData: [cssTheme()] });
export default html;
