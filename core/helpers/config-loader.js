import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";

const CONFIG_FILE_NAME = "smark.config.js";

/**
 * Loads a configuration object from a Javascript file.
 * We add the current time to the file path. This makes Node.js read 
 * the file again instead of using an old copy from its memory.
 * 
 * @param {string} configPath - The absolute path to the config file.
 * @returns {Promise<Object|null>} - The configuration object or null on error.
 */
async function loadConfigFile(configPath) {
	if (!configPath) return null;
	try {
		const configURL = `${pathToFileURL(configPath).href}?t=${Date.now()}`;
		const loadedModule = await import(configURL);
		return loadedModule.default || loadedModule;
	} catch (error) {
		return null;
	}
}

/**
 * Finds and loads the SomMark configuration file.
 * It looks in the current folder or a specific path if provided.
 * 
 * @param {string|null} targetPath - A specific file or folder to look in.
 * @returns {Promise<Object>} - The final configuration merged with defaults.
 */
export async function findAndLoadConfig(targetPath) {
	let startDir = process.cwd();
	let configPath = null;

	// 1. Check if targetPath is an explicit config file path
	if (targetPath) {
		try {
			const stats = await fs.stat(targetPath);
			if (stats.isFile() && targetPath.endsWith(".js")) {
				configPath = path.resolve(targetPath);
			} else {
				startDir = stats.isDirectory() ? targetPath : path.dirname(targetPath);
			}
		} catch {
			// Path doesn't exist
		}
	}

	// 2. Check the current folder
	if (!configPath) {
		const localConfig = path.join(startDir, CONFIG_FILE_NAME);
		try {
			await fs.access(localConfig);
			configPath = localConfig;
		} catch {
			// No local config found
		}
	}
	
	const defaultConfig = {
		outputFile: "output",
		outputDir: startDir,
		mappingFile: null,
		removeComments: true,
	};

	if (configPath) {
		const loadedConfig = await loadConfigFile(configPath);
		if (loadedConfig) {
			const finalConfig = { ...defaultConfig, ...loadedConfig, resolvedConfigPath: configPath };
			if (loadedConfig.outputDir) {
				const configDir = path.dirname(configPath);
				finalConfig.outputDir = path.resolve(configDir, loadedConfig.outputDir);
			}
			return finalConfig;
		}
	}

	return { ...defaultConfig, resolvedConfigPath: null };
}
