import { findAndLoadConfig } from "../../core/helpers/config-loader.js";

// ========================================================================== //
//  Configuration Loader                                                      //
// ========================================================================== //

let resolvedConfigPath = null;

export async function loadConfig(filename = null) {
	const config = await findAndLoadConfig(filename);
	resolvedConfigPath = config.resolvedConfigPath;
	return config;
}

export function getResolvedConfigPath() {
	return resolvedConfigPath;
}
