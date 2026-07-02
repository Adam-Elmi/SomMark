import SomMark, { setDefaultFs, setDefaultCwd, setDefaultEnv, setDefaultAsyncLocalStorage } from "./index.shared.js";
import { AsyncLocalStorage } from "./async-hooks.js";
export * from "./index.shared.js";

setDefaultFs(null);
setDefaultCwd("/");
setDefaultEnv(null);
setDefaultAsyncLocalStorage(AsyncLocalStorage);

/**
 * Resolves a relative path into a full URL using the current document location.
 * Use this to set `baseDir` when loading .smark modules via fetch in the browser.
 *
 * @param {string} relativePath - Path relative to the HTML document (e.g. "./templates/").
 * @returns {string} Absolute URL string suitable for use as `baseDir`.
 *
 * @example
 * import SomMark, { resolveBaseDir } from "sommark/browser";
 * const engine = new SomMark({ src, format: "html", baseDir: resolveBaseDir("./templates/") });
 */
export function resolveBaseDir(relativePath = "./") {
    if (typeof document === "undefined") {
        throw new Error(
            "[SomMark] resolveBaseDir() can only be called in a browser environment.\n" +
            "In Node.js, pass a file path directly as 'baseDir' instead."
        );
    }

    if (typeof relativePath !== "string" || relativePath.trim() === "") {
        throw new Error(
            "[SomMark] resolveBaseDir() expects a non-empty string path, " +
            `but received: ${JSON.stringify(relativePath)}`
        );
    }

    try {
        return new URL(relativePath, document.baseURI).href;
    } catch (err) {
        throw new Error(
            `[SomMark] resolveBaseDir() could not resolve path '${relativePath}' ` +
            `against document URL '${document.baseURI}'.\n${err.message}`
        );
    }
}

/**
 * Injects compiled HTML into a container and activates any <script> tags inside it.
 * Browsers intentionally skip scripts inserted via innerHTML — this re-creates each
 * one as a live DOM element so they execute normally.
 *
 * @param {HTMLElement} container - The element to render into.
 * @param {string} html - The compiled HTML string.
 *
 * @example
 * import SomMark, { renderCompiledHTML } from "sommark/browser";
 * const html = await new SomMark({ src, format: "html" }).transpile();
 * renderCompiledHTML(document.getElementById("output"), html);
 */
export function renderCompiledHTML(container, html) {
    if (typeof document === "undefined") {
        throw new Error(
            "[SomMark] renderCompiledHTML() can only be called in a browser environment."
        );
    }
    if (!(container instanceof HTMLElement)) {
        throw new TypeError(
            "[SomMark] renderCompiledHTML() expects an HTMLElement as the first argument, " +
            `but received: ${Object.prototype.toString.call(container)}`
        );
    }
    if (typeof html !== "string") {
        throw new TypeError(
            "[SomMark] renderCompiledHTML() expects a string as the second argument, " +
            `but received: ${Object.prototype.toString.call(html)}`
        );
    }

    container.innerHTML = html;

    for (const inertScript of container.querySelectorAll("script")) {
        const liveScript = document.createElement("script");
        for (const { name, value } of inertScript.attributes) {
            liveScript.setAttribute(name, value);
        }
        liveScript.textContent = inertScript.textContent;
        inertScript.replaceWith(liveScript);
    }
}

export default SomMark;
