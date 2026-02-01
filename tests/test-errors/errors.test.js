import { describe, it, expect } from "vitest";
import fs from "fs";
import SomMark from "../../index.js";
import html from "../../mappers/languages/html.js";

// ========================================================================== //
//  Error Handling Tests                                                      //
// ========================================================================== //

// ========================================================================== //
//  Invalid File Cases                                                        //
// ========================================================================== //
describe("Transpiling -> [Errors]: invalid files should throw", () => {
    const cases = [
        "tests/test-errors/unclosed_block.smark",
        "tests/test-errors/unclosed_inline.smark",
        "tests/test-errors/invalid_identifier.smark",
        "tests/test-errors/missing_arrow.smark",
        "tests/test-errors/unclosed_atblock.smark",
        "tests/test-errors/missing_atblock_semicolon.smark",
        "tests/test-errors/arg_no_close_bracket.smark",
        "tests/test-errors/inline_arg_no_close_paren.smark",
        "tests/test-errors/escape_eof.smark",
        "tests/test-errors/extra_end_tag.smark",
        "tests/test-errors/id_start_num.smark",
        "tests/test-errors/id_symbols.smark",
        "tests/test-errors/empty_id.smark",
        "tests/test-errors/inline_empty_mapper.smark",
        "tests/test-errors/atblock_invalid_id.smark",
        "tests/test-errors/atblock_malformed_end.smark"
    ];

    for (const path of cases) {
        const name = path.split("/").pop();
        it(`throws for ${name}`, async () => {
            const src = fs.readFileSync(path, "utf8");
            await expect(() => new SomMark({ src, format: "html" }).transpile()).rejects.toThrow();
        });
    }
});
