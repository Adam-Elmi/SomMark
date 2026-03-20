import SomMark from './index.js';

async function test() {
    const text = '[Block = attr: "val with space"]\n  Content\n[end]\n';
    const sm = new SomMark({
        src: text,
        format: 'html',
        plugins: ['sommark-format']
    });
    await sm.parse();
    const formatPlugin = sm.plugins.find(p => p.name === 'sommark-format');
    const formatted = formatPlugin.formattedSource;
    console.log("Original:\n", text);
    console.log("Formatted:\n", formatted);
    
    if (formatted.includes('"val with space"')) {
        console.log("PASS: Quotes preserved for space-containing value.");
    } else {
        console.error("FAIL: Quotes LOST!");
        process.exit(1);
    }
    
    const text2 = 'Text at top level\n(inline)->(bold)\n@_AtBlock_@;\n  content\n@_end_@\n';
    const sm2 = new SomMark({
        src: text2,
        format: 'html',
        plugins: ['sommark-format']
    });
    await sm2.parse();
    const formatted2 = sm2.plugins.find(p => p.name === 'sommark-format').formattedSource;
    console.log("Top-level Original:\n", text2);
    console.log("Top-level Formatted:\n", formatted2);
    
    if (formatted2.includes('Text at top level') && formatted2.includes('(inline)->(bold)')) {
        console.log("PASS: Top-level content preserved.");
    } else {
        console.error("FAIL: Top-level content LOST or corrupted!");
        process.exit(1);
    }
}

test();
