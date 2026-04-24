import { findAndLoadConfig } from "../../core/helpers/config-loader.js";

// ========================================================================== //
//  Configuration Loader                                                      //
// ========================================================================== //

let resolvedConfigPath = null;

/**
 * Loads the SomMark settings (configuration) for a specific file or folder.
 * Saves the path to the settings file for later.
 * 
 * @param {string|null} [filename=null] - The file path to start searching for a config from.
 * @returns {Promise<Object>} - The loaded configuration object.
 */
export async function loadConfig(filename = null) {
	const config = await findAndLoadConfig(filename);
	resolvedConfigPath = config.resolvedConfigPath;
	return config;
}

/**
 * Returns the absolute path to the configuration file that was last loaded.
 * @returns {string|null}
 */
export function getResolvedConfigPath() {
	return resolvedConfigPath;
}
