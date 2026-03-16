import { describe, it, expect } from "vitest";
import lexer from "../../core/lexer.js";
import parser from "../../core/parser.js";
import TOKEN_TYPES from "../../core/tokenTypes.js";

describe("LSP Range Compatibility", () => {
    describe("Lexer Ranges", () => {
        it("should have correct range for a simple block", () => {
            const src = "[Block]Content[end]";
            const tokens = lexer(src);
            
            // [
            expect(tokens[0].type).toBe(TOKEN_TYPES.OPEN_BRACKET);
            expect(tokens[0].range).toEqual({
                start: { line: 0, character: 0 },
                end: { line: 0, character: 1 }
            });
            
            // Block
            expect(tokens[1].type).toBe(TOKEN_TYPES.IDENTIFIER);
            expect(tokens[1].range).toEqual({
                start: { line: 0, character: 1 },
                end: { line: 0, character: 6 }
            });
            
            // ]
            expect(tokens[2].type).toBe(TOKEN_TYPES.CLOSE_BRACKET);
            expect(tokens[2].range).toEqual({
                start: { line: 0, character: 6 },
                end: { line: 0, character: 7 }
            });
        });

        it("should handle multi-line ranges correctly", () => {
            const src = "[Block]\nLine 1\nLine 2\n[end]";
            const tokens = lexer(src);
            
            // Find the TEXT token
            const textToken = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
            expect(textToken.value).toBe("Line 1\nLine 2\n");
            expect(textToken.range).toEqual({
                start: { line: 1, character: 0 },
                end: { line: 3, character: 0 }
            });
        });

        it("should emit EOF token at the end of file", () => {
            const src = "[Block][end]";
            const tokens = lexer(src);
            const eofToken = tokens[tokens.length - 1];
            expect(eofToken.type).toBe(TOKEN_TYPES.EOF);
            expect(eofToken.range.start).toEqual(eofToken.range.end);
            expect(eofToken.range.start).toEqual({ line: 0, character: 12 });
        });
    });

    describe("Parser Ranges", () => {
        it("should have correct range for a single-line block node", () => {
            const src = "[Block]Content[end]";
            const tokens = lexer(src);
            const ast = parser(tokens);
            const blockNode = ast[0];
            
            expect(blockNode.range).toEqual({
                start: { line: 0, character: 0 },
                end: { line: 0, character: 19 }
            });
        });

        it("should have correct range for a multi-line block node", () => {
            const src = "[Block]\nContent\n[end]";
            const tokens = lexer(src);
            const ast = parser(tokens);
            const blockNode = ast[0];
            
            expect(blockNode.range).toEqual({
                start: { line: 0, character: 0 },
                end: { line: 2, character: 5 }
            });
        });
    });
});
