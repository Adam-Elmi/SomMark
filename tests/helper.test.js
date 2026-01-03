import { describe, it, expect } from "vitest";
import { removeNewline, removeWhiteSpaces } from "../helpers/removeChar";
import peek from "../helpers/peek";
import escapeHTML from "../helpers/escapeHTML";
import colorize from "../helpers/colorize";

// removeWhiteSpaces and removeNewline function tests
describe("Helper functions", () => {
    it("removeWhiteSpaces default removes all whitespace", () => {
        expect(removeWhiteSpaces(" a \n b\tc ")).toBe("abc");
    });
    it("removeWhiteSpaces collapse mode", () => {
        expect(removeWhiteSpaces(" a   b \n c  ", "collapse")).toBe("a b c");
    });
    it("removeWhiteSpaces trim mode", () => {
        expect(removeWhiteSpaces("  hello  ", "trim")).toBe("hello");
    });
    it("removeWhiteSpaces null returns empty string", () => {
        expect(removeWhiteSpaces(null)).toBe("");
    });
    it("removeNewline removes newlines", () => {
        expect(removeNewline("line1\nline2\r\n")).toBe("line1line2");
    });
    it("removeNewline null returns empty string", () => {
        expect(removeNewline(null)).toBe("");
    });
});

// Peek function tests
describe("Peek function", () => {
    it("returns the correct character at a given index with offset", () => {
        expect(peek("abcdef", 2, 1)).toBe("d");
    });
    it("returns null for out of bounds index", () => {
        expect(peek("abcdef", 5, 1)).toBe(null);
    });
    it("returns null for previous character", () => {
        expect(peek("abcdef", 2, -1)).toBe("b");
    });
    it("returns null for null input", () => {
        expect(peek(null, 0, 0)).toBe(null);
    });
});

// escapeHTML function tests
describe("escapeHTML", () => {
    it("escapes & < > \" ' correctly", () => {
        expect(escapeHTML("&<>\"'")).toBe("&amp;&lt;&gt;&quot;&#39;");
    });
    it("converts non-strings to string", () => {
        expect(escapeHTML(123)).toBe("123");
    });
    it("stringifies null", () => {
        expect(escapeHTML(null)).toBe("null");
    });
});

// colorize function tests
describe("colorize", () => {
    it("wraps text with color codes when color provided", () => {
        expect(colorize("red", "hello")).toBe("\x1b[31m" + "hello" + "\x1b[0m");
    });
    it("returns text unchanged when no color provided", () => {
        expect(colorize(null, "hello")).toBe("hello");
    });
    it("throws if text is not provided", () => {
        expect(() => colorize("red")).toThrow();
    });
});
