import { describe, it, expect } from "vitest";
import lexer from "../../core/lexer.js";

describe("Lexer: Indentation and Range Consistency", () => {

    it("maintains correct ranges for deeply indented blocks", () => {
        const src = "  [Block]\n    content\n  [end]";
        const tokens = lexer(src);
        
        console.log("TOKENS SURVEY START:");
        tokens.forEach((t, index) => {
            console.log(`Token ${index}: type=${t.type}, value=${JSON.stringify(t.value)}, line=${t.range.start.line}, char=${t.range.start.character}`);
        });
        console.log("TOKENS SURVEY END");
        const openToken = tokens.find(t => t.value === "[");
        expect(openToken.range.start.line).toBe(0);
        expect(openToken.range.start.character).toBe(2);
        
        // With whitespace-preserving lexer, '    content' is a single TEXT token starting at 0
        const contentToken = tokens.find(t => t.value.includes("content"));
        expect(contentToken.range.start.line).toBe(1);
        expect(contentToken.range.start.character).toBe(0);
        expect(contentToken.value).toBe("    content\n  ");
        
        // '[end]' starts at line 2, column 2
        const endOpenToken = tokens.filter(t => t.value === "[")[1];
        expect(endOpenToken.range.start.line).toBe(2);
        expect(endOpenToken.range.start.character).toBe(2);
    });

    it("verifies skip_sources correctly advances character count", () => {
        const src = "[  ID  ]";
        const tokens = lexer(src);
        
        const idToken = tokens.find(t => t.value === "ID");
        // [ at 0, spaces at 1-2, ID starts at 3
        expect(idToken.range.start.character).toBe(3);
        
        const closeToken = tokens.find(t => t.value === "]");
        // ID ends at 5, spaces at 5-6, ] starts at 7
        expect(closeToken.range.start.character).toBe(7);
    });
});
