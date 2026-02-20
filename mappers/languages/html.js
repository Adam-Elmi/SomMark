import Mapper from "../mapper.js";
const HTML = new Mapper();
const { tag, code, list } = HTML;

HTML.register(["Html", "html"], ({ args }) => {
	if (args) {
		HTML.pageProps.pageTitle = args.title ?? args.title ? args.title : HTML.pageProps.pageTitle;
		HTML.pageProps.charset = args.charset ? args.charset : HTML.pageProps.charset;
		HTML.pageProps.tabIcon.src = args.iconSrc ? args.iconSrc : HTML.pageProps.tabIcon.src;
		HTML.pageProps.tabIcon.type = args.iconType ? args.iconType : HTML.pageProps.tabIcon.type;
		HTML.pageProps.httpEquiv["X-UA-Compatible"] = args.httpEquiv ? args.httpEquiv : HTML.pageProps.httpEquiv["X-UA-Compatible"];
		HTML.pageProps.viewport = args.viewport ? args.viewport : HTML.pageProps.viewport;
	}
	return "";
});

// Block
HTML.register(
	["Block", "block"],
	({ content }) => {
		return content;
	},
	{
		rules: {
			type: "Block"
		}
	}
);
// Section
HTML.register(["Section", "section"], ({ content }) => {
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
	return tag("a")
		.attributes({ href: args[0].trim(), title: args[1] ? args[1].trim() : "" })
		.body(content);
});
// Image
HTML.register(
	["image", "Image"],
	({ args }) => {
		const src = args && args["src"] ? args["src"] : "";
		const alt = args && args["alt"] ? args["alt"] : "";
		const width = args && args["width"] ? args["width"] : "",
			height = args && args["height"] ? args["height"] : "";
		return tag("img").attributes({ src, alt, width, height }).selfClose();
	},
	{
		rules: {
			is_Self_closing: true,
			args: {
				required: ["src"]
			}
		}
	}
);
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
HTML.register(
	"hr",
	() => {
		return tag("hr").selfClose();
	},
	{
		rules: {
			is_Self_closing: true
		}
	}
);
// Todo
HTML.register("todo", ({ args, content }) => {
	const checked = HTML.todo(content);
	return tag("div").body(
		tag("input").attributes({ type: "checkbox", disabled: true, checked }).selfClose() + (args[0] ? args[0] : "")
	);
});

export default HTML;
