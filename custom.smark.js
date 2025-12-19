import Mapping from "./mapping/mapping.js";

const custom_html = new Mapping();
const { tag } = custom_html;

custom_html.create("Hello", (args, children) => {
	return tag("p").body(children);
});

export default custom_html;