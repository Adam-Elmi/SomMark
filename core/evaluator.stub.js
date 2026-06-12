// Lite-mode stub — same interface as evaluator.js but without QuickJS/WASM.
// Static and runtime blocks throw a clear error instead of executing.

const LITE_ERROR =
    "[SomMark lite] static ${}$ and runtime ${}$ blocks are not supported in lite mode. " +
    "Use the full SomMark bundle to enable JS evaluation.";

export function setCompilerClass(_cls) {}

class EvaluatorStub {
    setDefaultFs(_fs) {}

    get active() {
        return this;
    }

    async init(_baseDir, _security, _settings, _mapperFile) {}

    destroy() {}

    pushScope() {}

    async popScope() {}

    inject(_vars) {}

    async execute(_code) {
        throw new Error(LITE_ERROR);
    }

    hasDynamicTag(_id) {
        return false;
    }

    getDynamicTagOptions(_id) {
        return null;
    }

    async executeDynamicTag(_id, _payload) {
        throw new Error(LITE_ERROR);
    }
}

export default new EvaluatorStub();
