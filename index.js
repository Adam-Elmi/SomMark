import SomMark, { setDefaultFs, setDefaultFindAndLoadConfig } from "./index.shared.js";
export * from "./index.shared.js";

// Node-specific filesystem import
let nodeFs = null;
if (typeof process !== "undefined" && process.versions?.node) {
	try {
		nodeFs = await import("node:fs").then(m => m.default || m);
	} catch (e) {}
}
setDefaultFs(nodeFs);

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
