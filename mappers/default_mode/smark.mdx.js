import Mapper from "../mapper.js";
import markdown from "./smark.md.js";
const mdx = new Mapper();
mdx.outputs = markdown.outputs;
export default mdx;
