import TagBuilder from "../formatter/tag.js";
class Mapping {
	constructor() {
		this.outputs = [];
	}
	create(id, output) {
		if (id && output) {
			if (typeof id !== "string") {
				throw new Error("argument 'id' expected to be a string");
			}
			if (typeof output !== "function") {
				throw new Error("argument 'output' expected to be a function");
			}
			this.outputs.push({
				id,
				output
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
