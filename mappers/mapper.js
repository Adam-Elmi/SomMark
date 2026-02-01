import TagBuilder from "../formatter/tag.js";
import MarkdownBuilder from "../formatter/mark.js";
import { highlightCode, getHighlightTheme, highlightTheme, HighlightThemes } from "../lib/highlight.js";
import escapeHTML from "../helpers/escapeHTML.js";
import loadHighlightStyle from "../helpers/loadHighlightStyle.js";
import loadCss from "../helpers/loadCss.js";

class Mapper {
	#customHeaderContent;
	// ========================================================================== //
	//  Constructor                                                               //
	// ========================================================================== //
	constructor() {
		this.outputs = [];
		this.hasCode = false;
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

		this.highlightCode = highlightCode;
		this.getHighlightTheme = getHighlightTheme;
		this.highlightTheme = highlightTheme;
		this.escapeHTML = escapeHTML;
		this.enable_highlight_style_tag = true;
		this.enable_highlight_link_Style = false;
		this.enable_table_styles = true;
		this.styles = [];
		this.env = "node";
		this.loadStyles = async () => {
			let styles = "";
			if (this.enable_highlight_style_tag) {
				styles = await loadHighlightStyle(this.env, this.highlightTheme);
			}
			const allStyles = (styles ? styles + "\n" : "") + this.styles.join("\n");
			return allStyles;
		};
	}

	// ========================================================================== //
	//  Style Management                                                          //
	// ========================================================================== //
	get HighlightThemes() {
		return this.enable_highlight_link_Style || this.enable_highlight_style_tag ? HighlightThemes : [];
	}

	async loadCss(path) {
		const css = await loadCss(this.env, path);
		if (css && css.trim()) {
			this.addStyle(css);
		}
	}

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
		this.hasCode = true;
		const value = highlightCode(content, args && args[0] ? args[0].trim() : "text");
		return this.tag("pre").body(
			this.tag("code")
				.attributes({ class: `hljs language-${args && args[0] ? args[0].trim() : "text"}` })
				.body(value)
		);
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
		return checked.trim() === "x" ? true : false;
	}
}
export default Mapper;
