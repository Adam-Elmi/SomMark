import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { isExist, readContent, createFile } from "../../cli/helpers/file.js";

const tmpDir = path.join(os.tmpdir(), "sommark-cli-test");

afterEach(async () => {
    try {
        await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {}
});

describe("File Helpers", () => {
    describe("isExist", () => {
        it("should return true for an existing file", async () => {
            await fs.mkdir(tmpDir, { recursive: true });
            const filePath = path.join(tmpDir, "exists.txt");
            await fs.writeFile(filePath, "hello");
            expect(await isExist(filePath)).toBe(true);
        });

        it("should return false for a missing file", async () => {
            expect(await isExist(path.join(tmpDir, "nope.txt"))).toBe(false);
        });

        it("should return false for undefined path", async () => {
            expect(await isExist(undefined)).toBe(false);
        });

        it("should return false for empty string", async () => {
            expect(await isExist("")).toBe(false);
        });

        it("should return false for null", async () => {
            expect(await isExist(null)).toBe(false);
        });
    });

    describe("readContent", () => {
        it("should read file content as a buffer", async () => {
            await fs.mkdir(tmpDir, { recursive: true });
            const filePath = path.join(tmpDir, "read.txt");
            await fs.writeFile(filePath, "test content");

            const content = await readContent(filePath);
            expect(content.toString()).toBe("test content");
        });

        it("should throw for a missing file", async () => {
            await expect(readContent(path.join(tmpDir, "missing.txt"))).rejects.toThrow();
        });
    });

    describe("createFile", () => {
        it("should create a file in an existing directory", async () => {
            await fs.mkdir(tmpDir, { recursive: true });
            await createFile(tmpDir, "output.txt", "hello world");

            const content = await fs.readFile(path.join(tmpDir, "output.txt"), "utf-8");
            expect(content).toBe("hello world");
        });

        it("should create the directory if it doesn't exist", async () => {
            const nestedDir = path.join(tmpDir, "a", "b", "c");
            await createFile(nestedDir, "deep.txt", "nested content");

            const content = await fs.readFile(path.join(nestedDir, "deep.txt"), "utf-8");
            expect(content).toBe("nested content");
        });

        it("should overwrite an existing file", async () => {
            await fs.mkdir(tmpDir, { recursive: true });
            const filePath = path.join(tmpDir, "overwrite.txt");
            await fs.writeFile(filePath, "old");
            await createFile(tmpDir, "overwrite.txt", "new");

            const content = await fs.readFile(filePath, "utf-8");
            expect(content).toBe("new");
        });
    });
});
