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

	// 2. Check the target directory
	if (!configPath) {
		const localConfig = path.join(startDir, CONFIG_FILE_NAME);
		try {
			await fs.access(localConfig);
			configPath = localConfig;
		} catch {
			// No local config found in target dir
		}
	}

	// 3. Check the current working directory (if different from target dir)
	if (!configPath && startDir !== process.cwd()) {
		const cwdConfig = path.join(process.cwd(), CONFIG_FILE_NAME);
		try {
			await fs.access(cwdConfig);
			configPath = cwdConfig;
		} catch {
			// No config found in CWD
		}
	}
	
	const defaultConfig = {
		outputFile: "output",
		outputDir: startDir,
		mapperFile: null,
		removeComments: true,
		placeholders: {},
		customProps: [],
	};

	if (configPath) {
		const loadedConfig = await loadConfigFile(configPath);
		if (loadedConfig) {
			// Support both mapperFile and mappingFile (backwards compatibility)
			const finalMapper = loadedConfig.mapperFile || loadedConfig.mappingFile || defaultConfig.mapperFile;
			
			const finalConfig = { 
				...defaultConfig, 
				...loadedConfig, 
				mapperFile: finalMapper,
				resolvedConfigPath: configPath 
			};
			if (loadedConfig.outputDir) {
				const configDir = path.dirname(configPath);
				finalConfig.outputDir = path.resolve(configDir, loadedConfig.outputDir);
			}
			return finalConfig;
		}
	}

	return { ...defaultConfig, resolvedConfigPath: null };
}
