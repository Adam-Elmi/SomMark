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
        it('should render single-line comments with leading double-slash', async () => {
            const src = `
[Object]
    # This is a comment
    [string = key: "title"]Smark[end]
[end]
            `.trim();
            const sm = new SomMark(smSettings(src, false));
            const output = await sm.transpile();
            const expected = `{
  // This is a comment
  "title": "Smark"
}`;
            expect(output.trim()).toBe(expected);
        });

        it('should render single-line multiline-equivalent comment blocks', async () => {
            const src = `
[Object]
    ### Inline block comment ###
    [string = key: "status"]active[end]
[end]
            `.trim();
            const sm = new SomMark(smSettings(src, false));
            const output = await sm.transpile();
            const expected = `{
  /* Inline block comment */
  "status": "active"
}`;
            expect(output.trim()).toBe(expected);
        });

        it('should render multiline comment blocks with proper indentation', async () => {
            const src = `
[Object]
    ###
Line one of comment
Line two of comment
###
    [number = key: "version"]4[end]
[end]
            `.trim();
            const sm = new SomMark(smSettings(src, false));
            const output = await sm.transpile();
            const expected = `{
  /*
  Line one of comment
  Line two of comment
  */
  "version": 4
}`;
            expect(output.trim()).toBe(expected);
        });
    });

    describe('Nesting with Comments & Comma Placement', () => {
        it('should handle nested structures containing comments and ensure commas are placed correctly', async () => {
            const src = `
[Object]
    # Author metadata
    [Object = key: "author"]
        [string = key: "name"]Adam Elmi[end]
        # Contact information
        [string = key: "email"]adam@example.com[end]
    [end]
    # Supported skills
    [Array = key: "skills"]
        # Core skill
        [string]JavaScript[end]
        ###
Secondary
Skills
###
        [string]SomMark[end]
    [end]
[end]
            `.trim();
            const sm = new SomMark(smSettings(src, false));
            const output = await sm.transpile();
            const expected = `{
  // Author metadata
  "author": {
    "name": "Adam Elmi",
    // Contact information
    "email": "adam@example.com"
  },
  // Supported skills
  "skills": [
    // Core skill
    "JavaScript",
    /*
    Secondary
    Skills
    */
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
        it('should evaluate server-side static logic blocks correctly with comments enabled', async () => {
            const src = `
static \${ let name = "JSONC"; let release = 2026; }\$
[Object]
    # Dynamic compiler stats
    [string = key: "format"]static \${ name }\$[end]
    [number = key: "year"]static \${ release }\$[end]
[end]
            `.trim();
            const sm = new SomMark(smSettings(src, false));
            const output = await sm.transpile();
            const expected = `{
  // Dynamic compiler stats
  "format": "JSONC",
  "year": 2026
}`;
            expect(output.trim()).toBe(expected);
        });
    });
});
