import TagBuilder from "../formatter/tag.js";
import MarkdownBuilder from "../formatter/mark.js";
import escapeHTML from "../helpers/escapeHTML.js";
import atomOneDark from "../helpers/defaultTheme.js";
import loadCss from "../helpers/loadCss.js";
import { sommarkError } from "../core/errors.js";

class Mapper {
	#customHeaderContent;
	// ========================================================================== //
	//  Constructor                                                               //
	// ========================================================================== //
	constructor() {
		this.outputs = [];
		this.enable_highlightTheme = true;
		this.md = new MarkdownBuilder();

		this.pageProps = {
			pageTitle: "SomMark Page",
			tabIcon: {
				type: "image/x-icon",
				src: ""
			},
			charset: "UTF-8",
			viewport: "width=device-width, initial-scale=1.0",
			httpEquiv: { "X-UA-Compatible": "IE=edge" }
		};

		this.#customHeaderContent = "";

		this.highlightCode = null;
		this.escapeHTML = escapeHTML;
		this.styles = [];
		this.env = "node";
		// Theme Registry
		this.themes = {
			"sommark-default": "pre{padding: 5px; background-color: #f6f8fa; font-family: monospace}",
			"atom-one-dark": atomOneDark
		};
		this.currentTheme = this.highlightCode && typeof this.highlightCode === "function" ? "atom-one-dark" : "sommark-default";
		this.enable_table_styles = true;
	}

	registerHighlightTheme(themes) {
		this.themes = { ...this.themes, ...themes };
	}

	selectHighlightTheme(themeName) {
		if (this.themes[themeName]) {
			this.currentTheme = themeName;
		} else {
			console.warn(`Theme '${themeName}' not found in registry.`);
		}
	}

	// ========================================================================== //
	//  Style Management                                                          //
	// ========================================================================== //

	addStyle(css) {
		if (typeof css === "object" && css !== null) {
			let styleString = "";
			for (const [selector, rules] of Object.entries(css)) {
				let rulesString = "";
				for (const [prop, value] of Object.entries(rules)) {
					rulesString += `${prop}:${value};`;
				}
				styleString += `${selector}{${rulesString}}`;
			}
			css = styleString;
		}

		if (typeof css === "string" && css.trim() && !this.styles.includes(css.trim())) {
			this.styles.push(css.trim());
		}
	}

	loadCss = async (env = this.env, filePath) => {
		const css = await loadCss(env, filePath);
		this.addStyle(css);
	};

	// ========================================================================== //
	//  Header Generation                                                         //
	// ========================================================================== //
	get header() {
		const { pageTitle, tabIcon, charset, viewport, httpEquiv } = this.pageProps;

		let metas = "";
		metas += `${this.tag("meta").attributes({ charset }).selfClose()}\n`;
		metas += `${this.tag("meta").attributes({ name: "viewport", content: viewport }).selfClose()}\n`;

		for (const [key, value] of Object.entries(httpEquiv)) {
			metas += `${this.tag("meta").attributes({ "http-equiv": key, content: value }).selfClose()}\n`;
		}

		metas += `${this.tag("title").body(pageTitle)}\n`;

		if (tabIcon && tabIcon.src) {
			metas += `${this.tag("link").attributes({ rel: "icon", type: tabIcon.type, href: tabIcon.src }).selfClose()}\n`;
		}

		return metas + this.#customHeaderContent;
	}

	// ========================================================================== //
	//  Mappings                                                                  //
	// ========================================================================== //
	register = (id, renderOutput, options = { escape: true }) => {
		if (!id || !renderOutput) {
			throw new Error("Expected arguments are not defined");
		}

		if (typeof id !== "string" && !Array.isArray(id)) {
			throw new TypeError("argument 'id' expected to be a string or array");
		}

		if (typeof renderOutput !== "function") {
			throw new TypeError("argument 'renderOutput' expected to be a function");
		}
		const render = data => {
			if (
				typeof data !== "object" ||
				data === null ||
				!Object.prototype.hasOwnProperty.call(data, "args") ||
				!Object.prototype.hasOwnProperty.call(data, "content")
			) {
				throw new TypeError("render expects an object with properties { args, content }");
			}
			return renderOutput(data);
		};

		this.outputs.push({ id, render, options });
	};
	removeOutput = id => {
		this.outputs = this.outputs.filter(output => {
			if (Array.isArray(output.id)) {
				return !output.id.some(singleId => singleId === id);
			} else {
				return output.id !== id;
			}
		});
	};

	get = id => {
		for (const output of this.outputs) {
			if (Array.isArray(output.id)) {
				if (output.id.some(singleId => singleId === id)) return output;
			} else if (output.id === id) {
				return output;
			}
		}
		return null;
	};

	// ========================================================================== //
	//  Helpers                                                                   //
	// ========================================================================== //
	tag = tagName => {
		return new TagBuilder(tagName);
	};
	setHeader = rawData => {
		if (Array.isArray(rawData)) {
			for (const data of rawData) {
				if (typeof data === "string") {
					this.#customHeaderContent += data + "\n";
				}
			}
		}
	};
	// ========================================================================== //
	//  Formatters                                                                //
	// ========================================================================== //
	code = (args, content) => {
		const lang = this.safeArg(args, 0, "lang", null, null, "text");
		const code = content || "";
		let value = content;
		const code_element = this.tag("code");
		if (this.highlightCode && typeof this.highlightCode === "function") {
			code_element.attributes({ class: `hljs language-${lang}` });
			value = this.highlightCode(code, lang);
		}
		return this.tag("pre").body(code_element.body(value));
	};
	htmlTable = (data, headers, defaultStyle = true) => {
		const isAddedStyle = this.styles.some(s => s.includes(".sommark-table"));
		if (!data) return "";

		const css = `
.sommark-table{border-collapse:collapse;width:100%;border:1px solid #e1e1e1}
.sommark-table th,.sommark-table td{border:1px solid #e1e1e1;padding:6px 8px;text-align:left}
.sommark-table th{background:#f6f8fa;font-weight:600}
.sommark-table tr:nth-child(even){background:#fbfbfb}`;

		if (defaultStyle && this.enable_table_styles && !isAddedStyle) {
			this.addStyle(css.trim());
		}

		if (typeof data === "string") {
			data = data.split(/\r?\n/);
		} else if (!Array.isArray(data) || data.length === 0) {
			return "";
		}

		let tableHTML = `<table class="sommark-table">\n<thead>\n<tr>`;
		for (const header of headers) {
			tableHTML += `<th>${this.escapeHTML(header)}</th>`;
		}
		tableHTML += "</tr>\n</thead>\n<tbody>\n";

		for (const row of data) {
			if (!row.trim()) continue;
			const rowData = row.split(",").map(cell => cell.trim());
			tableHTML += "<tr>";
			for (const cell of rowData) {
				tableHTML += `<td>${this.escapeHTML(cell.trim())}</td>`;
			}
			tableHTML += "</tr>\n";
		}

		tableHTML += "</tbody>\n</table>";
		return tableHTML;
	};
	parseList = (data, indentSize = 2) => {
		if (typeof data === "string") {
			data = data.split("\n");
		}
		const root = { level: -1, children: [] };
		const stack = [root];

		const getLevel = line => {
			const spaces = line.match(/^\s*/)[0].length;
			return Math.floor(spaces / indentSize);
		};

		for (const raw of data) {
			if (!raw.trim()) continue;
			const level = getLevel(raw);
			const text = raw.trim();

			const node = { text, children: [] };

			while (stack.length && stack[stack.length - 1].level >= level) {
				stack.pop();
			}

			stack[stack.length - 1].children.push(node);
			stack.push({ ...node, level });
		}

		return root.children;
	};
	list = (data, as = "ul") => {
		const nodes = this.parseList(data);
		if (!Array.isArray(nodes) || nodes.length === 0) return "";

		const tag = as === "ol" ? "ol" : "ul";

		const renderItems = items => {
			let html = `<${tag}>`;

			for (const item of items) {
				html += `<li>`;

				html += this.escapeHTML(item.text);
				if (item.children && item.children.length > 0) {
					html += renderItems(item.children);
				}

				html += `</li>`;
			}

			html += `</${tag}>`;
			return html;
		};

		return renderItems(nodes);
	};
	// ========================================================================== //
	//  Utilities                                                                 //
	// ========================================================================== //
	includesId = ids => {
		try {
			if (!Array.isArray(ids) || ids.length === 0) {
				return false;
			}

			if (!this.outputs || !Array.isArray(this.outputs)) {
				return false;
			}

			const searchSet = new Set(ids);

			for (const output of this.outputs) {
				if (!output || !output.id) {
					continue;
				}

				if (Array.isArray(output.id)) {
					if (output.id.some(id => searchSet.has(id))) {
						return true;
					}
				} else if (typeof output.id === "string" || typeof output.id === "number") {
					if (searchSet.has(output.id)) {
						return true;
					}
				}
			}

			return false;
		} catch (error) {
			console.error(error);
			return false;
		}
	};
	todo(checked = false) {
		return checked.trim() === "x" || checked.trim().toLowerCase() === "done" ? true : false;
	}
	safeArg = (args, index, key, type = null, setType = null, fallBack = null) => {
		if (!Array.isArray(args)) {
			sommarkError([`{line}<$red:TypeError:$> <$yellow:args must be an array$>{line}`]);
		}

		if (index === undefined && key === undefined) {
			sommarkError([`{line}<$red:ReferenceError:> <$yellow:At least one of 'index' or 'key' must be provided$>{line}`]);
		}

		if (index !== undefined && typeof index !== "number") {
			sommarkError([`{line}<$red:TypeError:$> <$yellow:index must be a number$>{line}`]);
		}

		if (key !== undefined && typeof key !== "string") {
			sommarkError([`{line}<$red:TypeError:$> <$yellow:key must be a string$>{line}`]);
		}

		if (type !== null && typeof type !== "string") {
			sommarkError([`{line}<$red:TypeError:$> <$yellow:type must be a string$>{line}`]);
		}

		if (setType !== null && typeof setType !== "function") {
			sommarkError([`{line}<$red:TypeError:$> <$yellow:setType must be a function$>{line}`]);
		}

		const validate = value => {
			if (value === undefined) return false;
			if (!type) return true;
			const evaluated = setType ? setType(value) : value;
			return typeof evaluated === type;
		};

		if (index !== undefined && validate(args[index])) {
			return args[index];
		}

		if (key !== undefined && validate(args[key])) {
			return args[key];
		}

		return fallBack;
	};
}
export default Mapper;
