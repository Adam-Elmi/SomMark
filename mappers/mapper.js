import TagBuilder from "../formatter/tag.js";
import MarkdownBuilder from "../formatter/mark.js";
import { highlightCode } from "../lib/highlight.js";
class Mapping {
	#predefinedData;
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
			"  " +
			this.tag("title").body("SomMark Page") +
			"\n";
		this.header = this.#predefinedData;
		this.highlightCode = highlightCode;
	}
	create(id, renderOutput) {
		if (id && renderOutput) {
			if (typeof id !== "string" && !Array.isArray(id)) {
				throw new Error("argument 'id' expected to be a string or array");
			}
			if (typeof renderOutput !== "function") {
				throw new Error("argument 'renderOutput' expected to be a function");
			}
			this.outputs.push({
				id,
				renderOutput
			});
		} else {
			throw new Error("Expected arguments are not defined");
		}
	}
	tag = tagName => {
		return new TagBuilder(tagName);
	};
	setHeader = (customHeader = [], options = { title, elements, rawData, resetData: false }) => {
		let headerData = "";
		let { title, elements, rawData, resetData } = options;
		if (resetData) {
			this.#predefinedData = "";
		}
		if (!title) {
			title = "SomMark";
		}
		if (typeof title === "string") {
			// console.log(title);
		}
		if (Array.isArray(elements)) {
			this.#getElements(elements);
		}
		if (Array.isArray(rawData)) {
			for (const data of rawData) {
				if (typeof data === "string") {
					this.#predefinedData += "\n" + "  " + data + "\n";
				}
			}
		}
		if (this.#predefinedData) {
			headerData += this.tag("head").body("\n" + this.#predefinedData) + "\n";
		}
		this.header = headerData;
		return headerData;
	};
	#getElements(elements) {
		for (let i = 0; i < elements.length; i++) {
			let element = elements[i];
			if (element instanceof Object) {
				let propsLen = Object.keys(element);
				if (propsLen.length > 0 && element.hasOwnProperty("tagName")) {
					const { tagName, text, ...allProps } = element;
					this.#predefinedData +=
						"  " +
						this.tag(tagName)
							.attributes(allProps)
							.body(text ? text : "") +
						(i === elements.length - 1 ? "" : "\n");
				}
			}
		}
	}
}
export default Mapping;
