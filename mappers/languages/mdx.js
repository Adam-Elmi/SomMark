import Mapper from "../mapper.js";
import MARKDOWN from "./markdown.js";
const MDX = new Mapper();
MDX.outputs = MARKDOWN.outputs;
export default MDX;
