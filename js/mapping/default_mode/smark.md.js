import Mapping from "../mapping.js";
const markdown = new Mapping();
const { md } = markdown;
// Headings
markdown.create("Heading", (args) => {
  return md.heading(args[1], args[0]);
});
// Inline Headings
markdown.create("h1", (_, children) => {
  return md.heading(children, 1);
});
markdown.create("h2", (_, children) => {
  return md.heading(children, 2);
});
markdown.create("h3", (_, children) => {
  return md.heading(children, 3);
});
markdown.create("h4", (_, children) => {
  return md.heading(children, 4);
});
markdown.create("h5", (_, children) => {
  return md.heading(children, 5);
});
markdown.create("h6", (_, children) => {
  return md.heading(children, 6);
});
// Bold
markdown.create(["bold", "b"], (_, children) => {
	return md.bold(children);
});
// Italic
markdown.create(["italic", "i"], (_, children) => {
	return md.italic(children);
});
// Bold and Italic (emphasis)
markdown.create(["emphasis", "e"], (_, children) => {
	return md.emphasis(children);
});
// Code Blocks
markdown.create(["code", "codeBlock"], (args, children) => {
	return md.codeBlock(children, args[0]);
});
// Link
markdown.create("link", (args, children) => {
	return md.url("link", children, args[0], args[1]);
});
// Image
markdown.create("image", (args, children) => {
	return md.url("image", children, args[0], args[1]);
});
// Horizontal Rule
markdown.create(["horizontal", "h"], (_, children) => {
	return md.horizontal(children);
});
// Escape Characters
markdown.create(["escape", "s"], (_, children) => {
	return md.escape(children);
});
export default markdown;
