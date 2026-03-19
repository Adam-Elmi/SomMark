import { describe, it, expect } from "vitest";
import lexer from "../../core/lexer.js";

describe("Lexer: Syntax Compliance (Alphabetical Cases)", () => {

    // ========================================================================== //
    //  Case A: EOF Escape                                                        //
    // ========================================================================== //
    it("Case A: throws LexerError on trailing backslash (EOF)", () => {
        expect(() => lexer("\\")).toThrow("[Lexer Error]");
    });

    // ========================================================================== //
    //  Case B: Space after Escape                                                //
    // ========================================================================== //
    it("Case B: throws LexerError on escaped whitespace", () => {
        expect(() => lexer("\\ ")).toThrow("[Lexer Error]");
        expect(() => lexer("\\\n")).toThrow("[Lexer Error]");
    });

    // ========================================================================== //
    //  Case C: Alphanumeric Identifier rule                                      //
    // ========================================================================== //
    describe("Case C: Expanded Identifier Rules (_, $, -)", () => {
        it("allows underscores, dollar signs, and hyphens", () => {
            const tokens1 = lexer("[Valid_ID][end]");
            expect(tokens1.some(t => t.value === "Valid_ID")).toBe(true);

            const tokens2 = lexer("[Valid-ID][end]");
            expect(tokens2.some(t => t.value === "Valid-ID")).toBe(true);

            const tokens3 = lexer("[Valid$ID][end]");
            expect(tokens3.some(t => t.value === "Valid$ID")).toBe(true);
        });

        it("disallows other special characters", () => {
            expect(() => lexer("[In@valid][end]")).toThrow();
            expect(() => lexer("[In val id][end]")).toThrow();
        });
    });

    // ========================================================================== //
    //  Case D: Empty Body Support                                                //
    // ========================================================================== //
    it("Case D: allows empty bodies (self-closing style)", () => {
        const tokens = lexer("[Block][end]");
        expect(tokens).toBeDefined();
    });

    // ========================================================================== //
    //  Case E: Semicolon exclusivity                                             //
    // ========================================================================== //
    describe("Case E: Semicolon Exclusivity", () => {
        it("treats semicolon as a token only in At-block arguments", () => {
            const atTokens = lexer("@_Code_@: js; body @_end_@");
            expect(atTokens.some(t => t.type === "SEMICOLON")).toBe(true);

            const textTokens = lexer("[Block] Hello; World [end]");
            expect(textTokens.some(t => t.type === "SEMICOLON")).toBe(false);
            expect(textTokens.some(t => t.value.includes(";"))).toBe(true);
        });
    });

    // ========================================================================== //
    //  Case F: Colon sensitivity                                                 //
    // ========================================================================== //
    describe("Case F: Colon Sensitivity", () => {
        it("treats inline colons as plain text", () => {
            const tokens = lexer("(V)->(P: \"x:y:z\")");
            const colons = tokens.filter(t => t.type === "COLON");
            // Only the first colon after (P is a separator, others are part of the quoted VALUE
            expect(colons.length).toBe(1);
        });

        it("respects escaped colons in block arguments", () => {
            const tokens = lexer("[B = key:val\\:extra]");
            expect(tokens.some(t => t.type === "ESCAPE" && t.value === "\\:")).toBe(true);
        });
    });

    // ========================================================================== //
    //  Case G: Depth stack leak                                                  //
    // ========================================================================== //
    describe("Case G: Depth Stack Consistency", () => {
        it("maintains same depth for sibling blocks", () => {
            const tokens = lexer("[B1][end][B2][end]");
            const openBrackets = tokens.filter(t => t.type === "OPEN_BRACKET");
            expect(openBrackets[0].depth).toBe(1);
            expect(openBrackets[1].depth).toBe(1);
        });

        it("increments depth for nested blocks", () => {
            const tokens = lexer("[Outer][Inner][end][end]");
            const openBrackets = tokens.filter(t => t.type === "OPEN_BRACKET");
            expect(openBrackets[0].depth).toBe(1);
            expect(openBrackets[1].depth).toBe(2);
        });
    });

    // ========================================================================== //
    //  Case H: At-block identifier greedy consumption                            //
    // ========================================================================== //
    it("Case H: stops At-block identifier at colon", () => {
        const tokens = lexer("@_id:val_@ body @_end_@");
        const idToken = tokens.find(t => t.type === "IDENTIFIER");
        expect(idToken.value).toBe("id");
    });

    // ========================================================================== //
    //  Case I: At-block isolation                                                //
    // ========================================================================== //
    it("Case I: isolates At-block body from nested syntax", () => {
        const tokens = lexer("@_Code_@; [Block] body [end] @_end_@");
        const textToken = tokens.find(t => t.type === "TEXT");
        expect(textToken.value).toBe(" [Block] body [end] ");
    });

    // ========================================================================== //
    //  Case J: Nested At-blocks                                                  //
    // ========================================================================== //
    it("Case J: allows inner At-block tags as plain text", () => {
        const tokens = lexer("@_Outer_@: arg; @_Inner_@ content @_end_@ @_end_@");
        const textToken = tokens.find(t => t.type === "TEXT");
        expect(textToken.value).toBe(" @_Inner_@ content ");
    });

    // ========================================================================== //
    //  Extra: Trim validation                                                    //
    // ========================================================================== //
    it("trims whitespace from identifiers and keys", () => {
        const tokens = lexer("[  TrimMe  =  myKey : val ]");
        const id = tokens.find(t => t.type === "IDENTIFIER" && t.value === "TrimMe");
        const key = tokens.find(t => t.type === "IDENTIFIER" && t.value === "myKey");
        expect(id).toBeDefined();
        expect(key).toBeDefined();
    });
});
