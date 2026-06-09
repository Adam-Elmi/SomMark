export class FetchFS {
    constructor(baseURL) {
        this.baseURL = baseURL.endsWith("/") ? baseURL : baseURL + "/";
        this._cache = new Map();
    }

    _resolve(p) {
        if (p.startsWith("http://") || p.startsWith("https://")) return p;
        return this.baseURL + p.replace(/^\//, "");
    }

    async readFile(p, encoding) {
        const url = this._resolve(p);
        if (this._cache.has(url)) return this._cache.get(url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`File not found: ${p} (${res.status})`);
        const text = await res.text();
        this._cache.set(url, text);
        return text;
    }

    async exists(p) {
        try { await this.readFile(p); return true; }
        catch { return false; }
    }

    // Sync versions — backed by cache, only valid after readFile has been called for that path
    existsSync(p) {
        return this._cache.has(this._resolve(p));
    }

    readFileSync(p, encoding) {
        const cached = this._cache.get(this._resolve(p));
        if (cached !== undefined) return cached;
        throw new Error(`Not in cache: ${p}. Call readFile first.`);
    }
}
