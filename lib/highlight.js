import hljs from "highlight.js";

const cssTheme = theme => `<link rel="stylesheet" href="node_modules/highlight.js/styles/${theme}.css">`;

export function highlightCode(code, language = "plaintext", theme = "atom-one-dark") {
	if (!hljs.getLanguage(language)) {
		language = "plaintext";
	}
	return [hljs.highlight(code, { language }).value, cssTheme(theme)];
}
