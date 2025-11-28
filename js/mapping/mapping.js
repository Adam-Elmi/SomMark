import TagBuilder from "../formatter/tag.js";
import Markdown from "../formatter/mark.js";
class Mapping {
	constructor() {
		this.outputs = [];
    this.md = new Markdown();
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
	tag(tagName) {
		return new TagBuilder(tagName);
	}
}
export default Mapping;
