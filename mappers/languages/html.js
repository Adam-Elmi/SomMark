import Mapper from "../mapper.js";
const HTML = new Mapper();
const { tag, code, list } = HTML;

// Define a custom theme (Dracula-ish)
const draculaTheme = `pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}.hljs{color:#e9e9f4;background:#282936}.hljs ::selection,.hljs::selection{background-color:#4d4f68;color:#e9e9f4}.hljs-comment{color:#626483}.hljs-tag{color:#62d6e8}.hljs-operator,.hljs-punctuation,.hljs-subst{color:#e9e9f4}.hljs-operator{opacity:.7}.hljs-bullet,.hljs-deletion,.hljs-name,.hljs-selector-tag,.hljs-template-variable,.hljs-variable{color:#ea51b2}.hljs-attr,.hljs-link,.hljs-literal,.hljs-number,.hljs-symbol,.hljs-variable.constant_{color:#b45bcf}.hljs-class .hljs-title,.hljs-title,.hljs-title.class_{color:#00f769}.hljs-strong{font-weight:700;color:#00f769}.hljs-addition,.hljs-code,.hljs-string,.hljs-title.class_.inherited__{color:#ebff87}.hljs-built_in,.hljs-doctag,.hljs-keyword.hljs-atrule,.hljs-quote,.hljs-regexp{color:#a1efe4}.hljs-attribute,.hljs-function .hljs-title,.hljs-section,.hljs-title.function_,.ruby .hljs-property{color:#62d6e8}.diff .hljs-meta,.hljs-keyword,.hljs-template-tag,.hljs-type{color:#b45bcf}.hljs-emphasis{color:#b45bcf;font-style:italic}.hljs-meta,.hljs-meta .hljs-keyword,.hljs-meta .hljs-string{color:#00f769}.hljs-meta .hljs-keyword,.hljs-meta-keyword{font-weight:700}`;

// 1. Register the theme
HTML.registerHighlightTheme({
	"dracula": draculaTheme
});

// 2. Select the theme
HTML.selectHighlightTheme("dracula");

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
