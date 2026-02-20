import Mapper from "../mapper.js";
const HTML = new Mapper();
const { tag, code, list, safeArg } = HTML;

HTML.register(["Html", "html"], ({ args }) => {
	HTML.pageProps.pageTitle = safeArg(args, undefined, "title", null, null, HTML.pageProps.pageTitle);
	HTML.pageProps.charset = safeArg(args, undefined, "charset", null, null, HTML.pageProps.charset);
	HTML.pageProps.tabIcon.src = safeArg(args, undefined, "iconSrc", null, null, HTML.pageProps.tabIcon.src);
	HTML.pageProps.tabIcon.type = safeArg(args, undefined, "iconType", null, null, HTML.pageProps.tabIcon.type);
	HTML.pageProps.httpEquiv["X-UA-Compatible"] = safeArg(
		args,
		undefined,
		"httpEquiv",
		null,
		null,
		HTML.pageProps.httpEquiv["X-UA-Compatible"]
	);
	HTML.pageProps.viewport = safeArg(args, undefined, "viewport", null, null, HTML.pageProps.viewport);
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
// Emphasis
HTML.register(["emphasis", "e"], ({ content }) => {
	return tag("span").attributes({ style: "font-weight:bold; font-style: italic;" }).body(content);
});
// Colored Text
HTML.register("color", ({ args, content }) => {
	const color = safeArg(args, 0, undefined, null, null, "none");
	return tag("span")
		.attributes({ style: `color:${color}` })
		.body(content);
});
// Link
HTML.register("link", ({ args, content }) => {
	const url = safeArg(args, 0, "url", null, null, "");
	const title = safeArg(args, 1, "title", null, null, "");
	return tag("a").attributes({ href: url.trim(), title: title.trim() }).body(content);
});
// Image
HTML.register(
	["image", "Image"],
	({ args }) => {
		const src = safeArg(args, undefined, "src", null, null, "");
		const alt = safeArg(args, undefined, "alt", null, null, "");
		const width = safeArg(args, undefined, "width", null, null, "");
		const height = safeArg(args, undefined, "height", null, null, "");
		return tag("img").attributes({ src, alt, width, height }).selfClose();
	},
	{
		rules: {
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
	const task = safeArg(args, 0, undefined, null, null, "");
	return tag("div").body(tag("input").attributes({ type: "checkbox", disabled: true, checked }).selfClose() + task);
});

export default HTML;
