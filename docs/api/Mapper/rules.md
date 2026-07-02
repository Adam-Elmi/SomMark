# rules

Defines structural and argument validation constraints enforced automatically by the compiler.

---

**Syntax:**
```javascript
mapper.register(id, render, {
  rules: {
    is_self_closing: true, // or is_empty_body: true
    required_args: ["arg1", 0]
  }
});
```

---

### Built-In Validation Rules

The compiler automatically parses and validates three structural rules before code execution:

1. **`is_self_closing` / `is_empty_body`** (Boolean): Enforces that a Block cannot contain nested child elements or text nodes.
2. **`required_args`** (Array of Strings/Numbers): Enforces that named props (by string key) or positional props (by index number) must be present in the block's props.

If a block violates any of these rules, the transpiler immediately throws a validation error and stops compiling.

---

### Example: Restricting Empty-Body Elements and Arguments

The following complete script demonstrates how validation rules are declared, tested with `try-catch` blocks, and executed successfully under the `HTML` mapper:

```javascript
import { transpile, HTML } from "sommark";

const mapper = HTML.clone();

// 1. Register the image block with built-in validation rules
mapper.register("image", function ({ props }) {
  return this.tag("img").smartAttributes(props).selfClose();
}, { 
  type: "Block",
  rules: { 
    is_empty_body: true,        // Enforce that block must not have children
    required_args: ["src", 0]   // Require both named 'src' and positional prop at index 0
  }
});

// --- Scenario A: Missing Required Argument ---
try {
  // Violates required_args because both "src" and positional arg 0 are missing
  await transpile({ 
    src: "[image !]", 
    format: "html", 
    mapperFile: mapper 
  });
} catch (error) {
  console.error(error);
  // Caught: [Transpiler Error]: Identifier 'image' is missing required arguments: src, 0
}

// --- Scenario B: Illegal Block Children ---
try {
  // Violates is_empty_body because text content is placed inside the block
  await transpile({ 
    src: "[image = 'logo.png', src: 'logo.png']Illegal Block Content[end:image]", 
    format: "html", 
    mapperFile: mapper 
  });
} catch (error) {
  console.error(error);
  // Caught: [Transpiler Error]: Identifier 'image' is defined as an empty-body component and cannot have children.
}

// --- Scenario C: Successful Transpilation ---
// All rules passed successfully!
const output = await transpile({ 
  src: "[image = 'logo.png', src: 'logo.png' !]", 
  format: "html", 
  mapperFile: mapper 
});

console.log(output);
// Output: <img src="logo.png" />
```

[Read register() for more info](register.md)

[Read tag() for more info](tag.md)
