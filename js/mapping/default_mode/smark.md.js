import Mapping from "../mapping.js";
const markdown = new Mapping();
const { md } = markdown;
markdown.create("Heading", (args, children) => {
	return md.heading(children, args[0]);
});
export default markdown;
