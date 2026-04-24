import { describe, it, expect, vi, beforeEach } from "vitest";
import { runInit } from "../../cli/commands/init.js";
import { runVersion } from "../../cli/commands/version.js";
import { runShow } from "../../cli/commands/show.js";
import * as fileHelper from "../../cli/helpers/file.js";
import fs from "node:fs/promises";

vi.mock("node:fs/promises");
vi.mock("../../cli/helpers/file.js");
vi.mock("../../core/errors.js", () => ({
    cliError: vi.fn(),
    formatMessage: vi.fn(msg => msg)
}));

describe("CLI Commands (cli/commands/*.js)", () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("init.js", () => {
        it("should create smark.config.js if it doesn't exist", async () => {
            vi.mocked(fileHelper.isExist).mockResolvedValue(false);
            vi.mocked(fileHelper.createFile).mockResolvedValue(undefined);
            
            await runInit();
            
            expect(fileHelper.createFile).toHaveBeenCalledWith(process.cwd(), "smark.config.js", expect.stringMatching(/export default/));
        });

        it("should NOT overwrite smark.config.js if it exists", async () => {
            vi.mocked(fileHelper.isExist).mockResolvedValue(true);
            const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
            
            await runInit();
            
            expect(fileHelper.createFile).not.toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe("show.js", () => {
        it("should log configuration settings", async () => {
            const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
            // Mocking config loader indirectly through the behavior of show.js
            await runShow("config");
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
