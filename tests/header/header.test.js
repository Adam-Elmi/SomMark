
import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import html from "../../mappers/languages/html.js";

describe("Header Generation", () => {
    it("generates default header for HTML format", async () => {

        let output = await new SomMark({
            src: "[Block]Content[end]",
            format: "html",
            includeDocument: true
        }).transpile();

        expect(output).toContain("<meta charset=\"UTF-8\" />");
        expect(output).toContain("<title>SomMark Page</title>");
        expect(output).toContain("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />");
    });

    it("updates header when pageProps are modified", async () => {

        html.pageProps.pageTitle = "Dynamic Title";
        html.pageProps.tabIcon.src = "./assets/smark.logo.png";

        let output = await new SomMark({
            src: "[Block]Content[end]",
            format: "html",
            includeDocument: true
        }).transpile();

        expect(output).toContain("<title>Dynamic Title</title>");
        // expect(output).toContain("<link rel=\"icon\" href=\"./assets/smark.logo.png\" />");
    });

    it("includes custom header content added via setHeader", async () => {
        html.setHeader(["<meta name=\"custom\" content=\"test\" />"]);

        let output = await new SomMark({
            src: "[Block]Content[end]",
            format: "html",
            includeDocument: true
        }).transpile();

        expect(output).toContain("<meta name=\"custom\" content=\"test\" />");
    });
});
