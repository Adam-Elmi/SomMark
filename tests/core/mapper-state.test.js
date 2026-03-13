import { describe, it, expect } from "vitest";
import SomMark, { FORMATS } from "../../index.js";
const { htmlFormat } = FORMATS;

describe("SomMark State Management", () => {
    it("should correctly clear and reset all registered mappers", async () => {
        const sm = new SomMark({ format: htmlFormat });

        // Starts with default tags
        expect(sm.get("bold")).not.toBeNull();

        sm.clear();

        // Empty after clear()
        expect(sm.get("bold")).toBeNull();

        // Can register new tags after clear
        sm.register("NewOnly", () => "Exclusive Content");
        const output = await sm.transpile("[NewOnly][end]");
        expect(output).toContain("Exclusive Content");
    });
});
