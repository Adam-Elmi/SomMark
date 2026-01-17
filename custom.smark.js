import Mapper from "./mappers/mapper.js";

const custom_html = new Mapper();
const { tag } = custom_html;

custom_html.create("Hello", ({args, content}) => {
	return tag("Text").body(content);
});

export default custom_html;