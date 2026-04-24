import { describe, it, expect } from 'vitest';
import SomMark from '../../../index.js';

describe('JSON Mapper (Blocks only)', () => {
    const smSettings = (src) => ({
        src,
        format: 'json',
        removeComments: true
    });

    describe('Primitives', () => {
        it('should render a string', async () => {
            const sm = new SomMark(smSettings('[string]Hello World[end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('"Hello World"');
        });

        it('should render an empty string', async () => {
            const sm = new SomMark(smSettings('[string][end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('""');
        });

        it('should render a number', async () => {
            const sm = new SomMark(smSettings('[number]123.45[end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('123.45');
        });

        it('should render a negative number', async () => {
            const sm = new SomMark(smSettings('[number]-42[end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('-42');
        });

        it('should render a boolean true', async () => {
            const sm = new SomMark(smSettings('[bool]true[end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('true');
        });

        it('should render a boolean false', async () => {
            const sm = new SomMark(smSettings('[bool]false[end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('false');
        });

        it('should render boolean from numeric 1', async () => {
            const sm = new SomMark(smSettings('[bool]1[end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('true');
        });

        it('should render null', async () => {
            const sm = new SomMark(smSettings('[null][end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('null');
        });
    });

    describe('Structural Blocks', () => {
        it('should render an empty Object', async () => {
            const sm = new SomMark(smSettings('[Object][end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('{}');
        });

        it('should render an Object with members', async () => {
            const sm = new SomMark(smSettings(`
                [Object]
                    [string = key: "name"]Adam[end]
                    [number = key: "age"]25[end]
                [end]
            `));
            const output = await sm.transpile();
            const expected = `{
  "name": "Adam",
  "age": 25
}`;
            expect(output.trim()).toBe(expected);
        });

        it('should render an empty Array', async () => {
            const sm = new SomMark(smSettings('[Array][end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('[]');
        });

        it('should render an Array with values', async () => {
            const sm = new SomMark(smSettings(`
                [Array]
                    [string]Apple[end]
                    [string]Banana[end]
                [end]
            `));
            const output = await sm.transpile();
            const expected = `[
  "Apple",
  "Banana"
]`;
            expect(output.trim()).toBe(expected);
        });
    });

    describe('Nesting', () => {
        it('should render nested structures', async () => {
            const sm = new SomMark(smSettings(`
                [Object]
                    [Object = key: "user"]
                        [string = key: "id"]123[end]
                        [Array = key: "roles"]
                            [string]admin[end]
                            [string]editor[end]
                        [end]
                    [end]
                [end]
            `));
            const output = await sm.transpile();
            const expected = `{
  "user": {
    "id": "123",
    "roles": [
      "admin",
      "editor"
    ]
  }
}`;
            expect(output.trim()).toBe(expected);
        });
    });

    describe('Edge Cases', () => {
        it('should return 0 for invalid number', async () => {
            const sm = new SomMark(smSettings('[number]abc[end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('0');
        });

        it('should handle root-level object/array without double wrapping', async () => {
            const sm = new SomMark(smSettings(`
                [Object]
                    [string = key: "p"]v[end]
                [end]
            `));
            const output = await sm.transpile();
            const expected = `{
  "p": "v"
}`;
            expect(output.trim()).toBe(expected);
        });
    });
});
