import { describe, it, expect } from "vitest";
import Mapper from "../../mappers/mapper.js";
import TagBuilder from "../../formatter/tag.js";

describe("Mapper Class Methods", () => {

	describe("Tag Registration & Retrieval", () => {
		it("should register and retrieve a single output", () => {
			const mapper = new Mapper();
			const render = () => "test";
			mapper.register("test", render);
			
			const output = mapper.get("test");
			expect(output.render).toBe(render);
			expect(output.id).toBe("test");
		});

		it("should register multiple IDs for one output", () => {
			const mapper = new Mapper();
			const render = () => "test";
			mapper.register(["a", "b"], render);
			
			expect(mapper.get("a").render).toBe(render);
			expect(mapper.get("b").render).toBe(render);
		});

		it("should throw error if expected arguments are not defined", () => {
			const mapper = new Mapper();
			expect(() => mapper.register(null, () => {})).toThrow("Expected arguments are not defined");
			expect(() => mapper.register("a", null)).toThrow("Expected arguments are not defined");
		});

		it("should throw TypeError if id or renderOutput are invalid types", () => {
			const mapper = new Mapper();
			expect(() => mapper.register(123, () => {})).toThrow(TypeError);
			expect(() => mapper.register("a", "not-a-func")).toThrow(TypeError);
		});

		it("should reject registration of engine reserved keywords", () => {
			const mapper = new Mapper();
			expect(() => mapper.register("end", () => {})).toThrow("Reserved Keyword Error");
			expect(() => mapper.register("import", () => {})).toThrow("Reserved Keyword Error");
			expect(() => mapper.register("slot", () => {})).toThrow("Reserved Keyword Error");
			expect(() => mapper.register("$use-module", () => {})).toThrow("Reserved Keyword Error");
			expect(() => mapper.register("for-each", () => {})).toThrow("Reserved Keyword Error");
			expect(() => mapper.register(["div", "slot"], () => {})).toThrow("Reserved Keyword Error");
		});

		it("should remove existing overlaps when registering a new tag", () => {
			const mapper = new Mapper();
			mapper.register("a", () => "v1");
			mapper.register("a", () => "v2"); // Overwrite
			
			expect(mapper.outputs.length).toBe(1);
			expect(mapper.get("a").render()).toBe("v2");
		});

		it("should remove a specific output using removeOutput", () => {
			const mapper = new Mapper();
			mapper.register("a", () => "a");
			mapper.removeOutput("a");
			expect(mapper.get("a")).toBeNull();
		});

		it("should throw TypeError if removeOutput receives non-string parameter", () => {
			const mapper = new Mapper();
			expect(() => mapper.removeOutput(123)).toThrow(TypeError);
		});

		it("should remove one ID from a shared registration array", () => {
			const mapper = new Mapper();
			mapper.register(["a", "b"], () => "shared");
			mapper.removeOutput("a");
			
			expect(mapper.get("a")).toBeNull();
			expect(mapper.get("b")).not.toBeNull();
			expect(mapper.get("b").id).toEqual(["b"]);
		});

		it("should clear all outputs using clear()", () => {
			const mapper = new Mapper();
			mapper.register("a", () => "a");
			mapper.clear();
			expect(mapper.outputs.length).toBe(0);
		});

		it("should check if IDs are included using includesId", () => {
			const mapper = new Mapper();
			expect(mapper.includesId(null)).toBe(false);
			expect(mapper.includesId([])).toBe(false);

			mapper.register(["a", "b"], () => "test");
			mapper.register("d", () => "single");
			
			expect(mapper.includesId(["a"])).toBe(true);
			expect(mapper.includesId(["b"])).toBe(true);
			expect(mapper.includesId(["d"])).toBe(true);
			expect(mapper.includesId(["c"])).toBe(false);
			expect(mapper.includesId(["a", "c"])).toBe(true);
		});
	});

	describe("Inheritance", () => {
		it("should inherit outputs from other mappers", () => {
			const m1 = new Mapper();
			m1.register("a", () => "A");
			
			const m2 = new Mapper();
			m2.inherit(m1);
			
			expect(m2.get("a")).not.toBeNull();
			expect(m2.get("a").render()).toBe("A");
		});

		it("should follow last-match-wins logic during inheritance", () => {
			const m1 = new Mapper();
			m1.register("dup", () => "M1");
			
			const m2 = new Mapper();
			m2.register("dup", () => "M2");
			
			const main = new Mapper();
			main.inherit(m1, m2);
			
			expect(main.get("dup").render()).toBe("M2");
		});
	});

	describe("Default Behavior & Formats", () => {
		const mapper = new Mapper();

		it("text() should return content as-is", () => {
			expect(mapper.text("hello")).toBe("hello");
		});

		it("comment() should return empty string", () => {
			expect(mapper.comment("secret")).toBe("");
		});

		it("commentBlock() should default to comment() result", () => {
			expect(mapper.commentBlock("secret")).toBe("");
		});

		it("commentBlock() should delegate to custom comment() implementation", () => {
			const customMapper = Mapper.define({
				comment: (t) => `# ${t}`
			});
			expect(customMapper.commentBlock("test")).toBe("# test");
		});

		it("runtimeLogic() should discard runtime blocks with empty string by default", () => {
			expect(mapper.runtimeLogic("console.log(1)")).toBe("");
		});

		it("getUnknownTag() should return null", () => {
			expect(mapper.getUnknownTag({})).toBeNull();
		});
	});

	describe("Utilities & safeArg", () => {
		const mapper = new Mapper();

		it("tag() should return a TagBuilder instance", () => {
			const builder = mapper.tag("div");
			expect(builder).toBeInstanceOf(TagBuilder);
		});

		it("safeArg() should handle positional and named arguments", () => {
			const props = { 0: "pos0", key: "val" };
			
			expect(mapper.safeArg({ props, index: 0, key: "none" })).toBe("pos0");
			expect(mapper.safeArg({ props, index: 1, key: "key" })).toBe("val");
			expect(mapper.safeArg({ props, index: 5, key: "missing", fallBack: "default" })).toBe("default");
		});

		it("safeArg() should handle type validation without transformation", () => {
			const props = { num: "123", bool: "true" };
			
			// It validates that Number("123") is a "number", but returns the raw "123"
			expect(mapper.safeArg({ props, index: 0, key: "num", type: "number", setType: Number })).toBe("123");
			
			// It validates that (v => v === "true")("true") is a "boolean", but returns the raw "true"
			const toBool = (v) => v === "true";
			expect(mapper.safeArg({ props, index: 0, key: "bool", type: "boolean", setType: toBool })).toBe("true");
		});

		it("clone() should create a deep copy and isolate changes", () => {
			const original = new Mapper();
			original.register("a", () => "original");
			original.options.test = true;
			original.customProps.add("x");
			
			const replica = original.clone();
			replica.register("a", () => "replica");
			replica.options.test = false;
			
			expect(original.get("a").render()).toBe("original");
			expect(original.options.test).toBe(true);
			expect(original.customProps.has("x")).toBe(true);

			expect(replica.get("a").render()).toBe("replica");
			expect(replica.options.test).toBe(false);
			expect(replica.customProps.has("x")).toBe(true);
		});

		it("clone() should copy custom methods and preserve their 'this' binding", () => {
			const original = Mapper.define({
				myCustomVal: "yes",
				customMethod() { return this.myCustomVal; }
			});
			const cloned = original.clone();
			expect(cloned.customMethod()).toBe("yes");
		});
	});

	describe("Static Factory", () => {
		it("Mapper.define() should create a mapper with custom overrides", () => {
			const custom = Mapper.define({
				text: (t) => t.toUpperCase(),
				customVal: 123
			});
			
			expect(custom.text("hi")).toBe("HI");
			expect(custom.customVal).toBe(123);
			expect(custom).toBeInstanceOf(Mapper);
		});
	});
});
