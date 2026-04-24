/**
 * Removes or collapses whitespace in a string based on the specified mode.
 * 
 * @param {string} text - The source string.
 * @param {'all'|'trim'|'collapse'} [mode="all"] - The whitespace removal strategy.
 * @returns {string} - The processed string.
 */
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

/**
 * Removes all newline characters (\r, \n) from a string.
 * @param {string} text - The source string.
 * @returns {string} - The processed string without newlines.
 */
function removeNewline(text) {
        if (text == null) return "";
        return String(text).replace(/[\r\n]+/g, "");
}

export { removeWhiteSpaces, removeNewline };