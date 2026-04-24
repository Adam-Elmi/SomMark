import { describe, it, expect } from 'vitest';
import SomMark from '../../../index.js';

/**
 * Text (Plain-Text Extraction) Test Suite
 */
describe('Text Format (Plain-Text Extraction)', () => {

	const smSettings = (src) => ({
		src,
		format: 'text'
	});

	it('should extract text from a single block', async () => {
		const sm = new SomMark(smSettings('[p]Hello World[end]'));
		const output = await sm.transpile();
		expect(output).toBe('Hello World');
	});

	it('should extract text from nested blocks', async () => {
		const sm = new SomMark(smSettings('[div][p]Nested Content[end][end]'));
		const output = await sm.transpile();
		expect(output).toBe('Nested Content');
	});

	it('should handle multiple blocks with spacing', async () => {
		const sm = new SomMark(smSettings('[h1]Title[end]\n[p]Paragraph[end]'));
		const output = await sm.transpile();
		expect(output).toBe('Title\nParagraph');
	});

	it('should extract text from inline tags', async () => {
		const sm = new SomMark(smSettings('This is (bold text)->(bold).'));
		const output = await sm.transpile();
		expect(output).toBe('This is bold text.'); 
	});

	it('should handle nested parentheses in inline statement content', async () => {
		const sm = new SomMark(smSettings('(console.log("Hello World"))->(code)'));
		const output = await sm.transpile();
		expect(output).toBe('console.log("Hello World")');
	});

	it('should extract text from AtBlocks', async () => {
		const sm = new SomMark(smSettings('@_code_@; const x = 1; @_end_@'));
		const output = await sm.transpile();
		expect(output).toBe('const x = 1;');
	});

	it('should handle complex mixed content', async () => {
		const src = `
[h1]Project SomMark[end]
This is a (flexible)->(italic) document.
@_quote_@;
  "Stay hungry, stay foolish"
@_end_@
[details]
  [p]More info here[end]
[end]
		`.trim();
		const sm = new SomMark(smSettings(src));
		const output = await sm.transpile();
		
		// Checking for core parts of the text
		expect(output).toContain('Project SomMark');
		expect(output).toContain('This is a flexible document.');
		expect(output).toContain('"Stay hungry, stay foolish"');
		expect(output).toContain('More info here');
	});

	it('should ignore comments', async () => {
		const src = `
[p]Visible[end]
# This is a hidden comment
[p]Also Visible[end]
		`.trim();
		const sm = new SomMark({ src, format: 'text', removeComments: true });
		const output = await sm.transpile();
		expect(output).toContain('Visible');
		expect(output).toContain('Also Visible');
		expect(output).not.toContain('hidden comment');
	});

	it('should correctly handle whitespace and newlines in blocks', async () => {
		const src = `
[div]
  Line 1
  Line 2
[end]
		`.trim();
		const sm = new SomMark(smSettings(src));
		const output = await sm.transpile();
		expect(output).toContain('Line 1');
		expect(output).toContain('Line 2');
	});
});
