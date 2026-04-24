import fs from "node:fs/promises";
import path from "node:path";
// ========================================================================== //
//  File helpers                                                              //
// ========================================================================== //

// ========================================================================== //
//  Check if file exists                                                      //
// ========================================================================== //
/**
 * Checks if a file or folder exists at the given path.
 * @param {string} path - The path to check.
 * @returns {Promise<boolean>}
 */
export const isExist = async path => {
    try {
        if (path) {
            await fs.access(path);
            return true;
        } else {
            throw new Error("Path is not found");
        }
    } catch (_) {
        return false;
    }
};

/**
 * Reads all the text from an entire file.
 * @param {string} path - The path to the file.
 * @returns {Promise<Buffer>}
 */
export async function readContent(path) {
    const content = await fs.readFile(path);
    return content;
}

/**
 * Creates a new file with text. It will create folders if they don't exist.
 * 
 * @param {string} folder - The directory path.
 * @param {string} file - The filename.
 * @param {string} content - The file content.
 */
export async function createFile(folder, file, content) {
    if (!(await isExist(folder))) {
        await fs.mkdir(folder, { recursive: true });
    }
    await fs.writeFile(path.join(folder, file), content);
}
