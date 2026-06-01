import { quickJS } from "@sebastianwessel/quickjs";
import fs from "node:fs";
import path from "node:path";
import * as acorn from "acorn";
import SomMark, { registerHostCompile, registerHostSettings } from "./helpers/lib.js";

// Global tracker to ensure deep recursive Smark compilation never exceeds safe boundaries
let globalCompilationDepth = 0;

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

const customCompileAdapter = async (src, options, parentSecurity = {}) => {
    const maxDepth = parentSecurity?.maxDepth ?? 5;
    if (globalCompilationDepth >= maxDepth) {
        throw new Error(`Recursion Guard: Maximum Smark compilation depth exceeded (limit is ${maxDepth}).`);
    }

    globalCompilationDepth++;
    try {
        // Securely isolate and deep-clone options to strip parent VM proxies
        const cleanOptions = JSON.parse(JSON.stringify(options || {}));
        const { default: SomMarkCompiler } = await import("../index.js");
        const compilerOptions = {
            src,
            format: cleanOptions.format || "html",
            variables: cleanOptions.variables || {},
            formatOption: cleanOptions.formatOption || {},
            security: parentSecurity
        };
        const sm = new SomMarkCompiler(compilerOptions);
        return await sm.transpile();
    } finally {
        globalCompilationDepth--;
    }
};

// Register statically once at module loading
registerHostCompile(customCompileAdapter);

/**
 * EvaluatorState
 * 
 * Houses the actual state, scopes, and QuickJS VM instance for a single transpilation lifecycle.
 */
class EvaluatorState {
    constructor() {
        this.runtime = null;
        this.baseDir = process.cwd();
        this.scopes = [{}];
        this.dynamicTagsStack = [new Map()];
        this.deadline = 0;
    }

    /**
     * Initializes the QuickJS VM.
     */
    async init(baseDir = null, security = {}, settings = {}, mapperFile = null) {
        if (baseDir) this.baseDir = baseDir;
        this.scopes = [{}];
        this.dynamicTagsStack = [new Map()];
        this.security = security;
        this.settings = settings;
        this.mapperFile = mapperFile;
        registerHostSettings(settings);

        if (this.runtime) {
            this.runtime.vm.expose({
                __allowRaw: this.security.allowRaw !== false
            });
            return;
        }

        const { createRuntime } = await quickJS();

        this.runtime = await createRuntime({
            allowFetch: true,
            fetchAdapter: async (input, init) => {
                return await customFetchAdapter(input, init, this.security);
            },
            allowFs: true,
            env: {}
        });

        this.deadline = 0;
        if (this.runtime?.vm?.context?.runtime?.setInterruptHandler) {
            this.runtime.vm.context.runtime.setInterruptHandler(() => {
                return this.deadline > 0 && Date.now() > this.deadline;
            });
        }

        // Expose standard library version & compile adapter, then construct the frozen global namespace inside the VM
        this.runtime.vm.expose({
            __hostSomMarkVersion: SomMark.version,
            __hostSomMarkSettings: () => JSON.stringify(SomMark.settings),
            __hostCompile: async (src, options) => {
                return await customCompileAdapter(src, options, this.security);
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
            __allowRaw: this.security.allowRaw !== false
        });

        await this.runtime.vm.evalCode(`
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
                    const plainRes = await __nativeFetch(input, init);
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
                }
            };

            // Deep freeze the SomMark standard library to make it completely immutable
            Object.freeze(SomMark);

            // Establish the global SomMark constant (non-writable, non-configurable)
            Object.defineProperty(globalThis, "SomMark", {
                value: SomMark,
                writable: false,
                configurable: false
            });

            // Prevent direct/un-namespaced global fetch usage to enforce standard library architecture
            delete globalThis.fetch;
            delete globalThis.process;
        `);

        // Configure host-based module loader to support local imports perfectly
        this.runtime.vm.context.runtime.setModuleLoader((moduleName) => {
            try {
                const isRaw = moduleName.endsWith("?raw");
                const cleanModuleName = isRaw ? moduleName.slice(0, -4) : moduleName;
                const resolvedPath = path.resolve(this.baseDir, cleanModuleName);
                if (fs.existsSync(resolvedPath)) {
                    let source = fs.readFileSync(resolvedPath, "utf8");

                    if (isRaw) {
                        const escapedSource = source.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${");
                        return `export default \`${escapedSource}\`;`;
                    }

                    // Support JSON files
                    if (resolvedPath.endsWith(".json")) {
                        source = `export default ${source};`;
                    }

                    // Support Smark files
                    if (resolvedPath.endsWith(".smark")) {
                        const escapedSource = source.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${");
                        source = `
                            export default async (variables = {}) => {
                                return await SomMark.compile(\`${escapedSource}\`, { variables });
                            };
                        `;
                    }

                    return source; // MUST BE A STRING
                }
                throw new Error(`Module not found: ${moduleName}`);
            } catch (err) {
                throw err;
            }
        });
    }

    /**
     * Pushes a new block scope level.
     */
    pushScope() {
        this.scopes.push({});
        this.dynamicTagsStack.push(new Map());
    }

    /**
     * Pops the current block scope level, cleaning up VM globals and restoring parent scope variables.
     */
    async popScope() {
        if (this.scopes.length > 1) {
            const popped = this.scopes.pop();
            this.dynamicTagsStack.pop();
            const keysToDelete = Object.keys(popped);
            if (keysToDelete.length > 0 && this.runtime) {
                try {
                    const deleteCode = keysToDelete.map(k => `delete globalThis['${k}'];`).join(" ");
                    await this.runtime.vm.evalCode(deleteCode, "cleanup.js");
                } catch (e) {
                    // ignore
                }
            }
            // Restore parent scopes
            if (this.runtime) {
                const merged = {};
                for (const scope of this.scopes) {
                    Object.assign(merged, scope);
                }
                this.runtime.vm.expose(merged);
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
        if (!this.runtime) throw new Error("EvaluatorState not initialized");
        this.runtime.vm.expose({
            __activeTagPayload: () => JSON.stringify(payload)
        });
        const code = `
            (() => {
                const payload = JSON.parse(__activeTagPayload());
                const tag = SomMark.__dynamicTags.get(${JSON.stringify(id)});
                if (!tag) throw new Error("Tag not found inside VM: " + ${JSON.stringify(id)});
                const res = tag.render({
                    args: payload.args,
                    content: payload.content,
                    textContent: payload.textContent,
                    nodeType: payload.nodeType,
                    isSelfClosing: payload.isSelfClosing
                });
                return res;
            })()
        `;
        let result = await this.runtime.vm.evalCode(code, "render_tag.js");
        if (result instanceof Promise || (result && typeof result === "object" && typeof result.then === "function")) {
            result = await result;
        }
        return result;
    }

    /**
     * Synchronizes changed VM global variables back to the scope stack.
     */
    async _syncScopes() {
        if (!this.runtime) return;
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
                const valuesRes = await this.runtime.vm.evalCode(getValuesCode, "sync.js", { type: 'module' });
                if (valuesRes && typeof valuesRes === 'object' && 'default' in valuesRes) {
                    const syncedValues = valuesRes.default;
                    for (const [key, val] of Object.entries(syncedValues)) {
                        for (let s = this.scopes.length - 1; s >= 0; s--) {
                            if (key in this.scopes[s]) {
                                this.scopes[s][key] = val;
                                break;
                            }
                        }
                    }
                }
            } catch (err) {
                // ignore
            }
        }
    }

    /**
     * Injects variables safely into the sandbox.
     */
    inject(vars) {
        if (!this.runtime) return;
        const currentScope = this.scopes[this.scopes.length - 1];
        Object.assign(currentScope, vars);
        this.runtime.vm.expose(vars);
    }

    /**
     * Executes code asynchronously and returns resolved result.
     */
    async execute(code) {
        if (!this.runtime) throw new Error("Evaluator not initialized");

        const timeout = this.security?.timeout ?? 5000;
        this.deadline = Date.now() + timeout; // Dynamic timeout safety safeguard

        // Keep QuickJS event loop alive in the background during execution
        const interval = setInterval(() => {
            try {
                this.runtime.vm.context.runtime.executePendingJobs();
            } catch (err) {
                // ignore
            }
        }, 1);

        try {
            // Detect top-level declarations for Auto-Export
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
                // If it fails to parse as module, it might be a simple expression, ignore
            }

            const hasImportExport = hasExplicitExports || /\bimport\b/.test(code);
            const hasAwait = /\bawait\b/.test(code);

            let finalCode = code;

            // Rewrite the last expression statement to be export default so we automatically return its value
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
                // Ignore parsing errors and fallback to raw code
            }

            if (autoExportedNames.length > 0 && !hasExplicitExports) {
                finalCode += `\nexport { ${autoExportedNames.join(', ')} };`;
            }

            const isModule = hasImportExport || hasAwait || autoExportedNames.length > 0 || finalCode.includes("export default");

            let result;
            if (isModule) {
                // Evaluate as module using Arena
                const evalPromise = this.runtime.vm.evalCode(finalCode, "main.js", {
                    strict: true,
                    strip: true,
                    backtraceBarrier: true,
                    type: 'module'
                });

                const res = await evalPromise;

                // Move exports directly to global scope in the VM
                if (res && typeof res === 'object') {
                    const currentScope = this.scopes[this.scopes.length - 1];
                    for (const [key, val] of Object.entries(res)) {
                        if (key !== 'default') {
                            currentScope[key] = val;
                            this.runtime.vm.expose({ [key]: val });
                        }
                    }
                    if ('default' in res) {
                        result = res.default;
                    } else {
                        result = undefined;
                    }
                } else {
                    result = res;
                }
            } else {
                result = await this.runtime.vm.evalCode(code, "main.js");
            }

            if (result instanceof Promise || (result && typeof result === "object" && typeof result.then === "function")) {
                result = await result;
            }

            await this._syncScopes();
            return result;
        } catch (error) {
            // Try to extract line/col from stack trace
            const stack = error.stack || "";
            const match = stack.match(/main\.js:(\d+):(\d+)/) || stack.match(/:(\d+):(\d+)/);

            const err = new Error(error.message || error);
            if (match) {
                err.line = parseInt(match[1]);
                err.column = parseInt(match[2]);
            }
            throw err;
        } finally {
            this.deadline = 0;
            clearInterval(interval);
        }
    }

    /**
     * Disposal.
     */
    destroy() {
        if (this.runtime) {
            try {
                // Execute any lingering jobs & trigger the QuickJS garbage collector
                if (this.runtime.vm?.context?.runtime) {
                    this.runtime.vm.context.runtime.executePendingJobs();
                    this.runtime.vm.context.runtime.gc();
                }
            } catch (e) { }

            try {
                this.runtime.dispose();
            } catch (e) {
                // Graceful logging for minor Emscripten reference delays
                console.warn("<$yellow:Warning:$> Safe context disposal warning: " + e.message);
            }
            this.runtime = null;
        }
    }
}

/**
 * Evaluator
 * 
 * Acts as a router/proxy singleton that routes VM calls to a stack of active isolated runtimes.
 * This guarantees concurrent and recursive safety across all compiler runs.
 */
class Evaluator {
    constructor() {
        this.instances = [];
    }

    /**
     * Get the active logic engine state instance at the top of the stack.
     */
    get active() {
        if (this.instances.length === 0) {
            throw new Error("No active EvaluatorState instance. Did you call init()?");
        }
        return this.instances[this.instances.length - 1];
    }

    async init(baseDir = null, security = {}, settings = {}, mapperFile = null) {
        const state = new EvaluatorState();
        await state.init(baseDir, security, settings, mapperFile);
        this.instances.push(state);
    }

    destroy() {
        if (this.instances.length > 0) {
            const state = this.instances.pop();
            state.destroy();
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

    async execute(code) {
        return await this.active.execute(code);
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