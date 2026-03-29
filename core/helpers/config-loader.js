import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";

const CONFIG_FILE_NAME = "smark.config.js";

/**
 * Gets the global configuration directory based on the OS.
 */
export function getConfigDir() {
	const homeDir = os.homedir();
	if (process.platform === "win32") {
		return path.join(process.env.APPDATA || path.join(homeDir, "AppData", "Roaming"), "sommark");
	} else if (process.platform === "darwin") {
		return path.join(homeDir, "Library", "Application Support", "sommark");
	} else {
		return path.join(process.env.XDG_CONFIG_HOME || path.join(homeDir, ".config"), "sommark");
	}
}

/**
 * Recursively searches for smark.config.js up the directory tree starting from startDir.
 */
async function findConfig(startDir) {
	let currentDir = path.resolve(startDir);
	const root = path.parse(currentDir).root;

	while (true) {
		const configPath = path.join(currentDir, CONFIG_FILE_NAME);
		try {
			await fs.access(configPath);
			return configPath;
		} catch {
			if (currentDir === root) break;
			currentDir = path.dirname(currentDir);
		}
	}
	return null;
}

/**
 * Loads the configuration from a file.
 */
async function loadConfigFile(configPath) {
	if (!configPath) return null;
	try {
		// Use a timestamp to bypass cache for dynamic updates in LSP
		const configURL = `${pathToFileURL(configPath).href}?t=${Date.now()}`;
		const loadedModule = await import(configURL);
		return loadedModule.default || loadedModule;
	} catch (error) {
		return null;
	}
}

/**
 * Finds and loads the configuration starting from targetPath.
 * Checks local directory, parent directories, and finally the global config directory.
 */
export async function findAndLoadConfig(targetPath) {
	let startDir;
	if (targetPath) {
		try {
			const stats = await fs.stat(targetPath);
			startDir = stats.isDirectory() ? targetPath : path.dirname(targetPath);
		} catch {
			startDir = process.cwd();
		}
	} else {
		startDir = process.cwd();
	}
	
	let configPath = await findConfig(startDir);
	
	if (!configPath) {
		// As a fallback, check the current working directory of the process
		// This helps LSP find the project config when running in the project root
		const localConfigPath = path.join(process.cwd(), CONFIG_FILE_NAME);
		try {
			await fs.access(localConfigPath);
			configPath = localConfigPath;
		} catch {
			// Not in CWD
		}
	}

	if (!configPath) {
		const globalConfigPath = path.join(getConfigDir(), CONFIG_FILE_NAME);
		try {
			await fs.access(globalConfigPath);
			configPath = globalConfigPath;
		} catch {
			// No config found
		}
	}

	const defaultConfig = {
		outputFile: "output",
		outputDir: startDir,
		mappingFile: null,
		plugins: [],
		priority: [],
		excludePlugins: [],
		includeDocument: true
	};

	if (configPath) {
		const loadedConfig = await loadConfigFile(configPath);
		if (loadedConfig) {
			const finalConfig = { ...defaultConfig, ...loadedConfig, resolvedConfigPath: configPath };
			
			// Ensure outputDir is resolved if it's relative in the config
			if (loadedConfig.outputDir) {
				const configDir = path.dirname(configPath);
				finalConfig.outputDir = path.resolve(configDir, loadedConfig.outputDir);
			}

			return finalConfig;
		}
	}

	return { ...defaultConfig, resolvedConfigPath: null };
}



