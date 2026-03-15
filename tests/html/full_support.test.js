import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import { removeWhiteSpaces, removeNewline } from "../../helpers/removeChar.js";

describe("HTML Full Support - New Features", () => {

    describe("Dynamic Tag Registration", () => {
        it("supports standard HTML5 tags (article, aside, nav)", async () => {
            const src = "[article]Article Content[end][aside]Aside Content[end][nav]Nav Content[end]";
            let output = await new SomMark({ src, format: "html", includeDocument: false }).transpile();
            output = removeWhiteSpaces(output);
            expect(output).toBe("<article>ArticleContent</article><aside>AsideContent</aside><nav>NavContent</nav>");
        });
    });

    describe("Smart Attribute / Style Mapping", () => {
        it("maps width/height as attributes for media tags (img, canvas)", async () => {
            const src = "[img = src:test.png, width:100, height:200][end][canvas = width:500, height:300][end]";
            let output = await new SomMark({ src, format: "html", includeDocument: false }).transpile();
            output = removeNewline(output);
            expect(output).toBe('<img src="test.png" width="100" height="200" /><canvas width="500" height="300"></canvas>');
        });

        it("maps width/height as styles for generic tags (div, section)", async () => {
            const src = "[div = width:100px, height:50px]Content[end]";
            let output = await new SomMark({ src, format: "html", includeDocument: false }).transpile();
            output = removeNewline(output);
            expect(output).toBe('<div style="width:100px;height:50px;">Content</div>');
        });

        it("handles data and aria attributes correctly", async () => {
            const src = "[div = data-test:value, aria-label:Greetings]Hello[end]";
            let output = await new SomMark({ src, format: "html", includeDocument: false }).transpile();
            output = removeNewline(output);
            expect(output).toBe('<div data-test="value" aria-label="Greetings">Hello</div>');
        });
    });

    describe("Event Handler Support", () => {
        it("transpiles lowercase event handlers (onclick)", async () => {
            const src = "[button = onclick:alert('hi')]Click me[end]";
            let output = await new SomMark({ src, format: "html", includeDocument: false }).transpile();
            output = removeNewline(output);
            expect(output).toBe('<button onclick="alert(&#39;hi&#39;)">Click me</button>');
        });

        it("standardizes camelCase event handlers to lowercase (onClick -> onclick)", async () => {
            const src = "[button = onClick:alert('hi')]Click me[end]";
            let output = await new SomMark({ src, format: "html", includeDocument: false }).transpile();
            output = removeNewline(output);
            expect(output).toBe('<button onclick="alert(&#39;hi&#39;)">Click me</button>');
        });
    });

    describe("Specialized AtBlocks", () => {
        it("renders Style AtBlock correctly", async () => {
            const src = "[Block]@_style_@;.test { color: red; }@_end_@[end]";
            let output = await new SomMark({ src, format: "html", includeDocument: false }).transpile();
            output = removeNewline(output);
            expect(output).toBe('<style>.test { color: red; }</style>');
        });

        it("renders Todo component with correct status and content", async () => {
            const src = "[todo = Done]Task 1[end][todo]Task 2[end]";
            let output = await new SomMark({ src, format: "html", includeDocument: false }).transpile();
            output = removeNewline(output);
            expect(output).toBe('<div><input type="checkbox" disabled checked /> Task 1</div><div><input type="checkbox" disabled /> Task 2</div>');
        });

        it("handles inline todo usage correctly", async () => {
            const src = "[Block](done)->(todo: Task 1)[end]";
            let output = await new SomMark({ src, format: "html", includeDocument: false }).transpile();
            output = removeNewline(output);
            expect(output).toBe('<div><input type="checkbox" disabled checked /> Task 1</div>');
        });
    });
});
