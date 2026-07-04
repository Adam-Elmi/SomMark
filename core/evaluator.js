import { getQuickJS } from "quickjs-emscripten";
import path from "pathe";
import * as acorn from "acorn";
import SomMark, { registerHostCompile, registerHostSettings } from "./helpers/lib.js";
import { formatMessage } from "./errors.js";
import { patheBundleCode } from "./pathe-bundle.js";
import lexer from "./lexer.js";
import parser from "./parser.js";

// Set by index.js (Node.js) or index.browser.js (shim) — never imported directly.
let evaluatorStorage = null;

export function setDefaultAsyncLocalStorage(cls) {
    evaluatorStorage = cls ? new cls() : null;
}

/**
 * Runs fn inside an isolated evaluator context.
 * Concurrent transpile() calls each get their own stack — no cross-contamination.
 */
export function withEvaluator(fn) {
    if (!evaluatorStorage) return fn();
    return evaluatorStorage.run([], fn);
}

// Global tracker to ensure deep recursive Smark compilation never exceeds safe boundaries
let globalCompilationDepth = 0;

async function prefetchImports(code, baseDir, fsImpl) {
    if (!fsImpl?.readFile) return;
    let ast;
    try { ast = acorn.parse(code, { ecmaVersion: "latest", sourceType: "module" }); }
    catch { return; }

    for (const node of ast.body) {
        if (node.type !== "ImportDeclaration") continue;
        const importPath = node.source.value;
        const resolved = /^https?:\/\//.test(baseDir)
            ? new URL(importPath, baseDir.endsWith("/") ? baseDir : baseDir + "/").href
            : path.resolve(baseDir, importPath);

        if (fsImpl.existsSync(resolved)) continue; // already cached

        try {
            const content = await fsImpl.readFile(resolved);
            if (resolved.endsWith(".js")) {
                const nextBase = /^https?:\/\//.test(resolved)
                    ? resolved.slice(0, resolved.lastIndexOf("/") + 1)
                    : path.dirname(resolved);
                await prefetchImports(content, nextBase, fsImpl);
            }
        } catch { /* let QuickJS surface the error */ }
    }
}

let compilerClass = null;

export function setCompilerClass(cls) {
    compilerClass = cls;
}

// Pure, top-level stateless adapters to avoid circular references and closures over EvaluatorState
const customFetchAdapter = async (input, init, security = {}) => {
    const allowFetch = security?.allowFetch !== false;
    if (!allowFetch) {
        throw new Error("Fetch Error: fetch is disabled in this environment.");
    }

    const url = input.toString();
    try {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol.toLowerCase();
        const hostname = parsedUrl.hostname.toLowerCase();

        // 1. Enforce HTTPS (HTTP Blocked by default unless allowHttp is true)
        const allowHttp = security?.allowHttp === true;
        if (protocol === "http:" && !allowHttp) {
            throw new Error("Fetch Security Error: HTTP requests are disabled. Use HTTPS instead.");
        }
        if (protocol !== "http:" && protocol !== "https:") {
            throw new Error(`Fetch Security Error: Unsupported protocol '${protocol}'. Only HTTP/HTTPS is allowed.`);
        }

        // 2. SSRF Protection: Block localhost, loopbacks, link-local, and RFC 1918 private network IP ranges
        const isLocal = hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "0.0.0.0" ||
            hostname === "[::1]" ||
            hostname === "::" ||
            hostname.startsWith("127.") ||
            hostname.startsWith("10.") ||
            hostname.startsWith("192.168.") ||
            hostname.startsWith("169.254.") ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

        if (isLocal) {
            throw new Error("SSRF Protection: Requests to local or private IP addresses are forbidden.");
        }

        // 3. Whitelisted Origins Check
        const allowedOrigins = security?.allowedOrigins;
        if (allowedOrigins && allowedOrigins.length > 0) {
            const origin = parsedUrl.origin.toLowerCase();
            const isOriginAllowed = allowedOrigins.some(allowed => {
                try {
                    const allowedUrl = new URL(allowed);
                    return origin === allowedUrl.origin.toLowerCase();
                } catch {
                    return hostname === allowed.toLowerCase() || hostname.endsWith("." + allowed.toLowerCase());
                }
            });
            if (!isOriginAllowed) {
                throw new Error(`Fetch Security Error: Origin '${origin}' is not whitelisted.`);
            }
        }

        // 4. Whitelisted Extensions Check
        const allowedExtensions = security?.allowedExtensions;
        if (allowedExtensions && allowedExtensions.length > 0) {
            const ext = path.extname(parsedUrl.pathname).toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                throw new Error(`Fetch Security Error: Extension '${ext || "(none)"}' is not whitelisted.`);
            }
        }
    } catch (e) {
        throw new Error(e.message.startsWith("Fetch Security Error:") || e.message.startsWith("SSRF Protection:")
            ? e.message
            : "Fetch Security Error: " + e.message);
    }

    const res = await fetch(url, init);
    const bodyText = await res.text();

    const headers = {};
    res.headers.forEach((val, key) => {
        headers[key.toLowerCase()] = val;
    });

    return {
        status: res.status,
        ok: res.ok,
        statusText: res.statusText,
        url: res.url,
        type: res.type,
        redirected: res.redirected,
        bodyText,
        headers
    };
};

const customCompileAdapter = async (src, options, parentSecurity = {}, parentFs = null, parentBaseDir = null) => {
    const maxDepth = parentSecurity?.maxDepth ?? 5;
    if (globalCompilationDepth >= maxDepth) {
        throw new Error(`Recursion Guard: Maximum Smark compilation depth exceeded (limit is ${maxDepth}).`);
    }

    globalCompilationDepth++;
    try {
        const cleanOptions = JSON.parse(JSON.stringify(options || {}));
        if (!compilerClass) {
            throw new Error("Compiler class is not registered in the evaluator.");
        }
        const compilerOptions = {
            ...cleanOptions,
            src,
            format: cleanOptions.format || "html",
            security: parentSecurity,
            fs: parentFs ?? undefined,
            baseDir: cleanOptions.baseDir || parentBaseDir || undefined,
        };
        const sm = new compilerClass(compilerOptions);
        return await sm.transpile();
    } finally {
        globalCompilationDepth--;
    }
};

// Register statically once at module loading
registerHostCompile(customCompileAdapter);

let defaultFs = null;
let defaultEnv = null;
let quickJSInstance = null;
async function getQuickJSModule() {
    if (!quickJSInstance) {
        quickJSInstance = await getQuickJS();
    }
    return quickJSInstance;
}

function objectToHandle(context, obj) {
    if (obj === undefined) {
        return context.undefined;
    }
    const jsonStr = JSON.stringify(obj);
    const stringHandle = context.newString(jsonStr);
    const jsonHandle = context.getProp(context.global, "JSON");
    const parseHandle = context.getProp(jsonHandle, "parse");
    const result = context.callFunction(parseHandle, jsonHandle, stringHandle);
    stringHandle.dispose();
    parseHandle.dispose();
    jsonHandle.dispose();
    return result.unwrap();
}

function isPlainData(value, seen = new Set()) {
    if (value === null || value === undefined) return true;
    if (typeof value === "function") return false;
    if (typeof value !== "object") return true;
    if (seen.has(value)) return false;
    seen.add(value);
    if (Array.isArray(value)) return value.every(v => isPlainData(v, seen));
    return Object.values(value).every(v => isPlainData(v, seen));
}

function expose(context, vars, pendingDeferreds) {
    for (const [key, value] of Object.entries(vars)) {
        let handle;
        if (typeof value === "function") {
            handle = context.newFunction(key, (...args) => {
                try {
                    const jsArgs = args.map(arg => context.dump(arg));
                    const res = value(...jsArgs);
                    if (res instanceof Promise || (res && typeof res === "object" && typeof res.then === "function")) {
                        const deferred = context.newPromise();
                        if (pendingDeferreds) {
                            pendingDeferreds.add(deferred);
                        }
                        res.then(
                            (resolvedVal) => {
                                try {
                                    if (!context.alive) return;
                                    if (resolvedVal === undefined) {
                                        deferred.resolve();
                                    } else {
                                        const valHandle = objectToHandle(context, resolvedVal);
                                        deferred.resolve(valHandle);
                                        valHandle.dispose();
                                    }
                                } catch (e) {
                                    if (context.alive) {
                                        const errHandle = context.newError(e.message || String(e));
                                        deferred.reject(errHandle);
                                        errHandle.dispose();
                                    }
                                } finally {
                                    if (pendingDeferreds) {
                                        pendingDeferreds.delete(deferred);
                                    }
                                    if (context.alive) {
                                        deferred.dispose();
                                    }
                                }
                            },
                            (rejectedErr) => {
                                try {
                                    if (!context.alive) return;
                                    const errHandle = context.newError(rejectedErr.message || String(rejectedErr));
                                    deferred.reject(errHandle);
                                    errHandle.dispose();
                                } catch (e) {
                                    // ignore
                                } finally {
                                    if (pendingDeferreds) {
                                        pendingDeferreds.delete(deferred);
                                    }
                                    if (context.alive) {
                                        deferred.dispose();
                                    }
                                }
                            }
                        );
                        return deferred.handle.dup();
                    } else if (res === undefined) {
                        return;
                    } else {
                        return objectToHandle(context, res);
                    }
                } catch (err) {
                    throw context.newError(err.message || String(err));
                }
            });
        } else {
            handle = objectToHandle(context, value);
        }
        context.setProp(context.global, key, handle);
        handle.dispose();
    }
}

class EvaluatorState {
    constructor() {
        this.runtime = null;
        this.context = null;
        this.baseDir = "/";
        this.scopes = [{}];
        this.dynamicTagsStack = [new Map()];
        this.deadline = 0;
        this.pendingDeferreds = new Set();
    }

    async init(baseDir = null, security = {}, settings = {}, mapperFile = null) {
        if (baseDir) {
            this.baseDir = baseDir;
        } else if (settings?.instance?.cwd) {
            this.baseDir = settings.instance.cwd;
        } else {
            this.baseDir = "/";
        }
        this.rootDir = settings?.instance?.cwd || this.baseDir;
        this.scopes = [{}];
        this.dynamicTagsStack = [new Map()];
        this.security = security;
        this.settings = settings;
        this.mapperFile = mapperFile;
        registerHostSettings(settings);

        this.nodeFs = defaultFs;

        if (this.context) {
            this.expose({
                __allowRaw: this.security.allowRaw !== false
            });
            return;
        }

        const QuickJS = await getQuickJSModule();
        this.runtime = QuickJS.newRuntime();
        this.context = this.runtime.newContext();

        this.deadline = 0;
        this.runtime.setInterruptHandler(() => {
            return this.deadline > 0 && Date.now() > this.deadline;
        });

        this.expose({
            __hostEnv: (key) => {
                if (defaultEnv === null) {
                    throw new Error(
                        "[SomMark] SomMark.env() is not available in browser mode.\n" +
                        "Environment variables are a server-side concept.\n" +
                        "Read env values at build time and pass them as placeholders instead."
                    );
                }
                const allowlist = this.security?.env;
                if (!Array.isArray(allowlist) || !allowlist.includes(key)) return undefined;
                return defaultEnv[key] ?? undefined;
            },
            __hostSomMarkVersion: SomMark.version,
            __hostSomMarkSettings: () => {
                const s = SomMark.settings;
                return JSON.stringify({
                    format:        s.format        ?? null,
                    dev:           s.dev           ?? false,
                    removeComments:s.removeComments ?? false,
                    allowRaw:      s.allowRaw      ?? true,
                    dualOutput:    s.dualOutput     ?? false,
                    webOutputs:    s.webOutputs     ?? false,
                });
            },
            __hostCompile: async (src, options) => {
                return await customCompileAdapter(src, options, this.security, this.nodeFs, this.baseDir);
            },
            __hostLexer: (src, filename) => {
                return JSON.stringify(lexer(src, filename || "anonymous"));
            },
            __hostParser: (src, filename) => {
                const tokens = lexer(src, filename || "anonymous");
                return JSON.stringify(parser(tokens, filename || "anonymous"));
            },
            __hostFetch: async (input, initStr) => {
                const init = initStr ? JSON.parse(initStr) : undefined;
                return await customFetchAdapter(input, init, this.security);
            },
            __hostRegisterDynamicTag: (id, options) => {
                this.registerDynamicTag(id, options);
            },
            __hostRemoveDynamicTag: (id) => {
                const activeMap = this.dynamicTagsStack[this.dynamicTagsStack.length - 1];
                activeMap.delete(id);
            },
            __hostGetTagInfo: (id) => {
                if (!this.mapperFile) return null;
                const target = this.mapperFile.get(id);
                if (!target) return null;
                return JSON.stringify({
                    options: target.options || {}
                });
            },
            __hostCallTagRender: async (id, payloadStr) => {
                if (!this.mapperFile) return "";
                const target = this.mapperFile.get(id);
                if (!target) return "";
                const payload = JSON.parse(payloadStr);
                return await target.render.call(this.mapperFile, payload);
            },
            __hostFileRead: async (filePath) => {
                if (!this.nodeFs) {
                    throw new Error(
                        "[SomMark] fileHandler is not available in browser mode.\n" +
                        "File access is a server-side concept."
                    );
                }
                const abs = path.resolve(this.rootDir, filePath);
                if (!abs.startsWith(this.rootDir)) {
                    throw new Error(
                        `[SomMark] fileHandler.read: path traversal outside project root is not allowed.\n` +
                        `Attempted path: ${abs}`
                    );
                }
                return this.nodeFs.readFile(abs, "utf-8");
            },
            __hostFileExists: async (filePath) => {
                if (!this.nodeFs) return false;
                const abs = path.resolve(this.rootDir, filePath);
                if (!abs.startsWith(this.rootDir)) return false;
                return this.nodeFs.exists(abs);
            },
            __hostFileGlob: async (pattern) => {
                if (!this.nodeFs) throw new Error("[SomMark] fileHandler.glob is not available in browser mode.\nFile access is a server-side concept.");
                if (!this.nodeFs.glob) throw new Error("[SomMark] fileHandler.glob requires Node.js 22 or later.");
                const files = await this.nodeFs.glob(pattern, { cwd: this.rootDir });
                return JSON.stringify(files);
            },
            __hostFileLastModified: async (filePath) => {
                if (!this.nodeFs) throw new Error("[SomMark] fileHandler.lastModified is not available in browser mode.");
                const abs = path.resolve(this.rootDir, filePath);
                if (!abs.startsWith(this.rootDir)) throw new Error("[SomMark] fileHandler.lastModified: path traversal outside project root is not allowed.");
                const stat = await this.nodeFs.stat(abs);
                return stat.mtimeMs;
            },
            __hostFileStat: async (filePath) => {
                if (!this.nodeFs) throw new Error("[SomMark] fileHandler.stat is not available in browser mode.\nFile access is a server-side concept.");
                const abs = path.resolve(this.rootDir, filePath);
                if (!abs.startsWith(this.rootDir)) throw new Error(`[SomMark] fileHandler.stat: path traversal outside project root is not allowed.\nAttempted path: ${abs}`);
                try {
                    const s = await this.nodeFs.stat(abs);
                    return JSON.stringify({
                        size: s.size,
                        mtime: s.mtimeMs,
                        ctime: s.ctimeMs,
                        atime: s.atimeMs,
                        isFile: s.isFile(),
                        isDirectory: s.isDirectory(),
                    });
                } catch {
                    return null;
                }
            },
            __allowRaw: this.security.allowRaw !== false
        });

        // Setup standard library and namespace
        const setupRes = this.context.evalCode(`
            const __nativeFetch = globalThis.fetch;
            class TagBuilder {
                constructor(tagName) {
                    this.tagName = tagName;
                    this._children = "";
                    this._attr = [];
                    this._is_self_close = false;
                }
                attributes(obj) {
                    if (obj && typeof obj === "object") {
                        Object.entries(obj).forEach(([key, value]) => {
                            if (value === true) this._attr.push(key);
                            else if (value !== false && value !== null && value !== undefined) {
                                const esc = String(value)
                                    .replace(/&/g, "&amp;")
                                    .replace(/</g, "&lt;")
                                    .replace(/>/g, "&gt;")
                                    .replace(/"/g, "&quot;")
                                    .replace(/'/g, "&#39;");
                                this._attr.push(\`\${key}="\${esc}"\`);
                            }
                        });
                    }
                    return this;
                }
                body(nodes) {
                    if (nodes) {
                        this._children += (this._children ? " " : "") + nodes;
                    }
                    return this.builder();
                }
                selfClose() {
                    this._is_self_close = true;
                    return this.builder();
                }
                builder() {
                    const props = this._attr.length > 0 ? " " + this._attr.join(" ") : "";
                    if (this._is_self_close) {
                        return \`<\${this.tagName}\${props} />\`;
                    }
                    return \`<\${this.tagName}\${props}>\${this._children}</\${this.tagName}>\`;
                }
            }

            const SomMark = {
                version: __hostSomMarkVersion,
                __dynamicTags: new Map(),
                register: function(id, render, options = {}) {
                    if (typeof id !== "string") {
                        throw new Error("SomMark.register Error: Tag ID must be a string.");
                    }
                    if (typeof render !== "function") {
                        throw new Error("SomMark.register Error: Render function must be a function.");
                    }
                    this.__dynamicTags.set(id, { render, options });
                    __hostRegisterDynamicTag(id, options);
                },
                get: function(id) {
                    if (typeof id !== "string") {
                        throw new Error("SomMark.get Error: Tag ID must be a string.");
                    }
                    const local = this.__dynamicTags.get(id);
                    if (local) {
                        return {
                            options: local.options || {},
                            render: local.render
                        };
                    }
                    const hostInfoStr = __hostGetTagInfo(id);
                    if (hostInfoStr) {
                        const hostInfo = JSON.parse(hostInfoStr);
                        return {
                            options: hostInfo.options || {},
                            render: async function(payload) {
                                return await __hostCallTagRender(id, JSON.stringify(payload));
                            }
                        };
                    }
                    return null;
                },
                removeOutput: function(id) {
                    if (typeof id !== "string") {
                        throw new Error("SomMark.removeOutput Error: Tag ID must be a string.");
                    }
                    this.__dynamicTags.delete(id);
                    __hostRemoveDynamicTag(id);
                },
                includesId: function(ids) {
                    if (!Array.isArray(ids)) {
                        throw new Error("SomMark.includesId Error: Expected an array of IDs.");
                    }
                    if (ids.some(id => this.__dynamicTags.has(id))) {
                        return true;
                    }
                    return ids.some(id => __hostGetTagInfo(id) !== null);
                },
                tag: function(tagName) {
                    if (typeof tagName !== "string") {
                        throw new Error("SomMark.tag Error: Tag name must be a string.");
                    }
                    return new TagBuilder(tagName);
                },
                get settings() {
                    const parsed = JSON.parse(__hostSomMarkSettings() || "{}");
                    Object.defineProperty(parsed, "__raw", {
                        value: JSON.stringify(parsed),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    });
                    return Object.freeze(parsed);
                },
                fetch: async (input, init) => {
                    const plainRes = await __hostFetch(input.toString(), init ? JSON.stringify(init) : "");
                    return {
                        status: plainRes.status,
                        ok: plainRes.ok,
                        statusText: plainRes.statusText,
                        url: plainRes.url,
                        type: plainRes.type,
                        redirected: plainRes.redirected,
                        headers: {
                            get: (name) => plainRes.headers[name.toLowerCase()] || null,
                            forEach: (cb) => {
                                Object.keys(plainRes.headers).forEach(key => cb(plainRes.headers[key], key));
                            }
                        },
                        text: async () => plainRes.bodyText,
                        json: async () => JSON.parse(plainRes.bodyText),
                        clone: function() { return { ...this }; }
                    };
                },
                compile: async (src, options) => {
                    if (src === null || src === undefined) {
                        throw new Error("SomMark.compile Error: Template source cannot be null or undefined.");
                    }
                    if (typeof src === "function") {
                        throw new Error("SomMark.compile Error: Cannot pass a function as the template source. Did you forget to invoke/call it?");
                    }
                    if (src instanceof Promise || (typeof src === "object" && typeof src.then === "function")) {
                        throw new Error("SomMark.compile Error: Cannot pass a Promise as the template source. Did you forget to use 'await'?");
                    }
                    if (typeof src !== "string") {
                        throw new Error("SomMark.compile Error: Template source must be a string.");
                    }
                    return await __hostCompile(src, options);
                },
                lexer: (src, filename) => {
                    if (typeof src !== "string") {
                        throw new Error("SomMark.lexer Error: Source must be a string.");
                    }
                    return JSON.parse(__hostLexer(src, filename));
                },
                parser: (src, filename) => {
                    if (typeof src !== "string") {
                        throw new Error("SomMark.parser Error: Source must be a string.");
                    }
                    return JSON.parse(__hostParser(src, filename));
                },
                raw: (html) => {
                    if (typeof __allowRaw !== "undefined" && !__allowRaw) {
                        throw new Error("Security Error: SomMark.raw is disabled in this environment.");
                    }
                    if (html === null || html === undefined) {
                        return { __raw: "" };
                    }
                    if (typeof html === "function") {
                        throw new Error("SomMark.raw Error: Cannot pass a function directly to SomMark.raw. Did you forget to invoke/call it?");
                    }
                    if (html instanceof Promise || (typeof html === "object" && typeof html.then === "function")) {
                        throw new Error("SomMark.raw Error: Cannot pass a Promise directly to SomMark.raw. Did you forget to use 'await'?");
                    }
                    if (typeof html === "object" && !html.__raw) {
                        throw new Error("SomMark.raw Error: Cannot render an object directly.");
                    }
                    return { __raw: String(html.__raw !== undefined ? html.__raw : html) };
                },
                static: (expr) => {
                    if (typeof expr !== "string") {
                        throw new Error("SomMark.static Error: Argument must be a string.");
                    }
                    return globalThis.eval(expr);
                },
                env: (key) => {
                    if (typeof key !== "string" || !key) {
                        throw new Error("SomMark.env Error: Key must be a non-empty string.");
                    }
                    return __hostEnv(key);
                }
            };

            Object.freeze(SomMark);

            Object.defineProperty(globalThis, "SomMark", {
                value: SomMark,
                writable: false,
                configurable: false
            });

            Object.defineProperty(globalThis, "Smark", {
                value: SomMark,
                writable: false,
                configurable: false
            });

            globalThis.fileHandler = Object.freeze({
                read: async (path) => await __hostFileRead(path),
                exists: async (path) => await __hostFileExists(path),
                glob: async (pattern) => JSON.parse(await __hostFileGlob(pattern)),
                lastModified: async (path) => await __hostFileLastModified(path),
                stat: async (path) => { const r = await __hostFileStat(path); return r ? JSON.parse(r) : null; },
            });

            delete globalThis.fetch;
            delete globalThis.process;
        `);

        if (setupRes.error) {
            const err = this.context.dump(setupRes.error);
            setupRes.error.dispose();
            throw new Error("VM initialization failed: " + JSON.stringify(err));
        }
        setupRes.value.dispose();

        const patheRes = this.context.evalCode(patheBundleCode);
        if (patheRes.error) {
            patheRes.error.dispose();
        } else {
            patheRes.value.dispose();
        }

        // Configure module loader using virtual FS implementation.
        // The normalizer resolves every import to an absolute path so the module
        // cache key is always absolute — <smark> (the eval module name) can never
        // be reached by any user import regardless of what the file is named.
        this.runtime.setModuleLoader((moduleName) => {
            try {
                const isRaw = moduleName.endsWith("?raw");
                const cleanModuleName = isRaw ? moduleName.slice(0, -4) : moduleName;
                // moduleName is already an absolute path (supplied by the normalizer below),
                // so resolve() is a no-op for absolute paths and a safe fallback for URLs.
                const resolvedPath = /^https?:\/\//.test(cleanModuleName)
                    ? cleanModuleName
                    : path.resolve(this.baseDir, cleanModuleName);

                const fsImpl = this.settings?.fs || this.settings?.instance?.fs || this.nodeFs;
                if (!fsImpl) {
                    throw new Error("No filesystem implementation available.");
                }

                if (fsImpl.existsSync(resolvedPath)) {
                    let source = fsImpl.readFileSync(resolvedPath, "utf8");

                    if (isRaw) {
                        const escapedSource = source.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${");
                        return `export default \`${escapedSource}\`;`;
                    }

                    if (resolvedPath.endsWith(".json")) {
                        source = `export default ${source};`;
                    }

                    if (resolvedPath.endsWith(".smark")) {
                        const escapedSource = source.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${");
                        source = `
                            export default async (variables = {}) => {
                                return await SomMark.compile(\`${escapedSource}\`, { variables });
                            };
                        `;
                    }

                    return source;
                }
                throw new Error(`Module not found: ${moduleName}`);
            } catch (err) {
                throw err;
            }
        }, (baseName, moduleName) => {
            // Resolve every import to an absolute path so no user import can ever
            // normalize to <smark> (or any other virtual eval module name).
            const isRaw = moduleName.endsWith("?raw");
            const clean = isRaw ? moduleName.slice(0, -4) : moduleName;
            if (/^https?:\/\//.test(clean)) return moduleName;
            const baseDir = (baseName === "<smark>" || !path.isAbsolute(baseName))
                ? this.baseDir
                : (/^https?:\/\//.test(baseName) ? baseName : path.dirname(baseName));
            let resolved;
            if (/^https?:\/\//.test(baseDir)) {
                resolved = new URL(clean, baseDir).href;
            } else {
                resolved = path.resolve(baseDir, clean);
            }
            return isRaw ? resolved + "?raw" : resolved;
        });
    }

    expose(vars) {
        if (!this.context) return;
        expose(this.context, vars, this.pendingDeferreds);
    }

    pushScope() {
        this.scopes.push({});
        this.dynamicTagsStack.push(new Map());
    }

    async popScope() {
        if (this.scopes.length > 1) {
            const popped = this.scopes.pop();
            this.dynamicTagsStack.pop();
            const keysToDelete = Object.keys(popped);
            if (keysToDelete.length > 0 && this.context) {
                try {
                    const deleteCode = keysToDelete.map(k => `delete globalThis['${k}'];`).join(" ");
                    const deleteRes = this.context.evalCode(deleteCode, "cleanup.js");
                    if (deleteRes.value) deleteRes.value.dispose();
                    if (deleteRes.error) deleteRes.error.dispose();
                } catch (e) {
                    // ignore
                }
            }
            if (this.context) {
                const merged = {};
                for (const scope of this.scopes) {
                    Object.assign(merged, scope);
                }
                this.expose(merged);
            }
        }
    }

    hasDynamicTag(id) {
        for (let i = this.dynamicTagsStack.length - 1; i >= 0; i--) {
            if (this.dynamicTagsStack[i].has(id)) return true;
        }
        return false;
    }

    getDynamicTagOptions(id) {
        for (let i = this.dynamicTagsStack.length - 1; i >= 0; i--) {
            const entry = this.dynamicTagsStack[i].get(id);
            if (entry) return entry.options;
        }
        return {};
    }

    registerDynamicTag(id, options = {}) {
        const activeMap = this.dynamicTagsStack[this.dynamicTagsStack.length - 1];
        activeMap.set(id, { options });
    }

    async executeDynamicTag(id, payload) {
        if (!this.context) throw new Error("EvaluatorState not initialized");
        this.expose({
            __activeTagPayload: () => JSON.stringify(payload)
        });
        const code = `
            (() => {
                const payload = JSON.parse(__activeTagPayload());
                const tag = SomMark.__dynamicTags.get(${JSON.stringify(id)});
                if (!tag) throw new Error("Tag not found inside VM: " + ${JSON.stringify(id)});
                const res = tag.render({
                    props: payload.props,
                    content: payload.content,
                    textContent: payload.textContent,
                    isSelfClosing: payload.isSelfClosing
                });
                return res;
            })()
        `;
        const evalRes = this.context.evalCode(code, "render_tag.js");
        if (evalRes.error) {
            const err = this.context.dump(evalRes.error);
            evalRes.error.dispose();
            throw err;
        }

        let resultHandle = evalRes.unwrap();
        const state = this.context.getPromiseState(resultHandle);
        if (state && state.type === "pending") {
            while (true) {
                this.runtime.executePendingJobs();
                const curState = this.context.getPromiseState(resultHandle);
                if (curState.type !== "pending") {
                    if (curState.type === "fulfilled") {
                        resultHandle.dispose();
                        resultHandle = curState.value;
                    } else {
                        const errHandle = curState.error;
                        const err = this.context.dump(errHandle);
                        errHandle.dispose();
                        resultHandle.dispose();
                        throw err;
                    }
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        const result = this.context.dump(resultHandle);
        resultHandle.dispose();
        return result;
    }

    _syncScopes() {
        if (!this.context) return;
        const allKeysSet = new Set();
        for (const scope of this.scopes) {
            for (const key of Object.keys(scope)) {
                allKeysSet.add(key);
            }
        }
        const allKeys = Array.from(allKeysSet);
        if (allKeys.length > 0) {
            try {
                const getValuesCode = `export default { ${allKeys.map(k => `${JSON.stringify(k)}: globalThis['${k}']`).join(", ")} };`;
                const valuesRes = this.context.evalCode(getValuesCode, "sync.js", { type: 'module' });
                if (valuesRes.value) {
                    const syncedValuesObj = this.context.dump(valuesRes.value);
                    valuesRes.value.dispose();
                    if (syncedValuesObj && typeof syncedValuesObj === 'object' && 'default' in syncedValuesObj) {
                        const syncedValues = syncedValuesObj.default;
                        for (const [key, val] of Object.entries(syncedValues)) {
                            for (let s = this.scopes.length - 1; s >= 0; s--) {
                                if (key in this.scopes[s]) {
                                    this.scopes[s][key] = val;
                                    break;
                                }
                            }
                        }
                    }
                } else if (valuesRes.error) {
                    valuesRes.error.dispose();
                }
            } catch (err) {
                // ignore
            }
        }
    }

    inject(vars) {
        if (!this.context) return;
        const safe = {};
        for (const [key, value] of Object.entries(vars)) {
            if (typeof value === "function") {
                const src = value.toString();
                if (src.includes("SomMark.")) {
                    console.warn(`[SomMark] variables.${key}: references 'SomMark' which bundlers may rename. Use 'Smark' instead.`);
                }
                const res = this.context.evalCode(`globalThis[${JSON.stringify(key)}] = ${src}`);
                if (res.error) res.error.dispose();
                else res.value.dispose();
                continue;
            }
            if (!isPlainData(value)) continue;
            safe[key] = value;
        }
        const currentScope = this.scopes[this.scopes.length - 1];
        Object.assign(currentScope, safe);
        this.expose(safe);
    }

    async execute(code, baseDir = null) {
        if (!this.context) throw new Error("Evaluator not initialized");
        const prevBaseDir = this.baseDir;
        if (baseDir) this.baseDir = baseDir;

        const timeout = this.security?.timeout ?? 5000;
        this.deadline = Date.now() + timeout;

        const interval = setInterval(() => {
            try {
                this.runtime.executePendingJobs();
            } catch (err) {
                // ignore
            }
        }, 1);

        try {
            let autoExportedNames = [];
            let hasExplicitExports = false;
            try {
                const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', allowReturnOutsideFunction: true });
                for (const node of ast.body) {
                    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration' || node.type === 'ExportAllDeclaration') {
                        hasExplicitExports = true;
                    }
                    if (node.type === 'VariableDeclaration') {
                        for (const decl of node.declarations) {
                            if (decl.id.type === 'Identifier') autoExportedNames.push(decl.id.name);
                            else if (decl.id.type === 'ObjectPattern') {
                                for (const prop of decl.id.properties) {
                                    if (prop.value.type === 'Identifier') autoExportedNames.push(prop.value.name);
                                }
                            }
                        }
                    } else if (node.type === 'FunctionDeclaration') {
                        if (node.id) autoExportedNames.push(node.id.name);
                    } else if (node.type === 'ImportDeclaration') {
                        for (const spec of node.specifiers) {
                            autoExportedNames.push(spec.local.name);
                        }
                    }
                }
            } catch (e) {
                // Ignore parsing errors for simple expression fragments
            }

            const hasImportExport = hasExplicitExports || /\bimport\b/.test(code);
            const hasAwait = /\bawait\b/.test(code);

            let finalCode = code;

            try {
                const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', allowReturnOutsideFunction: true });
                const lastNode = ast.body[ast.body.length - 1];
                if (lastNode && lastNode.type === 'ExpressionStatement') {
                    const start = lastNode.start;
                    finalCode = code.slice(0, start) + "export default " + code.slice(start);
                } else if (lastNode && lastNode.type === 'ReturnStatement') {
                    const start = lastNode.start;
                    if (lastNode.argument) {
                        const argumentCode = code.slice(lastNode.argument.start, lastNode.argument.end);
                        finalCode = code.slice(0, start) + `export default (${argumentCode});` + code.slice(lastNode.end);
                    } else {
                        finalCode = code.slice(0, start) + "export default undefined;" + code.slice(lastNode.end);
                    }
                }
            } catch (err) {
                // Parse failed as a statement — try as a parenthesised expression.
                // This handles object/array literals like {a: 1} or [1, 2] which are
                // ambiguous in statement context but valid when wrapped in parens.
                try {
                    const trimmed = code.trim();
                    acorn.parse(`(${trimmed})`, { ecmaVersion: 'latest', sourceType: 'module' });
                    finalCode = `export default (${trimmed});`;
                } catch {
                    // Give up — let QuickJS surface the error.
                }
            }

            if (autoExportedNames.length > 0 && !hasExplicitExports) {
                finalCode += `\nexport { ${autoExportedNames.join(', ')} };`;
            }

            const isModule = hasImportExport || hasAwait || autoExportedNames.length > 0 || finalCode.includes("export default");

            const fsImpl = this.settings?.fs || this.settings?.instance?.fs || this.nodeFs;
            if (isModule) await prefetchImports(finalCode, this.baseDir, fsImpl);

            let result;
            if (isModule) {
                const evalRes = this.context.evalCode(finalCode, "<smark>", { type: 'module' });
                if (evalRes.error) {
                    const err = this.context.dump(evalRes.error);
                    evalRes.error.dispose();
                    throw err;
                }

                let resultHandle = evalRes.unwrap();
                const state = this.context.getPromiseState(resultHandle);
                if (state && state.type === "pending") {
                    while (true) {
                        this.runtime.executePendingJobs();
                        const curState = this.context.getPromiseState(resultHandle);
                        if (curState.type !== "pending") {
                            if (curState.type === "fulfilled") {
                                resultHandle.dispose();
                                resultHandle = curState.value;
                            } else {
                                const errHandle = curState.error;
                                const err = this.context.dump(errHandle);
                                errHandle.dispose();
                                resultHandle.dispose();
                                throw err;
                            }
                            break;
                        }
                        await new Promise(resolve => setTimeout(resolve, 1));
                    }
                }

                let defaultHandle = this.context.getProp(resultHandle, "default");
                let resolvedDefaultHandle = defaultHandle;
                let isPromise = false;

                const defaultState = this.context.getPromiseState(defaultHandle);
                if (defaultState && !defaultState.notAPromise) {
                    isPromise = true;
                    if (defaultState.type === "pending") {
                        while (true) {
                            this.runtime.executePendingJobs();
                            const curState = this.context.getPromiseState(defaultHandle);
                            if (curState.type !== "pending") {
                                if (curState.type === "fulfilled") {
                                    resolvedDefaultHandle = curState.value;
                                } else {
                                    const errHandle = curState.error;
                                    const err = this.context.dump(errHandle);
                                    errHandle.dispose();
                                    defaultHandle.dispose();
                                    resultHandle.dispose();
                                    throw err;
                                }
                                break;
                            }
                            await new Promise(resolve => setTimeout(resolve, 1));
                        }
                    } else if (defaultState.type === "fulfilled") {
                        resolvedDefaultHandle = defaultState.value;
                    } else if (defaultState.type === "rejected") {
                        const errHandle = defaultState.error;
                        const err = this.context.dump(errHandle);
                        errHandle.dispose();
                        defaultHandle.dispose();
                        resultHandle.dispose();
                        throw err;
                    }
                }

                const defaultValue = this.context.dump(resolvedDefaultHandle);

                if (isPromise) {
                    resolvedDefaultHandle.dispose();
                }
                defaultHandle.dispose();

                const res = this.context.dump(resultHandle);

                this.context.setProp(this.context.global, "__tempModule", resultHandle);
                const copyRes = this.context.evalCode(`
                    for (const key of Object.keys(__tempModule)) {
                        if (key !== "default") {
                            globalThis[key] = __tempModule[key];
                        }
                    }
                    delete globalThis.__tempModule;
                `);
                if (copyRes.error) {
                    copyRes.error.dispose();
                } else {
                    copyRes.value.dispose();
                }
                resultHandle.dispose();

                if (res && typeof res === 'object') {
                    const currentScope = this.scopes[this.scopes.length - 1];
                    for (const [key, val] of Object.entries(res)) {
                        if (key !== 'default') {
                            currentScope[key] = val;
                        }
                    }
                    if ('default' in res) {
                        result = defaultValue;
                    } else {
                        result = undefined;
                    }
                } else {
                    result = res;
                }
            } else {
                const evalRes = this.context.evalCode(code, "<smark>");
                if (evalRes.error) {
                    const err = this.context.dump(evalRes.error);
                    evalRes.error.dispose();
                    throw err;
                }
                let resultHandle = evalRes.unwrap();
                const state = this.context.getPromiseState(resultHandle);
                if (state && state.type === "pending") {
                    while (true) {
                        this.runtime.executePendingJobs();
                        const curState = this.context.getPromiseState(resultHandle);
                        if (curState.type !== "pending") {
                            if (curState.type === "fulfilled") {
                                resultHandle.dispose();
                                resultHandle = curState.value;
                            } else {
                                const errHandle = curState.error;
                                const err = this.context.dump(errHandle);
                                errHandle.dispose();
                                resultHandle.dispose();
                                throw err;
                            }
                            break;
                        }
                        await new Promise(resolve => setTimeout(resolve, 1));
                    }
                }
                result = this.context.dump(resultHandle);
                resultHandle.dispose();
            }

            await this._syncScopes();
            return result;
        } catch (error) {
            const stack = error.stack || "";
            const match = stack.match(/__smark__\.js:(\d+):(\d+)/) || stack.match(/:(\d+):(\d+)/);

            const err = new Error(error.message || error);
            if (match) {
                err.line = parseInt(match[1]);
                err.column = parseInt(match[2]);
            }
            throw err;
        } finally {
            this.deadline = 0;
            clearInterval(interval);
            if (baseDir) this.baseDir = prevBaseDir;
        }
    }

    destroy() {
        if (this.runtime) {
            if (this.pendingDeferreds) {
                for (const deferred of this.pendingDeferreds) {
                    try {
                        if (deferred.alive) {
                            deferred.dispose();
                        }
                    } catch (e) {}
                }
                this.pendingDeferreds.clear();
            }

            try {
                this.runtime.executePendingJobs();
            } catch (e) {}

            try {
                if (this.context) {
                    this.context.dispose();
                }
                this.runtime.dispose();
            } catch (e) {
                console.warn(formatMessage("<$yellow:Warning:$> Safe context disposal warning: " + e.message));
            }
            this.runtime = null;
            this.context = null;
        }
    }
}

class Evaluator {
    constructor() {
        // Fallback stack for callers that use init() outside withEvaluator() (e.g. tests).
        this._fallbackStack = [];
    }

    _getStack() {
        return evaluatorStorage.getStore() ?? this._fallbackStack;
    }

    // Expose the active stack so tests can check .instances.length
    get instances() { return this._getStack(); }

    setDefaultFs(fs) {
        defaultFs = fs;
    }

    setDefaultEnv(env) {
        defaultEnv = env;
    }

    setDefaultAsyncLocalStorage(cls) {
        setDefaultAsyncLocalStorage(cls);
    }

    get active() {
        const stack = this._getStack();
        if (stack.length === 0) {
            throw new Error("No active EvaluatorState instance. Did you call init()?");
        }
        return stack[stack.length - 1];
    }

    // Forward .runtime to the active state so tests can assert on it
    get runtime() { return this.active?.runtime ?? null; }

    async init(baseDir = null, security = {}, settings = {}, mapperFile = null) {
        const state = new EvaluatorState();
        await state.init(baseDir, security, settings, mapperFile);
        this._getStack().push(state);
    }

    destroy() {
        const stack = this._getStack();
        if (stack.length > 0) {
            stack.pop().destroy();
        }
    }

    pushScope() {
        this.active.pushScope();
    }

    async popScope() {
        await this.active.popScope();
    }

    inject(vars) {
        this.active.inject(vars);
    }

    async execute(code, baseDir = null) {
        return await this.active.execute(code, baseDir);
    }

    hasDynamicTag(id) {
        return this.active.hasDynamicTag(id);
    }

    getDynamicTagOptions(id) {
        return this.active.getDynamicTagOptions(id);
    }

    async executeDynamicTag(id, payload) {
        return await this.active.executeDynamicTag(id, payload);
    }
}

export default new Evaluator();