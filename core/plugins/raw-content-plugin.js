/**
 * Raw Content Plugin
 * Lets you write raw code or text inside special blocks without it being processed by SomMark.
 */
const RawContentPlugin = {
	name: "raw-content",
	type: ["preprocessor", "on-ast"],
	author: "Adam-Elmi",
	description: "Lets you write raw code or text inside special blocks without it being processed by SomMark.",
	scope: "top-level",
	options: {
		// ========================================================================== //
		//  Target blocks to treat as raw                                           //
		// ========================================================================== //
		targetBlocks: ["mdx", "raw"]
	},
	// ========================================================================== //
	//  1. Preprocessing phase (escaping raw blocks)                             //
	// ========================================================================== //
	beforeLex(src) {
		let processed = src;
		const options = this.options || {};
		const targetBlocks = options.targetBlocks || ["mdx", "raw"];

		targetBlocks.forEach(tag => {
			const regex = new RegExp(`\\[${tag}([^ \\]]*|\\s*=[^\\]]*)?\\]([\\s\\S]*?)\\[end\\]`, "g");
			processed = processed.replace(regex, (match, argsPart, content) => {
				const escapedContent = content
					.replace(/\\/g, "\\\\")
					.replace(/\[/g, "\\[")
					.replace(/\]/g, "\\]")
					.replace(/@_/g, "\\@_")
					.replace(/_@/g, "\\_@")
					.replace(/={1}/g, "\\=")
					.replace(/:/g, "\\:")
					.replace(/#/g, "\\#")
					.replace(/,/g, "\\,")
					.replace(/\(/g, "\\(")
					.replace(/\)/g, "\\)")
					.replace(/ /g, "\u200B ")
					.replace(/\t/g, "\u200B\t")
					.replace(/\n/g, "\u200B\n")
					.replace(/\r/g, "\u200B\r");
				return `[${tag}${argsPart || ""}]${escapedContent}[end]`;
			});
		});
		return processed;
	},
	// ========================================================================== //
	//  2. AST Transformation phase (unescaping whitespace)                      //
	// ========================================================================== //
	onAst(ast) {
		const options = this.options || {};
		const targetBlocks = (options.targetBlocks || ["mdx", "raw", "code"]).map(t => t.toLowerCase());

		const processNodes = (nodes) => {
			if (!Array.isArray(nodes)) return;
			nodes.forEach(node => {
				if (node.type === "Block" && targetBlocks.includes(node.id.toLowerCase())) {
					if (node.body) {
						node.body.forEach(child => {
							if (child.type === "Text") {
								child.text = child.text.replace(/\u200B/g, "");
							}
						});
					}
				}
				if (node.body) processNodes(node.body);
			});
		};

		const root = Array.isArray(ast) ? ast : [ast];
		processNodes(root);
		return ast;
	}
};

export default RawContentPlugin;
