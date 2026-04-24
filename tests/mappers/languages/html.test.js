import { describe, it, expect } from 'vitest';
import SomMark from '../../../index.js';

/**
 * HTML High-Fidelity Test Suite
 */
describe('HTML Mapper (V4 High-Fidelity)', () => {

	const smSettings = (src) => ({
		src,
		format: 'html'
	});

	it('Test basic tag: should render [p]Content[end] as <p>Content</p>', async () => {
		const sm = new SomMark(smSettings('[p]Content[end]'));
		const output = await sm.transpile();
		expect(output).toBe('<p>Content</p>');
	});

	describe('Attributes', () => {
		it('Test global attributes: should render id and class correctly', async () => {
			const sm = new SomMark(smSettings('[div = id: "main", class: "container"]Content[end]'));
			const output = await sm.transpile();
			expect(output).toBe('<div id="main" class="container">Content</div>');
		});

		it('Test event attributes: should render onClick as onclick (lowercase)', async () => {
			// Smark preserves case in args, but HTML mapper/TagBuilder should normalize events
			const sm = new SomMark(smSettings('[button = onClick: "alert()"]Click[end]'));
			const output = await sm.transpile();
			expect(output).toBe('<button onclick="alert()">Click</button>');
		});

		it('Test aria attributes: should render ariaLabel as aria-label (kebabized)', async () => {
			const sm = new SomMark(smSettings('[button = ariaLabel: "Close"]X[end]'));
			const output = await sm.transpile();
			expect(output).toBe('<button aria-label="Close">X</button>');
		});

		it('Test css attributes as global attributes: should move unknown props to style attribute', async () => {
			// feature: using css attributes as global attributes
			const sm = new SomMark(smSettings('[div = backgroundColor: "red", marginTop: "10px"]Content[end]'));
			const output = await sm.transpile();
			expect(output).toBe('<div style="background-color:red;margin-top:10px;">Content</div>');
		});

		it('Test unknown/recognized attributes: should distinguish between native and unknown', async () => {
			// 'title' is native, 'customData' is unknown (should be kebabized and moved to style unless it starts with data/aria)
			const sm = new SomMark(smSettings('[div = title: "Hover me", customAttr: "val"]Content[end]'));
			const output = await sm.transpile();
			// customAttr becomes custom-attr:val; in style
			expect(output).toBe('<div title="Hover me" style="custom-attr:val;">Content</div>');
		});

		it('Test custom attributes: should not move unknown props to style attribute', async () => {
			const sm = new SomMark({ src: '[div = title: "Hover me", custom: "val"]Content[end]', format: 'html', customProps: ["custom"] });
			const output = await sm.transpile();
			expect(output).toBe('<div title="Hover me" custom="val">Content</div>');
		});

		it('Test camelcase and kebab-case attributes: backgroundColor vs background-color', async () => {
			const sm1 = new SomMark(smSettings('[div = backgroundColor: "red"]Content[end]'));
			const sm2 = new SomMark(smSettings('[div = "background-color": "red"]Content[end]'));

			const out1 = await sm1.transpile();
			const out2 = await sm2.transpile();

			expect(out1).toBe('<div style="background-color:red;">Content</div>');
			expect(out2).toBe('<div style="background-color:red;">Content</div>');
		});
	});

	it('Test void elements/selfClosing element: should render [img = src: "a.png"][end] as <img src="a.png" />', async () => {
		const sm = new SomMark(smSettings('[img = src: "a.png"][end]\n [br][end]'));
		const output = await sm.transpile();
		// Dispatcher adds \n after every tag in HTML mode
		expect(output).toBe('<img src="a.png" />\n <br />');
	});

	it('Test nested tags (100 nested tags): should handle deep recursion without stack overflow', async () => {
		let src = 'Content';
		for (let i = 0; i < 100; i++) {
			src = `[div = id: "layer-${i}"]${src}[end]`;
		}
		const sm = new SomMark(smSettings(src));
		const output = await sm.transpile();
		expect(output).toContain('id="layer-99"');
		expect(output).toContain('id="layer-0"');
		expect((output.match(/<div/g) || []).length).toBe(100);
	});

	it('Test unknown tags: should fallback to lowercase tags', async () => {
		const sm = new SomMark(smSettings('[MyCustomTag]Content[end]'));
		const output = await sm.transpile();
		expect(output).toBe('<mycustomtag>Content</mycustomtag>');
	});

	it('Test full html structure: should render DOCTYPE, html, head, body correctly', async () => {
		const src = `
[doctype][end]
[html]
	[head]
		[title]My Page[end]
	[end]
	[body]
		[h1]Welcome[end]
	[end]
[end]`;
		const sm = new SomMark(smSettings(src.trim()));
		const output = await sm.transpile();
		expect(output).toContain('<!DOCTYPE html>');
		expect(output).toContain('<html>');
		expect(output).toContain('<head>');
		expect(output).toContain('<title>My Page</title>');
		expect(output).toContain('<body>');
		expect(output).toContain('<h1>Welcome</h1>');
	});

	it('Test if shared outputs in /mappers/shared/index.js works', async () => {
		const sm = new SomMark(smSettings('@_raw_@;<b>Raw Code</b>@_end_@ (Styled Text)->(css: "color: blue")'));
		const output = await sm.transpile();
		expect(output).toBe('<b>Raw Code</b> <span style="color:blue">Styled Text</span>');
	});

	it('Test html escaping: should escape special characters in text nodes', async () => {
		const sm = new SomMark(smSettings('[p]Escape & <tags>[end]'));
		const output = await sm.transpile();
		expect(output).toBe('<p>Escape &amp; &lt;tags&gt;</p>');
	});
});
