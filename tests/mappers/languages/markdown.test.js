import { describe, it, expect } from 'vitest';
import SomMark from '../../../index.js';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';

/**
 * Markdown High-Fidelity Test Suite
 * Validates SomMark output against the official Remark parser with GFM support.
 * Format: [MARKDOWN] -> (using remark to ensure compatibility)
 */
describe('Markdown Mapper (V4 High-Fidelity)', () => {

	/**
	 * Helper to validate that a string is valid Markdown syntax.
	 * Attempts to parse the Markdown using remark-gfm; throws on syntax errors.
	 */
	const validateMarkdown = async (output) => {
		try {
			await remark()
				.use(remarkParse)
				.use(remarkGfm)
				.process(output);
			return true;
		} catch (err) {
			console.error('Markdown Compatibility Error:', err.message);
			console.error('Offending Output:\n', output);
			throw err;
		}
	};

	const smSettings = (src) => ({
		src,
		format: 'markdown'
	});

	describe('Inline Formatting', () => {
		it('Test Bold: should render [b]Bold[end] as **Bold**', async () => {
			const sm = new SomMark(smSettings('[b]Bold[end]'));
			const output = await sm.transpile();
			expect(output).toBe('**Bold**');
			await validateMarkdown(output);
		});

		it('Test Italic: should render [i]Italic[end] as *Italic*', async () => {
			const sm = new SomMark(smSettings('[i]Italic[end]'));
			const output = await sm.transpile();
			expect(output).toBe('*Italic*');
			await validateMarkdown(output);
		});

		it('Test Emphasis: should render [em]Emphasis[end] as ***Emphasis***', async () => {
			const sm = new SomMark(smSettings('[em]Emphasis[end]'));
			const output = await sm.transpile();
			expect(output).toBe('***Emphasis***');
			await validateMarkdown(output);
		});

		it('Test Strike: should render [s]Strike[end] as ~~Strike~~', async () => {
			const sm = new SomMark(smSettings('[s]Strike[end]'));
			const output = await sm.transpile();
			expect(output).toBe('~~Strike~~');
			await validateMarkdown(output);
		});

		it('Test Code (Inline): should render (text)->(code) as `text`', async () => {
			const sm = new SomMark(smSettings('Use (the method)->(code)'));
			const output = await sm.transpile();
			expect(output).toBe('Use `the method`');
			await validateMarkdown(output);
		});
	});

	describe('Block Elements', () => {
		it('Test Quote: should render [quote]Quote[end] as > Quote', async () => {
			const sm = new SomMark(smSettings('[quote]Quote[end]'));
			const output = await sm.transpile();
			expect(output).toBe('> Quote');
			await validateMarkdown(output);
		});

		it('Test Quote (Alert): should render [quote = type: "NOTE"]Note[end] as GitHub Alert', async () => {
			const sm = new SomMark(smSettings('[quote = type: "NOTE"]Note[end]'));
			const output = await sm.transpile();
			expect(output).toBe('> [!NOTE]\n> Note');
			await validateMarkdown(output);
		});

		it('Test Horizontal rule: should render [hr][end] as ---', async () => {
			const sm = new SomMark(smSettings('[hr][end]'));
			const output = await sm.transpile();
			expect(output).toBe('---');
			await validateMarkdown(output);
		});

		it('Test Headings: should render [h1]H1[end] as # H1', async () => {
			const sm = new SomMark(smSettings('[h1]H1[end]'));
			const output = await sm.transpile();
			expect(output).toBe('# H1');
			await validateMarkdown(output);
		});

		it('Test Todo: should render [todo = status: "x"]Task[end] as task list item', async () => {
			const sm = new SomMark(smSettings('[todo = status: "x"]Task[end]'));
			const output = await sm.transpile();
			expect(output).toBe('- [x] Task');
			await validateMarkdown(output);
		});
	});

	describe('Structural Components (Native AST)', () => {
		it('Test Table: should render full Native AST table with 3-dash dividers', async () => {
			const src = `
[Table]
	[header]
		[row]
			[cell]Name[end]
			[cell]Role[end]
		[end]
	[end]
	[body]
		[row]
			[cell]Adam[end]
			[cell]Author[end]
		[end]
	[end]
[end]`;
			const sm = new SomMark(smSettings(src.trim()));
			const output = await sm.transpile();
			expect(output).toContain('| Name | Role |');
			expect(output).toContain('| --- | --- |');
			expect(output).toContain('| Adam | Author |');
			await validateMarkdown(output);
		});

		it('Test List (Unordered): should render bulleted list', async () => {
			const src = `
[list]
	[item]One[end]
	[item]Two[end]
[end]`;
			const sm = new SomMark(smSettings(src.trim()));
			const output = await sm.transpile();
			expect(output).toBe('- One\n- Two');
			await validateMarkdown(output);
		});

		it('Test List (Ordered): should render numbered list', async () => {
			const src = `
[list = type: "number"]
	[item]First[end]
	[item]Second[end]
[end]`;
			const sm = new SomMark(smSettings(src.trim()));
			const output = await sm.transpile();
			expect(output).toBe('1. First\n2. Second');
			await validateMarkdown(output);
		});
	});

	describe('Media & Navigation', () => {
		it('Test Link: should render [link = src: "url"]text[end] as [text](url)', async () => {
			const sm = new SomMark(smSettings('[link = src: "https://google.com"]Google[end]'));
			const output = await sm.transpile();
			expect(output).toBe('[Google](https://google.com)');
			await validateMarkdown(output);
		});

		it('Test Image: should render [image = alt: "Alt", src: "img.png"][end] as ![Alt](img.png)', async () => {
			const sm = new SomMark(smSettings('[image = alt: "Alt", src: "img.png"][end]'));
			const output = await sm.transpile();
			expect(output).toBe('![Alt](img.png)');
			await validateMarkdown(output);
		});
	});

	describe('Special Features & Formatting', () => {
		it('Test Code (Block): should render [code = lang: "js"]const x = 1[end] as fenced block', async () => {
			const sm = new SomMark(smSettings('@_code_@:lang: "js";const x = 1;@_end_@'));
			const output = await sm.transpile();
			expect(output).toBe('```js\nconst x = 1;\n```');
			await validateMarkdown(output);
		});

		it('Test Html headings: should render [h1 = format: "html"]Title[end] as <h1>', async () => {
			const sm = new SomMark(smSettings('[h1 = format: "html"]Title[end]'));
			const output = await sm.transpile();
			expect(output).toBe('<h1>Title</h1>');
			await validateMarkdown(output);
		});

		it('Test Unknown/unregistered ids: should fallback to HTML tags (Compact vs multiline)', async () => {
			// Single child -> compact
			const sm1 = new SomMark(smSettings('[Unknown]Body[end]'));
			const out1 = await sm1.transpile();
			expect(out1).toBe('<unknown>Body</unknown>');

			// Multi child -> multiline (Structural separation enforces \n\n for block-level children like <p>)
			const sm2 = new SomMark(smSettings('[Unknown][p]Line 1[end][p]Line 2[end][end]'));
			const out2 = await sm2.transpile();
			expect(out2).toBe('<unknown>\n<p>Line 1</p><p>Line 2</p>\n</unknown>');
		});

		it('Test Shared outputs (raw, css): should support shared utilities with structural separation', async () => {
			const sm = new SomMark(smSettings('@_raw_@;**Not Bold**@_end_@ and (text)->(css: "color:red")'));
			const output = await sm.transpile();
			expect(output).toBe('**Not Bold** and <span style="color:red">text</span>');
			await validateMarkdown(output);
		});
	});

	describe('Auto-escape & Formatting', () => {
		it('Test Auto-escape (Html): should escape < and > in standard text nodes', async () => {
			const sm = new SomMark(smSettings('Special <characters> & strings'));
			const output = await sm.transpile();
			expect(output).toBe('Special &lt;characters&gt; &amp; strings');
			await validateMarkdown(output);
		});

		it('Test Auto-escape (Markdown): should escape markdown markers in text while using valid Smark escaping', async () => {
			const sm = new SomMark(smSettings('I like *stars*'));
			const output = await sm.transpile();
			expect(output).toBe('I like \\*stars\\*');
			await validateMarkdown(output);
		});

		it('Test Escape: should render [e]*[end] as \* explicitly without placeholder corruption', async () => {
			const sm = new SomMark(smSettings('Literal [e]*[end]'));
			const output = await sm.transpile();
			expect(output).toBe('Literal \\*');
			await validateMarkdown(output);
		});

		it('Test Markdown Formatting: should ensure double newlines between block elements', async () => {
			const sm = new SomMark(smSettings('[h1]Title[end]\n[p]Paragraph[end]'));
			const output = await sm.transpile();
			expect(output).toBe('# Title\n<p>Paragraph</p>');
			await validateMarkdown(output);
		});
	});
});
