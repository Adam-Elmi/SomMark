import Mapping from "../mapping.js";
const html_mapping = new Mapping();
const { tag } = html_mapping;
html_mapping.create("Section", (args, children) => {
	return tag("section").body(children).render();
});
export default html_mapping;
