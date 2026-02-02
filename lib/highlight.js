import hljs from "highlight.js";

function highlightCode(code, language = "plaintext") {
    if (!hljs.getLanguage(language)) {
        language = "plaintext";
    }
    return hljs.highlight(code, { language }).value;
}
export {
    highlightCode,
};
