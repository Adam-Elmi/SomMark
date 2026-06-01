import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runInit } from "../../cli/commands/init.js";
import { printVersion, printHeader } from "../../cli/commands/version.js";
import { runShow } from "../../cli/commands/show.js";
import { isColorEnabled, runColor } from "../../cli/commands/color.js";
import { getHelp } from "../../cli/commands/help.js";
import * as fileHelper from "../../cli/helpers/file.js";
import * as configHelper from "../../cli/helpers/config.js";

vi.mock("../../cli/helpers/file.js", () => ({
    isExist: vi.fn(),
    createFile: vi.fn()
}));

vi.mock("../../cli/helpers/config.js", () => ({
    loadConfig: vi.fn(),
    getResolvedConfigPath: vi.fn()
}));

vi.mock("../../core/errors.js", () => ({
    cliError: vi.fn(),
    formatMessage: vi.fn(msg => msg)
}));

describe("CLI Commands (cli/commands/*.js)", () => {
    let consoleSpy;
    let exitSpy;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        exitSpy.mockRestore();
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
            
            await runInit();
            
            expect(fileHelper.createFile).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("already exists"));
        });
    });

    describe("version.js", () => {
        it("should print package.json version", () => {
            printVersion();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/^\d+\.\d+\.\d+$/));
        });

        it("should print the banner header with version and details", () => {
            printHeader();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("SomMark-"));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Copyright (C) Adam Elmi"));
        });
    });

    describe("show.js", () => {
        it("should log configuration settings under show config", async () => {
            vi.mocked(configHelper.loadConfig).mockResolvedValue({
                removeComments: true,
                outputDir: "./out"
            });

            await runShow("config", "dummy.smark");
            
            expect(configHelper.loadConfig).toHaveBeenCalledWith("dummy.smark");
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("removeComments"));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("./out"));
        });

        it("should log the configuration path under show --path-config", async () => {
            vi.mocked(configHelper.getResolvedConfigPath).mockReturnValue("/path/to/smark.config.js");

            await runShow("--path-config");
            
            expect(configHelper.getResolvedConfigPath).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("/path/to/smark.config.js"));
        });

        it("should log fallback message if show config path is not resolved", async () => {
            vi.mocked(configHelper.getResolvedConfigPath).mockReturnValue(null);

            await runShow("--path-config");
            
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("No configuration file found"));
        });

        it("should show usage guide on invalid show arguments", async () => {
            const { cliError } = await import("../../core/errors.js");
            await runShow("invalid-action");
            expect(cliError).toHaveBeenCalledWith(expect.arrayContaining([expect.stringContaining("Usage:")]));
        });
    });

    describe("color.js", () => {
        const originalEnv = process.env.SOMMARK_COLOR;

        afterEach(() => {
            if (originalEnv === undefined) {
                delete process.env.SOMMARK_COLOR;
            } else {
                process.env.SOMMARK_COLOR = originalEnv;
            }
        });

        it("isColorEnabled should evaluate process.env correctly", async () => {
            process.env.SOMMARK_COLOR = "true";
            expect(await isColorEnabled()).toBe(true);

            process.env.SOMMARK_COLOR = "false";
            expect(await isColorEnabled()).toBe(false);
        });

        it("runColor should instruct on how to enable or disable color terminal logs", () => {
            runColor("on");
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("SOMMARK_COLOR=true"));

            runColor("off");
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("SOMMARK_COLOR=false"));

            runColor("invalid");
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
        });
    });

    describe("help.js", () => {
        const originalArgv = process.argv;

        afterEach(() => {
            process.argv = originalArgv;
        });

        it("getHelp should return formatted help text", () => {
            process.argv = ["node", "cli.mjs", "-h"];
            const helpText = getHelp(false);
            
            expect(helpText).toContain("Usage:");
            expect(helpText).toContain("Global Options:");
            expect(helpText).toContain("Transpilation Options:");
            expect(exitSpy).toHaveBeenCalledWith(0);
        });

        it("getHelp should exit if an unknown option is passed and validation is true", () => {
            process.argv = ["node", "cli.mjs", "--unknown-flag"];
            getHelp(true);
            expect(exitSpy).toHaveBeenCalledWith(0);
        });
    });
});
