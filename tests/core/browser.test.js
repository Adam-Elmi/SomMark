import { describe, it, expect } from "vitest";
import SomMark from "../../index.browser.js";

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
                    SomMark.register("my-card", ({ args, content }) => {
                        return layout({ title: args.title, body: content });
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
                    const res = await SomMark.fetch("https://api.github.com/users/Adam-Elmi");
                    const user = await res.json();
                    globalThis.userName = user.login;
                    return;
                }$
                static \${ userName }$
            `,
            format: "html"
        });
        const res = await sm.transpile();
        expect(res.trim()).toBe("Adam-Elmi");
    });
});
