export async function loadCss(env, filePath) {
    if (!env) {
        env = typeof window !== "undefined" && typeof window.document !== "undefined" ? "browser" : "node";
    }

    try {
        if (env === "node") {
            const fs = await import("fs/promises");
            const path = await import("path");
            const stylePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

            try {
                await fs.access(stylePath);
            } catch (e) {
                console.error(`CSS file not found: ${stylePath}`);
                return "";
            }
            if (path.parse(stylePath).ext !== ".css") {
                console.error(`Invalid CSS file: ${stylePath}`);
                return "";
            }
            const content = await fs.readFile(stylePath, "utf-8");
            return content || "";
        } else if (env === "browser") {
            const response = await fetch(filePath);
            const fileExtension = filePath.split(".").pop();
            if (fileExtension !== "css") {
                console.error(`Invalid CSS file: ${filePath}`);
                return "";
            }
            if (!response.ok) {
                console.error(`Failed to fetch CSS file: ${filePath} (${response.statusText})`);
                return "";
            }
            const content = await response.text();
            return content || "";
        } else {
            throw new Error("Invalid environment");
        }
    } catch (error) {
        console.error("Error loading CSS file:", error);
        return "";
    }
}

export default loadCss;
