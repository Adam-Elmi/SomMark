import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import { removeWhiteSpaces, removeNewline } from "../../helpers/removeChar.js";

// ========================================================================== //
//  Text Transpiler Tests                                                     //
// ========================================================================== //

describe("Text Transpiler", () => {
    it("transpiles [Block] to plain text", async () => {
        let output = await new SomMark({ src: "[Block]Hello World[end]", format: "text", includeDocument: false }).transpile();
        output = removeNewline(output);
        expect(output).toBe("Hello World");
    });

    it("transpiles nested blocks to plain text", async () => {
        const expectedValue = "Hello Inner World";
        let output = await new SomMark({
            src: "[Outer]Hello [Inner]Inner[end] World[end]",
            format: "text",
            includeDocument: false
        }).transpile();
        output = removeWhiteSpaces(output);
        expect(output).toBe(expectedValue.replace(/\s/g, ""));
    });

    it("transpiles inline elements to their value", async () => {
        // INLINE: context += body_node.value + " "; 
        // (SomMark)->(bold) -> "SomMark "
        let output = await new SomMark({
            src: "[Block](SomMark)->(bold)[end]",
            format: "text",
            includeDocument: false
        }).transpile();

        expect(output.trim()).toBe("SomMark");
    });

    it("transpiles @-blocks to their content", async () => {
        let output = await new SomMark({
            src: "[Block]@_List_@\nItem 1\nItem 2\n@_end_@[end]",
            format: "text",
            includeDocument: false
        }).transpile();
        output = removeNewline(output);
        expect(output).toContain("Item 2");
    });

    it("ignores key-value arguments in blocks", async () => {
        let output = await new SomMark({
            src: "[Block = key: value]Content[end]",
            format: "text",
            includeDocument: false
        }).transpile();
        output = removeNewline(output);
        expect(output).toBe("Content");
    });

    it("handles escape characters in text", async () => {
        let output = await new SomMark({
            src: "[Block]Escaped \\[\\] chars[end]",
            format: "text",
            includeDocument: false
        }).transpile();
        output = removeNewline(output);
        expect(output).toBe("Escaped [] chars");
    });
});
