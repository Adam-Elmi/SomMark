import SomMark, { setDefaultFs, setDefaultCwd, setDefaultFindAndLoadConfig, setDefaultResolvePath, setDefaultEnv, setDefaultAsyncLocalStorage } from "./index.shared.js";
import { AsyncLocalStorage } from "node:async_hooks";
export * from "./index.shared.js";

setDefaultAsyncLocalStorage(AsyncLocalStorage);

// Node-specific filesystem import
let nodeFs = null;
if (typeof process !== "undefined" && process.versions?.node) {
	try {
		nodeFs = await import("node:fs").then(m => m.default || m);
		// Add async interface so modules.js can use await fs.exists / await fs.readFile
		nodeFs.exists = (p) => nodeFs.promises.access(p).then(() => true).catch(() => false);
		nodeFs.readFile = (p, enc) => nodeFs.promises.readFile(p, enc);
	} catch (e) {}
}
setDefaultFs(nodeFs);
if (typeof process !== "undefined" && process.cwd) setDefaultCwd(process.cwd());

// Resolve filenames to absolute paths for clear error messages
if (typeof process !== "undefined" && process.versions?.node) {
	try {
		const nodePath = await import("node:path");
		setDefaultResolvePath(nodePath.resolve.bind(nodePath));
	} catch (e) {}
}

// Node-specific config-loader import
let findAndLoadConfigFn = async () => ({});
if (typeof process !== "undefined" && process.versions?.node) {
	try {
		const loader = await import("./core/helpers/config-loader.js");
		findAndLoadConfigFn = loader.findAndLoadConfig;
	} catch (e) {}
}
setDefaultFindAndLoadConfig(findAndLoadConfigFn);

// Load .env file from cwd and merge with process.env (process.env wins)
{
	let mergedEnv = { ...process.env };
	if (nodeFs) {
		try {
			const dotenvPath = nodeFs.promises
				? await nodeFs.promises.readFile(process.cwd() + "/.env", "utf8")
				: null;
			if (dotenvPath) {
				for (const line of dotenvPath.split("\n")) {
					const trimmed = line.trim();
					if (!trimmed || trimmed.startsWith("#")) continue;
					const eq = trimmed.indexOf("=");
					if (eq === -1) continue;
					const key = trimmed.slice(0, eq).trim();
					let val = trimmed.slice(eq + 1).trim();
					if ((val.startsWith('"') && val.endsWith('"')) ||
						(val.startsWith("'") && val.endsWith("'"))) {
						val = val.slice(1, -1);
					}
					if (!(key in mergedEnv)) mergedEnv[key] = val;
				}
			}
		} catch { /* .env file is optional */ }
	}
	setDefaultEnv(mergedEnv);
}

export default SomMark;
