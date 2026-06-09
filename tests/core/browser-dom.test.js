// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { resolveBaseDir, renderCompiledHTML } from "../../index.browser.js";

describe("SomMark Browser DOM Helpers", () => {
	describe("resolveBaseDir", () => {
		it("returns an absolute URL from a relative path", () => {
			const result = resolveBaseDir("./templates/");
			expect(result).toMatch(/^https?:\/\//);
			expect(result).toContain("templates/");
		});

		it("throws for an empty string", () => {
			expect(() => resolveBaseDir("")).toThrow(/non-empty string/);
		});

		it("throws for a non-string argument", () => {
			expect(() => resolveBaseDir(null)).toThrow(/non-empty string/);
		});
	});

	describe("renderCompiledHTML", () => {
		it("sets innerHTML of the container", () => {
			const container = document.createElement("div");
			renderCompiledHTML(container, "<p>Hello</p>");
			expect(container.innerHTML).toBe("<p>Hello</p>");
		});

		it("throws TypeError for non-HTMLElement container", () => {
			expect(() => renderCompiledHTML("#output", "<p>Hi</p>")).toThrow(TypeError);
		});

		it("throws TypeError for non-string HTML", () => {
			const container = document.createElement("div");
			expect(() => renderCompiledHTML(container, 42)).toThrow(TypeError);
		});

		it("replaces inert script tags with live script elements", () => {
			const container = document.createElement("div");
			renderCompiledHTML(container, '<script>window.__testRan = true;<\/script>');
			const scripts = container.querySelectorAll("script");
			expect(scripts.length).toBe(1);
			expect(scripts[0].textContent).toContain("__testRan");
		});
	});
});
