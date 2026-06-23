import { describe, it, expect } from "vitest";
import { parse as parseTOML } from "smol-toml";
import SomMark from "../../../index.js";

const transpile = (src, placeholders = {}) =>
    new SomMark({ src, format: "toml", placeholders }).transpile();

// Round-trips the output through a real TOML parser so every test proves
// both that the output is syntactically valid TOML and that it carries the
// correct values.
const toml = async (src, placeholders) => parseTOML(await transpile(src, placeholders));

// ─── Shorthand (unknown-tag) key-value ────────────────────────────────────────

describe("TOML shorthand key-value (unknown tag)", () => {
    it("emits a quoted string", async () => {
        const doc = await toml(`[name = "Adam" !]`);
        expect(doc).toEqual({ name: "Adam" });
    });

    it("emits an integer", async () => {
        const doc = await toml(`[port = 5432 !]`);
        expect(doc).toEqual({ port: 5432 });
    });

    it("emits a float", async () => {
        const doc = await toml(`[ratio = 1.618 !]`);
        expect(doc.ratio).toBeCloseTo(1.618);
    });

    it("emits boolean true", async () => {
        const doc = await toml(`[active = true !]`);
        expect(doc).toEqual({ active: true });
    });

    it("emits boolean false", async () => {
        const doc = await toml(`[debug = false !]`);
        expect(doc).toEqual({ debug: false });
    });

    it("emits a string that looks like a number when using [str]", async () => {
        const doc = await toml(`[str = "code", "007" !]`);
        expect(doc).toEqual({ code: "007" });
    });

    it("reads value from body text", async () => {
        const doc = await toml(`[bio]Software developer[end]`);
        expect(doc).toEqual({ bio: "Software developer" });
    });

    it("handles multiple root keys", async () => {
        const doc = await toml(`
            [name = "SomMark" !]
            [version = "5.0.0" !]
            [stable = true !]
        `);
        expect(doc).toEqual({ name: "SomMark", version: "5.0.0", stable: true });
    });
});

// ─── Typed scalar blocks ──────────────────────────────────────────────────────

describe("TOML typed scalar blocks", () => {
    it("[str] emits a quoted string key-value", async () => {
        const doc = await toml(`[str = "name", "Adam" !]`);
        expect(doc).toEqual({ name: "Adam" });
    });

    it("[str] with body form", async () => {
        const doc = await toml(`[str = "desc"]A long description.[end]`);
        expect(doc).toEqual({ desc: "A long description." });
    });

    it("[int] emits an integer key-value", async () => {
        const doc = await toml(`[int = "port", "5432" !]`);
        expect(doc).toEqual({ port: 5432 });
    });

    it("[int] throws when given a decimal value", async () => {
        await expect(toml(`[int = "pi", "3.14" !]`)).rejects.toThrow();
    });

    it("[float] emits a float key-value", async () => {
        const doc = await toml(`[float = "pi", "3.14159" !]`);
        expect(doc.pi).toBeCloseTo(3.14159);
    });

    it("[float] throws when given a whole number", async () => {
        await expect(toml(`[float = "port", "5432" !]`)).rejects.toThrow();
    });

    it("[number] accepts an integer", async () => {
        const doc = await toml(`[number = "port", "5432" !]`);
        expect(doc).toEqual({ port: 5432 });
    });

    it("[number] accepts a float", async () => {
        const doc = await toml(`[number = "ratio", "1.618" !]`);
        expect(doc.ratio).toBeCloseTo(1.618);
    });

    it("[bool] emits boolean true", async () => {
        const doc = await toml(`[bool = "enabled", "true" !]`);
        expect(doc).toEqual({ enabled: true });
    });

    it("[bool] emits boolean false", async () => {
        const doc = await toml(`[bool = "debug", "false" !]`);
        expect(doc).toEqual({ debug: false });
    });

    it("[bool] accepts '1' as true", async () => {
        const doc = await toml(`[bool = "flag", "1" !]`);
        expect(doc).toEqual({ flag: true });
    });

    it("[datetime] emits a bare datetime", async () => {
        const doc = await toml(`[datetime = "created_at", "1979-05-27T07:32:00Z" !]`);
        expect(doc.created_at).toBeInstanceOf(Date);
    });
});

// ─── [table] ──────────────────────────────────────────────────────────────────

describe("TOML [table]", () => {
    it("renders a table with shorthand fields", async () => {
        const doc = await toml(`
            [table = "database"]
              [host = "localhost" !]
              [port = 5432 !]
              [ssl = true !]
            [end]
        `);
        expect(doc).toEqual({ database: { host: "localhost", port: 5432, ssl: true } });
    });

    it("renders a table with typed scalar fields", async () => {
        const doc = await toml(`
            [table = "server"]
              [str = "ip", "10.0.0.1" !]
              [int = "port", "8080" !]
            [end]
        `);
        expect(doc).toEqual({ server: { ip: "10.0.0.1", port: 8080 } });
    });

    it("handles a dotted table name", async () => {
        const doc = await toml(`
            [table = "server.production"]
              [ip = "10.0.0.1" !]
            [end]
        `);
        expect(doc.server.production.ip).toBe("10.0.0.1");
    });
});

// ─── [array-table] ────────────────────────────────────────────────────────────

describe("TOML [array-table]", () => {
    it("renders multiple entries as an array of tables", async () => {
        const doc = await toml(`
            [array-table = "servers"]
              [host = "alpha" !]
              [port = 8001 !]
            [end]
            [array-table = "servers"]
              [host = "beta" !]
              [port = 8002 !]
            [end]
        `);
        expect(doc.servers).toEqual([
            { host: "alpha", port: 8001 },
            { host: "beta",  port: 8002 },
        ]);
    });
});

// ─── [array] ──────────────────────────────────────────────────────────────────

describe("TOML [array]", () => {
    it("renders an inline integer array", async () => {
        const doc = await toml(`
            [array = "ports"]
              [int = 8001 !]
              [int = 8002 !]
              [int = 8003 !]
            [end]
        `);
        expect(doc).toEqual({ ports: [8001, 8002, 8003] });
    });

    it("renders an inline string array", async () => {
        const doc = await toml(`
            [array = "tags"]
              [str = "rust" !]
              [str = "cli" !]
            [end]
        `);
        expect(doc).toEqual({ tags: ["rust", "cli"] });
    });

    it("renders a mixed-type inline array", async () => {
        const doc = await toml(`
            [array = "mixed"]
              [str = "hello" !]
              [int = 42 !]
              [bool = true !]
            [end]
        `);
        expect(doc).toEqual({ mixed: ["hello", 42, true] });
    });
});

// ─── for-each ─────────────────────────────────────────────────────────────────

describe("TOML for-each", () => {
    it("generates a dynamic array of tables", async () => {
        const src = `
            [for-each = \${ servers }\$, as: "s"]
              [array-table = "servers"]
                [host = \${ s.host }\$ !]
                [port = \${ s.port }\$ !]
              [end]
            [end]
        `;
        const doc = await toml(src, {
            servers: [
                { host: "10.0.0.1", port: 8001 },
                { host: "10.0.0.2", port: 8002 },
            ],
        });
        expect(doc.servers).toEqual([
            { host: "10.0.0.1", port: 8001 },
            { host: "10.0.0.2", port: 8002 },
        ]);
    });

    it("generates a dynamic inline array", async () => {
        const src = `
            [array = "tags"]
              [for-each = \${ tags }\$, as: "t"]
                [str = \${ t }\$ !]
              [end]
            [end]
        `;
        const doc = await toml(src, { tags: ["rust", "cli", "config"] });
        expect(doc).toEqual({ tags: ["rust", "cli", "config"] });
    });

    it("generates dynamic table fields with typed [str]", async () => {
        const src = `
            [table = "dependencies"]
              [for-each = \${ packages }\$, as: "p"]
                [str = \${ p.name }\$, \${ p.version }\$ !]
              [end]
            [end]
        `;
        const doc = await toml(src, {
            packages: [
                { name: "serde",   version: "1.0.0" },
                { name: "tokio",   version: "2.0.0" },
            ],
        });
        expect(doc.dependencies).toEqual({ serde: "1.0.0", tokio: "2.0.0" });
    });
});

// ─── compile-time blocks ──────────────────────────────────────────────────────

describe("TOML compile-time blocks", () => {
    it("evaluates static expressions", async () => {
        const doc = await toml(`[workers = \${ 2 + 2 }\$ !]`);
        expect(doc).toEqual({ workers: 4 });
    });

    it("shares variables across blocks", async () => {
        const src = `
            \${ const prefix = "v"; const num = 5; }\$
            [label = \${ prefix + num }\$ !]
        `;
        const doc = await toml(src);
        expect(doc).toEqual({ label: "v5" });
    });
});
