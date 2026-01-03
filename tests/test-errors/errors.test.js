import { describe, it, expect } from "vitest";
import fs from "fs";
import SomMark from "../../index.js";
import html from "../../mappers/default_mode/smark.html.js";

describe("Transpiling -> [Errors]: invalid files should throw", () => {
    const cases = [
        "tests/test-errors/case_1.smark",
        "tests/test-errors/case_2.smark",
        "tests/test-errors/case_3.smark",
        "tests/test-errors/case_4.smark",
        "tests/test-errors/case_5.smark",
        "tests/test-errors/case_6.smark",
        "tests/test-errors/case_7.smark",
        "tests/test-errors/case_8.smark",
        "tests/test-errors/case_9.smark",
        "tests/test-errors/case_10.smark",
        "tests/test-errors/case_11.smark",
        "tests/test-errors/case_12.smark",
        "tests/test-errors/case_13.smark",
        "tests/test-errors/case_14.smark",
        "tests/test-errors/case_15.smark",
        "tests/test-errors/case_16.smark",
        "tests/test-errors/case_17.smark",
    ];
    const cases_names = Array.from({ length: 17 }, (_, i) => `case${i + 1}`);
    for(const name of cases_names) {
        html.create(name, ({content}) => html.tag("div").body(content));
    }

    for (const path of cases) {
        const name = path.split("/").pop();
        it(`throws for ${name}`, () => {
            const src = fs.readFileSync(path, "utf8");
            expect(() => new SomMark({ src, format: "html" }).transpile()).toThrow();
        });
    }
});
