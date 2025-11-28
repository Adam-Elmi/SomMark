import Mapping from "../mapping.js";
const html = new Mapping();
const { tag } = html;
html.create("Section", (args, children) => {
	return tag("section").body(children).render();
});
export default html;
