import SomMark, { resolveBaseDir, renderCompiledHTML } from "../index.browser.js";

const status = document.getElementById("status");
const output = document.getElementById("output");

try {
    const src = await fetch("./templates/main.smark").then(r => r.text());

    const compiler = new SomMark({
        src,
        format: "html",
        baseDir: resolveBaseDir("./templates/"),
    });

    const html = await compiler.transpile();
    renderCompiledHTML(output, html);

    status.textContent = "Compiled successfully ✓";
    status.style.color = "green";
} catch (err) {
    status.textContent = "Compilation failed ✗";
    status.style.color = "red";
    output.textContent = err.message;
    console.error(err);
}
