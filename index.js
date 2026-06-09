import SomMark, { setDefaultFs, setDefaultCwd, setDefaultFindAndLoadConfig } from "./index.shared.js";
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
