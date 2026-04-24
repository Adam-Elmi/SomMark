import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { isExist, readContent, createFile } from "../../cli/helpers/file.js";
import { transpile } from "../../cli/helpers/transpile.js";

// Robust mock for node:fs/promises that handles both default and named exports
vi.mock("node:fs/promises", () => {
    const mockFs = {
        access: vi.fn(),
        readFile: vi.fn(),
        mkdir: vi.fn(),
        writeFile: vi.fn(),
        stat: vi.fn()
    };
    return {
        ...mockFs,
        default: mockFs
    };
});

describe("CLI Helpers (cli/helpers/*.js)", () => {
    
    describe("file.js helpers", () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("isExist should return true if path exists", async () => {
            vi.mocked(fs.access).mockResolvedValue(undefined);
            const result = await isExist("test.smark");
            expect(result).toBe(true);
        });

        it("isExist should return false if path doesn't exist", async () => {
            vi.mocked(fs.access).mockRejectedValue(new Error("No file"));
            const result = await isExist("missing.smark");
            expect(result).toBe(false);
        });

        it("readContent should call fs.readFile", async () => {
            vi.mocked(fs.readFile).mockResolvedValue(Buffer.from("content"));
            const result = await readContent("test.smark");
            expect(result.toString()).toBe("content");
            expect(fs.readFile).toHaveBeenCalledWith("test.smark");
        });

        it("createFile should create directory if missing and write file", async () => {
            // Mock isExist behavior via fs.access
            vi.mocked(fs.access).mockRejectedValueOnce(new Error("No dir"));
            vi.mocked(fs.mkdir).mockResolvedValue(undefined);
            vi.mocked(fs.writeFile).mockResolvedValue(undefined);
            
            await createFile("output", "test.html", "data");
            
            expect(fs.mkdir).toHaveBeenCalledWith("output", { recursive: true });
            expect(fs.writeFile).toHaveBeenCalledWith(path.join("output", "test.html"), "data");
        });
    });

    describe("transpile.js helper", () => {
        it("should call SomMark transpile method", async () => {
            const result = await transpile({ 
                src: "[div]Content[end]", 
                format: "html",
                config: { removeComments: true, placeholder: {} }
            });
            expect(result).toContain("<div>Content</div>");
        });
    });
});
