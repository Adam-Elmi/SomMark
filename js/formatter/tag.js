class TagBuilder {
	constructor(tagName) {
		this.tagName = tagName;
		this.children = "";
		this.attr = [];
		this.render = this.render;
		this.is_self_close = false;
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
		this.is_self_close = true;
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
		return `${lt}${name} ${props}${this.is_self_close ? "" : gt}${this.is_self_close ? "" : inner}${this.is_self_close ? "" : lt}${slash}${this.is_self_close ? "" : name}${gt}`;
	}
}
export default TagBuilder;
