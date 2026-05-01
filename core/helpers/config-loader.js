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
	const cwd = process.cwd();
	let configPath = null;
	let startDir = cwd;

	// 1. Resolve Target Directory
	if (targetPath) {
		try {
			const absoluteTarget = path.resolve(cwd, targetPath);
			const stats = await fs.stat(absoluteTarget);
			
			// If target is a .js file, it might be an explicit config (legacy/internal support)
			if (stats.isFile() && absoluteTarget.endsWith(".js") && !absoluteTarget.endsWith("smark.config.js")) {
				configPath = absoluteTarget;
			} else {
				startDir = stats.isDirectory() ? absoluteTarget : path.dirname(absoluteTarget);
			}
		} catch {
			// Path doesn't exist, fallback to CWD
		}
	}

	// 2. Check the Target Directory (Highest Priority)
	if (!configPath) {
		const targetConfig = path.join(startDir, CONFIG_FILE_NAME);
		try {
			await fs.access(targetConfig);
			configPath = targetConfig;
		} catch {
			// No config found in target dir
		}
	}

	// 3. Check the Current Working Directory (Fallback)
	// We only check CWD if it's different from the Target Directory
	if (!configPath && startDir !== cwd) {
		const cwdConfig = path.join(cwd, CONFIG_FILE_NAME);
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
