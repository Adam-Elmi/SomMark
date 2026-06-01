import Mapper from "../mapper.js";

/**
 * The Text Mapper used for plain-text extraction.
 */
const TEXT = Mapper.define({
	options: {
		trimAndWrapBlocks: false
	},

	/**
	 * Comments are discarded in plain-text output.
	 */
	comment() {
		return "";
	},

	/**
	 * Comment blocks are discarded in plain-text output.
	 */
	commentBlock() {
		return "";
	},

	/**
	 * Runtime logic is discarded in plain-text output.
	 */
	runtimeLogic() {
		return "";
	},

	/**
	 * Returns plain text literally.
	 */
	text(text) {
		return text;
	},

	/**
	 * Returns inline text literally.
	 */
	inlineText(text) {
		return text;
	},

	/**
	 * Returns at-block body text literally.
	 */
	atBlockBody(text) {
		return text;
	},

	/**
	 * Fallback for all tags - extracts inner content.
	 */
	getUnknownTag(node) {
		const isBlock = node.type === "Block" || node.type === "ForEach";
		return {
			render: ({ content }) => content,
			options: {
				type: isBlock ? "Block" : (node.type === "AtBlock" ? "AtBlock" : "Inline")
			}
		};
	}
});

export default TEXT;
