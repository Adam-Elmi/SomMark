import { describe, it, expect } from "vitest";
import Papa from "papaparse";
import SomMark from "../../../index.js";

const transpile = (src, placeholders = {}) =>
    new SomMark({ src, format: "csv", placeholders }).transpile();

// Parses the output with PapaParse and returns { fields, data } so tests can
// assert on both the header row and data rows independently.
const csv = async (src, placeholders) => {
    const raw = await transpile(src, placeholders);
    const result = Papa.parse(raw.trim(), { header: true, skipEmptyLines: true });
    return { fields: result.meta.fields, data: result.data, raw };
};

// ─── [header] ─────────────────────────────────────────────────────────────────

describe("CSV [header]", () => {
    it("renders a self-closing header row", async () => {
        const { fields } = await csv(`[header = "name", "age", "city" !]`);
        expect(fields).toEqual(["name", "age", "city"]);
    });

    it("renders a body-form header with [col] children", async () => {
        const { fields } = await csv(`
            [header]
              [col]name[end]
              [col]age[end]
              [col]city[end]
            [end]
        `);
        expect(fields).toEqual(["name", "age", "city"]);
    });

    it("[thead] is an alias for [header]", async () => {
        const { fields } = await csv(`[thead = "id", "email" !]`);
        expect(fields).toEqual(["id", "email"]);
    });
});

// ─── [row] ────────────────────────────────────────────────────────────────────

describe("CSV [row]", () => {
    it("renders a self-closing data row", async () => {
        const { data } = await csv(`
            [header = "name", "age" !]
            [row = "Adam", "25" !]
        `);
        expect(data).toEqual([{ name: "Adam", age: "25" }]);
    });

    it("renders a body-form row with [col] children", async () => {
        const { data } = await csv(`
            [header = "name", "city" !]
            [row]
              [col]Adam[end]
              [col]Hargeisa[end]
            [end]
        `);
        expect(data).toEqual([{ name: "Adam", city: "Hargeisa" }]);
    });

    it("[tr] and [td] are aliases", async () => {
        const { data } = await csv(`
            [header = "x", "y" !]
            [tr]
              [td]1[end]
              [td]2[end]
            [end]
        `);
        expect(data).toEqual([{ x: "1", y: "2" }]);
    });

    it("renders multiple rows", async () => {
        const { data } = await csv(`
            [header = "name", "age" !]
            [row = "Adam",  "25" !]
            [row = "Elmi",  "40" !]
            [row = "Farah", "32" !]
        `);
        expect(data).toHaveLength(3);
        expect(data[0]).toEqual({ name: "Adam",  age: "25" });
        expect(data[1]).toEqual({ name: "Elmi",  age: "40" });
        expect(data[2]).toEqual({ name: "Farah", age: "32" });
    });
});

// ─── CSV escaping ─────────────────────────────────────────────────────────────

describe("CSV value escaping", () => {
    it("quotes a value that contains a comma", async () => {
        const { data } = await csv(`
            [header = "place" !]
            [row = "Hargeisa, Somaliland" !]
        `);
        expect(data[0].place).toBe("Hargeisa, Somaliland");
    });

    it("doubles internal quotes per RFC 4180", async () => {
        const { data } = await csv(`
            [header = "quote" !]
            [row = 'say "hello"' !]
        `);
        expect(data[0].quote).toBe('say "hello"');
    });

    it("preserves a value that contains a newline", async () => {
        const { data } = await csv(`
            [header = "text" !]
            [row]
              [col]line one
line two[end]
            [end]
        `);
        expect(data[0].text).toContain("line one");
    });
});

// ─── for-each ─────────────────────────────────────────────────────────────────

describe("CSV for-each", () => {
    it("generates dynamic rows from an array", async () => {
        const src = `
            [header = "name", "age", "city" !]
            [for-each = \${ users }\$, as: "u"]
              [row = \${ u.name }\$, \${ u.age }\$, \${ u.city }\$ !]
            [end]
        `;
        const { data } = await csv(src, {
            users: [
                { name: "Adam",  age: 25, city: "Hargeisa"  },
                { name: "Elmi",  age: 40, city: "Borama"    },
                { name: "Farah", age: 32, city: "Mogadishu" },
            ],
        });
        expect(data).toHaveLength(3);
        expect(data[0]).toEqual({ name: "Adam",  age: "25", city: "Hargeisa"  });
        expect(data[1]).toEqual({ name: "Elmi",  age: "40", city: "Borama"    });
        expect(data[2]).toEqual({ name: "Farah", age: "32", city: "Mogadishu" });
    });

    it("generates rows with [col] children inside for-each", async () => {
        const src = `
            [header = "product", "price" !]
            [for-each = \${ items }\$, as: "item"]
              [row]
                [col]\${ item.name }\$[end]
                [col]\${ item.price }\$[end]
              [end]
            [end]
        `;
        const { data } = await csv(src, {
            items: [
                { name: "Keyboard", price: 49.99 },
                { name: "Mouse",    price: 29.99 },
            ],
        });
        expect(data).toHaveLength(2);
        expect(data[0].product).toBe("Keyboard");
        expect(data[1].product).toBe("Mouse");
    });

    it("uses loop index ${ i }$", async () => {
        const src = `
            [header = "index", "name" !]
            [for-each = \${ ["A","B","C"] }\$, as: "v"]
              [row = \${ i }\$, \${ v }\$ !]
            [end]
        `;
        const { data } = await csv(src);
        expect(data[0].index).toBe("0");
        expect(data[1].index).toBe("1");
        expect(data[2].index).toBe("2");
    });
});

// ─── compile-time blocks ──────────────────────────────────────────────────────

describe("CSV compile-time blocks", () => {
    it("evaluates static expressions in cells", async () => {
        const src = `
            [header = "result" !]
            [row = \${ 6 * 7 }\$ !]
        `;
        const { data } = await csv(src);
        expect(data[0].result).toBe("42");
    });

    it("uses shared variables across rows", async () => {
        const src = `
            \${ const label = "v5"; }\$
            [header = "version" !]
            [row = \${ label }\$ !]
        `;
        const { data } = await csv(src);
        expect(data[0].version).toBe("v5");
    });
});

// ─── output shape ─────────────────────────────────────────────────────────────

describe("CSV output shape", () => {
    it("produces valid RFC 4180 CSV that PapaParse parses without errors", async () => {
        const src = `
            [header = "name", "score" !]
            [row = "Alice", "98.5" !]
            [row = "Bob",   "72.0" !]
        `;
        const raw = await transpile(src);
        const result = Papa.parse(raw.trim(), { header: true, skipEmptyLines: true });
        expect(result.errors).toHaveLength(0);
        expect(result.data).toHaveLength(2);
    });
});
