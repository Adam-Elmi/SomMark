import fs from "node:fs/promises";
import SomMark from "./index.js"; 
const rawSource = await fs.readFile("./unformatted.smark", "utf8");

const smark = new SomMark({
	src: rawSource,
	format: "html",
	plugins: [
		{ 
			name: "sommark-format", 
			options: { indentString: "  " } // 2 spaces instead of default "\t"
		}
	]
});

// 1. Run parse() 
await smark.parse();

// 2. Get the formatted string from the "sommark-format" plugin
const formatPlugin = smark.plugins.find(p => p.name === "sommark-format");

console.log("--- Formatted Output ---");
console.log(formatPlugin.formattedSource);
