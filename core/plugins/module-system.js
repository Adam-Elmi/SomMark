import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { runtimeError } from "../errors.js";

const ModuleSystem = {
	name: "module-system",
	type: "preprocessor",
	scope: "top-level",
	async beforeLex(src) {
        if (!src) return src;

        const options = this.options || {};
        const supportedExtensions = options.supportedExtensions || ["smark", "css", "js"];
		const importRegex = /\[\[\s*import\s*=\s*\$([a-zA-Z0-9_-]+)\s*:\s*"([^"]+)"\s*\]\]/g;
		const usageRegex = /\$\[\[([a-zA-Z0-9_-]+)\]\]/g;

        const imports = [];
        let srcLines = src.split('\n');
        let processedSrc = src;

        // ========================================================================== //
        //  0. Module Position Validator & 1. Format Validator                        //
        // ========================================================================== //
        const potentialImportRegex = /\[\[\s*import\s*=/;
        const commentRegex = /^\s*#/;
        let contentStarted = false;
        
        srcLines.forEach((line, index) => {
            const isImportCandidate = potentialImportRegex.test(line);
            const isComment = commentRegex.test(line);
            const isEmpty = line.trim() === "";

            if (isImportCandidate) {
                if (contentStarted) {
                    runtimeError([
                        `<$red:Module Position Error:$> {N}`,
                        `Import found at line <$yellow:${index + 1}$> after content has already started. {N}`,
                        `All imports must be at the very top of the file.`
                    ]);
                }

                const match = [...line.matchAll(importRegex)][0];
                if (!match) {
                    runtimeError([
                        `<$red:Module Format Error:$> {N}`,
                        `Invalid import syntax at line <$yellow:${index + 1}$>: <$magenta:${line.trim()}$> {N}`,
                        `Expected format: <$green:[[import = $key: "path"]]$>`
                    ]);
                }
                
                const [fullMatch, key, filePath] = match;
                imports.push({
                    fullMatch,
                    key,
                    path: filePath,
                    line: index + 1
                });
            } else if (!isEmpty && !isComment) {
                // This is actual content (blocks, text, ...)
                contentStarted = true;
            }
        });

        if (imports.length === 0) return src;

        // ========================================================================== //
        //  2. Module Path Validator                                                  //
        // ========================================================================== //
        imports.forEach(imp => {
            // Check existence
            if (!fs.existsSync(imp.path)) {
                runtimeError([
                    `<$red:Module Path Error:$> {N}`,
                    `File not found: <$magenta:${imp.path}$> {N}`,
                    `Imported at line <$yellow:${imp.line}$> with key <$green:${imp.key}$>`
                ]);
            }

            // Check extension
            const ext = path.extname(imp.path).slice(1);
            if (!supportedExtensions.includes(ext)) {
                runtimeError([
                    `<$red:Module Extension Error:$> {N}`,
                    `Unsupported extension <$magenta:.${ext}$> for file <$green:${imp.path}$> {N}`,
                    `Supported extensions: <$cyan:${supportedExtensions.join(", ")}$>`
                ]);
            }
        });

        // ========================================================================== //
        //  3. Module Usage Validator                                                 //
        // ========================================================================== //
        const usageMatches = [...src.matchAll(usageRegex)];
        const usedKeys = new Set(usageMatches.map(m => m[1]));

        imports.forEach(imp => {
            if (!usedKeys.has(imp.key)) {
                runtimeError([
                    `<$red:Module Usage Error:$> {N}`,
                    `Module <$green:$${imp.key}$> is imported but never used. {N}`,
                    `Imported at line <$yellow:${imp.line}$>: <$magenta:${imp.fullMatch}$>`
                ]);
            }
        });

        // ========================================================================== //
        //  4. Substitution                                                           //
        // ========================================================================== //
        // Replace $[[key]] with content
        for (const match of usageMatches) {
            const key = match[1];
            const imp = imports.find(i => i.key === key);
            if (imp) {
                try {
                    const content = await fsPromises.readFile(imp.path, "utf-8");
                    processedSrc = processedSrc.split(`$[[${key}]]`).join(content);
                } catch (e) {
                    runtimeError([`<$red:Module Read Error:$> Failed to read <$magenta:${imp.path}$>`]);
                }
            }
        }

        // ========================================================================== //
        //  5. Remove the [[import ...]] lines                                       //
        // ========================================================================== //
        imports.forEach(imp => {
            processedSrc = processedSrc.replace(imp.fullMatch, "");
        });

        return processedSrc;
	}
};

export default ModuleSystem;
