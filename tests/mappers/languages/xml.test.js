import { describe, it, expect } from 'vitest';
import SomMark from '../../../index.js';
import { XMLParser } from 'fast-xml-parser';

/**
 * XML Mapper Test Suite
 * Enhanced with fast-xml-parser for structural validation.
 */
describe('XML Mapper (V4 Strict)', () => {
    const smSettings = (src) => ({
        src,
        format: 'xml'
    });

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: ""
    });

    describe('Basic Tags', () => {
        it('should render a simple block as an XML tag', async () => {
            const sm = new SomMark(smSettings('[note]Hello World[end]'));
            const output = await sm.transpile();
            
            const obj = parser.parse(output);
            expect(obj.note).toBe('Hello World');
            expect(output.trim()).toBe('<note>Hello World</note>');
        });

        it('should render a self-closing tag for empty blocks', async () => {
            const sm = new SomMark(smSettings('[empty][end]'));
            const output = await sm.transpile();
            
            // XMLParser might treat <empty /> as an empty object or string depending on config
            const obj = parser.parse(output);
            expect(obj).toHaveProperty('empty');
            expect(output.trim()).toBe('<empty />');
        });
    });

    describe('Attributes', () => {
        it('should render attributes with strict quoting', async () => {
            const sm = new SomMark(smSettings('[note = date: "2023-10-21", author: "Adam"]Content[end]'));
            const output = await sm.transpile();
            
            const obj = parser.parse(output);
            expect(obj.note.date).toBe('2023-10-21');
            expect(obj.note.author).toBe('Adam');
            expect(obj.note['#text']).toBe('Content');
        });

        it('should filter out positional arguments for XML attributes', async () => {
            const sm = new SomMark(smSettings('[note = "positional"]Content[end]'));
            const output = await sm.transpile();
            
            const obj = parser.parse(output);
            expect(obj.note).toBe('Content');
            // If obj.note is a string, it has no attributes in the parsed object
            expect(typeof obj.note).toBe('string');
        });
    });

    describe('Unknown Tags', () => {
        it('should preserve tag case for unknown tags', async () => {
            const sm = new SomMark(smSettings('[MyCustomTag]Data[end]'));
            const output = await sm.transpile();
            
            const obj = parser.parse(output);
            expect(obj.MyCustomTag).toBe('Data');
            expect(output).toContain('<MyCustomTag>');
        });
    });

    describe('XML Declaration', () => {
        it('should render the <?xml?> declaration with default values', async () => {
            const sm = new SomMark(smSettings('[xml][end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('<?xml version="1.0" encoding="UTF-8"?>');
        });

        it('should render the <?xml?> declaration with custom values', async () => {
            const sm = new SomMark(smSettings('[xml = version: "1.1", encoding: "ISO-8859-1"][end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('<?xml version="1.1" encoding="ISO-8859-1"?>');
        });
    });

    describe('Nesting (Stress Test)', () => {
        it('should handle 100 levels of nested tags', async () => {
            let src = 'DeepData';
            for (let i = 0; i < 100; i++) {
                src = `[lvl${i}]${src}[end]`;
            }
            
            const sm = new SomMark(smSettings(src));
            const output = await sm.transpile();
            
            const obj = parser.parse(output);
            
            // Recursively check nesting (outermost is lvl99)
            let current = obj;
            for (let i = 99; i >= 0; i--) {
                expect(current).toHaveProperty(`lvl${i}`);
                current = current[`lvl${i}`];
            }
            expect(current).toBe('DeepData');
        });
    });

    describe('Namespaces', () => {
        it('should support name prefixes in tags', async () => {
            const sm = new SomMark(smSettings('[h:table]Content[end]'));
            const output = await sm.transpile();
            
            expect(output.trim()).toBe('<h:table>Content</h:table>');
        });

        it('should support namespace definitions via xmlns attributes', async () => {
            const sm = new SomMark(smSettings('[h:table = "xmlns:h": "http://www.w3.org/TR/html4/"]Content[end]'));
            const output = await sm.transpile();
            
            const obj = parser.parse(output);
            expect(obj['h:table']['xmlns:h']).toBe('http://www.w3.org/TR/html4/');
            expect(output).toContain('xmlns:h="http://www.w3.org/TR/html4/"');
        });

        it('should support default namespaces', async () => {
            const sm = new SomMark(smSettings('[table = xmlns: "http://www.w3.org/TR/html4/"]Content[end]'));
            const output = await sm.transpile();
            
            const obj = parser.parse(output);
            expect(obj.table.xmlns).toBe('http://www.w3.org/TR/html4/');
            expect(output).toContain('xmlns="http://www.w3.org/TR/html4/"');
        });

        it('should handle nested namespaced tags', async () => {
            const sm = new SomMark(smSettings('[root = "xmlns:p": "URI"][p:child]Data[end][end]'));
            const output = await sm.transpile();
            
            const obj = parser.parse(output);
            expect(obj.root['p:child']).toBe('Data');
            expect(output).toContain('<p:child>Data</p:child>');
        });
    });

    describe('Advanced XML Features', () => {
        it('should render DOCTYPE declarations', async () => {
            const sm = new SomMark(smSettings('[doctype = root: "note", system: "note.dtd"][end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('<!DOCTYPE note SYSTEM "note.dtd">');
        });

        it('should render DOCTYPE with PUBLIC/FPI', async () => {
            const sm = new SomMark(smSettings('[doctype = root: "html", public: "-//W3C//DTD XHTML 1.0 Strict//EN", system: "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"][end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">');
        });

        it('should render xml-stylesheet processing instructions', async () => {
            const sm = new SomMark(smSettings('[xml-stylesheet = href: "style.xsl"][end]'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('<?xml-stylesheet type="text/xsl" href="style.xsl"?>');
        });

        it('should render CDATA sections using AtBlock syntax', async () => {
            const sm = new SomMark(smSettings('@_cdata_@;if (a < b && b < c) { ... }@_end_@'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('<![CDATA[if (a < b && b < c) { ... }]]>');
        });

        it('should preserve special characters inside CDATA', async () => {
            const sm = new SomMark(smSettings('@_cdata_@;<b>Bold</b> and & Symbol@_end_@'));
            const output = await sm.transpile();
            expect(output.trim()).toBe('<![CDATA[<b>Bold</b> and & Symbol]]>');
        });
    });
});
