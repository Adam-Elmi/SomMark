import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";

describe("Complex YAML Generation", () => {
    it("should generate a complex YAML file with nested objects, arrays, and various types", async () => {
        const src = `
[Yaml]
  # This is a complex YAML file
  [Object = metadata]
    (name)->(string: project-sommark)
    (version)->(string: 3.0.0)
    [string = status] production [end]
  [end]

  [Object = database]
    (host)->(string: localhost)
    [number = port] 5432 [end]
    (enabled)->(bool: true)
    (options)->(array: ssl, pool=5)
  [end]

  [Object = infrastructure]
    [Object = compute]
      [Object = k8s]
        (cluster)->(string: production-1)
        (region)->(string: us-east-1)
      [end]
    [end]
  [end]

  [Array = maintainers]
    [Object = adam]
      (role)->(string: lead)
      (active)->(bool: true)
    [end]
    [Object = elmi]
      (role)->(string: contributor)
      (active)->(bool: false)
    [end]
  [end]
[end]`;

        const smark = new SomMark({
            src: src,
            format: "yaml"
        });

        const output = await smark.transpile();
        
        // Assertions for structure and indentation
        expect(output).toContain("metadata:");
        expect(output).toContain("  name: project-sommark");
        expect(output).toContain('  status: production');

        expect(output).toContain("database:");
        expect(output).toContain("  host: localhost");
        expect(output).toContain("  port: 5432");
        expect(output).toContain("  enabled: true");
        expect(output).toContain("  options: [ssl, pool=5]");

        expect(output).toContain("infrastructure:");
        expect(output).toContain("  compute:");
        expect(output).toContain("    k8s:");
        expect(output).toContain("      cluster: production-1");

        expect(output).toContain("maintainers:");
        // Test array indentation and prefix
        expect(output).toContain("- adam:");
        expect(output).toContain("      role: lead");
        expect(output).toContain("- elmi:");

        // Assertion for comment
        expect(output).toContain("# This is a complex YAML file");
    });
});
