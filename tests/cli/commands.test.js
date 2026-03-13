import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

// ========================================================================== //
//  Init - getConfigDir                                                        //
// ========================================================================== //
import { getConfigDir } from "../../cli/commands/init.js";

describe("getConfigDir", () => {
    it("should return a string path", () => {
        const dir = getConfigDir();
        expect(typeof dir).toBe("string");
        expect(dir.length).toBeGreaterThan(0);
    });

    it("should end with 'sommark'", () => {
        const dir = getConfigDir();
        expect(path.basename(dir)).toBe("sommark");
    });

    it("should use XDG_CONFIG_HOME on Linux when set", () => {
        const original = process.env.XDG_CONFIG_HOME;
        process.env.XDG_CONFIG_HOME = "/tmp/test-xdg";
        const dir = getConfigDir();
        if (process.platform === "linux") {
            expect(dir).toBe("/tmp/test-xdg/sommark");
        }
        if (original !== undefined) {
            process.env.XDG_CONFIG_HOME = original;
        } else {
            delete process.env.XDG_CONFIG_HOME;
        }
    });

    it("should fall back to ~/.config on Linux without XDG_CONFIG_HOME", () => {
        const original = process.env.XDG_CONFIG_HOME;
        delete process.env.XDG_CONFIG_HOME;
        const dir = getConfigDir();
        if (process.platform === "linux") {
            expect(dir).toBe(path.join(os.homedir(), ".config", "sommark"));
        }
        if (original !== undefined) {
            process.env.XDG_CONFIG_HOME = original;
        }
    });
});

// ========================================================================== //
//  Version                                                                    //
// ========================================================================== //
import { printVersion, printHeader } from "../../cli/commands/version.js";

describe("Version Commands", () => {
    let logSpy;

    beforeEach(() => {
        logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        logSpy.mockRestore();
    });

    it("printVersion should print a version string", () => {
        printVersion();
        expect(logSpy).toHaveBeenCalled();
        const output = logSpy.mock.calls[0][0];
        expect(output).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("printHeader should print project info", () => {
        printHeader();
        expect(logSpy).toHaveBeenCalled();
        const output = logSpy.mock.calls[0][0];
        expect(output).toContain("SomMark");
        expect(output).toContain("Adam Elmi");
    });
});

// ========================================================================== //
//  Print Commands                                                             //
// ========================================================================== //
import { printOutput, printLex, printParse } from "../../cli/commands/print.js";

describe("Print Commands", () => {
    let logSpy;
    const tmpDir = path.join(os.tmpdir(), "sommark-print-test");
    const fixturePath = path.join(tmpDir, "test.smark");
    const fixtureContent = "[Block]\nHello\n[end]";

    beforeEach(async () => {
        logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        await fs.mkdir(tmpDir, { recursive: true });
        await fs.writeFile(fixturePath, fixtureContent);
    });

    afterEach(async () => {
        logSpy.mockRestore();
        try {
            await fs.rm(tmpDir, { recursive: true, force: true });
        } catch {}
    });

    describe("printOutput", () => {
        it("should print HTML output for a valid file", async () => {
            await printOutput("html", fixturePath);
            const allOutput = logSpy.mock.calls.map(c => c[0]).join("\n");
            expect(allOutput).toContain("Hello");
        });

        it("should handle missing file without crashing", async () => {
            const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            try {
                await printOutput("html", path.join(tmpDir, "nope.smark"));
            } catch {}
            errorSpy.mockRestore();
        });
    });

    describe("printLex", () => {
        it("should print tokens as JSON for a valid file", async () => {
            await printLex(fixturePath);
            const allOutput = logSpy.mock.calls.map(c => c[0]).join("\n");
            // Tokens are printed as JSON
            expect(allOutput).toContain("[");
        });
    });

    describe("printParse", () => {
        it("should print AST as JSON for a valid file", async () => {
            await printParse(fixturePath);
            const allOutput = logSpy.mock.calls.map(c => c[0]).join("\n");
            expect(allOutput).toContain("{");
        });
    });
});

// ========================================================================== //
//  Show Command                                                               //
// ========================================================================== //
import { runShow } from "../../cli/commands/show.js";

describe("Show Command", () => {
    let logSpy;

    beforeEach(() => {
        logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        logSpy.mockRestore();
    });

    it("should print config paths when target is 'config'", async () => {
        await runShow("config");
        const allOutput = logSpy.mock.calls.map(c => c[0]).join("\n");
        expect(allOutput).toContain("Config");
    });

    it("should throw for an invalid target", async () => {
        try {
            await runShow("invalid");
        } catch (e) {
            expect(e).toBeDefined();
        }
    });
});
