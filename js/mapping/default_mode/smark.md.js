import Mapping from "../mapping.js";

const markdown_mapping = new Mapping();
const { md } = markdown_mapping;
markdown_mapping.create("Heading", (args, children) => {
	return md.heading(children, args[0]);
});
export default markdown_mapping;
