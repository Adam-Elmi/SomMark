import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cliError, formatMessage } from "../../core/errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_SRC = path.resolve(__dirname, "../../dist");

const BUNDLES = {
    "--lite":         { file: "sommark.browser.lite.js",  label: "Lite bundle",   note: "no WASM — static/runtime blocks disabled" },
    "--only-lexer":   { file: "sommark.lexer.js",         label: "Lexer bundle",  note: "lexSync, lex, TOKEN_TYPES, labels only" },
    "--only-parser":  { file: "sommark.parser.js",        label: "Parser bundle", note: "lexSync, lex, parseSync, parse, TOKEN_TYPES, labels only" },
};

async function copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath  = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

async function getDirSize(dir) {
    let total = 0;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            total += await getDirSize(full);
        } else {
            const stat = await fs.stat(full);
            total += stat.size;
        }
    }
    return total;
}

async function ensureDir(outDir) {
    let exists = false;
    try {
        const stat = await fs.stat(outDir);
        if (!stat.isDirectory()) {
            cliError([
                `{line}<$red:Target path$> <$yellow:'${outDir}'$> <$red:already exists but is a file, not a directory.$>{line}`
            ]);
        }
        exists = true;
    } catch (err) {
        if (err.code !== "ENOENT") throw err;
    }
    if (!exists) {
        try {
            await fs.mkdir(outDir, { recursive: true });
        } catch (err) {
            cliError([
                `{line}<$red:Could not create directory$> <$yellow:'${outDir}'$>{N}`,
                `<$blue:${err.message}$>{line}`
            ]);
        }
    }
}

export async function runBundle(targetDir, flags = []) {
    const outDir = targetDir ? path.resolve(process.cwd(), targetDir) : process.cwd();

    // Partial bundle (--lite, --only-lexer, --only-parser)
    const partialFlag = flags.find(f => BUNDLES[f]);
    if (partialFlag) {
        const { file, label, note } = BUNDLES[partialFlag];
        const src = path.resolve(DIST_SRC, file);

        try {
            await fs.access(src);
        } catch {
            cliError([
                `{line}<$red:${label} not found at$> <$yellow:'${src}'$>{N}`,
                `<$red:Your SomMark installation may be incomplete or corrupted.$>{line}`
            ]);
        }

        await ensureDir(outDir);

        const dest = path.join(outDir, file);
        try {
            await fs.copyFile(src, dest);
        } catch (err) {
            cliError([
                `{line}<$red:Failed to copy ${label.toLowerCase()} to$> <$yellow:'${dest}'$>{N}`,
                `<$blue:${err.message}$>{line}`
            ]);
        }

        const stats = await fs.stat(dest);
        const date  = new Date().toLocaleString();
        console.log(formatMessage(
            [
                `{line}[<$yellow: STATUS$> : <$green: SUCCESS$>]{line}`,
                `<$blue:${label}$> <$yellow:'${file}'$> <$blue:copied to$> <$yellow:'${outDir}'$>{N}`,
                `<$blue:Size:$> <$yellow:${(stats.size / 1024).toFixed(1)} KB$> <$yellow:(${note})$>{N}`,
                `<$blue:Date:$> <$yellow:${date}$>{line}`
            ].join("")
        ));
        return;
    }

    // Full: copy entire dist folder
    try {
        await fs.access(DIST_SRC);
    } catch {
        cliError([
            `{line}<$red:dist folder not found at$> <$yellow:'${DIST_SRC}'$>{N}`,
            `<$red:Your SomMark installation may be incomplete or corrupted.$>{line}`
        ]);
    }

    await ensureDir(outDir);

    try {
        await copyDir(DIST_SRC, outDir);
    } catch (err) {
        cliError([
            `{line}<$red:Failed to copy bundle to$> <$yellow:'${outDir}'$>{N}`,
            `<$blue:${err.message}$>{line}`
        ]);
    }

    const totalSize = await getDirSize(outDir);
    const date      = new Date().toLocaleString();
    console.log(formatMessage(
        [
            `{line}[<$yellow: STATUS$> : <$green: SUCCESS$>]{line}`,
            `<$blue:Bundle copied to$> <$yellow:'${outDir}'$>{N}`,
            `<$blue:Total size:$> <$yellow:${(totalSize / 1024).toFixed(1)} KB$>{N}`,
            `<$blue:Date:$> <$yellow:${date}$>{line}`
        ].join("")
    ));
}
