import path from "pathe";

/**
 * Avoids any dependency on Node.js built-in modules (like buffer, path, stream).
 */
export class VirtualFS {
    constructor(files = {}) {
        this.files = {};
        for (const [key, value] of Object.entries(files)) {
            this.files[path.normalize(key)] = value;
        }
    }

    existsSync(p) {
        const normalized = path.normalize(p);
        return normalized in this.files;
    }

    readFileSync(p, encoding) {
        const normalized = path.normalize(p);
        if (normalized in this.files) {
            return this.files[normalized];
        }
        throw new Error(`File not found: ${p}`);
    }
}
