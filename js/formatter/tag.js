class TagBuilder {
	constructor(tagName) {
		this.tagName = tagName;
		this.children = "";
		this.attr = [];
		this.render = this.render;
		this.isInline = false;
	}
	attributes(obj, ...arr) {
		if (obj && obj instanceof Object) {
			Object.entries(obj).forEach(([key, value]) => {
				this.attr.push(`${key}="${value}"`);
			});
		}
		if (arr && Array.isArray(arr)) {
			arr.forEach(key => {
				this.attr.push(`${key}`);
			});
		}
		return this;
	}
	body(nodes) {
		if (nodes) {
			let space = this.children ? " " : "";
			this.children += space + nodes;
		}
		return this;
	}
	selfClose() {
		this.isInline = true;
		return this;
	}
	render() {
		const components = {
			lt: "<",
			gt: ">",
			slash: "/",
			name: this.tagName,
			props: this.attr.join(" "),
			inner: this.children
		};
		const { lt, gt, slash, name, props, inner } = components;
		return `${lt}${name} ${props}${this.isInline ? "" : gt}${this.isInline ? "" : inner}${this.isInline ? "" : lt}${slash}${this.isInline ? "" : name}${gt}`;
	}
}
export default TagBuilder;