import TagBuilder from "../formatter/tag.js";
import MarkdownBuilder from "../formatter/mark.js";
import { highlightCode, cssTheme } from "../lib/highlight.js";
class Mapper {
	#predefinedData;
	#countCalls;
	constructor() {
		this.outputs = [];
		this.md = new MarkdownBuilder();
		this.#predefinedData =
			"  " +
			this.tag("meta").selfClose().attributes({ charset: "UTF-8" }).body() +
			"\n" +
			"  " +
			this.tag("meta").selfClose().attributes({ name: "viewport", content: "width=device-width, initial-scale=1.0" }).body() +
			"\n" +
			"  ";
		this.header = this.#predefinedData;
		this.highlightCode = highlightCode;
		this.cssTheme = cssTheme;
		this.#countCalls = 0;
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

	tag = tagName => {
		return new TagBuilder(tagName);
	};
	setHeader = (options = { title, rawData, resetData: false }) => {
		this.#countCalls++;
		let headerData = "";
		let { title, rawData, resetData } = options;
		if (resetData && this.#countCalls === 1) {
			this.#predefinedData = "";
		}
		if (!title) {
			title = "SomMark Page";
		}
		if (typeof title === "string" && this.#countCalls === 1) {
			this.#predefinedData += this.tag("title").body(title) + "\n";
		}
		if (Array.isArray(rawData) && this.#countCalls === 1) {
			for (const data of rawData) {
				if (typeof data === "string") {
					this.#predefinedData += "  " + data + "\n";
				}
			}
		}
		if (this.#predefinedData) {
			headerData += this.tag("head").body("\n" + this.#predefinedData) + "\n";
		}
		this.header = headerData;
		return headerData;
	};
	code = (args, content) => {
		const value = highlightCode(content, args[0].trim());
		return this.tag("pre").body(
			this.tag("code")
				.attributes({ class: `hljs language-${args[0].trim()}` })
				.body(value)
		);
	}
}
export default Mapper;
