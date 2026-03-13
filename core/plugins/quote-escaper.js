/**
 * Quote Escaper Plugin for SomMark
 * 
 * Scope: arguments
 * 
 * Automatically escapes special characters within double quotes in arguments.
 */
const QuoteEscaper = {
	name: "quote-escaper",
	type: "preprocessor",
	scope: "arguments",
	beforeLex(args) {
		return args.replace(/"([^"]*)"/g, (match, content) => {
			const options = this.options || {};

			const escapedContent = content
				.replace(/\\/g, "\\\\")
				.replace(/\[/g, "\\[")
				.replace(/\]/g, "\\]")
				.replace(/=/g, "\\=")
				.replace(/->/g, "\\->")
				.replace(/\(/g, "\\(")
				.replace(/\)/g, "\\)")
				.replace(/@_/g, "\\@_")
				.replace(/_@/g, "\\_@")
				.replace(/:/g, "\\:")
				.replace(/,/g, "\\,")
				.replace(/;/g, "\\;")
				.replace(/#/g, "\\#");
			return `"${escapedContent}"`;
		});
	}
};

export default QuoteEscaper;
