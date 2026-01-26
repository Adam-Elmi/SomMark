import fs from "node:fs/promises";
import SomMark from "./index.js";

const buffer = await fs.readFile("./example.smark");
const file_content = buffer.toString();
let smark = new SomMark({ src: file_content, format: "md", includeDocument: false });

// console.log(JSON.stringify(smark.parse(), null, 2));
// console.log(smark.lex());
console.log(smark.transpile());


// Input: "title:SomMark, description:Docs"

// const args = [
//   "SomMark",  // Index 0 (Raw value)
//   "Docs"      // Index 1 (Raw value)
// ];

// // The Parser ALSO attaches the keys map to the same object:
// args["title"] = "SomMark";
// args["description"] = "Docs";

// // Now both work:
// console.log(Object.entries(args));       // "SomMark"
// console.log(args["title"]); // "SomMark"