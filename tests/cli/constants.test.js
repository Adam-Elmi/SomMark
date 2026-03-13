import { describe, it, expect } from "vitest";
import { options, extensions } from "../../cli/constants.js";

describe("CLI Constants", () => {
    describe("options", () => {
        it("should be an array", () => {
            expect(Array.isArray(options)).toBe(true);
        });

        it("should include help flags", () => {
            expect(options).toContain("-h");
            expect(options).toContain("--help");
        });

        it("should include version flags", () => {
            expect(options).toContain("-v");
            expect(options).toContain("--version");
        });

        it("should include format flags", () => {
            expect(options).toContain("--html");
            expect(options).toContain("--markdown");
            expect(options).toContain("--mdx");
            expect(options).toContain("--json");
            expect(options).toContain("--text");
        });

        it("should include print flag", () => {
            expect(options).toContain("--print");
            expect(options).toContain("-p");
        });

        it("should include lex and parse flags", () => {
            expect(options).toContain("--lex");
            expect(options).toContain("--parse");
        });
    });

    describe("extensions", () => {
        it("should map text to txt", () => {
            expect(extensions.text).toBe("txt");
        });

        it("should map html to html", () => {
            expect(extensions.html).toBe("html");
        });

        it("should map markdown to md", () => {
            expect(extensions.markdown).toBe("md");
        });

        it("should map mdx to mdx", () => {
            expect(extensions.mdx).toBe("mdx");
        });

        it("should map json to json", () => {
            expect(extensions.json).toBe("json");
        });

        it("should not have unknown formats", () => {
            const keys = Object.keys(extensions);
            expect(keys).toEqual(["text", "html", "markdown", "mdx", "json"]);
        });
    });
});
