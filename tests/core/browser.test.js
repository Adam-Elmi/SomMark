import { describe, it, expect } from "vitest";
import SomMark, { resolveBaseDir } from "../../index.browser.js";

describe("SomMark Browser Entrypoint Isomorphic Tests", () => {
    it("compiles standard templates correctly in the simulated browser environment", async () => {
        const sm = new SomMark({
            src: "[h1]Hello from Browser[end]",
            format: "html"
        });
        const res = await sm.transpile();
        expect(res).toBe("<h1>Hello from Browser</h1>");
    });

    it("resolves dynamic imports from the virtual filesystem (options.files)", async () => {
        const sm = new SomMark({
            src: `
                static \${
                    const { default: layout } = await import("./components/Layout.smark");
                    SomMark.register("my-card", ({ props, content }) => {
                        return layout({ title: props.title, body: content });
                    });
                }$
                [my-card = title: "Browser VFS"]Simulated browser environment[end]
            `,
            format: "html",
            files: {
                "/components/Layout.smark": '[div = class: "card"][h3]static \${ title }$[end]static \${ body }$[end]'
            }
        });
        const res = await sm.transpile();
        expect(res).toBe('<div class="card">\n<h3>Browser VFS</h3>Simulated browser environment\n</div>');
    });

    it("supports asynchronous fetch requests correctly inside browser sandbox", async () => {
        const sm = new SomMark({
            src: `
                static \${
                    const res = await SomMark.fetch("https://jsonplaceholder.typicode.com/users/1");
                    const user = await res.json();
                    globalThis.userName = user.username;
                    return;
                }$
                static \${ userName }$
            `,
            format: "html"
        });
        const res = await sm.transpile();
        expect(res.trim()).toBe("Bret");
    });

    it("resolves [import = ...] smark modules from the virtual filesystem", async () => {
        const sm = new SomMark({
            src: `
[import = card: "/components/Card.smark"][end]
[$use-module = card][end]
            `.trim(),
            format: "html",
            files: {
                "/components/Card.smark": "[div = class: \"card\"]VFS module[end]"
            }
        });
        const res = await sm.transpile();
        expect(res).toBe('<div class="card">VFS module</div>');
    });

    it("preprocesses SomMark.import with instance fs reading from the virtual filesystem", async () => {
        const sm = new SomMark({
            src: `
runtime \${
const data = SomMark.import("./data.json");
}\$
            `.trim(),
            format: "html",
            files: {
                "/data.json": '{"hello":"world"}'
            }
        });
        const res = await sm.transpile();
        expect(res).toContain('const data = {"hello":"world"}');
    });

    it("resolveBaseDir throws when called outside a browser environment", () => {
        expect(() => resolveBaseDir("./templates/")).toThrow(/browser environment/);
    });
});
