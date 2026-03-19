import { describe, it, expect } from "vitest";
import lexer from "../../core/lexer.js";

describe("Lexer: Identifier Recovery (Missing Delimiters)", () => {

    it("recovers Block Identifier and context when ']' is missing (via structural delimiter)", () => {
        const src = "[Block=val";
        const tokens = lexer(src);
        
        expect(tokens.find(t => t.value === "Block")).toBeDefined();
        expect(tokens.find(t => t.value === "val")).toBeDefined();
    });

    it("recovers Inline Identifier and context when ')' is missing (via structural delimiter)", () => {
        const src = "() -> (id:val";
        const tokens = lexer(src);
        
        expect(tokens.find(t => t.value === "id")).toBeDefined();
        expect(tokens.find(t => t.value === "val")).toBeDefined();
    });

    it("recovers At-Block Identifier and context when '_@' is missing (via structural delimiter)", () => {
        const src = "@_AtBlock:arg";
        const tokens = lexer(src);
        
        expect(tokens.find(t => t.value === "AtBlock")).toBeDefined();
        expect(tokens.find(t => t.value === "arg")).toBeDefined();
    });

    it("correctly handles At-Block boundary with underscore in identifier", () => {
        const src = "@_At_Block_@ body";
        const tokens = lexer(src);
        const idToken = tokens.find(t => t.type === "IDENTIFIER" && t.value === "At_Block");
        
        expect(idToken).toBeDefined();
        expect(idToken.value).toBe("At_Block");
    });
});
