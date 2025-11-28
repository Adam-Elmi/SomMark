import Mapping from "../mapping.js";

const html_mapping = new Mapping();
const { tag } = html_mapping;
html_mapping.create("Section", (args, children) => {
	return tag("p").attributes({ class: args[0] }).body(children).render();
});
html_mapping.create(["Bold", "bold", "b", "B"], (args, children) => {
	return tag("strong").body(children).render();
});
export default html_mapping;
