import SomMark, { setDefaultFs, setDefaultCwd, setDefaultFindAndLoadConfig, setDefaultResolvePath } from "./index.shared.js";
export * from "./index.shared.js";

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

export default SomMark;
