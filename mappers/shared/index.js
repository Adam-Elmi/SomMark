import { runtimeError } from "../../core/errors.js";

/**
 * Registers universal utility tags shared across all SomMark mappers.
 * These tags are considered "Format Agnostic."
 * 
 * @param {Mapper} mapper - The mapper instance to register tags on.
 */
export function registerSharedOutputs(mapper) {
    // 1. 'raw' - AtBlock that return the raw, unparsed content.
    mapper.register("raw", ({ content, nodeType }) => {
        if (nodeType === "Block") {
            return String(content);
        }
        return content;
    }, {
        type: "AtBlock",
        escape: false
    });

}
