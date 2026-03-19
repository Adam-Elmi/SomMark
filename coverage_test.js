import lexer from "./core/lexer.js";

const src = "  [Block]\n    content\n  [end]";
console.log(`Source length: ${src.length}`);

const tokens = lexer(src);
let totalCovered = 0;

tokens.forEach((t, idx) => {
    if (t.type === "EOF") return;
    const len = t.value.length;
    totalCovered += len;
    console.log(`Token ${idx}: type=${t.type.padEnd(15)} structural=${(!!t.isStructural).toString().padEnd(6)} val=${JSON.stringify(t.value).padEnd(20)} range:(${t.range.start.line},${t.range.start.character}) - (${t.range.end.line},${t.range.end.character})`);
});

console.log(`Total covered length: ${totalCovered}`);
if (totalCovered !== src.length) {
    console.log(`GAP DETECTED: missing ${src.length - totalCovered} characters.`);
} else {
    console.log("SUCCESS: 100% Coverage.");
}
