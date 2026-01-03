import TagBuilder from "../formatter/tag.js";
import MarkdownBuilder from "../formatter/mark.js";
import { highlightCode, cssTheme } from "../lib/highlight.js";
import escapeHTML from "../helpers/escapeHTML.js";
class Mapper {
	#predefinedHeaderData;
	#customElements;
	constructor() {
		this.outputs = [];
		this.md = new MarkdownBuilder();
		this.title = "SomMark Page";
		this.#predefinedHeaderData =
			"  " +
			this.tag("meta").attributes({ charset: "UTF-8" }).selfClose() +
			"\n" +
			"  " +
			this.tag("meta").attributes({ name: "viewport", content: "width=device-width, initial-scale=1.0" }).selfClose() +
			"\n" +
			"  " + this.tag("meta").attributes({ "http-equiv": "X-UA-Compatible", content: "IE=edge" }).selfClose() +
			"\n" + "  " + this.tag("title").body(this.title) + "\n";
		this.header = this.#predefinedHeaderData + "\n" + "";
		this.#customElements = "";
		this.highlightCode = highlightCode;
		this.cssTheme = cssTheme;
		this.escapeHTML = escapeHTML;
	}
	create(id, renderOutput) {
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

		this.outputs.push({ id, render });
	}
	removeOutput(id) {
		this.outputs = this.outputs.filter(output => {
			if (Array.isArray(output.id)) {
				return !output.id.some(singleId => singleId === id);
			} else {
				return output.id !== id;
			}
		});
	}

	tag = tagName => {
		return new TagBuilder(tagName);
	};
	setHeader = (rawData) => {
		this.#customElements = "";
		if (Array.isArray(rawData)) {
			for (const data of rawData) {
				if (typeof data === "string") {
					this.#customElements += data + "\n";
				}
			}
		}
		this.header += this.#customElements;
	};
	code = (args, content) => {
		const value = highlightCode(content, args[0].trim());
		return this.tag("pre").body(
			this.tag("code")
				.attributes({ class: `hljs language-${args[0].trim()}` })
				.body(value)
		);
	};
	htmlTable = (data, headers, defaultStyle = true) => {
		const isAddedStyle = this.header.includes(".sommark-table");
		if (!data) return "";

		const css = `<style>
.sommark-table{border-collapse:collapse;width:100%;border:1px solid #e1e1e1}
.sommark-table th,.sommark-table td{border:1px solid #e1e1e1;padding:6px 8px;text-align:left}
.sommark-table th{background:#f6f8fa;font-weight:600}
.sommark-table tr:nth-child(even){background:#fbfbfb}
</style>\n`;

		if (defaultStyle && !isAddedStyle) {
			try {
				this.setHeader([css]);
			} catch (e) {
				console.error("Error setting table CSS in header:", e);
			}
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
			const rowData = row.split(",").map(cell => cell.trim());
			tableHTML += "<tr>";
			for (const cell of rowData) {
				tableHTML += `<td>${this.escapeHTML(cell.replace("-", "").trim())}</td>`;
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
			const level = getLevel(raw);
			const text = raw
				.split(" ")
				.map(value => {
					if (value[0] === "-") {
						value = value.slice(1);
					}
					return value;
				})
				.join(" ")
				.trimStart();

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
}
export default Mapper;
