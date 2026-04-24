import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

describe("CLI End-to-End (Integration)", () => {
    const cliPath = path.resolve(process.cwd(), "cli/cli.mjs");
    const testDir = path.resolve(process.cwd(), "tests/cli/tmp_e2e");
    const smarkFile = path.join(testDir, "test.smark");
    const htmlFile = path.join(testDir, "test.html");

    it("should show help output when running with -h", () => {
        const output = execSync(`node ${cliPath} -h`).toString();
        expect(output).toContain("Usage:");
        expect(output).toContain("Global Options:");
    });

    it("should show version when running with -v", () => {
        const output = execSync(`node ${cliPath} -v`).toString().trim();
        // Expecting bare version string from printVersion()
        expect(output).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("should transpile a file via shell command", () => {
        // Setup tiny temp project
        if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(smarkFile, "[div]E2E[end]");

        // Run CLI: node cli.mjs --html tests/cli/tmp_e2e/test.smark -o tests/cli/tmp_e2e/test.html
        execSync(`node ${cliPath} --html ${smarkFile} -o ${htmlFile}`, { stdio: 'inherit' });

        // Verify output exists and contains content
        expect(fs.existsSync(htmlFile)).toBe(true);
        const html = fs.readFileSync(htmlFile, "utf-8");
        expect(html).toContain("<div>E2E</div>");

        // Cleanup
        fs.rmSync(testDir, { recursive: true, force: true });
    });
});
