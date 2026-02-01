export async function loadHighlightStyle(env, theme = "atom-one-dark.min", targetPath = "./node_modules/highlight.js/styles/") {
	if (!env) {
		env = typeof window !== "undefined" && typeof window.document !== "undefined" ? "browser" : "node";
	}

	try {
		if (env === "node") {
			const fs = await import("fs/promises");
			const path = await import("path");
			const stylePath = path.join(process.cwd(), targetPath, theme + ".css");
			return await fs.readFile(stylePath, "utf-8");
		} else if (env === "browser") {
			const url = new URL("../" + targetPath + theme + ".css", import.meta.url);
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch style: ${response.statusText}`);
			}
			return await response.text();
		} else {
			throw new Error("Invalid environment");
		}
	} catch (error) {
		console.error("Error loading style:", error);
		return "";
	}
}

export default loadHighlightStyle;
