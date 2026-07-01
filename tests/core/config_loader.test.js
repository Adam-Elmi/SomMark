import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { findAndLoadConfig } from "../../core/helpers/config-loader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, "temp_configs");
const cwd = process.cwd();

describe("SomMark Config Loader Integration Tests", () => {
	beforeAll(() => {
		// Prepare a clean isolated directory for configuration loader tests
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}
	});

	afterAll(() => {
		// Completely clean up the isolated testing directory
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
	});

	afterEach(() => {
		// Clean up files and directories in tempDir between runs to prevent dynamic import cache side effects
		if (fs.existsSync(tempDir)) {
			const files = fs.readdirSync(tempDir);
			for (const file of files) {
				fs.rmSync(path.join(tempDir, file), { recursive: true, force: true });
			}
		}

		// Ensure stray smark.config.js files in process.cwd() are cleaned up
		const cwdConfigPath = path.join(cwd, "smark.config.js");
		if (fs.existsSync(cwdConfigPath)) {
			fs.unlinkSync(cwdConfigPath);
		}
	});

	describe("Step 1: Default Configuration Fallbacks", () => {
		it("loads all defaultConfig settings when no configuration file is present on disk", async () => {
			const config = await findAndLoadConfig();

			expect(config.outputFile).toBe("output");
			expect(config.outputDir).toBe(cwd);
			expect(config.mapperFile).toBeNull();
			expect(config.removeComments).toBe(true);
			expect(config.placeholders).toEqual({});
			expect(config.customProps).toEqual([]);
			expect(config.importAliases).toEqual({});
			expect(config.fallbackTarget).toBe(true);
			expect(config.outputValidator).toBeNull();
			expect(config.baseDir).toBeNull();
			expect(config.showSpinner).toBe(true);
			expect(config.security).toEqual({});
			expect(config.resolvedConfigPath).toBeNull();
		});

		it("falls back safely to default config when a non-existent targetPath is specified", async () => {
			const config = await findAndLoadConfig("./non-existent-subfolder-fallback");

			expect(config.outputFile).toBe("output");
			expect(config.outputDir).toBe(cwd);
			expect(config.resolvedConfigPath).toBeNull();
		});
	});

	describe("Step 2: High Priority Target Directory Config Loading", () => {
		it("detects and imports smark.config.js inside a target folder, overriding default properties", async () => {
			const basicDir = path.join(tempDir, "basic");
			fs.mkdirSync(basicDir, { recursive: true });

			const configContent = `
export default {
	outputFile: "dir_out",
	removeComments: false,
	placeholders: { user: "AdamElmi" }
};
			`;
			fs.writeFileSync(path.join(basicDir, "smark.config.js"), configContent, "utf-8");

			const config = await findAndLoadConfig("./tests/core/temp_configs/basic");

			expect(config.outputFile).toBe("dir_out");
			expect(config.removeComments).toBe(false);
			expect(config.placeholders).toEqual({ user: "AdamElmi" });
			expect(config.resolvedConfigPath).toBe(path.resolve(basicDir, "smark.config.js"));
		});

		it("correctly resolves config directory search if target path points to a file within that directory", async () => {
			const siblingDir = path.join(tempDir, "sibling");
			fs.mkdirSync(siblingDir, { recursive: true });

			const configContent = `
export default {
	outputFile: "file_sibling_out",
	showSpinner: true
};
			`;
			fs.writeFileSync(path.join(siblingDir, "smark.config.js"), configContent, "utf-8");
			// Write the dummy index.smark file so stats.isFile() or stats.isDirectory() has a real file on disk
			fs.writeFileSync(path.join(siblingDir, "index.smark"), "", "utf-8");

			// Target path points to an arbitrary template file inside the sibling folder
			const config = await findAndLoadConfig("./tests/core/temp_configs/sibling/index.smark");

			expect(config.outputFile).toBe("file_sibling_out");
			expect(config.showSpinner).toBe(true);
			expect(config.resolvedConfigPath).toBe(path.resolve(siblingDir, "smark.config.js"));
		});
	});

	describe("Step 3: Explicit Custom JavaScript Config File Loading", () => {
		it("directly loads and imports any arbitrary .js file if passed explicitly as targetPath", async () => {
			const customDir = path.join(tempDir, "custom");
			fs.mkdirSync(customDir, { recursive: true });

			const customConfigContent = `
export default {
	outputFile: "my_explicit_output",
	fallbackTarget: false
};
			`;
			fs.writeFileSync(path.join(customDir, "custom_smark_config.js"), customConfigContent, "utf-8");

			const config = await findAndLoadConfig("./tests/core/temp_configs/custom/custom_smark_config.js");

			expect(config.outputFile).toBe("my_explicit_output");
			expect(config.fallbackTarget).toBe(false);
			expect(config.resolvedConfigPath).toBe(path.resolve(customDir, "custom_smark_config.js"));
		});
	});

	describe("Step 3b: Walk-Up Config Discovery", () => {
		it("finds smark.config.js in a parent directory when none exists in the target directory", async () => {
			const rootDir = path.join(tempDir, "walkup-root");
			const childDir = path.join(rootDir, "components");
			fs.mkdirSync(childDir, { recursive: true });

			fs.writeFileSync(path.join(rootDir, "smark.config.js"), `
export default { outputFile: "root-config" };
			`, "utf-8");
			fs.writeFileSync(path.join(childDir, "button.smark"), "", "utf-8");

			const config = await findAndLoadConfig(path.join(childDir, "button.smark"));

			expect(config.outputFile).toBe("root-config");
			expect(config.resolvedConfigPath).toBe(path.join(rootDir, "smark.config.js"));
		});

		it("uses the nearest config when both the target directory and a parent directory have smark.config.js", async () => {
			const rootDir = path.join(tempDir, "walkup-nearest");
			const childDir = path.join(rootDir, "components");
			fs.mkdirSync(childDir, { recursive: true });

			fs.writeFileSync(path.join(rootDir, "smark.config.js"), `
export default { outputFile: "root-config" };
			`, "utf-8");
			fs.writeFileSync(path.join(childDir, "smark.config.js"), `
export default { outputFile: "components-config" };
			`, "utf-8");
			fs.writeFileSync(path.join(childDir, "button.smark"), "", "utf-8");

			const config = await findAndLoadConfig(path.join(childDir, "button.smark"));

			expect(config.outputFile).toBe("components-config");
			expect(config.resolvedConfigPath).toBe(path.join(childDir, "smark.config.js"));
		});
	});

	describe("Step 4: CWD Fallback Resolution", () => {
		it("falls back to loading smark.config.js from CWD if not found in the empty target folder", async () => {
			// Create empty sub-directory in temp_configs
			const emptySubDir = path.join(tempDir, "empty_dir");
			fs.mkdirSync(emptySubDir, { recursive: true });

			// Write CWD configuration
			const cwdConfigContent = `
export default {
	outputFile: "cwd_fallback_val",
	removeComments: false
};
			`;
			fs.writeFileSync(path.join(cwd, "smark.config.js"), cwdConfigContent, "utf-8");

			// Search empty target directory
			const config = await findAndLoadConfig("./tests/core/temp_configs/empty_dir");

			expect(config.outputFile).toBe("cwd_fallback_val");
			expect(config.removeComments).toBe(false);
			expect(config.resolvedConfigPath).toBe(path.join(cwd, "smark.config.js"));
		});
	});

	describe("Step 5: Advanced Options Merging & Backwards Compatibility", () => {
		it("resolves relative outputDir absolute to the configuration file's parent folder", async () => {
			const relativeDir = path.join(tempDir, "relative");
			fs.mkdirSync(relativeDir, { recursive: true });

			const configContent = `
export default {
	outputDir: "./dist_folder"
};
			`;
			fs.writeFileSync(path.join(relativeDir, "smark.config.js"), configContent, "utf-8");

			const config = await findAndLoadConfig("./tests/core/temp_configs/relative");

			// outputDir should be resolved absolutely relative to relativeDir
			const expectedOutputDir = path.resolve(relativeDir, "./dist_folder");
			expect(config.outputDir).toBe(expectedOutputDir);
		});

		it("maps legacy mappingFile property onto the new mapperFile property for backwards compatibility", async () => {
			const legacyDir = path.join(tempDir, "legacy");
			fs.mkdirSync(legacyDir, { recursive: true });

			const configContent = `
export default {
	mappingFile: "./mappers/legacy-mappers.js"
};
			`;
			fs.writeFileSync(path.join(legacyDir, "smark.config.js"), configContent, "utf-8");

			const config = await findAndLoadConfig("./tests/core/temp_configs/legacy");

			expect(config.mapperFile).toBe("./mappers/legacy-mappers.js");
		});

		it("gracefully catches syntax import errors returning safe default config settings", async () => {
			const corruptDir = path.join(tempDir, "corrupt");
			fs.mkdirSync(corruptDir, { recursive: true });

			const corruptConfigContent = `
export default {
	outputFile:
			`; // Intentionally corrupt JS syntax
			fs.writeFileSync(path.join(corruptDir, "smark.config.js"), corruptConfigContent, "utf-8");

			const config = await findAndLoadConfig("./tests/core/temp_configs/corrupt");

			// Gracefully falls back to defaults when import fails
			expect(config.outputFile).toBe("output");
			expect(config.resolvedConfigPath).toBeNull();
		});
	});
});
