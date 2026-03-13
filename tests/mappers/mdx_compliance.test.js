import { describe, it, expect } from "vitest";
import { transpile } from "../../index.js";

describe("MDX Mapper: Compliance & Enhancements", () => {
    const options = { format: "mdx", includeDocument: false, plugins: ["raw-content"] };

    it("renders standard HTML tags as JSX", async () => {
        const src = '[div = class: "container"]Content[end]';
        const result = await transpile({ src, ...options });
        expect(result).toContain('<div className="container">');
        expect(result).toContain('Content');
        expect(result).toContain('</div>');
    });

    it("supports custom components (Catch-all mapping)", async () => {
        const src = '[MyCustomCard = title: "Hello", primary: true]Card Body[end]';
        const result = await transpile({ src, ...options });
        expect(result).toContain('<MyCustomCard title="Hello" primary={true}>');
        expect(result).toContain('Card Body');
        expect(result).toContain('</MyCustomCard>');
    });

    it("supports raw mdx blocks for ESM (via raw-content-plugin)", async () => {
        const src = `
[mdx]
import { Chart } from "./Chart.js";
export const data = [1, 2, 3];

function Local() {
  return <div>Local</div>;
}
[end]
`;
        const result = await transpile({ src, ...options });
        expect(result).toContain('import { Chart } from "./Chart.js";');
        expect(result).toContain('export const data =');
        expect(result).toContain('[1, 2, 3];');
        expect(result).toContain('function Local()');
    });

    it("performs smart expression and style conversion", async () => {
        const src = '[div = style: "color: red, margin-top: 10px", count: 2 + 2, active: true]Content[end]';
        const result = await transpile({ src, ...options });
        
        // Style conversion: snake-case to camelCase, object syntax
        expect(result).toContain("style={{color:'red',marginTop:'10px'}}");
        
        // Expression detection
        expect(result).toContain('count={2 + 2}');
        
        // Boolean detection
        expect(result).toContain('active={true}');
    });

    it("handles both camelCase and kebab-case for styles", async () => {
        const src = '[div = style: "fontSize: 16px, background-color: blue"]Text[end]';
        const result = await transpile({ src, ...options });
        expect(result).toContain("style={{fontSize:'16px',backgroundColor:'blue'}}");
    });

    it("preserves self-closing tags correctly in MDX", async () => {
        const src = '[img = src: "logo.png", width: 200][end]';
        const result = await transpile({ src, ...options });
        expect(result).toContain('<img src="logo.png" width={200} />');
    });
});
