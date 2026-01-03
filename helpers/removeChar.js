function removeWhiteSpaces(text, mode = "all") {
	if (text == null) return "";
	text = String(text);
	switch (mode) {
		case "trim":
			return text.trim();
		case "collapse":
			return text.replace(/\s+/g, " ").trim();
		case "all":
		default:
			return text.replace(/\s+/g, "");
	}
}

function removeNewline(text) {
	if (text == null) return "";
	return String(text).replace(/[\r\n]+/g, "");
}
export { removeWhiteSpaces, removeNewline };