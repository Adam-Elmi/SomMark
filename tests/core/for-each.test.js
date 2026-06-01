import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import evaluator from "../../core/evaluator.js";

describe("Native [for-each] Keyword Core Tests", () => {
	const format = "html";

	describe("1. Valid Iterations & Context Scoping", () => {
		it("repeats inner content for an array of strings resolved positionally", async () => {
			const sm = new SomMark({
				src: "[ul][for-each = static ${[\"Apple\", \"Banana\"]}$][li]static ${item}$[end][end][end]",
				format
			});
			const output = await sm.transpile();
			expect(output).toBe("<ul><li>Apple</li><li>Banana</li></ul>");
		});

		it("repeats inner content for an array of strings resolved via the named 'items' argument", async () => {
			const sm = new SomMark({
				src: "[ul][for-each = items: static ${[\"Apple\", \"Banana\"]}$, as: \"item\"][li]static ${item}$[end][end][end]",
				format
			});
			const output = await sm.transpile();
			expect(output).toBe("<ul><li>Apple</li><li>Banana</li></ul>");
		});

		it("assigns a custom variable name to the current loop item using the 'as' option", async () => {
			const sm = new SomMark({
				src: "[for-each = static ${[\"Red\", \"Blue\"]}$, as: \"color\"]static ${color}$[end]",
				format
			});
			const output = await sm.transpile();
			expect(output).toBe("RedBlue");
		});

		it("tracks and binds incremental iteration indexes under the active item suffix", async () => {
			const sm = new SomMark({
				src: "[for-each = static ${[\"a\", \"b\"]}$]static ${item_index}$:static ${item}$[end]",
				format
			});
			const output = await sm.transpile();
			expect(output).toBe("0:a1:b");
		});

		it("handles deeply nested loops by isolating inner scopes from parent scopes", async () => {
			const sm = new SomMark({
				src: "[for-each = static ${[\"a\", \"b\"]}$, as: \"outer\"][for-each = static ${[1, 2]}$, as: \"inner\"]static ${outer + inner}$[end][end]",
				format
			});
			const output = await sm.transpile();
			expect(output).toBe("a1a2b1b2");
		});

		it("resolves nested property attributes of list objects natively inside loop bodies", async () => {
			const sm = new SomMark({
				src: "[for-each = static ${[{ name: \"Adam\" }, { name: \"Elmi\" }]}$]static ${item.name}$[end]",
				format
			});
			const output = await sm.transpile();
			expect(output).toBe("AdamElmi");
		});

		it("renders an empty string and does not execute the body if the items list is empty", async () => {
			const sm = new SomMark({
				src: "[for-each = static ${[]}$]Item: static ${item}$[end]",
				format
			});
			const output = await sm.transpile();
			expect(output).toBe("");
		});
	});

	describe("2. Whitespace & Body Formatting", () => {
		it("trims leading and trailing structural line breaks from the loop body output", async () => {
			const sm = new SomMark({
				src: `[for-each = static \${["a", "b"]}$]
    [span]static \${item}$[end]
[end]`,
				format
			});
			const output = await sm.transpile();
			expect(output).toBe("<span>a</span><span>b</span>");
		});
	});

	describe("3. Scope Security & VM Cleanup", () => {
		it("deletes loop context variables from the VM global scope after compilation is complete", async () => {
			const sm = new SomMark({
				src: "[for-each = static ${['test']}$]Body[end]",
				format
			});
			await sm.transpile();

			// Initialize a direct VM query to verify scope variables are cleaned up
			await evaluator.init(null, {}, { format }, null);
			// Verify item and item_index variables are completely cleaned up and undefined
			const itemVal = await evaluator.execute("typeof item !== 'undefined' ? item : 'cleaned'");
			const indexVal = await evaluator.execute("typeof item_index !== 'undefined' ? item_index : 'cleaned'");
			evaluator.destroy();

			expect(itemVal).toBe("cleaned");
			expect(indexVal).toBe("cleaned");
		});
	});

	describe("4. Error Gatekeeping & Boundaries", () => {
		it("throws a transpiler type error if the provided loop value is not a standard JavaScript Array", async () => {
			const sm = new SomMark({
				src: "[for-each = static ${\"NotAnArray\"}$]...[end]",
				format
			});
			await expect(sm.transpile()).rejects.toThrow(/Type Error in \[for-each\]/);
		});
	});
});
