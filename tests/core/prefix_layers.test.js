import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";

describe("SomMark Prefix Layers (Context Logic)", () => {
    const placeholder = {
        name: "Adam",
        site: "SomMark",
        v: "4.0"
    };

    const options = {
        format: "html",
        placeholder
    };

    describe("p{} Placeholders", () => {
        it("should resolve at top-level text", async () => {
            const src = "Welcome to p{site} vp{v}!";
            const sm = new SomMark({ ...options, src });
            const output = await sm.transpile();
            expect(output).toBe("Welcome to SomMark v4.0!");
        });

        it("should resolve inside a block body", async () => {
            const src = "[div]\nHello p{name}!\n[end]";
            const sm = new SomMark({ ...options, src });
            const output = await sm.transpile();
            expect(output).toContain("<div>\nHello Adam!\n</div>");
        });

        it("should resolve inside a block header (unquoted)", async () => {
            const src = "[a = href: p{site}]Link[end]";
            const sm = new SomMark({ ...options, src });
            const output = await sm.transpile();
            expect(output).toContain("<a href=\"SomMark\">Link</a>");
        });

        it("should resolve inside a block header (quoted)", async () => {
            const src = "[a = href: \"https://p{site}.com\"]Link[end]";
            const sm = new SomMark({ ...options, src });
            const output = await sm.transpile();
            expect(output).toContain("<a href=\"https://SomMark.com\">Link</a>");
        });

        it("should NOT resolve inside an At-Block header value", async () => {
            const src = "@_Table_@: key:p{site}; content @_end_@";
            const sm = new SomMark({ ...options, src });
            const output = await sm.transpile();
            // Prefix should be literal
            expect(output).toContain("p{site}");
        });

        it("should NOT resolve inside an At-Block body", async () => {
            const src = "@_raw_@; p{site} @_end_@";
            const sm = new SomMark({ ...options, src });
            const output = await sm.transpile();
            expect(output).toContain("p{site}");
        });

        it("should NOT resolve inside an Inline statement header", async () => {
            const src = "(p{site})->(bold)";
            const sm = new SomMark({ ...options, src });
            const output = await sm.transpile();
            expect(output).toContain("p{site}");
        });

        it("should resolve placeholders from dynamic public API data", async () => {
            // Simulating a real fetch call to a public API
            const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
            const rawTodo = await response.json();

            // Note: SomMark engine currently expects placeholder values used in text 
            // to be strings (it may crash if they are Numbers/Booleans due to .trim() calls).
            // We cast them here to ensure compatibility.
            const todo = {
                id: String(rawTodo.id) || "Unknown",
                title: String(rawTodo.title) || "Unknown",
                completed: String(rawTodo.completed) || "Unknown"
            };

            const src = "Todo ID p{id} -- p{title} -- Status: p{completed}";
            const sm = new SomMark({
                format: "html",
                src,
                placeholders: todo
            });
            const output = await sm.transpile();

            expect(output).toBe(`Todo ID ${todo.id} -- ${todo.title} -- Status: ${todo.completed}`);
        });

        it("should handle raw numeric and boolean placeholders without crashing", async () => {
            const src = "[div = style: p{width}]p{msg}: p{active}[end]";
            const sm = new SomMark({
                format: "html",
                src,
                placeholders: {
                    width: 100,
                    msg: "Status",
                    active: true
                }
            });
            const output = await sm.transpile();
            expect(output).toContain('style="100;"');
            expect(output).toContain('Status: true');
        });
    });

    describe("js{} JavaScript Layers", () => {
        it("should resolve inside a block header (object literal)", async () => {
            const src = "[div = data-info: js{ {id: 1, val: \"test\"} }]content[end]";
            const sm = new SomMark({ ...options, src });
            const output = await sm.transpile();
            expect(output).toContain("data-info");
        });

        it("should NOT resolve at top-level", async () => {
            const src = "The result is js{ {a: 1} }";
            const sm = new SomMark({ ...options, src });
            const output = await sm.transpile();
            expect(output).toBe("The result is js{ {a: 1} }");
        });

        it("should NOT resolve inside a block body", async () => {
            const src = "[div]js{{a:1}}[end]";
            const sm = new SomMark({ ...options, src });
            const output = await sm.transpile();
            expect(output).toBe("<div>js{{a:1}}</div>");
        });

        it("should handle braces inside string literals correctly (Regression: Prefix Layer collection)", async () => {
            const src = "[div = data-bug: js{{ a: \"}\" }}]content[end]";
            const sm = new SomMark({ ...options, src });
            const output = await sm.transpile();
            // If bug exists, lexer stops at the "}" inside the string, 
            // and the final "}" would be left over, likely causing a parser error or trailing text.
            // If fixed, it correctly captures the entire js{} layer and resolves it as an object.
            expect(output).toContain("data-bug");
            expect(output).toContain("{&quot;a&quot;:&quot;}&quot;}");
        });
    });
});
