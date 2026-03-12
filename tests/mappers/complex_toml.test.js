import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";

describe("Complex TOML Generation", () => {
    it("should generate a complex TOML file with nested sections and various types", async () => {
        const src = `
[Toml]
  # This is a complex TOML file
  [Object = owner]
    (name)->(string: Tom Preston-Werner)
    (dob)->(string: 1979-05-27T07:32:00Z)
  [end]

  [Object = database]
    [number = port] 8000 [end]
    (connection_max)->(number: 5000)
    (enabled)->(bool: true)
  [end]

  [Object = servers.alpha]
    (ip)->(string: 10.0.0.1)
    (role)->(string: frontend)
  [end]

  [Object = servers.beta]
    (ip)->(string: 10.0.0.2)
    (role)->(string: backend)
  [end]

  [Object = clients]
    (data)->(array: gamma, delta)
    (active)->(bool: false)
  [end]
[end]`;

        const smark = new SomMark({
            src: src,
            format: "toml"
        });

        const output = await smark.transpile();
        
        // Assertions for sections
        expect(output).toContain("[owner]");
        expect(output).toContain("[database]");
        expect(output).toContain("[servers.alpha]");
        expect(output).toContain("[servers.beta]");
        expect(output).toContain("[clients]");

        // Assertions for values
        expect(output).toContain('name = "Tom Preston-Werner"');
        expect(output).toContain('dob = "1979-05-27T07:32:00Z"');
        expect(output).toContain('port = 8000');
        expect(output).toContain('connection_max = 5000');
        expect(output).toContain('enabled = true');
        expect(output).toContain('ip = "10.0.0.1"');
        expect(output).toContain('role = "frontend"');
        expect(output).toContain('data = ["gamma", "delta"]');
        expect(output).toContain('active = false');

        // Assertion for comment
        expect(output).toContain("# This is a complex TOML file");
    });
});
