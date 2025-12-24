import Mapper from "../mapper.js";
const markdown = new Mapper();
const { md } = markdown;
// Block
markdown.create("Block", ({args, content}) => {
  return content;
});
// Headings
markdown.create("Heading", ({args, content}) => {
  console.log(args, content)
	return md.heading(args[1], args[0]);
});
// Inline Headings
markdown.create("h1", ({args, content}) => {
	return md.heading(content, 1);
});
markdown.create("h2", ({args, content}) => {
	return md.heading(content, 2);
});
markdown.create("h3", ({args, content}) => {
	return md.heading(content, 3);
});
markdown.create("h4", ({args, content}) => {
	return md.heading(content, 4);
});
markdown.create("h5", ({args, content}) => {
	return md.heading(content, 5);
});
markdown.create("h6", ({args, content}) => {
	return md.heading(content, 6);
});
// Bold
markdown.create(["bold", "b"], ({args, content}) => {
	return md.bold(content);
});
// Italic
markdown.create(["italic", "i"], ({args, content}) => {
	return md.italic(content);
});
// Bold and Italic (emphasis)
markdown.create(["emphasis", "e"], ({args, content}) => {
	return md.emphasis(content);
});
// Code Blocks
markdown.create(["code", "codeBlock"], ({args, content}) => {
	return md.codeBlock(content, args[0]);
});
// Link
markdown.create("link", ({args, content}) => {
	return md.url("link", content, args[0], args[1]);
});
// Image
markdown.create("image", ({args, content}) => {
	return md.url("image", content, args[0], args[1]);
});
// Horizontal Rule
markdown.create(["horizontal", "h"], ({args, content}) => {
	return md.horizontal(content);
});
// Escape Characters
markdown.create(["escape", "s"], ({args, content}) => {
	return md.escape(content);
});
// Table
markdown.create("table", ({args, content}) => {
	return md.table(args, content.split("\n"));
});
export default markdown;
