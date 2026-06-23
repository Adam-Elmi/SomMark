/**
 * CLI Constants
 * Supported options and format-to-extension mappings.
 */

/** @type {Array<string>} List of recognized CLI flags and commands. */
export const options = ["-v", "--version", "-h", "--help", "--html", "--markdown", "--mdx", "--json", "--jsonc", "--text", "--xml", "--csv", "--toml", "--yaml", "--print", "-p", "--lex", "--parse", "list", "bundle"];

/** @type {Object<string, string>} Map of output formats to their respective file extensions. */
export const extensions = {
	text: "txt",
	html: "html",
	markdown: "md",
	mdx: "mdx",
	json: "json",
	jsonc: "jsonc",
	xml: "xml",
	csv: "csv",
	toml: "toml",
	yaml: "yaml"
};
