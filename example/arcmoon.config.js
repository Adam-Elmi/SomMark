// ###################
// ArcMoon config for the example
// ###################
export default {
	importAliases: { "@": "./src" },   // [import = X: "@/components/X.arcm" !]
	bundle: ["svg-tag-names"],         // npm packages allowed in runtime code
	outDir: "./dist",                  // "arcmoon build pages" writes here
	externalScripts: false,            // true: JS in dist/assets/*.js, shared chunks
	externalStyles: false              // true: CSS in dist/assets/*.css
};
