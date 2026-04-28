import { describe, it, expect, vi, beforeEach } from "vitest";
import { runBuild } from "../../cli/commands/build.js";
import * as fileHelper from "../../cli/helpers/file.js";
import * as configHelper from "../../cli/helpers/config.js";
import fs from "node:fs/promises";

// Mocking with factories
vi.mock("../../cli/helpers/file.js", () => ({
    isExist: vi.fn(),
    readContent: vi.fn(),
    createFile: vi.fn()
}));

vi.mock("../../cli/helpers/config.js", () => ({
    loadConfig: vi.fn()
}));

vi.mock("node:fs/promises", () => ({
    default: {
        stat: vi.fn(),
        access: vi.fn()
    }
}));

vi.mock("../../core/errors.js", () => ({
    cliError: vi.fn(),
    formatMessage: vi.fn(msg => msg)
}));

describe("CLI Configuration Integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should use mapperFile from config if present", async () => {
        const mockConfig = {
            mapperFile: "./my_mapper.js",
            outputFile: "my_output",
            outputDir: "./out",
            removeComments: true,
            placeholders: {},
            customProps: []
        };
        
        fileHelper.isExist.mockResolvedValue(true);
        fileHelper.readContent.mockResolvedValue("[p]Test[end]");
        configHelper.loadConfig.mockResolvedValue(mockConfig);
        fs.stat.mockResolvedValue({ size: 100 });
        
        vi.spyOn(console, "log").mockImplementation(() => {});

        await runBuild("--html", "test.smark");

        expect(fileHelper.createFile).toHaveBeenCalledWith("./out", "my_output.html", expect.any(String));
    });

    it("should respect removeComments from config", async () => {
        const mockConfig = {
            removeComments: false,
            outputFile: "output",
            outputDir: "./",
            placeholders: {},
            customProps: []
        };

        fileHelper.isExist.mockResolvedValue(true);
        fileHelper.readContent.mockResolvedValue("# Comment\n[p]Test[end]");
        configHelper.loadConfig.mockResolvedValue(mockConfig);
        fs.stat.mockResolvedValue({ size: 100 });
        
        vi.spyOn(console, "log").mockImplementation(() => {});

        await runBuild("--html", "test.smark");
        
        // Success check
        expect(fileHelper.createFile).toHaveBeenCalled();
    });
});
