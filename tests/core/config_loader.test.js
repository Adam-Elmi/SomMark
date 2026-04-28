import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import { findAndLoadConfig } from "../../core/helpers/config-loader.js";

// Mock fs
vi.mock("node:fs/promises", () => ({
    default: {
        stat: vi.fn(),
        access: vi.fn(),
        readFile: vi.fn()
    }
}));

// Mock dynamic import for config files
// Vitest handles dynamic imports differently, so we'll mock the internal loader if needed
// but for now let's see if we can just mock the return value of the function that calls it

describe("Config Loader (core/helpers/config-loader.js)", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should return default config if no config file is found", async () => {
        // Mock fs behavior by spying
        const statSpy = vi.spyOn(fs, "stat").mockRejectedValue(new Error("Not found"));
        const accessSpy = vi.spyOn(fs, "access").mockRejectedValue(new Error("Not found"));

        const config = await findAndLoadConfig();

        expect(config.outputFile).toBe("output");
        expect(config.removeComments).toBe(true);
        expect(config.mapperFile).toBeNull();
        expect(config.placeholders).toEqual({});
        expect(config.customProps).toEqual([]);
        
        statSpy.mockRestore();
        accessSpy.mockRestore();
    });

    it("should resolve outputDir to absolute path", async () => {
        const statSpy = vi.spyOn(fs, "stat").mockRejectedValue(new Error("Not found"));
        const accessSpy = vi.spyOn(fs, "access").mockRejectedValue(new Error("Not found"));

        const config = await findAndLoadConfig();
        expect(path.isAbsolute(config.outputDir)).toBe(true);
        expect(config.outputDir).toBe(process.cwd());

        statSpy.mockRestore();
        accessSpy.mockRestore();
    });
});
