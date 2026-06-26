/**
 * SomMark Evaluator APIs
 * 
 * Provides built-in utility methods safely bound to the sandbox VM.
 */

// Host-defined compile that will be injected securely
let hostCompile = null;

export function registerHostCompile(fn) {
    hostCompile = fn;
}

// Host-defined settings that will be injected securely
let hostSettings = {};

export function registerHostSettings(settings) {
    hostSettings = settings || {};
}

const version = "5.0.5";

const SomMark = {
    version,
    
    get settings() {
        return hostSettings;
    },
    
    // Secure recursive compile implementation
    compile: async (src, options = {}) => {
        if (!hostCompile) {
            throw new Error("Compilation capability is not initialized.");
        }
        return hostCompile(src, options);
    },

    // Wrap string as safe raw HTML to skip automatic escaping
    raw: (html) => {
        return { __raw: String(html) };
    },

    // Register custom tag handlers programmatically within sandboxed environments
    register: (id, render, options = {}) => {
        throw new Error("SomMark.register can only be invoked within the sandboxed template logic environment.");
    },

    // Retrieve active tags by ID
    get: (id) => {
        throw new Error("SomMark.get can only be invoked within the sandboxed template logic environment.");
    },

    // Remove registered output handlers
    removeOutput: (id) => {
        throw new Error("SomMark.removeOutput can only be invoked within the sandboxed template logic environment.");
    },

    // Check if tag IDs are registered
    includesId: (ids) => {
        throw new Error("SomMark.includesId can only be invoked within the sandboxed template logic environment.");
    },

    // Programmatic HTML/XML tag generation utility
    tag: (tagName) => {
        throw new Error("SomMark.tag can only be invoked within the sandboxed template logic environment.");
    }
};

// Freeze the entire Standard Library to make it completely immutable and tamper-proof
Object.freeze(SomMark);

export default SomMark;
