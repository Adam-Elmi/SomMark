import hljs from "highlight.js";

export function highlightCode(code, language = "plaintext") {
	if (!hljs.getLanguage(language)) {
		language = "plaintext";
	}
	return hljs.highlight(code, { language }).value;
}

export function cssTheme(theme = "atom-one-dark") {
	return `<link rel="stylesheet" href="node_modules/highlight.js/styles/${theme}.css">`;
}
