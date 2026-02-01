import fs from "node:fs/promises";
import path from "node:path";
// ========================================================================== //
//  File helpers                                                              //
// ========================================================================== //

// ========================================================================== //
//  Check if file exists                                                      //
// ========================================================================== //
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

// ========================================================================== //
//  Read file content                                                         //
// ========================================================================== //
export async function readContent(path) {
    const content = await fs.readFile(path);
    return content;
}

// ========================================================================== //
//  Create file                                                               //
// ========================================================================== //
export async function createFile(folder, file, content) {
    if (!(await isExist(folder))) {
        await fs.mkdir(folder, { recursive: true });
    }
    await fs.writeFile(path.join(folder, file), content);
}
