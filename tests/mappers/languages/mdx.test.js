import { describe, it, expect } from 'vitest';
import SomMark from '../../../index.js';
import { compile } from '@mdx-js/mdx';

/**
 * MDX High-Fidelity Test Suite
 * Validates SomMark output using the official @mdx-js/mdx compiler.
 */
describe('MDX Mapper (V4 High-Fidelity)', () => {

    /**
     * Helper to validate that a string is valid MDX syntax.
     * Attempts to compile the MDX; throws on syntax errors.
     */
    const validateMDX = async (output) => {
        try {
            await compile(output);
            return true;
        } catch (err) {
            console.error('MDX Compilation Error:', err.message);
            console.error('Offending Output:\n', output);
            throw err;
        }
    };

    const smSettings = (src) => ({
        src,
        format: 'mdx'
    });

    describe('Tag Casing and Identity', () => {
        it('should preserve PascalCase for components', async () => {
            const sm = new SomMark(smSettings('[Gallery]Content[end]'));
            const output = await sm.transpile();

            expect(output).toContain('<Gallery>');
            expect(output).toContain('</Gallery>');
            await validateMDX(output);
        });

        it('should lowercase standard HTML elements by default if provided as lowercase', async () => {
            const sm = new SomMark(smSettings('[div]Content[end]'));
            const output = await sm.transpile();

            expect(output).toContain('<div>');
            expect(output).toContain('</div>');
            await validateMDX(output);
        });
    });

    describe('Attributes and js{...} Expressions', () => {
        it('should render standard HTML attributes as strings', async () => {
            const sm = new SomMark(smSettings('[div = class: "main", id: "root"]Body[end]'));
            const output = await sm.transpile();

            expect(output).toContain('className="main"');
            expect(output).toContain('id="root"');
            await validateMDX(output);
        });

        it('should handle primitive JSX expressions correctly', async () => {
            const sm = new SomMark(smSettings('[MyComp = count: 5, active: true]Body[end]'));
            const output = await sm.transpile();

            expect(output).toContain('count={5}');
            expect(output).toContain('active={true}');
            await validateMDX(output);
        });

        it('should handle complex nested data in js{...}', async () => {
            const sm = new SomMark(smSettings('[User = profile: js{ {name: "Adam", roles: ["admin", "dev"], meta: { active: true } } }]Body[end]'));
            const output = await sm.transpile();

            expect(output).toContain('profile={{name:"Adam",roles:["admin","dev"],meta:{active:true}}}');
            await validateMDX(output);
        });

        it('should objectify inline style strings for React compatibility', async () => {
            const sm = new SomMark(smSettings('[div = style: "color: red; margin-top: 10px"]Text[end]'));
            const output = await sm.transpile();

            expect(output).toContain('style={{color:"red",marginTop:"10px"}}');
            await validateMDX(output);
        });
    });

    describe('Structural Fidelity', () => {
        it('should render self-closing tags for void elements', async () => {
            const sm = new SomMark(smSettings('[img = src: "logo.png"][end]'));
            const output = await sm.transpile();

            expect(output.trim()).toBe('<img src="logo.png" />');
            await validateMDX(output);
        });

        it('should handle unknown tags as JSX fallbacks', async () => {
            const sm = new SomMark(smSettings('[CustomTag]Body[end]'));
            const output = await sm.transpile();

            expect(output).toContain('<CustomTag>');
            await validateMDX(output);
        });

        it('should stress test extreme nesting (100 levels)', async () => {
            let src = 'DeepData';
            for (let i = 0; i < 100; i++) {
                src = `[lvl${i}]${src}[end]`;
            }

            const sm = new SomMark(smSettings(src));
            const output = await sm.transpile();

            expect(output).toContain('<lvl0>');
            expect(output).toContain('<lvl99>');
            await validateMDX(output);
        });
    });

    describe('Advanced Features and Escaping', () => {
        it('should pass-through raw JSX/ESM via the @mdx block', async () => {
            const sm = new SomMark(smSettings('@_mdx_@;import { Button } from "./ui";\n\n<Button>Click</Button>@_end_@'));
            const output = await sm.transpile();

            expect(output).toContain('import { Button }');
            expect(output).toContain('<Button>Click</Button>');
            await validateMDX(output);
        });

        it('should apply universal escaping for HTML and MD markers', async () => {
            const sm = new SomMark(smSettings('<span>**Literal**</span>'));
            const output = await sm.transpile();

            expect(output).toContain('&lt;span&gt;');
            expect(output).toContain('\\*\\*Literal\\*\\*');
            await validateMDX(output);
        });
    });

    describe('Headings and Shared Outputs', () => {
        it('should render MDX headings as HTML tags for high-fidelity', async () => {
            // MDX inherits MARKDOWN headings (leaves # as #).
            // To test high-fidelity HTML tags in MDX, we use the explicit [h1] blocks.
            const sm = new SomMark(smSettings('[h1]Level 1[end]\n[h2]Level 2[end]'));
            const output = await sm.transpile();

            expect(output).toContain('<h1>Level 1</h1>');
            expect(output).toContain('<h2>Level 2</h2>');
            await validateMDX(output);
        });

        it('should support shared outputs (bold, code) correctly in MDX', async () => {
            // [bold] is in-place, [code] is a fenced block
            const sm = new SomMark(smSettings('[b]Bold[end] and [code]js{ ... }[end]'));
            const output = await sm.transpile();

            expect(output).toContain('**Bold**');
            expect(output).toContain('```text\njs{ ... }\n```');
            await validateMDX(output);
        });
    });
});
