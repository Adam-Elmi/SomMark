import Mapper from "../mapper.js";
const HTML = new Mapper();
const { tag, code, list } = HTML;

// Block
HTML.register("Block", ({ content }) => {
	return content;
});
// Section
HTML.register("Section", ({ content }) => {
	return tag("section").body(content);
});
// Headings
["h1", "h2", "h3", "h4", "h5", "h6"].forEach(heading => {
	HTML.register(heading, ({ content }) => {
		return tag(heading).body(content);
	});
});
// Bold
HTML.register(["bold", "b"], ({ content }) => {
	return tag("strong").body(content);
});
// Italic
HTML.register(["italic", "i"], ({ content }) => {
	return tag("i").body(content);
});
// Italic
HTML.register(["emphasis", "e"], ({ content }) => {
	return tag("span").attributes({ style: "font-weight:bold; font-style: italic;" }).body(content);
});
// Colored Text
HTML.register("color", ({ args, content }) => {
	return tag("span")
		.attributes({ style: `color:${args[0]}` })
		.body(content);
});
// Link
HTML.register("link", ({ args, content }) => {
	console.log(args);
	return tag("a").attributes({ href: args[0].trim(), title: args[1] ? args[1].trim() : "" }).body(content);
});
// Image
HTML.register("image", ({ args, content }) => {
	return tag("img").attributes({ src: args[0].trim(), alt: content }).selfClose();
});
// Code
HTML.register(
	["code", "Code"],
	({ args, content }) => {
		return code(args, content);
	},
	{ escape: false }
);
// List
HTML.register(
	["list", "List"],
	({ content }) => {
		return list(content);
	},
	{ escape: false }
);
// Table
HTML.register(
	["table", "Table"],
	({ content, args }) => {
		return HTML.htmlTable(content.split(/\n/), args);
	},
	{ escape: false }
);
// Horizontal Rule
HTML.register("hr", () => {
	return tag("hr").selfClose();
});
// Todo
HTML.register("todo", ({ args, content }) => {
	const checked = HTML.todo(content);
	return tag("div").body(tag("input").attributes({ type: "checkbox", disabled: true, checked }).selfClose() + (args[0] ? args[0] : ""));
});

export default HTML;
