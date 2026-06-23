import { describe, it, expect } from 'vitest';
import SomMark from '../../../index.js';

describe('JSONC Mapper', () => {
    const smSettings = (src, removeComments = false) => ({
        src,
        format: 'jsonc',
        removeComments
    });

    describe('Primitives (Mirroring JSON)', () => {
        it('should render standard JSON primitives', async () => {
            const src = `
[Object]
    [string = key: "name"]Adam[end]
    [number = key: "age"]25[end]
    [bool = key: "active"]true[end]
    [null = key: "extra"][end]
[end]
            `.trim();
            const sm = new SomMark(smSettings(src, true));
            const output = await sm.transpile();
            const expected = `{
  "name": "Adam",
  "age": 25,
  "active": true,
  "extra": null
}`;
            expect(output.trim()).toBe(expected);
        });
    });

    describe('Comment Handling (removeComments = false)', () => {
        it('should render top-level single-line comments with leading double-slash', async () => {
            const src = `
# This is a comment
[Object]
    [string = key: "title"]Smark[end]
[end]
            `.trim();
            const sm = new SomMark(smSettings(src, false));
            const output = await sm.transpile();
            const expected = `// This is a comment
{
  "title": "Smark"
}`;
            expect(output.trim()).toBe(expected);
        });

        it('should render top-level multiline comment blocks', async () => {
            const src = `
### Inline block comment ###
[Object]
    [string = key: "status"]active[end]
[end]
            `.trim();
            const sm = new SomMark(smSettings(src, false));
            const output = await sm.transpile();
            const expected = `/* Inline block comment */
{
  "status": "active"
}`;
            expect(output.trim()).toBe(expected);
        });

        it('should render top-level multiline comment blocks with line breaks', async () => {
            const src = `
###
Line one of comment
Line two of comment
###
[number = key: "version"]4[end]
            `.trim();
            const sm = new SomMark(smSettings(src, false));
            const output = await sm.transpile();
            expect(output.trim()).toContain("Line one of comment");
            expect(output.trim()).toContain("Line two of comment");
            expect(output.trim()).toContain('"version": 4');
        });
    });

    describe('Nesting & Comma Placement', () => {
        it('should handle nested structures and ensure commas are placed correctly', async () => {
            const src = `
[Object]
    [Object = key: "author"]
        [string = key: "name"]Adam Elmi[end]
        [string = key: "email"]adam@example.com[end]
    [end]
    [Array = key: "skills"]
        [string]JavaScript[end]
        [string]SomMark[end]
    [end]
[end]
            `.trim();
            const sm = new SomMark(smSettings(src, true));
            const output = await sm.transpile();
            const expected = `{
  "author": {
    "name": "Adam Elmi",
    "email": "adam@example.com"
  },
  "skills": [
    "JavaScript",
    "SomMark"
  ]
}`;
            expect(output.trim()).toBe(expected);
        });
    });

    describe('Comment Stripping (removeComments = true)', () => {
        it('should completely strip comments when removeComments is set to true', async () => {
            const src = `
[Object]
    # Header comment
    [string = key: "key"]value[end]
    ###
    Block comment
    ###
    [Array = key: "list"]
        # List comment
        [number]42[end]
    [end]
[end]
            `.trim();
            const sm = new SomMark(smSettings(src, true));
            const output = await sm.transpile();
            const expected = `{
  "key": "value",
  "list": [
    42
  ]
}`;
            expect(output.trim()).toBe(expected);
        });
    });

    describe('Static Logic Block Evaluation inside JSONC', () => {
        it('should evaluate server-side static logic blocks correctly inside JSONC', async () => {
            const src = `
static \${ let name = "JSONC"; let release = 2026; }\$
[Object]
    [string = key: "format"]static \${ name }\$[end]
    [number = key: "year"]static \${ release }\$[end]
[end]
            `.trim();
            const sm = new SomMark(smSettings(src, false));
            const output = await sm.transpile();
            const expected = `{
  "format": "JSONC",
  "year": 2026
}`;
            expect(output.trim()).toBe(expected);
        });
    });
});
