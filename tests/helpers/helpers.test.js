import { describe, it, expect } from "vitest";
import { removeNewline, removeWhiteSpaces } from "../../helpers/removeChar";
import peek from "../../helpers/peek";
import escapeHTML from "../../helpers/escapeHTML";
import colorize from "../../helpers/colorize";
import loadHighlightStyle from "../../helpers/loadHighlightStyle";
import { vi } from "vitest";

// ========================================================================== //
//  Helper Tests                                                              //
// ========================================================================== //

// ========================================================================== //
//  removeWhiteSpaces and removeNewline                                       //
// ========================================================================== //
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

// ========================================================================== //
//  Peek Function                                                             //
// ========================================================================== //
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

// ========================================================================== //
//  Escape HTML                                                               //
// ========================================================================== //
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

// ========================================================================== //
//  Colorize                                                                  //
// ========================================================================== //
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

// ========================================================================== //
//  loadHighlightStyle                                                        //
// ========================================================================== //
describe("loadHighlightStyle", () => {
    it("loads style in node env (tries to read file)", async () => {
        const style = await loadHighlightStyle("node", "github", "node_modules/highlight.js/styles/");
        expect(typeof style).toBe("string");
    });

    it("handles invalid environment", async () => {
        const result = await loadHighlightStyle("alien_computer");
        expect(result).toBe("");
    });

    it("browser environment fetch failure", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                statusText: "Not Found",
            })
        );
        const result = await loadHighlightStyle("browser");
        expect(result).toBe("");
        expect(global.fetch).toHaveBeenCalled();
    });

    it("browser environment fetch success", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve(".css { color: red; }"),
            })
        );
        const result = await loadHighlightStyle("browser");
        expect(result).toBe(".css { color: red; }");
    });
});

