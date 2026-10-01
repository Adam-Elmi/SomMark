// ###################
// D2: render code loads through Node's module hooks, so no .mjs file is written
// ###################

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, writeFile, readdir, rm, mkdir, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import module from "node:module";
import ArcMoon from "../node/compiler.js";

let dir;

beforeAll(async () => {
	dir = await mkdtemp(join(tmpdir(), "arcmoon-temp-"));
	await mkdir(join(dir, "node_modules/greet"), { recursive: true });
	await writeFile(join(dir, "node_modules/greet/package.json"), JSON.stringify({ name: "greet", type: "module", main: "index.js" }));
	await writeFile(join(dir, "node_modules/greet/index.js"), `export default (n) => "Hello, " + n;`);
	await writeFile(join(dir, "data.js"), `export const lang = "Lua";`);
});

afterAll(async () => {
	await chmod(join(dir, "ro"), 0o755).catch(() => {});
	await rm(dir, { recursive: true, force: true });
});

const build = (filename) => new ArcMoon({ filename, cwd: dir, onWarning() {} }).compile();
const hooks = typeof module.registerHooks === "function";

describe.runIf(hooks)("no temp files", () => {
	it("imports npm packages and local files, and writes nothing", async () => {
		const page = join(dir, "page.arcm");
		await writeFile(page, `\${ import greet from "greet"; import { lang } from "./data.js"; }\$[p]\${ greet(lang) }\$[end]`);
		const before = await readdir(dir);
		const html = await build(page);
		expect(html).toContain("Hello, Lua");
		expect(await readdir(dir)).toEqual(before);
	});

	it("builds a page in a read-only folder", async () => {
		await mkdir(join(dir, "ro"));
		const page = join(dir, "ro/page.arcm");
		await writeFile(page, `\${ import { lang } from "../data.js"; }\$[p]\${ lang }\$[end]`);
		await chmod(join(dir, "ro"), 0o555);
		const html = await build(page);
		expect(html).toContain("Lua");
	});

	it("still names a missing package", async () => {
		const page = join(dir, "missing.arcm");
		await writeFile(page, `\${ import x from "not-installed-pkg"; }\$[p]x[end]`);
		await expect(build(page)).rejects.toThrow(/can't find package "not-installed-pkg"/);
	});
});
