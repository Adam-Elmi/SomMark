import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import mdx from "../../mappers/languages/mdx.js";

describe("MDX Whitespace Verification", () => {
    mdx.register("Card", ({ content }) => mdx.tag("Card").body(content));
    mdx.register("Title", ({ content }) => mdx.tag("Title").body(content));

    it("should generate clean MDX with required padding for blocks", async () => {
        const src = "[Card][Title]Welcome[end]Content[end]";
        const smark = new SomMark({ src, format: "mdx" });
        const output = await smark.transpile();
        
        // MDX requires block-level elements to be padded with newlines for valid parsing
        expect(output).toContain("\n<Card>\n");
        expect(output).toContain("\n<Title>\nWelcome\n</Title>\n");
        expect(output).toContain("\nContent\n</Card>\n");
    });

    it("should not append newlines after inline elements in MDX", async () => {
        const src = "[Block]Hello **world** ![end]";
        const smark = new SomMark({ src, format: "mdx" });
        const output = await smark.transpile();
        
        // Should be compact for inline content
        expect(output).toContain("Hello **world** !");
        expect(output).not.toContain("**world**\n");
    });

    it("should handle realistic nested structures with valid MDX padding", async () => {
        const src = `
[Card]
  [Title]Title[end]
  Text
[end]`;
        const smark = new SomMark({ src, format: "mdx" });
        const output = await smark.transpile();
        
        // Padding ensures MDX v2+ recognizes segments correctly
        expect(output).toContain("<Card>\n");
        expect(output).toContain("<Title>\nTitle\n</Title>");
        expect(output).toContain("\n  Text\n");
    });
});
