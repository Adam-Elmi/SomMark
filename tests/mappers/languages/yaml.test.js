import { describe, it, expect } from "vitest";
import { load as parseYAML } from "js-yaml";
import SomMark from "../../../index.js";

const transpile = (src, placeholders = {}) =>
    new SomMark({ src, format: "yaml", placeholders }).transpile();

// Round-trips the output through a real YAML parser so every test proves
// both that the output is syntactically valid YAML and that it carries the
// correct values.
const yaml = async (src, placeholders) => parseYAML(await transpile(src, placeholders));

// ─── Shorthand (unknown-tag) key-value ────────────────────────────────────────

describe("YAML shorthand key-value (unknown tag)", () => {
    it("emits a quoted string", async () => {
        const doc = await yaml(`[name = "Adam" !]`);
        expect(doc).toEqual({ name: "Adam" });
    });

    it("emits an integer", async () => {
        const doc = await yaml(`[port = 5432 !]`);
        expect(doc).toEqual({ port: 5432 });
    });

    it("emits a float", async () => {
        const doc = await yaml(`[ratio = 1.618 !]`);
        expect(doc.ratio).toBeCloseTo(1.618);
    });

    it("emits boolean true", async () => {
        const doc = await yaml(`[active = true !]`);
        expect(doc).toEqual({ active: true });
    });

    it("emits boolean false", async () => {
        const doc = await yaml(`[debug = false !]`);
        expect(doc).toEqual({ debug: false });
    });

    it("reads value from body text", async () => {
        const doc = await yaml(`[bio]Software developer[end]`);
        expect(doc).toEqual({ bio: "Software developer" });
    });

    it("handles multiple root keys", async () => {
        const doc = await yaml(`
            [name = "SomMark" !]
            [version = "5.0.0" !]
            [stable = true !]
        `);
        expect(doc).toEqual({ name: "SomMark", version: "5.0.0", stable: true });
    });
});

// ─── Typed scalar blocks ──────────────────────────────────────────────────────

describe("YAML typed scalar blocks", () => {
    it("[str] emits a quoted string — value stays string even if it looks like a number", async () => {
        const doc = await yaml(`[str = "code", "007" !]`);
        expect(doc).toEqual({ code: "007" });
        expect(typeof doc.code).toBe("string");
    });

    it("[str] with body form", async () => {
        const doc = await yaml(`[str = "desc"]A long description.[end]`);
        expect(doc).toEqual({ desc: "A long description." });
    });

    it("[int] emits an integer", async () => {
        const doc = await yaml(`[int = "port", "5432" !]`);
        expect(doc).toEqual({ port: 5432 });
    });

    it("[int] throws when given a decimal value", async () => {
        await expect(yaml(`[int = "pi", "3.14" !]`)).rejects.toThrow();
    });

    it("[float] emits a float", async () => {
        const doc = await yaml(`[float = "pi", "3.14159" !]`);
        expect(doc.pi).toBeCloseTo(3.14159);
    });

    it("[float] throws when given a whole number", async () => {
        await expect(yaml(`[float = "port", "5432" !]`)).rejects.toThrow();
    });

    it("[number] accepts an integer", async () => {
        const doc = await yaml(`[number = "port", "5432" !]`);
        expect(doc).toEqual({ port: 5432 });
    });

    it("[number] accepts a float", async () => {
        const doc = await yaml(`[number = "ratio", "1.618" !]`);
        expect(doc.ratio).toBeCloseTo(1.618);
    });

    it("[bool] emits boolean true", async () => {
        const doc = await yaml(`[bool = "enabled", "true" !]`);
        expect(doc).toEqual({ enabled: true });
    });

    it("[bool] emits boolean false", async () => {
        const doc = await yaml(`[bool = "debug", "false" !]`);
        expect(doc).toEqual({ debug: false });
    });

    it("[bool] accepts '1' as true", async () => {
        const doc = await yaml(`[bool = "flag", "1" !]`);
        expect(doc).toEqual({ flag: true });
    });

    it("[null] emits null", async () => {
        const doc = await yaml(`[null = "missing" !]`);
        expect(doc).toEqual({ missing: null });
    });
});

// ─── [mapping] ────────────────────────────────────────────────────────────────

describe("YAML [mapping]", () => {
    it("renders a mapping with shorthand fields", async () => {
        const doc = await yaml(`
            [mapping = "database"]
              [host = "localhost" !]
              [port = 5432 !]
              [ssl = true !]
            [end]
        `);
        expect(doc).toEqual({ database: { host: "localhost", port: 5432, ssl: true } });
    });

    it("renders a root mapping (no key)", async () => {
        const doc = await yaml(`
            [mapping]
              [name = "app" !]
              [env = "production" !]
            [end]
        `);
        expect(doc).toEqual({ name: "app", env: "production" });
    });

    it("renders deeply nested mappings", async () => {
        const doc = await yaml(`
            [mapping = "app"]
              [mapping = "server"]
                [host = "0.0.0.0" !]
                [port = 3000 !]
              [end]
              [mapping = "db"]
                [pool = 10 !]
              [end]
            [end]
        `);
        expect(doc).toEqual({
            app: { server: { host: "0.0.0.0", port: 3000 }, db: { pool: 10 } },
        });
    });
});

// ─── [seq] ────────────────────────────────────────────────────────────────────

describe("YAML [seq]", () => {
    it("renders a sequence of strings", async () => {
        const doc = await yaml(`
            [seq = "tags"]
              [str = "rust" !]
              [str = "cli" !]
              [str = "sommark" !]
            [end]
        `);
        expect(doc).toEqual({ tags: ["rust", "cli", "sommark"] });
    });

    it("renders a sequence of integers", async () => {
        const doc = await yaml(`
            [seq = "ports"]
              [int = 8001 !]
              [int = 8002 !]
            [end]
        `);
        expect(doc).toEqual({ ports: [8001, 8002] });
    });

    it("renders a mixed-type sequence", async () => {
        const doc = await yaml(`
            [seq = "values"]
              [str = "hello" !]
              [int = 42 !]
              [bool = true !]
              [null !]
            [end]
        `);
        expect(doc).toEqual({ values: ["hello", 42, true, null] });
    });
});

// ─── [map-item] ───────────────────────────────────────────────────────────────

describe("YAML [map-item]", () => {
    it("renders a list of objects using shorthand", async () => {
        const doc = await yaml(`
            [seq = "servers"]
              [map-item]
                [host = "10.0.0.1" !]
                [port = 8001 !]
              [end]
              [map-item]
                [host = "10.0.0.2" !]
                [port = 8002 !]
              [end]
            [end]
        `);
        expect(doc).toEqual({
            servers: [
                { host: "10.0.0.1", port: 8001 },
                { host: "10.0.0.2", port: 8002 },
            ],
        });
    });
});

// ─── block scalars ────────────────────────────────────────────────────────────

describe("YAML block scalars", () => {
    it("[literal] preserves newlines", async () => {
        const doc = await yaml(`
            [literal = "script"]
              line one
              line two
            [end]
        `);
        expect(doc.script).toContain("line one");
        expect(doc.script).toContain("line two");
        expect(doc.script).toContain("\n");
    });

    it("[folded] is parsed as a string", async () => {
        const doc = await yaml(`
            [folded = "description"]
              This is a folded
              description.
            [end]
        `);
        expect(typeof doc.description).toBe("string");
        expect(doc.description.trim()).toBeTruthy();
    });
});

// ─── document markers ─────────────────────────────────────────────────────────

describe("YAML document markers", () => {
    it("[doc-start] and [doc-end] produce valid YAML", async () => {
        const raw = await transpile(`
            [doc-start !]
            [name = "myapp" !]
            [doc-end !]
        `);
        expect(raw).toMatch(/^---/);
        expect(raw).toMatch(/\.\.\.$/m);
        const doc = parseYAML(raw);
        expect(doc).toEqual({ name: "myapp" });
    });
});

// ─── for-each ─────────────────────────────────────────────────────────────────

describe("YAML for-each", () => {
    it("generates dynamic mapping fields with [str]", async () => {
        const src = `
            [mapping = "dependencies"]
              [for-each = \${ packages }\$, as: "p"]
                [str = \${ p.name }\$, \${ p.version }\$ !]
              [end]
            [end]
        `;
        const doc = await yaml(src, {
            packages: [
                { name: "serde",   version: "1.0.0" },
                { name: "tokio",   version: "2.0.0" },
            ],
        });
        expect(doc.dependencies).toEqual({ serde: "1.0.0", tokio: "2.0.0" });
    });

    it("generates a dynamic sequence of strings", async () => {
        const src = `
            [seq = "tags"]
              [for-each = \${ tags }\$, as: "t"]
                [str = \${ t }\$ !]
              [end]
            [end]
        `;
        const doc = await yaml(src, { tags: ["rust", "cli", "config"] });
        expect(doc).toEqual({ tags: ["rust", "cli", "config"] });
    });

    it("generates a dynamic list of objects with [map-item]", async () => {
        const src = `
            [seq = "packages"]
              [for-each = \${ packages }\$, as: "p"]
                [map-item]
                  [name = \${ p.name }\$ !]
                  [version = \${ p.version }\$ !]
                  [optional = \${ p.optional }\$ !]
                [end]
              [end]
            [end]
        `;
        const doc = await yaml(src, {
            packages: [
                { name: "serde",   version: "1.0.0", optional: false },
                { name: "tokio",   version: "2.0.0", optional: true  },
            ],
        });
        expect(doc.packages).toEqual([
            { name: "serde", version: "1.0.0", optional: false },
            { name: "tokio", version: "2.0.0", optional: true  },
        ]);
    });
});

// ─── compile-time blocks ──────────────────────────────────────────────────────

describe("YAML compile-time blocks", () => {
    it("evaluates static expressions", async () => {
        const doc = await yaml(`[workers = \${ 2 + 2 }\$ !]`);
        expect(doc).toEqual({ workers: 4 });
    });

    it("shares variables across blocks", async () => {
        const src = `
            \${ const app = "SomMark"; const major = 5; }\$
            [name = \${ app }\$ !]
            [major = \${ major }\$ !]
        `;
        const doc = await yaml(src);
        expect(doc).toEqual({ name: "SomMark", major: 5 });
    });
});
