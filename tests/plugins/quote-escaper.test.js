import { describe, it, expect } from "vitest";
import { transpile } from "../../index.js";

describe("Plugin: quote-escaper", () => {
    const options = { includeDocument: false };

    it("escapes Tailwind colons in arguments", async () => {
        const src = '[section = class:"hover:bg-slate-300"]Content[end]';
        const result = await transpile({ src, ...options });
        expect(result).toContain('class="hover:bg-slate-300"');
    });

    it("escapes nested brackets in arguments", async () => {
        const src = '[section = class:"text-[#cdf]"]Content[end]';
        const result = await transpile({ src, ...options });
        expect(result).toContain('class="text-[#cdf]"');
    });

    it("handles multiple quoted arguments", async () => {
        const src = '[section = class:"p-4", id:"my-id"]Content[end]';
        const result = await transpile({ src, ...options });
        expect(result).toContain('class="p-4"');
        expect(result).toContain('id="my-id"');
    });
});
