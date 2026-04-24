import { sommarkError } from "../core/errors.js";
import * as labels from "../core/labels.js";

/**
 * Checks if a value is a plain object.
 * @param {any} val - The value to check.
 * @returns {boolean} - True if it's an object.
 */
export const isObject = (val) => typeof val === "object" && val !== null && !Array.isArray(val);

/**
 * Checks if a value is an array.
 * @param {any} val - The value to check.
 * @returns {boolean} - True if it's an array.
 */
export const isArray = (val) => Array.isArray(val);

/**
 * Checks if a value is a string.
 * @param {any} val - The value to check.
 * @returns {boolean} - True if it's a string.
 */
export const isString = (val) => typeof val === "string";

/**
 * Checks if a value is a number and not NaN.
 * @param {any} val - The value to check.
 * @returns {boolean} - True if it's a valid number.
 */
export const isNumber = (val) => typeof val === "number" && !isNaN(val);

/**
 * Checks if a value is true or false.
 * @param {any} val - The value to check.
 * @returns {boolean} - True if it's a boolean.
 */
export const isBool = (val) => typeof val === "boolean";

/**
 * Checks if a value is null.
 * @param {any} val - The value to check.
 * @returns {boolean} - True if it's null.
 */
export const isNull = (val) => val === null;

/**
 * Checks if a value is missing (undefined).
 * @param {any} val - The value to check.
 * @returns {boolean} - True if it's undefined.
 */
export const isUndefined = (val) => val === undefined;

/**
 * Finds a matching output definition for a tag ID from a list of registered outputs.
 * Uses case-insensitive matching. Handles both string and array-based ID definitions.
 * 
 * @param {Array<Object>} outputs - List of registered tag outputs.
 * @param {string} targetId - The tag identifier to look for.
 * @returns {Object|undefined} - The matched output entry or undefined.
 */
export function matchedValue(outputs, targetId) {
        if (!outputs || !targetId) return undefined;
        for (let i = outputs.length - 1; i >= 0; i--) {
                const outputValue = outputs[i];
                const lowerTarget = targetId.toLowerCase();

                if (typeof outputValue.id === "string") {
                        if (outputValue.id.toLowerCase() === lowerTarget) {
                                return outputValue;
                        }
                } else if (Array.isArray(outputValue.id)) {
                        if (outputValue.id.some(id => id.toLowerCase() === lowerTarget)) {
                                return outputValue;
                        }
                }
        }
        return undefined;
}

/**
 * Safely retrieves an argument value, supporting both positional (number) and named (string) keys.
 * Includes validation against a specific type and optional type casting.
 * 
 * @param {Object} options - Resolution options.
 * @param {Object} options.args - The argument object from an AST node.
 * @param {number} [options.index] - The positional index (for V4 Global Indexing).
 * @param {string} [options.key] - The named key.
 * @param {string|null} [options.type=null] - Expected typeof result (e.g., 'string', 'boolean').
 * @param {Function|null} [options.setType=null] - Optional function to cast the value before validation.
 * @param {any} [options.fallBack=null] - Value to return if resolution or validation fails.
 * @returns {any} - The resolved argument value or the fallback.
 */
export function safeArg({ args, index, key, type = null, setType = null, fallBack = null }) {
        if (typeof args !== 'object' || args === null) {
                sommarkError([`{line}<$red:TypeError:$> <$yellow:args must be an object$>{line}`]);
        }

        if (index === undefined && key === undefined) {
                sommarkError([`{line}<$red:ReferenceError:> <$yellow:At least one of 'index' or 'key' must be provided$>{line}`]);
        }

        const validate = value => {
                if (value === undefined) return false;

                // Handle explicit type check functions (e.g., isObject, isArray)
                if (typeof type === 'function') {
                        return type(value);
                }

                if (!type) return true;
                const evaluated = setType ? setType(value) : value;
                return typeof evaluated === type;
        };

        if (index !== undefined && validate(args[index])) {
                return args[index];
        }

        if (key !== undefined && validate(args[key])) {
                return args[key];
        }

        return fallBack;
}

/**
 * Extracts and returns all positional arguments from the Object-based 'args' structure of V4.
 * 
 * @param {Object} args - The AST node's argument object.
 * @returns {Array<any>} - An ordered array of positional argument values.
 */
export function getPositionalArgs(args) {
        if (!args) return [];
        const keys = Object.keys(args);
        const result = keys
                .filter(k => !isNaN(parseInt(k)))
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(k => args[k]);

        return result;
}

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for "Did you mean?" suggestions and fuzzy matching in validation.
 * 
 * @param {string} a - First string.
 * @param {string} b - Second string.
 * @returns {number} - The edit distance between the two strings.
 */
export function levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                        if (b.charAt(i - 1) === a.charAt(j - 1)) {
                                matrix[i][j] = matrix[i - 1][j - 1];
                        } else {
                                matrix[i][j] = Math.min(
                                        matrix[i - 1][j - 1] + 1,
                                        matrix[i][j - 1] + 1,
                                        matrix[i - 1][j] + 1
                                );
                        }
                }
        }
        return matrix[b.length][a.length];
}
