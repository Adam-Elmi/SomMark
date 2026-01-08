export async function loadStyle(env = "node", theme = 'atom-one-dark.min', targetPath = "./node_modules/highlight.js/styles/") {
    try {
        if (env === "node" || env === "browser") {
            if (env === "node") {
                const fs = await import("fs/promises");
                const path = await import("path");
                return await fs.readFile(path.join(process.cwd(), targetPath, theme + ".css"), "utf-8");
            } else if (env === "browser") {
                const url = new URL("../" + targetPath + theme + ".css", import.meta.url);
                if (typeof process !== "undefined" && process.versions && process.versions.node) {
                    const fs = await import("fs/promises");
                    return await fs.readFile(url, "utf-8");
                }
                const response = await fetch(url);
                return await response.text();
            }
        } else {
            throw new Error("Invalid environment");
        }
    } catch (error) {
        console.error("Error loading style:", error);
        return "";
    }
}
export default loadStyle;
