import lexer from "./core/lexer.js";

const src = "  [Block]\n    content\n  [end]";
console.log("Input text:");
console.log(src);
console.log("-------------------");

try {
    const tokens = lexer(src);
    tokens.forEach((t, i) => {
        console.log(`Token ${i}: type=${t.type.padEnd(15)} val=${JSON.stringify(t.value).padEnd(20)} line=${t.range.start.line} char=${t.range.start.character}`);
    });
} catch (e) {
    console.error(e);
}
